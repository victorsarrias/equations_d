import { Router } from 'express';
import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, phone, email, username, password, role } = req.body;
    if (!fullName || !email || !username || !password) {
      return res.status(400).json({ message: 'Campos obligatorios faltantes' });
    }
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1', [email, username]);
    if (rows.length) return res.status(409).json({ message: 'Email o usuario ya existe' });
    const hash = await bcrypt.hash(password, 10);
    const userRole = role === 'teacher' ? 'teacher' : 'student';
    await pool.query(
      'INSERT INTO users (full_name, phone, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, phone || null, email, username, hash, userRole]
    );
    return res.json({ ok: true, role: userRole });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Error de servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email y contraseña requeridos' });
    const [rows] = await pool.query('SELECT id, full_name, email, username, password_hash, role FROM users WHERE email = ? LIMIT 1', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Credenciales inválidas' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });
    const token = jwt.sign({ uid: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: { id: user.id, fullName: user.full_name, email: user.email, username: user.username, role: user.role }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Error de servidor' });
  }
});

export default router;
