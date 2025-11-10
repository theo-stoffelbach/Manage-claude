import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock AuthContext
jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn()
  })
}));

// Mock socket service
jest.mock('./services/socket', () => ({
  default: {
    connect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  }
}));

describe('App Component', () => {
  it('should render App with AuthProvider', () => {
    render(<App />);

    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
