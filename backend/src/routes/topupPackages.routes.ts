import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import {
  getPackagesByGame,
  getAllPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
} from '../controllers/topupPackages.controller';

const router = Router();

// Public routes
router.get('/game/:gameId', getPackagesByGame);
router.get('/:id', getPackage);

// Admin routes
router.get('/', authenticate, requireAdmin, getAllPackages);
router.post('/', authenticate, requireAdmin, createPackage);
router.put('/:id', authenticate, requireAdmin, updatePackage);
router.delete('/:id', authenticate, requireAdmin, deletePackage);
router.patch('/:id/toggle', authenticate, requireAdmin, togglePackageStatus);

export default router;
