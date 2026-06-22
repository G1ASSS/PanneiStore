import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError, successResponse } from '../utils/response.utils';
import { str, int } from '../utils/helpers.utils';

// ─── Wishlist ──────────────────────────────────────────────────────────────
export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.id },
      include: {
        account: {
          include: {
            images: { orderBy: { order: 'asc' } },
            seller: { select: { shopName: true, isApproved: true, rating: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, items, 'Wishlist fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const accountId = str(req.body.accountId);
    if (!accountId) throw new ApiError(400, 'Account ID is required');

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new ApiError(404, 'Account not found');

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_accountId: { userId: req.user!.id, accountId } },
    });
    if (existing) return successResponse(res, existing, 'Item already in wishlist');

    const item = await prisma.wishlistItem.create({ data: { userId: req.user!.id, accountId } });
    return successResponse(res, item, 'Added to wishlist', 201);
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accountId } = req.params;
    await prisma.wishlistItem.delete({
      where: { userId_accountId: { userId: req.user!.id, accountId } },
    });
    return successResponse(res, null, 'Removed from wishlist');
  } catch (err) {
    next(err);
  }
};

// ─── Cart ──────────────────────────────────────────────────────────────────
export const getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: {
        account: {
          include: {
            images: { orderBy: { order: 'asc' } },
            seller: { select: { shopName: true, isApproved: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, items, 'Cart fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const accountId = str(req.body.accountId);
    if (!accountId) throw new ApiError(400, 'Account ID is required');

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new ApiError(404, 'Account not found');
    if (account.status !== 'AVAILABLE') throw new ApiError(400, 'Account is not available');

    const existing = await prisma.cartItem.findUnique({
      where: { userId_accountId: { userId: req.user!.id, accountId } },
    });
    if (existing) return successResponse(res, existing, 'Item already in cart');

    const item = await prisma.cartItem.create({ data: { userId: req.user!.id, accountId } });
    return successResponse(res, item, 'Added to cart', 201);
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { accountId } = req.params;
    await prisma.cartItem.delete({
      where: { userId_accountId: { userId: req.user!.id, accountId } },
    });
    return successResponse(res, null, 'Removed from cart');
  } catch (err) {
    next(err);
  }
};

// ─── Buyer Analytics ──────────────────────────────────────────────────────
export const getBuyerDashboardAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const [totalOrders, pendingPayments, completedOrders, totalSpentResult] = await Promise.all([
      prisma.order.count({ where: { buyerId: userId } }),
      prisma.order.count({ where: { buyerId: userId, status: 'PENDING' } }),
      prisma.order.count({ where: { buyerId: userId, status: 'COMPLETED' } }),
      prisma.order.aggregate({
        where: { buyerId: userId, status: 'COMPLETED' },
        _sum: { finalPrice: true },
      }),
    ]);

    return successResponse(res, {
      stats: {
        totalOrders, pendingPayments, completedOrders,
        totalSpent: totalSpentResult._sum.finalPrice ?? 0,
      },
    }, 'Buyer dashboard analytics fetched');
  } catch (err) {
    next(err);
  }
};
