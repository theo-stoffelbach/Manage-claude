import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { RegisterInput, LoginInput } from '../utils/validation';

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data: RegisterInput = req.body;
    const result = await authService.registerUser(data);

    res.status(201).json({
      message: 'User registered successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login a user
 * POST /api/auth/login
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data: LoginInput = req.body;
    const result = await authService.loginUser(data);

    res.status(200).json({
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!; // Set by authenticateToken middleware
    const user = await authService.getUserById(userId);

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}
