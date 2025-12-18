import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { allowRoles } from '../../middleware/role.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUpdateOwnProfile,
  validateStatusUpdate,
  validateResetPassword,
} from './validation.js';
import {
  getUsers,
  getStaff,
  getUserById,
  getMe,
  createUser,
  updateUser,
  updateMe,
  updateUserStatus,
  resetUserPassword,
} from './controller.js';
import { ROLES } from '../../core/constants.js';

const router = Router();

router.use(auth);

router.get('/me', getMe);
router.patch('/me', validateUpdateOwnProfile, updateMe);

router.get('/', allowRoles(ROLES.ADMIN), getUsers);
router.get('/staff', allowRoles(ROLES.ADMIN), getStaff);
router.post('/', allowRoles(ROLES.ADMIN), validateCreateUser, createUser);
router.get('/:id', allowRoles(ROLES.ADMIN), getUserById);
router.patch('/:id', allowRoles(ROLES.ADMIN), validateUpdateUser, updateUser);
router.patch(
  '/:id/status',
  allowRoles(ROLES.ADMIN),
  validateStatusUpdate,
  updateUserStatus,
);
router.patch(
  '/:id/reset-password',
  allowRoles(ROLES.ADMIN),
  validateResetPassword,
  resetUserPassword,
);

export default router;
