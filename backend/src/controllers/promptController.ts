import { Request, Response, NextFunction } from 'express';
import * as promptService from '../services/promptService';
import {
  CreatePromptInput,
  UpdatePromptInput,
  QueryPromptsInput,
  FillVariablesInput,
  RestoreVersionInput,
} from '../utils/validation';

/**
 * Create a new prompt
 * POST /api/prompts
 */
export async function createPrompt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const data: CreatePromptInput = req.body;

    const prompt = await promptService.createPrompt(userId, data);

    res.status(201).json({
      message: 'Prompt created successfully',
      prompt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get prompts with filters and pagination
 * GET /api/prompts?category=X&tags=Y&search=Z&page=1&limit=20
 */
export async function getPrompts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const query: QueryPromptsInput = req.query as any;

    const result = await promptService.getPrompts(userId, query);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific prompt by ID
 * GET /api/prompts/:id
 */
export async function getPrompt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const promptId = req.params.id;

    const prompt = await promptService.getPromptById(promptId, userId);

    res.status(200).json({ prompt });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a prompt
 * PUT /api/prompts/:id
 */
export async function updatePrompt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const promptId = req.params.id;
    const data: UpdatePromptInput = req.body;

    const prompt = await promptService.updatePrompt(promptId, userId, data);

    res.status(200).json({
      message: 'Prompt updated successfully',
      prompt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a prompt
 * DELETE /api/prompts/:id
 */
export async function deletePrompt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const promptId = req.params.id;

    const result = await promptService.deletePrompt(promptId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get prompt version history
 * GET /api/prompts/:id/history
 */
export async function getPromptHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const promptId = req.params.id;

    const history = await promptService.getPromptHistory(promptId, userId);

    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
}

/**
 * Restore a specific version of a prompt
 * POST /api/prompts/:id/restore
 */
export async function restorePromptVersion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const promptId = req.params.id;
    const data: RestoreVersionInput = req.body;

    const prompt = await promptService.restorePromptVersion(promptId, userId, data);

    res.status(200).json({
      message: 'Prompt version restored successfully',
      prompt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Fill variables in a prompt
 * POST /api/prompts/:id/fill
 */
export async function fillPromptVariables(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId!;
    const promptId = req.params.id;
    const data: FillVariablesInput = req.body;

    const result = await promptService.fillPromptVariables(promptId, userId, data);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
