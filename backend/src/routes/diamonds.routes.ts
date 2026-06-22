import { Router } from 'express';
import {
  listPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  verifyPlayer,
} from '../controllers/diamonds.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.get('/', listPackages);
router.get('/:id', getPackageById);
router.post('/verify-player', verifyPlayer);

// Admin only routes
router.post('/', authenticate, requireAdmin, createPackage);
router.patch('/:id', authenticate, requireAdmin, updatePackage);
router.delete('/:id', authenticate, requireAdmin, deletePackage);

export default router;
