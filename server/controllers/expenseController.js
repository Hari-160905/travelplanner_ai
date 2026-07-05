import { validationResult } from 'express-validator';
import {
  createExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpensesByUser,
  getTotalExpenses,
  getCategoryTotals,
  getMonthlyTotals,
  getMonthlyReport,
  getTripBudgetRemaining,
} from '../models/expenseModel.js';

export const addExpense = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { tripId, category, amount, currency, description, spentAt } = req.body;
    const parsedTripId = tripId ? parseInt(tripId, 10) : null;
    
    const expense = await createExpense({ 
      userId: req.user.id, 
      tripId: parsedTripId, 
      category, 
      amount: parseFloat(amount), 
      currency, 
      description, 
      spentAt 
    });
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

export const listExpenses = async (req, res, next) => {
  try {
    const { tripId, category, startDate, endDate, limit, offset } = req.query;
    
    // FIX: Parse query parameter string values into true JavaScript integers
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    const parsedTripId = tripId ? parseInt(tripId, 10) : null;

    const expenses = await getExpensesByUser({ 
      userId: req.user.id, 
      tripId: parsedTripId, 
      category, 
      startDate, 
      endDate, 
      limit: parsedLimit, 
      offset: parsedOffset 
    });
    res.json({ count: expenses.length, expenses });
  } catch (err) {
    next(err);
  }
};

export const getExpense = async (req, res, next) => {
  try {
    const expense = await getExpenseById(req.params.id, req.user.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    next(err);
  }
};

export const editExpense = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    
    const { category, amount, currency, description, spentAt, tripId } = req.body;
    const parsedTripId = tripId ? parseInt(tripId, 10) : null;
    
    const expense = await updateExpense({ 
      expenseId: req.params.id, 
      userId: req.user.id, 
      category, 
      amount: parseFloat(amount), 
      currency, 
      description, 
      spentAt, 
      tripId: parsedTripId 
    });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    next(err);
  }
};

export const removeExpense = async (req, res, next) => {
  try {
    const success = await deleteExpense(req.params.id, req.user.id);
    if (!success) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
};

export const summary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const total = await getTotalExpenses(req.user.id);
    const categories = await getCategoryTotals(req.user.id, startDate, endDate);
    const monthly = await getMonthlyTotals(req.user.id, 12);
    res.json({ total, categories, monthly });
  } catch (err) {
    next(err);
  }
};

export const monthlyReport = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ message: 'year and month query params required' });
    const report = await getMonthlyReport(req.user.id, Number(year), Number(month));
    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const budgetRemaining = async (req, res, next) => {
  try {
    const { tripId } = req.query;
    if (!tripId) return res.status(400).json({ message: 'tripId query param required' });
    const result = await getTripBudgetRemaining(Number(tripId), req.user.id);
    if (result === null) return res.status(404).json({ message: 'Trip not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
};