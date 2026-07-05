import { getPool } from '../config/db.js';

export const createUser = async ({ name, email, passwordHash }) => {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, 'user', NOW(), NOW())`,
    [name, email, passwordHash]
  );
  return { id: result.insertId, name, email };
};

export const findUserByEmail = async (email) => {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};
