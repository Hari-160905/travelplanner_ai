import api from './axiosConfig';

export const tripPlanner = (payload) => api.post('/ai/trip-planner', payload);
export const packingList = (payload) => api.post('/ai/packing-list', payload);
export const budgetOptimizer = (payload) => api.post('/ai/budget-optimizer', payload);
export const chatAssistant = (payload) => api.post('/ai/chat', payload);
export const getAIHistory = () => api.get('/ai/history');
