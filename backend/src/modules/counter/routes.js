import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { allowRoles } from '../../middleware/role.js';
import { ROLES } from '../../core/constants.js';

import {
  create,
  list,
  getById,
  update,
  changeStatus,
  remove,
} from './controller.js';

const router = Router();

router.get('/', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER), list);
router.get('/:id', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER), getById);

router.post('/', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER), create);
router.patch('/:id', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER), update);
router.patch('/:id/status', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), changeStatus);
router.delete('/:id', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER), remove);

export default router;
