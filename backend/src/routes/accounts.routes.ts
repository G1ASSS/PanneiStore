import { Router } from 'express';
import {
  listAccounts,
  getAvailableAccountsCount,
  getAccountDetails,
  createAccount,
  updateAccount,
  deleteAccount,
  buyRequest,
} from '../controllers/accounts.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireSeller } from '../middleware/role.middleware';
import { uploadMultiple } from '../middleware/upload.middleware';

const router = Router();

router.get('/count', getAvailableAccountsCount);
router.get('/', listAccounts);
router.get('/:id', getAccountDetails);
router.post('/:id/buy-request', buyRequest);
router.post('/', authenticate, requireSeller, uploadMultiple, createAccount);
router.patch('/:id', authenticate, uploadMultiple, updateAccount);
router.delete('/:id', authenticate, deleteAccount);

export default router;
