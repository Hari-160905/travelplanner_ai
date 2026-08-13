import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();


console.log("DB_USER =", process.env.DB_USER);
console.log("DB_NAME =", process.env.DB_NAME);

let pool;

export const connectDatabase = async () => {
  if (pool) return pool;
  pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),   // <-- Add this
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  connectTimeout: 10000,
});

  // quick test query
  const [rows] = await pool.query('SELECT 1 as ok');
  if (!rows) throw new Error('DB connectivity test failed');
  console.log('MySQL pool created');
  return pool;
};

export const getPool = () => {
  if (!pool) throw new Error('Database pool not initialized');
  return pool;
};
