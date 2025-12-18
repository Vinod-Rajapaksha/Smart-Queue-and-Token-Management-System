import express from 'express';
import { auth } from '../../middleware/auth.js';
import { allowRoles } from '../../middleware/role.js';
import { ROLES } from '../../core/constants.js';
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
  allowRoles(ROLES.ADMIN),
  validateCreateBranch,
  createBranch
);

router.get('/', allowRoles(ROLES.ADMIN), getBranches);

router.get('/:id', allowRoles(ROLES.ADMIN), getBranchById);

router.patch(
  '/:id',
  allowRoles(ROLES.ADMIN),
  validateUpdateBranch,
  updateBranch
);

// Soft delete (deactivate)
router.delete('/:id', allowRoles(ROLES.ADMIN), deactivateBranch);

export default router;
