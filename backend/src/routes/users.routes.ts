import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  addToCart,
  removeFromCart,
  getBuyerDashboardAnalytics,
} from '../controllers/users.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/wishlist', getWishlist);
router.post('/wishlist', addToWishlist);
router.delete('/wishlist/:accountId', removeFromWishlist);

router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart/:accountId', removeFromCart);

router.get('/buyer-dashboard', getBuyerDashboardAnalytics);

export default router;
