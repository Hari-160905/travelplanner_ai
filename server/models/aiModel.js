import { getPool } from '../config/db.js';

export const saveAIHistory = async ({ userId, type, inputPayload, responseText }) => {
  const pool = getPool();
  const [result] = await pool.execute(
    'INSERT INTO aihistory (user_id, type, input_payload, response_text, created_at) VALUES (?, ?, ?, ?, NOW())',
    [userId, type, JSON.stringify(inputPayload), responseText]
  );
  return { id: result.insertId };
};

export const getAIHistoryByUser = async (userId, limit = 100) => {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT id, type, input_payload, response_text, created_at FROM aihistory WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, Number(limit)]);
  // parse JSON payloads
  return rows.map(r => ({ ...r, input_payload: JSON.parse(r.input_payload) }));
};
