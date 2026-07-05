import { connectDatabase } from './config/db.js';

const main = async () => {
  try {
    const pool = await connectDatabase();
    const userId = 8;
    const sql = 'SELECT * FROM trips WHERE user_id = ? ORDER BY start_date DESC LIMIT ? OFFSET ?';
    const params = [userId, 100, 0];
    console.log({ sql, params });
    const [rows] = await pool.execute(sql, params);
    console.log('rows', rows.length);
  } catch (err) {
    console.error('error', err);
  }
};

main();
