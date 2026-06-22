import { Router } from 'express';
import {
  getAdminAnalytics,
  listUsers,
  updateUserStatus,
  listSellersQueue,
  approveSeller,
  verifyPaymentProof,
  completeDiamondOrder,
  adminCreateAccount,
} from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { uploadMultiple } from '../middleware/upload.middleware';

const router = Router();

// Protect all admin endpoints
router.use(authenticate, requireAdmin);

router.get('/analytics', getAdminAnalytics);
router.get('/users', listUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/sellers/queue', listSellersQueue);
router.patch('/sellers/:id/approve', approveSeller);
router.post('/orders/:orderId/verify', verifyPaymentProof);
router.post('/orders/:orderId/complete-diamond', completeDiamondOrder);
router.post('/accounts', uploadMultiple, adminCreateAccount);

export default router;
