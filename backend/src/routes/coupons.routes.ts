import { Router } from 'express';
import {
  validateCoupon,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/coupons.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

// Public / Buyer route
router.post('/validate', validateCoupon);

// Admin only routes
router.get('/', authenticate, requireAdmin, listCoupons);
router.post('/', authenticate, requireAdmin, createCoupon);
router.patch('/:id', authenticate, requireAdmin, updateCoupon);
router.delete('/:id', authenticate, requireAdmin, deleteCoupon);

export default router;
