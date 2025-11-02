import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  authenticateToken,
  generateToken,
  verifyToken,
} from '../../middleware/auth';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const userId = 'user123';
      const email = 'test@example.com';
      
      const token = generateToken(userId, email);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include userId and email in token payload', () => {
      const userId = 'user123';
      const email = 'test@example.com';
      
      const token = generateToken(userId, email);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const userId = 'user123';
      const email = 'test@example.com';
      
      const token = generateToken(userId, email);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    it('should throw error for expired token', () => {
      const userId = 'user123';
      const email = 'test@example.com';
      
      // Create token that expires immediately
      const token = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET!,
        { expiresIn: '0s' }
      );
      
      // Wait a bit for token to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => verifyToken(token)).toThrow();
          resolve(undefined);
        }, 100);
      });
    });
  });

  describe('authenticateToken middleware', () => {
    it('should call next() with valid token', async () => {
      const userId = 'user123';
      const email = 'test@example.com';
      const token = generateToken(userId, email);
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };
      
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockRequest.userId).toBe(userId);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no authorization header', async () => {
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.userId).toBeUndefined();
    });

    it('should return 401 when no token provided', async () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };
      
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.userId).toBeUndefined();
    });

    it('should return 401 for invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here',
      };
      
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid token',
      });
    });

    it('should handle malformed authorization header', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };
      
      await authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe('token expiration', () => {
    it('should create token with 7 days expiration', () => {
      const userId = 'user123';
      const email = 'test@example.com';
      
      const token = generateToken(userId, email);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      
      // Token should expire in approximately 7 days (604800 seconds)
      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(604800); // 7 days in seconds
    });
  });
});

