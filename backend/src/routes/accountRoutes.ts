import { Router } from 'express';
import * as accountController from '../controllers/accountController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createAccountSchema, updateAccountSchema } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/accounts/active - Get active account (must be before /:id)
router.get('/active', accountController.getActiveAccount);

// POST /api/accounts - Create new account
router.post(
  '/',
  validateBody(createAccountSchema),
  accountController.createAccount
);

// GET /api/accounts - List all accounts
router.get('/', accountController.getAccounts);

// GET /api/accounts/:id - Get specific account
router.get('/:id', accountController.getAccount);

// PUT /api/accounts/:id - Update account
router.put(
  '/:id',
  validateBody(updateAccountSchema),
  accountController.updateAccount
);

// DELETE /api/accounts/:id - Delete account
router.delete('/:id', accountController.deleteAccount);

// POST /api/accounts/:id/set-active - Set account as active
router.post('/:id/set-active', accountController.setActiveAccount);

export default router;
