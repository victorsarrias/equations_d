// backend/src/db.js
import mysql from 'mysql2/promise';
import 'dotenv/config';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Optional connection check when starting the server.
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    console.log('MySQL connection OK');
    conn.release();
  } catch (err) {
    console.error('MySQL connection error:', err.message);
  }
})();
