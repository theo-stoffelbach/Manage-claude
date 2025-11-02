import { Router } from 'express';
import * as promptController from '../controllers/promptController';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createPromptSchema,
  updatePromptSchema,
  queryPromptsSchema,
  fillVariablesSchema,
  restoreVersionSchema,
} from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/prompts - Create new prompt
router.post(
  '/',
  validateBody(createPromptSchema),
  promptController.createPrompt
);

// GET /api/prompts - List prompts with filters
router.get(
  '/',
  validateQuery(queryPromptsSchema),
  promptController.getPrompts
);

// GET /api/prompts/:id - Get specific prompt
router.get('/:id', promptController.getPrompt);

// PUT /api/prompts/:id - Update prompt
router.put(
  '/:id',
  validateBody(updatePromptSchema),
  promptController.updatePrompt
);

// DELETE /api/prompts/:id - Delete prompt
router.delete('/:id', promptController.deletePrompt);

// GET /api/prompts/:id/history - Get prompt version history
router.get('/:id/history', promptController.getPromptHistory);

// POST /api/prompts/:id/restore - Restore a specific version
router.post(
  '/:id/restore',
  validateBody(restoreVersionSchema),
  promptController.restorePromptVersion
);

// POST /api/prompts/:id/fill - Fill variables in prompt
router.post(
  '/:id/fill',
  validateBody(fillVariablesSchema),
  promptController.fillPromptVariables
);

export default router;
