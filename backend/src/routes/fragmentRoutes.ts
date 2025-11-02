import { Router } from 'express';
import * as fragmentController from '../controllers/fragmentController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createFragmentSchema, updateFragmentSchema } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/fragments - Create new fragment
router.post(
  '/',
  validateBody(createFragmentSchema),
  fragmentController.createFragment
);

// GET /api/fragments - List all fragments
router.get('/', fragmentController.getFragments);

// GET /api/fragments/:id - Get specific fragment
router.get('/:id', fragmentController.getFragment);

// PUT /api/fragments/:id - Update fragment
router.put(
  '/:id',
  validateBody(updateFragmentSchema),
  fragmentController.updateFragment
);

// DELETE /api/fragments/:id - Delete fragment
router.delete('/:id', fragmentController.deleteFragment);

export default router;
