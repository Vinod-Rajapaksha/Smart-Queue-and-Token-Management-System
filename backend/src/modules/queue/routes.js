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

router.post('/open', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), validateOpenQueue, controller.open);
router.patch('/close', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), validateCloseQueue, controller.close);

router.get('/active/:branchId', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), validateGetActiveQueue, controller.active);

router.post('/next', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), validateCallNext, controller.next);

router.patch('/tokens/:tokenId/served', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), validateTokenAction, controller.served);
router.patch('/tokens/:tokenId/no-show', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), validateTokenAction, controller.noShow);

router.get('/', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), controller.list);

export default router;
