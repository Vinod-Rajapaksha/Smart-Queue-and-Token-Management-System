import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import {
  validateLogin,
  validateRefreshToken,
  validateRegister,
} from './validation.js';
import {
  login,
  refreshToken,
  register,
  logout,
} from './controller.js';

const router = Router();

router.post('/register', validateRegister, register);

router.post('/login', validateLogin, login);

router.post('/refresh-token', validateRefreshToken, refreshToken);

router.post('/logout', auth, logout);

export default router;
