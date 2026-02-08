import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { allowRoles } from '../../middleware/role.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateUpdateOwnProfile,
  validateStatusUpdate,
  validateResetPassword,
  validateChangeOwnPassword,
} from './validation.js';
import {
  getUsers,
  getUserById,
  getMe,
  createUser,
  updateUser,
  updateMe,
  updateUserStatus,
  resetUserPassword,
  changeMyPassword,
  deleteUser, 
} from './controller.js';
import { ROLES } from '../../core/constants.js';

const router = Router();

router.use(auth);

router.get('/me', getMe);
router.patch('/me', validateUpdateOwnProfile, updateMe);
router.patch('/me/password', validateChangeOwnPassword, changeMyPassword);

router.get('/', allowRoles(ROLES.ADMIN, ROLES.MANAGER), getUsers);
router.post('/', allowRoles(ROLES.ADMIN, ROLES.MANAGER), validateCreateUser, createUser);

router.get('/:id', allowRoles(ROLES.ADMIN), getUserById);
router.patch('/:id', allowRoles(ROLES.ADMIN,ROLES.MANAGER), validateUpdateUser, updateUser);
router.patch(
  '/:id/status',
  allowRoles(ROLES.ADMIN,ROLES.MANAGER),
  validateStatusUpdate,
  updateUserStatus,
);
router.patch(
  '/:id/reset-password',
  allowRoles(ROLES.ADMIN,ROLES.MANAGER),
  validateResetPassword,
  resetUserPassword,
);

router.delete('/:id', allowRoles(ROLES.ADMIN, ROLES.MANAGER), deleteUser);

export default router;
