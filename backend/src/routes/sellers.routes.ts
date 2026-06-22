import { Router } from 'express';
import {
  registerSeller,
  getSellerProfile,
  getMySellerProfile,
  updateSellerProfile,
  getSellerDashboardAnalytics,
} from '../controllers/sellers.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/profile/:id', getSellerProfile);

// Authenticated routes
router.use(authenticate);
router.post('/register', registerSeller);
router.get('/profile/me', getMySellerProfile);
router.patch('/profile/me', updateSellerProfile);
router.get('/dashboard', getSellerDashboardAnalytics);

export default router;
