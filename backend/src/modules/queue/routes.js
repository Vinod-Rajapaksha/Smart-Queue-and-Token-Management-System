import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { allowRoles } from '../../middleware/role.js';
import { ROLES } from '../../core/constants.js';

import * as controller from './controller.js';
import {
  validateOpenQueue,
  validateCloseQueue,
  validateGetActiveQueue,
  validateCallNext,
  validateTokenAction,
} from './validation.js';

const router = Router();

router.post('/open', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), validateOpenQueue, controller.open);
router.patch('/close', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), validateCloseQueue, controller.close);

router.get('/active/:counterId', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), validateGetActiveQueue, controller.active);

router.post('/next', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), validateCallNext, controller.next);

router.patch('/tokens/:tokenId/serving', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), validateTokenAction, controller.serving);
router.patch('/tokens/:tokenId/skipped', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), validateTokenAction, controller.skipped);
router.patch('/tokens/:tokenId/cancelled', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), validateTokenAction, controller.cancelled);
router.patch('/tokens/:tokenId/completed', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), validateTokenAction, controller.completed);

router.get('/', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF), controller.list);

export default router;
