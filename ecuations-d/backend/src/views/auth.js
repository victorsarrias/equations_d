// src/views/auth.js
import { Router } from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = Router();

// --- util ---
function norm(s) {
  return (s ?? '').toString().trim();
}
function normLower(s) {
  return norm(s).toLowerCase();
}
function ensureJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('Falta JWT_SECRET en .env');
  }
}

function isDev() {
  const env = (process.env.NODE_ENV || '').toLowerCase();
  return env !== 'production';
}

async function maybeSendResetEmail(to, token) {
  try {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
      console.log('SMTP no configurado. Saltando envío.');
      return { sent: false, reason: 'smtp-missing' };
    }
    const nodemailer = (await import('nodemailer')).default;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
    const base = process.env.FRONTEND_URL || 'http://localhost:5173';
    const url = `${base.replace(/\/$/, '')}/reset?token=${encodeURIComponent(token)}`;
    const from = process.env.MAIL_FROM || `no-reply@${(host||'example.com').replace(/:.*/, '')}`;
    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Restablecer contraseña',
      text: `Usa este enlace para restablecer tu contraseña: ${url}\nSi no solicitaste esto, ignora este mensaje.`,
      html: `<p>Usa este enlace para restablecer tu contraseña:</p><p><a href="${url}">${url}</a></p><p>Si no solicitaste esto, ignora este mensaje.</p>`
    });
    console.log('Reset email enviado:', info.messageId);
    return { sent: true };
  } catch (e) {
    console.log('No se pudo enviar email de reset:', e?.message || e);
    return { sent: false, reason: 'send-failed' };
  }
}

// ---- Healthcheck DB ----
router.get('/health/db', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    return res.json({ ok: true, db: rows[0].ok === 1 });
  } catch (e) {
    console.error('DB HEALTH ERROR >>>', e);
    return res.status(500).json({ ok: false });
  }
});

// ---- JWT middleware simple ----
function ensureAuth(req, res, next) {
  try {
    ensureJwtSecret();
    const h = req.headers['authorization'] || '';
    const m = /^Bearer\s+(.+)$/i.exec(h);
    if (!m) return res.status(401).json({ message: 'No autorizado' });
    const payload = jwt.verify(m[1], process.env.JWT_SECRET);
    req.auth = { uid: payload.uid, role: payload.role };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

/**
 * POST /api/auth/register
 * Body: { fullName, phone?, email, username, password, role? }
 */
router.post('/register', async (req, res) => {
  try {
    const fullName = norm(req.body.fullName);
    const phone = norm(req.body.phone) || null;
    const email = normLower(req.body.email);
    const username = normLower(req.body.username);
    const password = req.body.password;
    const role = req.body.role === 'teacher' ? 'teacher' : 'student';

    if (!fullName || !email || !username || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // ¿email o username ya existe?
    const [exists] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );
    if (exists.length) {
      return res.status(409).json({ message: 'Email o usuario ya registrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    try {
      const [result] = await pool.query(
        `INSERT INTO users (full_name, phone, email, username, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [fullName, phone, email, username, password_hash, role]
      );

      return res.status(201).json({
        ok: true,
        id: result.insertId,
        role
      });
    } catch (e) {
      // por si choca con UNIQUE al mismo tiempo
      if (e && e.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email o usuario ya registrado' });
      }
      throw e;
    }
  } catch (err) {
    console.error('REGISTER ERROR >>>', err);
    return res.status(500).json({ message: 'Error de servidor' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const email = normLower(req.body.email);
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }

    const [rows] = await pool.query(
      `SELECT id, full_name, email, username, password_hash, role
       FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    ensureJwtSecret();
    const token = jwt.sign(
      { uid: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('LOGIN ERROR >>>', err);
    return res.status(500).json({ message: 'Error de servidor' });
  }
});

/**
 * POST /api/auth/forgot
 * Body: { email }
 * Genera un token de restablecimiento y (en dev) lo devuelve para pruebas.
 */
router.post('/forgot', async (req, res) => {
  try {
    const email = normLower(req.body.email);
    if (!email) return res.status(400).json({ message: 'Correo requerido' });

    // Buscar usuario; pero siempre responder 200 para no revelar existencia
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (!rows.length) {
      // Respuesta genérica
      return res.json({ ok: true, message: 'Si el correo existe, enviaremos instrucciones.' });
    }

    const user = rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    // Guardar token
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), used_at = NULL`,
      [user.id, token, expiresAt]
    );

    // Enviar email si está configurado; en dev, además mostrar token
    const sendRes = await maybeSendResetEmail(email, token);
    if (isDev()) console.log('RESET TOKEN (dev):', { email, token, emailSent: sendRes.sent });

    const payload = { ok: true, message: 'Si el correo existe, enviaremos instrucciones.' };
    if (isDev() || process.env.SEND_RESET_TOKEN_IN_RESPONSE === 'true') {
      payload.debugToken = token;
    }
    return res.json(payload);
  } catch (err) {
    console.error('FORGOT ERROR >>>', err);
    return res.status(500).json({ message: 'Error de servidor' });
  }
});

/**
 * POST /api/auth/reset
 * Body: { token, password }
 */
router.post('/reset', async (req, res) => {
  try {
    const token = norm(req.body.token);
    const password = req.body.password;
    if (!token || !password) return res.status(400).json({ message: 'Token y nueva contraseña requeridos' });

    const [rows] = await pool.query(
      `SELECT pr.user_id, pr.expires_at, pr.used_at, u.id as uid
       FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.token = ? LIMIT 1`,
      [token]
    );
    if (!rows.length) return res.status(400).json({ message: 'Token inválido' });

    const row = rows[0];
    if (row.used_at) return res.status(400).json({ message: 'Token ya utilizado' });
    if (new Date(row.expires_at).getTime() < Date.now()) return res.status(400).json({ message: 'Token expirado' });

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, row.user_id]);
    await pool.query('UPDATE password_resets SET used_at = NOW() WHERE token = ?', [token]);

    return res.json({ ok: true, message: 'Contraseña actualizada' });
  } catch (err) {
    console.error('RESET ERROR >>>', err);
    return res.status(500).json({ message: 'Error de servidor' });
  }
});

/**
 * POST /api/auth/change-password
 * Header: Authorization: Bearer <jwt>
 * Body: { currentPassword, newPassword }
 */
router.post('/change-password', ensureAuth, async (req, res) => {
  try {
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Datos incompletos' });

    const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE id = ? LIMIT 1', [req.auth.uid]);
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });
    const user = rows[0];

    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Contraseña actual inválida' });

    const password_hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, user.id]);

    return res.json({ ok: true, message: 'Contraseña cambiada' });
  } catch (err) {
    console.error('CHANGE PASSWORD ERROR >>>', err);
    return res.status(500).json({ message: 'Error de servidor' });
  }
});

export default router;
