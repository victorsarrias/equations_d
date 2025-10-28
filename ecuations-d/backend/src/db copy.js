import mysql from 'mysql2/promise';
console.log('DB vars:', process.env.DB_HOST, process.env.DB_USER, !!process.env.DB_PASSWORD, process.env.DB_NAME);

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
