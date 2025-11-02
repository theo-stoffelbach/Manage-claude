import { Request, Response, NextFunction } from 'express';
import * as fragmentService from '../services/fragmentService';
import { CreateFragmentInput, UpdateFragmentInput } from '../utils/validation';

/**
 * Create a new fragment
 * POST /api/fragments
 */
export async function createFragment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const data: CreateFragmentInput = req.body;

    const fragment = await fragmentService.createFragment(userId, data);

    res.status(201).json({
      message: 'Fragment created successfully',
      fragment,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all fragments for the authenticated user
 * GET /api/fragments
 */
export async function getFragments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const fragments = await fragmentService.getFragmentsByUserId(userId);

    res.status(200).json({
      fragments,
      count: fragments.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific fragment by ID
 * GET /api/fragments/:id
 */
export async function getFragment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const fragmentId = req.params.id;

    const fragment = await fragmentService.getFragmentById(fragmentId, userId);

    res.status(200).json({ fragment });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a fragment
 * PUT /api/fragments/:id
 */
export async function updateFragment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const fragmentId = req.params.id;
    const data: UpdateFragmentInput = req.body;

    const fragment = await fragmentService.updateFragment(fragmentId, userId, data);

    res.status(200).json({
      message: 'Fragment updated successfully',
      fragment,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a fragment
 * DELETE /api/fragments/:id
 */
export async function deleteFragment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const fragmentId = req.params.id;

    const result = await fragmentService.deleteFragment(fragmentId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
