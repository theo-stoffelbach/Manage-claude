import React, { createContext, useContext, useState, useEffect } from 'react';
import socket from '../services/socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connect socket
    socket.connect();

    // Check authentication status on mount
    socket.emit('auth:check');

    socket.on('auth:check:result', (data) => {
      if (data.authenticated) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => {
      socket.off('auth:check:result');
    };
  }, []);

  const register = (username, email, password) => {
    return new Promise((resolve, reject) => {
      socket.emit('auth:register', { username, email, password });

      socket.once('auth:register:success', (data) => {
        resolve(data);
      });

      socket.once('auth:register:error', (data) => {
        reject(new Error(data.message));
      });
    });
  };

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      socket.emit('auth:login', { username, password });

      socket.once('auth:login:success', (data) => {
        setUser(data.user);
        setIsAuthenticated(true);
        resolve(data);
      });

      socket.once('auth:login:error', (data) => {
        reject(new Error(data.message));
      });
    });
  };

  const logout = () => {
    return new Promise((resolve) => {
      socket.emit('auth:logout');

      socket.once('auth:logout:success', () => {
        setUser(null);
        setIsAuthenticated(false);
        resolve();
      });
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
