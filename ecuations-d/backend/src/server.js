import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { pool } from "./db.js";
import authRouter from "./views/auth.js";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4000"] }));
app.use(express.json());

// Página informativa en desarrollo para la raíz
if (process.env.NODE_ENV !== "production") {
  app.get("/", (_req, res) => {
    res.type("text").send(
      "Ecuations-D API en desarrollo. Prueba /api/ping, /api/menu, /api/home"
    );
  });
}

// Servir archivos estáticos del frontend (build de Vite)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
}

// Salud
app.get("/api/ping", (req, res) => res.json({ ok: true, msg: "pong" }));

// Verificación rápida de conexión a la BD (temporal)
app.get("/api/db-check", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ ok: true, result: rows[0].result });
  } catch (err) {
    res.status(500).json({ ok: false, code: err.code, message: err.message });
  }
});

// Rutas de autenticación
app.use("/api/auth", authRouter);

// Ejemplo: lista de temas (fallará si aún no creas la BD/tablas)
app.get("/api/temas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, titulo, slug, orden FROM temas ORDER BY orden"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/aventuras", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id,
              a.slug,
              a.titulo,
              a.resumen,
              a.dificultad,
              a.cover_url,
              t.slug AS tema_slug,
              t.titulo AS tema_titulo
         FROM aventuras a
         JOIN temas t ON t.id = a.tema_id
       ORDER BY a.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/menu", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, etiqueta, ruta, orden, requiere_auth, solo_invited, icono
         FROM menu_items
        ORDER BY orden`
    );
    const data = rows.map((item) => ({
      ...item,
      requiere_auth: Boolean(item.requiere_auth),
      solo_invited: Boolean(item.solo_invited),
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/home", async (_req, res) => {
  try {
    const [sections] = await pool.query(
      `SELECT slug, titulo, subtitulo, contenido, cta_text, cta_url, orden
         FROM home_sections
        ORDER BY orden`
    );
    const [personajes] = await pool.query(
      `SELECT slug, nombre, rol, descripcion, imagen_url, orden
         FROM personajes
        ORDER BY orden`
    );
    res.json({ sections, personajes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Middleware simple de autenticación (copia ligera) ---
function getAuth(req) {
  try {
    const h = req.headers["authorization"] || "";
    const m = /^Bearer\s+(.+)$/i.exec(h);
    if (!m) return null;
    const payload = jwt.verify(m[1], process.env.JWT_SECRET);
    return { uid: payload.uid, role: payload.role };
  } catch {
    return null;
  }
}

// Marca una misión como completada para el usuario autenticado
app.post("/api/misiones/:id/complete", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth) return res.status(401).json({ message: "No autorizado" });
    const uid = auth.uid;
    const id = req.params.id;

    // Asegurar tabla (idempotente)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS progreso_misiones (
        user_id INT NOT NULL,
        mision_id VARCHAR(64) NOT NULL,
        completado TINYINT(1) NOT NULL DEFAULT 1,
        completado_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, mision_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(
      `INSERT INTO progreso_misiones (user_id, mision_id, completado, completado_at)
       VALUES (?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE completado = VALUES(completado), completado_at = VALUES(completado_at)`,
      [uid, id]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("MISIÓN COMPLETE ERROR >>>", err.message || err);
    res.status(500).json({ message: "No se pudo marcar misión" });
  }
});
// --- Niveles: listar con progreso del usuario ---
app.get("/api/niveles", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth) return res.status(401).json({ message: "No autorizado" });
    const uid = auth.uid;
    const [rows] = await pool.query(
      `SELECT n.id, n.titulo, n.descripcion, n.categoria, n.desafio, n.respuesta,
              n.recompensa_monedas, n.recompensa_vidas, n.recompensa_armas,
              n.orden,
              COALESCE(p.completado, 0) AS completado,
              COALESCE(p.intentos, 0) AS intentos
         FROM niveles n
    LEFT JOIN progreso_niveles p ON p.nivel_id = n.id AND p.user_id = ?
        ORDER BY n.orden, n.id`,
      [uid]
    );
    const mapped = rows.map(r => ({
      id: r.id,
      title: r.titulo,
      description: r.descripcion,
      difficulty: r.categoria,
      challenge: r.desafio,
      answer: r.respuesta,
      rewards: { coins: r.recompensa_monedas || 0, lives: r.recompensa_vidas || 0, weapons: r.recompensa_armas || 0 },
      completed: Boolean(r.completado),
      attempts: Number(r.intentos || 0)
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Niveles: marcar completado ---
app.post("/api/niveles/:id/complete", async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth) return res.status(401).json({ message: "No autorizado" });
    const uid = auth.uid;
    const nivelId = Number(req.params.id);
    if (!nivelId) return res.status(400).json({ message: "Nivel inválido" });
    // upsert: si existe, set completado=1 y sumar intento; si no, crear
    await pool.query(
      `INSERT INTO progreso_niveles (user_id, nivel_id, completado, intentos)
       VALUES (?, ?, 1, 1)
       ON DUPLICATE KEY UPDATE completado = VALUES(completado), intentos = intentos + 1`,
      [uid, nivelId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/misiones", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.id,
              m.titulo,
              m.estado_default,
              m.dificultad,
              m.descripcion,
              m.environment_key,
              m.orden,
              t.slug AS tema_slug,
              t.titulo AS tema_titulo
         FROM misiones m
         LEFT JOIN temas t ON t.id = m.tema_id
        ORDER BY m.orden, m.id`
    );
    // Obtener prerequisitos si existe la tabla
    let prereqMap = new Map();
    try {
      const [prereqRows] = await pool.query(
        `SELECT mp.mision_id, mp.requiere_id, m2.titulo AS requiere_titulo
           FROM mision_prerequisitos mp
           JOIN misiones m2 ON m2.id = mp.requiere_id`
      );
      prereqRows.forEach(r => {
        if (!prereqMap.has(r.mision_id)) prereqMap.set(r.mision_id, []);
        prereqMap.get(r.mision_id).push({ id: r.requiere_id, titulo: r.requiere_titulo });
      });
    } catch (e) {
      if (!(e && e.code === 'ER_NO_SUCH_TABLE')) {
        console.warn('WARN prerequisitos:', e.message);
      }
    }

    // Recompensas por misión (si existe la tabla)
    let rewardsMap = new Map();
    try {
      const [rewardsRows] = await pool.query(
        `SELECT mision_id, recompensa_monedas, recompensa_vidas, recompensa_armas
           FROM mision_recompensas`
      );
      rewardsRows.forEach(r => {
        rewardsMap.set(r.mision_id, {
          monedas: Number(r.recompensa_monedas) || 0,
          vidas: Number(r.recompensa_vidas) || 0,
          armas: Number(r.recompensa_armas) || 0,
        });
      });
    } catch (e) {
      if (!(e && e.code === 'ER_NO_SUCH_TABLE')) {
        console.warn('WARN recompensas:', e.message);
      }
    }
    // Progreso por usuario (si hay auth)
    let completedSet = new Set();
    try {
      const auth = getAuth(req);
      if (auth) {
        const [prog] = await pool.query(
          `SELECT mision_id FROM progreso_misiones WHERE user_id = ? AND completado = 1`,
          [auth.uid]
        );
        prog.forEach(r => completedSet.add(String(r.mision_id)));
      }
    } catch (e) {
      // no-op si no existe tabla
    }

    const data = rows.map(m => ({
      ...m,
      prerequisitos: prereqMap.get(m.id) || [],
      recompensas: rewardsMap.get(m.id) || null,
      user_completed: completedSet.has(String(m.id))
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/misiones/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [missionRows] = await pool.query(
      `SELECT m.id,
              m.titulo,
              m.estado_default,
              m.dificultad,
              m.descripcion,
              m.environment_key,
              m.orden,
              t.slug AS tema_slug,
              t.titulo AS tema_titulo
         FROM misiones m
         LEFT JOIN temas t ON t.id = m.tema_id
        WHERE m.id = ?
        LIMIT 1`,
      [id]
    );

    if (!missionRows.length) {
      return res.status(404).json({ error: "Mision no encontrada" });
    }

    const mission = missionRows[0];
    // Prerequisitos (si existen)
    let prerequisitos = [];
    try {
      const [prq] = await pool.query(
        `SELECT mp.requiere_id AS id, m2.titulo AS titulo
           FROM mision_prerequisitos mp
           JOIN misiones m2 ON m2.id = mp.requiere_id
          WHERE mp.mision_id = ?`,
        [id]
      );
      prerequisitos = prq;
    } catch (e) {
      if (!(e && e.code === 'ER_NO_SUCH_TABLE')) {
        console.warn('WARN prerequisitos detail:', e.message);
      }
    }
    // Recompensas (si existe la tabla)
    let recompensas = null;
    try {
      const [rw] = await pool.query(
        `SELECT recompensa_monedas, recompensa_vidas, recompensa_armas
           FROM mision_recompensas
          WHERE mision_id = ?
          LIMIT 1`,
        [id]
      );
      if (rw && rw.length) {
        recompensas = {
          monedas: Number(rw[0].recompensa_monedas) || 0,
          vidas: Number(rw[0].recompensa_vidas) || 0,
          armas: Number(rw[0].recompensa_armas) || 0,
        };
      }
    } catch (e) {
      if (!(e && e.code === 'ER_NO_SUCH_TABLE')) {
        console.warn('WARN recompensas detail:', e.message);
      }
    }
    const [pasos] = await pool.query(
      `SELECT paso, titulo, expresion
         FROM mision_pasos
        WHERE mision_id = ?
        ORDER BY paso`,
      [id]
    );
    const [collectibles] = await pool.query(
      `SELECT orden, pos_x, pos_y, simbolo, tipo, valor
         FROM mision_collectibles
        WHERE mision_id = ?
        ORDER BY orden`,
      [id]
    );
    const [enemigos] = await pool.query(
      `SELECT orden, pos_x, pos_y, tipo, velocidad
         FROM mision_enemigos
        WHERE mision_id = ?
        ORDER BY orden`,
      [id]
    );
    const [plataformas] = await pool.query(
      `SELECT orden, pos_x, pos_y, ancho, alto
         FROM mision_plataformas
        WHERE mision_id = ?
        ORDER BY orden`,
      [id]
    );

    // Progreso del usuario (si hay auth)
    let user_completed = false;
    try {
      const auth = getAuth(req);
      if (auth) {
        const [pr] = await pool.query(
          `SELECT 1 FROM progreso_misiones WHERE user_id = ? AND mision_id = ? AND completado = 1 LIMIT 1`,
          [auth.uid, id]
        );
        user_completed = pr && pr.length > 0;
      }
    } catch {}

    res.json({
      ...mission,
      prerequisitos,
      recompensas,
      pasos,
      collectibles,
      enemigos,
      plataformas,
      user_completed,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/temas/:slug/resources", async (req, res) => {
  const { slug } = req.params;
  try {
    const [temaRows] = await pool.query(
      `SELECT id, slug, titulo, descripcion
         FROM temas
        WHERE slug = ?
        LIMIT 1`,
      [slug]
    );

    if (!temaRows.length) {
      return res.status(404).json({ error: "Tema no encontrado" });
    }

    const tema = temaRows[0];
    const [ayudas] = await pool.query(
      `SELECT orden, texto
         FROM ayudas_tema
        WHERE tema_id = ?
        ORDER BY orden`,
      [tema.id]
    );
    const [pasos] = await pool.query(
      `SELECT orden, texto
         FROM pasos_tema
        WHERE tema_id = ?
        ORDER BY orden`,
      [tema.id]
    );

    res.json({ tema, ayudas, pasos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all: devolver index.html para rutas que no sean de API
if (process.env.NODE_ENV === "production") {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API lista en http://localhost:${PORT}`);
});
