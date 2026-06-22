import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);
router.patch('/change-password', authenticate, changePassword);

export default router;
