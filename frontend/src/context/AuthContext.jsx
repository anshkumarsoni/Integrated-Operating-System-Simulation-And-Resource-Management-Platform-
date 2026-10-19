import React, { createContext, useState, useEffect } from 'react';
import { auth as authApi } from '../api/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('os_sim_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username, password) => {
    const response = await authApi.login(username, password);
    if (response.success && response.user) {
      const userData = {
        ...response.user,
        lastLogin: new Date().toISOString()
      };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('os_sim_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return response;
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    if (response.success && response.user) {
      const userFull = {
        ...response.user,
        lastLogin: new Date().toISOString()
      };
      setUser(userFull);
      setIsAuthenticated(true);
      localStorage.setItem('os_sim_user', JSON.stringify(userFull));
      return { success: true, user: userFull };
    }
    return response;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('os_sim_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
