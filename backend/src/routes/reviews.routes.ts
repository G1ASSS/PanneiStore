import { Router } from 'express';
import {
  createReview,
  getSellerReviews,
  getAccountReviews,
  deleteReview,
} from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/seller/:sellerId', getSellerReviews);
router.get('/account/:accountId', getAccountReviews);

// Authenticated routes
router.post('/', authenticate, createReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
