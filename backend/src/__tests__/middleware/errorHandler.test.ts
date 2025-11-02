import { Request, Response } from 'express';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  errorHandler,
} from '../../middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('AppError', () => {
    it('should create error with status code and message', () => {
      const error = new AppError(400, 'Test error message');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error message');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ValidationError', () => {
    it('should create 400 error with custom message', () => {
      const error = new ValidationError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('should use default message when none provided', () => {
      const error = new ValidationError();
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create 401 error with custom message', () => {
      const error = new UnauthorizedError('Invalid token');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid token');
    });

    it('should use default message when none provided', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 error with custom message', () => {
      const error = new NotFoundError('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('should use default message when none provided', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError with correct status code', () => {
      const error = new AppError(403, 'Forbidden access');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Forbidden access',
      });
    });

    it('should handle ValidationError', () => {
      const error = new ValidationError('Invalid email format');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid email format',
      });
    });

    it('should handle UnauthorizedError', () => {
      const error = new UnauthorizedError('Session expired');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Session expired',
      });
    });

    it('should handle NotFoundError', () => {
      const error = new NotFoundError('Prompt not found');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Prompt not found',
      });
    });

    it('should handle generic Error with 500 status', () => {
      const error = new Error('Something went wrong');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });

    it('should use generic message for unknown errors', () => {
      const error = new Error('Database connection failed');
      
      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('error inheritance', () => {
    it('should maintain error chain', () => {
      const error = new ValidationError('Test');
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should allow instanceof checks', () => {
      const validationErr = new ValidationError();
      const unauthorizedErr = new UnauthorizedError();
      const notFoundErr = new NotFoundError();

      // All errors should be instances of AppError
      expect(validationErr).toBeInstanceOf(AppError);
      expect(unauthorizedErr).toBeInstanceOf(AppError);
      expect(notFoundErr).toBeInstanceOf(AppError);
      
      // Check error types by statusCode
      expect(validationErr.statusCode).toBe(400);
      expect(unauthorizedErr.statusCode).toBe(401);
      expect(notFoundErr.statusCode).toBe(404);
    });
  });
});

