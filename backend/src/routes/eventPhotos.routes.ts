import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { uploadSingle } from '../middleware/upload.middleware';
import {
  getActiveEventPhotos,
  getAllEventPhotos,
  getEventPhoto,
  createEventPhoto,
  updateEventPhoto,
  deleteEventPhoto,
  toggleEventPhotoStatus,
} from '../controllers/eventPhotos.controller';

const router = Router();

// Public routes
router.get('/active', getActiveEventPhotos);
router.get('/:id', getEventPhoto);

// Admin routes
router.get('/', authenticate, requireAdmin, getAllEventPhotos);
router.post('/', authenticate, requireAdmin, uploadSingle, createEventPhoto);
router.put('/:id', authenticate, requireAdmin, uploadSingle, updateEventPhoto);
router.delete('/:id', authenticate, requireAdmin, deleteEventPhoto);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleEventPhotoStatus);

export default router;
