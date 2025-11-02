import { Request, Response, NextFunction } from 'express';
import * as accountService from '../services/accountService';
import { CreateAccountInput, UpdateAccountInput } from '../utils/validation';

/**
 * Create a new account
 * POST /api/accounts
 */
export async function createAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const data: CreateAccountInput = req.body;

    const account = await accountService.createAccount(userId, data);

    res.status(201).json({
      message: 'Account created successfully',
      account,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all accounts for the authenticated user
 * GET /api/accounts
 */
export async function getAccounts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const accounts = await accountService.getAccountsByUserId(userId);

    res.status(200).json({
      accounts,
      count: accounts.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific account by ID
 * GET /api/accounts/:id
 */
export async function getAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const accountId = req.params.id;

    const account = await accountService.getAccountById(accountId, userId);

    res.status(200).json({ account });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an account
 * PUT /api/accounts/:id
 */
export async function updateAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const accountId = req.params.id;
    const data: UpdateAccountInput = req.body;

    const account = await accountService.updateAccount(accountId, userId, data);

    res.status(200).json({
      message: 'Account updated successfully',
      account,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an account
 * DELETE /api/accounts/:id
 */
export async function deleteAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const accountId = req.params.id;

    const result = await accountService.deleteAccount(accountId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Set an account as active
 * POST /api/accounts/:id/set-active
 */
export async function setActiveAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const accountId = req.params.id;

    const account = await accountService.setActiveAccount(accountId, userId);

    res.status(200).json({
      message: 'Account activated successfully',
      account,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get the active account
 * GET /api/accounts/active
 */
export async function getActiveAccount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const account = await accountService.getActiveAccount(userId);

    if (!account) {
      res.status(404).json({ message: 'No active account found' });
      return;
    }

    res.status(200).json({ account });
  } catch (error) {
    next(error);
  }
}
