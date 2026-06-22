import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { uploadSingle } from '../middleware/upload.middleware';
import {
  getActiveGames,
  getAllGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  toggleGameStatus,
} from '../controllers/games.controller';

const router = Router();

// Public routes
router.get('/active', getActiveGames);
router.get('/:id', getGame);

// Admin routes
router.get('/', authenticate, requireAdmin, getAllGames);
router.post('/', authenticate, requireAdmin, uploadSingle, createGame);
router.put('/:id', authenticate, requireAdmin, uploadSingle, updateGame);
router.delete('/:id', authenticate, requireAdmin, deleteGame);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleGameStatus);

export default router;
