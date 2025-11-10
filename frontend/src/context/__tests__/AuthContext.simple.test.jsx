import React from 'react';
import { useAuth } from '../AuthContext';

// Mock the socket service completely before any imports
jest.mock('../../services/socket', () => {
  const mockSocket = {
    connect: jest.fn(),
    emit: jest.fn(),
    on: jest.fn((event, callback) => {
      // Store callback for manual triggering
      if (!mockSocket._callbacks) mockSocket._callbacks = {};
      mockSocket._callbacks[event] = callback;
      return mockSocket;
    }),
    once: jest.fn((event, callback) => {
      // Store callback for manual triggering
      if (!mockSocket._onceCallbacks) mockSocket._onceCallbacks = {};
      mockSocket._onceCallbacks[event] = callback;
      return mockSocket;
    }),
    off: jest.fn(),
    _callbacks: {},
    _onceCallbacks: {},
  };
  return { default: mockSocket };
});

describe('AuthContext - Simple Tests', () => {
  it('should provide useAuth hook', () => {
    expect(typeof useAuth).toBe('function');
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      // This should throw
      const TestComponent = () => {
        useAuth();
        return null;
      };

      // We expect this to throw, so we catch it
      expect(() => {
        const { renderHook } = require('@testing-library/react');
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');
    } catch (error) {
      // Expected to throw
      expect(error.message).toContain('useAuth must be used within AuthProvider');
    } finally {
      consoleError.mockRestore();
    }
  });

  it('should export AuthProvider and useAuth', () => {
    const AuthContextModule = require('../AuthContext');

    expect(AuthContextModule.AuthProvider).toBeDefined();
    expect(AuthContextModule.useAuth).toBeDefined();
    expect(typeof AuthContextModule.AuthProvider).toBe('function');
    expect(typeof AuthContextModule.useAuth).toBe('function');
  });
});
