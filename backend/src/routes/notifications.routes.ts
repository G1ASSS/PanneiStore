import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { prisma } from '../server';
import { successResponse } from '../utils/response.utils';

const router = Router();
router.use(authenticate);

// GET /notifications — fetch my notifications
router.get('/', async (req: any, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return successResponse(res, { notifications });
  } catch (err) { next(err); }
});

// PATCH /notifications/:id/read — mark one as read
router.patch('/:id/read', async (req: any, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { readAt: new Date() },
    });
    return successResponse(res, null, 'Marked as read');
  } catch (err) { next(err); }
});

// PATCH /notifications/read-all — mark all as read
router.patch('/read-all', async (req: any, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, readAt: null },
      data: { readAt: new Date() },
    });
    return successResponse(res, null, 'All marked as read');
  } catch (err) { next(err); }
});

export default router;
