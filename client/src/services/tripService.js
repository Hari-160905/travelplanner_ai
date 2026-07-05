import api from './axiosConfig';

export const getTrips = (params) => api.get('/trips', { params });
export const getTrip = (id) => api.get(`/trips/${id}`);
export const createTrip = (trip) => api.post('/trips', trip);
export const updateTrip = (id, trip) => api.put(`/trips/${id}`, trip);
export const deleteTrip = (id) => api.delete(`/trips/${id}`);
