import { getPool } from '../config/db.js';

const normalizeDateOnly = (value) => {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value.slice(0, 10);
  return String(value).slice(0, 10);
};

const serializeExpense = (expense) => {
  if (!expense) return expense;
  return { ...expense, spent_at: normalizeDateOnly(expense.spent_at) };
};

export const createExpense = async ({ userId, tripId = null, category, amount, currency = 'USD', description = null, spentAt }) => {
  const pool = getPool();
  
  // FIX: Force invalid/empty tripIds to be pure NULL for MySQL constraints
  const finalTripId = (tripId && !isNaN(tripId)) ? Number(tripId) : null;
  const finalAmount = !isNaN(amount) ? Number(amount) : 0.0;

  const [result] = await pool.execute(
    `INSERT INTO expenses (user_id, trip_id, category, amount, currency, description, spent_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [userId, finalTripId, category, finalAmount, currency, description, spentAt]
  );
  const [rows] = await pool.execute('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
  return serializeExpense(rows[0]);
};

export const getExpenseById = async (expenseId, userId) => {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [expenseId, userId]);
  return serializeExpense(rows[0] || null);
};

export const updateExpense = async ({ expenseId, userId, category, amount, currency = 'USD', description, spentAt, tripId = null }) => {
  const pool = getPool();

  // FIX: Force invalid/empty tripIds to be pure NULL for MySQL constraints
  const finalTripId = (tripId && !isNaN(tripId)) ? Number(tripId) : null;
  const finalAmount = !isNaN(amount) ? Number(amount) : 0.0;

  await pool.execute(
    `UPDATE expenses SET category = ?, amount = ?, currency = ?, description = ?, spent_at = ?, trip_id = ?, updated_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [category, finalAmount, currency, description, spentAt, finalTripId, expenseId, userId]
  );
  return getExpenseById(expenseId, userId);
};

export const deleteExpense = async (expenseId, userId) => {
  const pool = getPool();
  const [result] = await pool.execute('DELETE FROM expenses WHERE id = ? AND user_id = ?', [expenseId, userId]);
  return result.affectedRows > 0;
};

export const getExpensesByUser = async ({ userId, tripId = null, category = null, startDate = null, endDate = null, limit = 100, offset = 0 }) => {
  const pool = getPool();
  let sql = 'SELECT * FROM expenses WHERE user_id = ?';
  const params = [userId];

  const finalTripId = (tripId && !isNaN(tripId)) ? Number(tripId) : null;
  if (finalTripId) {
    sql += ' AND trip_id = ?';
    params.push(finalTripId);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (startDate) {
    sql += ' AND spent_at >= ?';
    params.push(startDate);
  }
  if (endDate) {
    sql += ' AND spent_at <= ?';
    params.push(endDate);
  }

  const limitValue = Math.max(0, Number(limit) || 100);
  const offsetValue = Math.max(0, Number(offset) || 0);
  sql += ` ORDER BY spent_at DESC LIMIT ${limitValue} OFFSET ${offsetValue}`;

  const [rows] = await pool.execute(sql, params);
  return rows.map(serializeExpense);
};

export const getTotalExpenses = async (userId) => {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT IFNULL(SUM(amount),0) as total FROM expenses WHERE user_id = ?', [userId]);
  return rows[0].total || 0;
};

export const getCategoryTotals = async (userId, startDate = null, endDate = null) => {
  const pool = getPool();
  let sql = 'SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ?';
  const params = [userId];
  if (startDate) {
    sql += ' AND spent_at >= ?';
    params.push(startDate);
  }
  if (endDate) {
    sql += ' AND spent_at <= ?';
    params.push(endDate);
  }
  sql += ' GROUP BY category ORDER BY total DESC';
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export const getMonthlyTotals = async (userId, months = 12) => {
  const pool = getPool();
  const monthLimit = Math.max(0, Number(months) || 12);
  const [rows] = await pool.execute(
    `SELECT DATE_FORMAT(spent_at, '%Y-%m') as month, SUM(amount) as total
     FROM expenses WHERE user_id = ?
     GROUP BY month
     ORDER BY month DESC
     LIMIT ${monthLimit}`,
    [userId]
  );
  return rows;
};

export const getMonthlyReport = async (userId, year, month) => {
  const pool = getPool();
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const [endRows] = await pool.execute('SELECT LAST_DAY(?) as lastday', [start]);
  const end = endRows[0].lastday;

  const [totalRows] = await pool.execute('SELECT IFNULL(SUM(amount),0) as total FROM expenses WHERE user_id = ? AND DATE(spent_at) BETWEEN ? AND ?', [userId, start, end]);
  const [catRows] = await pool.execute('SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? AND DATE(spent_at) BETWEEN ? AND ? GROUP BY category', [userId, start, end]);
  const [dayRows] = await pool.execute('SELECT DATE(spent_at) as day, SUM(amount) as total FROM expenses WHERE user_id = ? AND DATE(spent_at) BETWEEN ? AND ? GROUP BY day ORDER BY day', [userId, start, end]);

  return { start, end, total: totalRows[0].total || 0, byCategory: catRows, byDay: dayRows };
};

export const getTripBudgetRemaining = async (tripId, userId) => {
  const pool = getPool();
  const [tripRows] = await pool.execute('SELECT budget FROM trips WHERE id = ? AND user_id = ?', [tripId, userId]);
  const trip = tripRows[0];
  if (!trip) return null;
  const [expenseRows] = await pool.execute('SELECT IFNULL(SUM(amount),0) as spent FROM expenses WHERE trip_id = ? AND user_id = ?', [tripId, userId]);
  const spent = expenseRows[0].spent || 0;
  return { budget: Number(trip.budget), spent: Number(spent), remaining: Number(trip.budget) - Number(spent) };
};