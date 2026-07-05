import { getPool } from '../config/db.js';

const normalizeDateOnly = (value) => {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value.slice(0, 10);
  return String(value).slice(0, 10);
};

const serializeTrip = (trip) => {
  if (!trip) return trip;
  return { ...trip, start_date: normalizeDateOnly(trip.start_date), end_date: normalizeDateOnly(trip.end_date) };
};

export const createTrip = async ({ userId, title, destination, startDate, endDate, budget, notes }) => {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO trips (user_id, title, destination, start_date, end_date, budget, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [userId, title, destination, startDate, endDate, budget, notes]
  );
  const [rows] = await pool.execute('SELECT * FROM trips WHERE id = ?', [result.insertId]);
  return serializeTrip(rows[0]);
};

export const getTripById = async (tripId, userId) => {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM trips WHERE id = ? AND user_id = ?', [tripId, userId]);
  return serializeTrip(rows[0] || null);
};

export const updateTrip = async ({ tripId, userId, title, destination, startDate, endDate, budget, notes }) => {
  const pool = getPool();
  await pool.execute(
    `UPDATE trips SET title = ?, destination = ?, start_date = ?, end_date = ?, budget = ?, notes = ?, updated_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [title, destination, startDate, endDate, budget, notes, tripId, userId]
  );
  return getTripById(tripId, userId);
};

export const deleteTrip = async (tripId, userId) => {
  const pool = getPool();
  const [result] = await pool.execute('DELETE FROM trips WHERE id = ? AND user_id = ?', [tripId, userId]);
  return result.affectedRows > 0;
};

export const searchAndFilterTrips = async ({ userId, search, destination, startDate, endDate, minBudget, maxBudget, limit = 100, offset = 0, sort = 'start_date' }) => {
  const pool = getPool();
  let sql = 'SELECT * FROM trips WHERE user_id = ?';
  const params = [userId];

  if (search) {
    sql += ' AND (title LIKE ? OR destination LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (destination) {
    sql += ' AND destination LIKE ?';
    params.push(`%${destination}%`);
  }
  if (startDate) {
    sql += ' AND start_date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    sql += ' AND end_date <= ?';
    params.push(endDate);
  }
  if (minBudget !== undefined && minBudget !== null) {
    sql += ' AND budget >= ?';
    params.push(minBudget);
  }
  if (maxBudget !== undefined && maxBudget !== null) {
    sql += ' AND budget <= ?';
    params.push(maxBudget);
  }

  // simple whitelist for sort
  const allowedSort = ['start_date', 'end_date', 'budget', 'created_at'];
  if (!allowedSort.includes(sort)) sort = 'start_date';
  const limitValue = Math.max(0, Number(limit) || 100);
  const offsetValue = Math.max(0, Number(offset) || 0);
  sql += ` ORDER BY ${sort} DESC LIMIT ${limitValue} OFFSET ${offsetValue}`;

  const [rows] = await pool.execute(sql, params);
  return rows.map(serializeTrip);
};
