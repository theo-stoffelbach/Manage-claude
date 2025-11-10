import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock Navigate component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }) => <div data-testid="navigate">Redirecting to {to}</div>
}));

describe('ProtectedRoute', () => {
  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state when authentication is being checked', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: 1, username: 'testuser' }
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('should render multiple children when authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: 1, username: 'testuser' }
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Content 1</div>
        <div>Content 2</div>
        <div>Content 3</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.getByText('Content 3')).toBeInTheDocument();
  });
});
