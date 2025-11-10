import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock the socket service
jest.mock('../../services/socket', () => ({
  default: {
    connect: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),
  }
}));

const socket = require('../../services/socket').default;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should render children', () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should connect socket on mount', () => {
      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      expect(socket.connect).toHaveBeenCalled();
    });

    it('should check authentication status on mount', () => {
      render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      expect(socket.emit).toHaveBeenCalledWith('auth:check');
    });

    it('should handle authenticated user response', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };

      socket.on.mockImplementation((event, callback) => {
        if (event === 'auth:check:result') {
          setTimeout(() => callback({ authenticated: true, user: mockUser }), 0);
        }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle unauthenticated user response', async () => {
      socket.on.mockImplementation((event, callback) => {
        if (event === 'auth:check:result') {
          setTimeout(() => callback({ authenticated: false }), 0);
        }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');

      consoleError.mockRestore();
    });

    it('should provide auth context when used inside AuthProvider', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
    });
  });

  describe('register function', () => {
    it('should emit register event and resolve on success', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const mockResponse = { message: 'Registration successful' };

      socket.once.mockImplementation((event, callback) => {
        if (event === 'auth:register:success') {
          setTimeout(() => callback(mockResponse), 0);
        }
      });

      let registerPromise;
      await act(async () => {
        registerPromise = result.current.register('testuser', 'test@example.com', 'password123');
      });

      await waitFor(async () => {
        const response = await registerPromise;
        expect(response).toEqual(mockResponse);
        expect(socket.emit).toHaveBeenCalledWith('auth:register', {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should reject on registration error', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      socket.once.mockImplementation((event, callback) => {
        if (event === 'auth:register:error') {
          setTimeout(() => callback({ message: 'Username already exists' }), 0);
        }
      });

      let registerPromise;
      await act(async () => {
        registerPromise = result.current.register('testuser', 'test@example.com', 'password123');
      });

      await expect(registerPromise).rejects.toThrow('Username already exists');
    });
  });

  describe('login function', () => {
    it('should emit login event and update state on success', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      const mockResponse = { message: 'Login successful', user: mockUser };

      socket.once.mockImplementation((event, callback) => {
        if (event === 'auth:login:success') {
          setTimeout(() => callback(mockResponse), 0);
        }
      });

      let loginPromise;
      await act(async () => {
        loginPromise = result.current.login('testuser', 'password123');
      });

      await waitFor(async () => {
        const response = await loginPromise;
        expect(response).toEqual(mockResponse);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
      });
    });

    it('should reject on login error', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      socket.once.mockImplementation((event, callback) => {
        if (event === 'auth:login:error') {
          setTimeout(() => callback({ message: 'Invalid credentials' }), 0);
        }
      });

      let loginPromise;
      await act(async () => {
        loginPromise = result.current.login('testuser', 'wrongpassword');
      });

      await expect(loginPromise).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout function', () => {
    it('should emit logout event and clear state on success', async () => {
      // First set up authenticated state
      socket.on.mockImplementation((event, callback) => {
        if (event === 'auth:check:result') {
          setTimeout(() => callback({
            authenticated: true,
            user: { id: 1, username: 'testuser' }
          }), 0);
        }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      // Wait for initial authentication
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Now test logout
      socket.once.mockImplementation((event, callback) => {
        if (event === 'auth:logout:success') {
          setTimeout(() => callback(), 0);
        }
      });

      await act(async () => {
        await result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(socket.emit).toHaveBeenCalledWith('auth:logout');
      });
    });
  });
});
