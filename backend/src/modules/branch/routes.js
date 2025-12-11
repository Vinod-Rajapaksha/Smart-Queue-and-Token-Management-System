import express from 'express';
import { auth } from '../../middleware/auth.js';
import { allowRoles } from '../../middleware/role.js';
import {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deactivateBranch,
} from './controller.js';
import {
  validateCreateBranch,
  validateUpdateBranch,
} from './validation.js';

const router = express.Router();

router.use(auth);

router.post(
  '/',
  allowRoles('ADMIN'),
  validateCreateBranch,
  createBranch
);

router.get('/', allowRoles('ADMIN'), getBranches);

router.get('/:id', allowRoles('ADMIN'), getBranchById);

router.patch(
  '/:id',
  allowRoles('ADMIN'),
  validateUpdateBranch,
  updateBranch
);

// Soft delete (deactivate)
router.delete('/:id', allowRoles('ADMIN'), deactivateBranch);

export default router;
