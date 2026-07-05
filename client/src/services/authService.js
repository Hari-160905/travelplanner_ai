import api from './axiosConfig';

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (credentials) => api.post('/auth/register', credentials);
export const fetchProfile = () => api.get('/auth/profile');
export const logout = () => api.post('/auth/logout');
