import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => {
    try {
      const stored = localStorage.getItem('eventhub_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount (handles page refreshes)
  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('eventhub_token');
      if (!token) { setLoading(false); return; }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
        localStorage.setItem('eventhub_user', JSON.stringify(data));
      } catch {
        localStorage.removeItem('eventhub_token');
        localStorage.removeItem('eventhub_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  // Listen for 401 events from the axios interceptor
  useEffect(() => {
    const handler = () => { setUser(null); };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('eventhub_token', data.token);
    localStorage.setItem('eventhub_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('eventhub_token', data.token);
    localStorage.setItem('eventhub_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('eventhub_token');
    localStorage.removeItem('eventhub_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('eventhub_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
