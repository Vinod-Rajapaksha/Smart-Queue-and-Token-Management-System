import express from 'express';
import { auth } from '../../middleware/auth.js';
import { allowRoles } from '../../middleware/role.js';
import { ROLES } from '../../core/constants.js';
import {
  getOverview,
  getVolume,
  getRatings,
} from './controller.js';

const router = express.Router();

router.get('/overview', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER), getOverview);
router.get('/volume', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER), getVolume);
router.get('/ratings', auth, allowRoles(ROLES.ADMIN, ROLES.MANAGER), getRatings);

export default router;
