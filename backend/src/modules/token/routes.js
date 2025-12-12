import express from 'express';
import {
  createToken,
  getMyTokens,
  updateTokenStatus,
} from './controller.js';
import { auth } from '../../middleware/auth.js';
import { allowRoles } from '../../middleware/role.js';
import { ROLES } from '../../core/constants.js';
import {
  validateCreateToken,
  validateUpdateTokenStatus,
} from './validation.js';

const router = express.Router();

router.post('/', auth, validateCreateToken, createToken);
router.get('/me', auth, getMyTokens);
router.patch('/:id/status', auth, allowRoles(ROLES.ADMIN, ROLES.STAFF), validateUpdateTokenStatus, updateTokenStatus);

export default router;
