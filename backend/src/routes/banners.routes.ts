import { Router } from 'express';
import {
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/banners.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = Router();

// Public route
router.get('/', listBanners);

// Admin only routes
router.post('/', authenticate, requireAdmin, uploadSingle, createBanner);
router.patch('/:id', authenticate, requireAdmin, uploadSingle, updateBanner);
router.delete('/:id', authenticate, requireAdmin, deleteBanner);

export default router;
