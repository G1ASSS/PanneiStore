import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { uploadSingle } from '../middleware/upload.middleware';
import {
  getAllBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBanner,
} from '../controllers/heroBanner.controller';

const router = Router();

// Public
router.get('/active', getActiveBanners);

// Admin
router.get('/', authenticate, requireAdmin, getAllBanners);
router.post('/', authenticate, requireAdmin, uploadSingle, createBanner);
router.put('/:id', authenticate, requireAdmin, uploadSingle, updateBanner);
router.delete('/:id', authenticate, requireAdmin, deleteBanner);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleBanner);

export default router;
