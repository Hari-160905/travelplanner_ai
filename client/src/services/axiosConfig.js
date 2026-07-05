import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  // Do not send credentials by default; backend uses token in Authorization header.
  // `withCredentials: true` can cause CORS failures when server does not
  // set Access-Control-Allow-Credentials. Keep false to avoid preflight issues.
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('travel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
