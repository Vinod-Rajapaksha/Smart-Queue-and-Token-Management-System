import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { allowRoles } from '../../middleware/role.js';
import { ROLES } from '../../core/constants.js';

import {
  createRatingController,
  listRatingsController,
  ratingSummaryController,
} from './controller.js';

import { validateCreateRating } from './validation.js';

const router = Router();

router.post('/', auth, allowRoles(ROLES.CUSTOMER), validateCreateRating, createRatingController);

router.get('/', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), listRatingsController);
router.get('/summary', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), ratingSummaryController);

export default router;
