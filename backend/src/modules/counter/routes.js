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

router.get('/', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), list);
router.get('/:id', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), getById);

router.post('/', auth, allowRoles(ROLES.ADMIN), create);
router.patch('/:id', auth, allowRoles(ROLES.ADMIN), update);
router.patch('/:id/status', auth, allowRoles(ROLES.ADMIN), changeStatus);
router.delete('/:id', auth, allowRoles(ROLES.ADMIN), remove);

export default router;
