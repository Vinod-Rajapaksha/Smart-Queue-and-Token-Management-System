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

const router = Router();

router.use(auth);

router.get('/me', getMe);
router.patch('/me', validateUpdateOwnProfile, updateMe);

router.get('/', allowRoles('ADMIN'), getUsers);
router.get('/staff', allowRoles('ADMIN'), getStaff);
router.post('/', allowRoles('ADMIN'), validateCreateUser, createUser);
router.get('/:id', allowRoles('ADMIN'), getUserById);
router.patch('/:id', allowRoles('ADMIN'), validateUpdateUser, updateUser);
router.patch(
  '/:id/status',
  allowRoles('ADMIN'),
  validateStatusUpdate,
  updateUserStatus,
);
router.patch(
  '/:id/reset-password',
  allowRoles('ADMIN'),
  validateResetPassword,
  resetUserPassword,
);

export default router;
