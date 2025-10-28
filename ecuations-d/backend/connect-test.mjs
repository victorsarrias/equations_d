// connect-test.mjs
import mysql from 'mysql2/promise';

const config = {
  host: '127.0.0.1',
  port: 3306,
  user: 'ecuations_user',
  password: 'TuClaveFuerteAqui',
  database: 'ecuationsd',
};

try {
  const conn = await mysql.createConnection(config);
  const [rows] = await conn.query('SELECT 1 AS ok');
  console.log('Conexión OK:', rows);
  await conn.end();
} catch (e) {
  console.error('Fallo conexión MySQL:', e.message);
  process.exit(1);
}
