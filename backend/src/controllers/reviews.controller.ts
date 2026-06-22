import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError, successResponse } from '../utils/response.utils';
import { str, int } from '../utils/helpers.utils';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId  = str(req.body.orderId);
    const rating   = int(req.body.rating);
    const comment  = str(req.body.comment);
    const commentMyanmar = str(req.body.commentMyanmar);
    const { images } = req.body;
    const buyerId  = req.user!.id;

    if (!orderId || !rating) throw new ApiError(400, 'Order ID and rating are required');

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { review: true, items: true },
    });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.buyerId !== buyerId) throw new ApiError(403, 'No permission to review this order');
    if (order.status !== 'COMPLETED') throw new ApiError(400, 'Only completed orders can be reviewed');
    if (order.review) throw new ApiError(400, 'You have already reviewed this order');
    if (!order.sellerId) throw new ApiError(400, 'Cannot review an order without a seller');

    const review = await prisma.$transaction(async (tx) => {
      const accountItem = order.items.find((i) => i.accountId !== null);
      const accountId = accountItem?.accountId ?? null;

      const newReview = await tx.review.create({
        data: {
          orderId, buyerId, sellerId: order.sellerId!, accountId,
          rating, comment, commentMyanmar,
          images: images ? JSON.parse(JSON.stringify(images)) : null,
          isVerified: true,
        },
      });

      const agg = await tx.review.aggregate({
        where: { sellerId: order.sellerId! },
        _avg: { rating: true },
        _count: { id: true },
      });

      await tx.seller.update({
        where: { id: order.sellerId! },
        data: {
          rating: agg._avg.rating ?? rating,
          reviewCount: agg._count.id,
        },
      });

      return newReview;
    });

    return successResponse(res, review, 'Review submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getSellerReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sellerId } = req.params;
    const page  = int(req.query.page)  ?? 1;
    const limit = int(req.query.limit) ?? 10;
    const skip  = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { sellerId },
        include: {
          buyer: { select: { id: true, name: true, avatar: true } },
          account: { select: { id: true, title: true, titleMyanmar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.review.count({ where: { sellerId } }),
    ]);

    return successResponse(res, { reviews, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }, 'Seller reviews fetched');
  } catch (err) {
    next(err);
  }
};

export const getAccountReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { accountId },
      include: { buyer: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, reviews, 'Account reviews fetched');
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new ApiError(404, 'Review not found');
    if (req.user!.role !== 'ADMIN') throw new ApiError(403, 'Only admins can delete reviews');

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id } });
      const agg = await tx.review.aggregate({
        where: { sellerId: review.sellerId },
        _avg: { rating: true },
        _count: { id: true },
      });
      await tx.seller.update({
        where: { id: review.sellerId },
        data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count.id },
      });
    });

    return successResponse(res, null, 'Review deleted successfully');
  } catch (err) {
    next(err);
  }
};
