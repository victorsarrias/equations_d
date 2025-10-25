import express from "express";
import cors from "cors";
import "dotenv/config";
import { pool } from "./db.js";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Salud
app.get("/api/ping", (req, res) => res.json({ ok: true, msg: "pong" }));

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
      `SELECT a.id, a.slug, a.titulo, a.resumen, a.dificultad, a.cover_url,
              a.tema_slug, t.titulo AS tema_titulo
         FROM aventuras a
         JOIN temas t ON t.slug = a.tema_slug
       ORDER BY a.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(process.env.PORT, () => {
  console.log(`API lista en http://localhost:${process.env.PORT}`);
});
