import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { uploadSingle } from '../middleware/upload.middleware';
import {
  getAllAnnouncements,
  getActiveAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement,
} from '../controllers/announcement.controller';

const router = Router();

// Public
router.get('/active', getActiveAnnouncement);

// Admin
router.get('/', authenticate, requireAdmin, getAllAnnouncements);
router.post('/', authenticate, requireAdmin, uploadSingle, createAnnouncement);
router.put('/:id', authenticate, requireAdmin, uploadSingle, updateAnnouncement);
router.delete('/:id', authenticate, requireAdmin, deleteAnnouncement);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleAnnouncement);

export default router;
