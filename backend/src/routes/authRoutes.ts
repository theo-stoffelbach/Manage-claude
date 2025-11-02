import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { registerSchema, loginSchema } from '../utils/validation';

const router = Router();

// POST /api/auth/register - Register new user
router.post(
  '/register',
  validateBody(registerSchema),
  authController.register
);

// POST /api/auth/login - Login user
router.post(
  '/login',
  validateBody(loginSchema),
  authController.login
);

// GET /api/auth/me - Get current user (protected)
router.get(
  '/me',
  authenticateToken,
  authController.getCurrentUser
);

export default router;
