import api from './axiosConfig';

export const getExpenses = (params) => api.get('/expenses', { params });
export const getExpense = (id) => api.get(`/expenses/${id}`);
export const createExpense = (expense) => api.post('/expenses', expense);
export const updateExpense = (id, expense) => api.put(`/expenses/${id}`, expense);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const getSummary = () => api.get('/expenses/summary');
export const getMonthlyReport = (year, month) => api.get('/expenses/monthly-report', { params: { year, month } });
export const getBudgetRemaining = (tripId) => api.get('/expenses/budget-remaining', { params: { tripId } });
