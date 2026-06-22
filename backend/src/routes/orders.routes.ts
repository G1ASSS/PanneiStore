import { Router } from 'express';
import {
  createOrder,
  submitPaymentProof,
  getOrderDetails,
  listBuyerOrders,
  listSellerOrders,
  cancelOrder,
} from '../controllers/orders.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireSeller } from '../middleware/role.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.post('/:id/payment', uploadSingle, submitPaymentProof);
router.get('/buyer', listBuyerOrders);
router.get('/seller', requireSeller, listSellerOrders);
router.get('/:id', getOrderDetails);
router.post('/:id/cancel', cancelOrder);

export default router;
