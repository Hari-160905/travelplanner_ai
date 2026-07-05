import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as loginRequest, register as registerRequest, fetchProfile, logout as logoutRequest } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('travel_token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProfile()
      .then((res) => setUser(res.data))
      .catch(() => window.localStorage.removeItem('travel_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (values) => {
    const res = await loginRequest(values);
    window.localStorage.setItem('travel_token', res.data.token);
    setUser(res.data.user);
    return res;
  };

  const register = async (values) => {
    const res = await registerRequest(values);
    window.localStorage.setItem('travel_token', res.data.token);
    setUser(res.data.user);
    return res;
  };

  const logout = async () => {
    await logoutRequest().catch(() => {});
    window.localStorage.removeItem('travel_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
