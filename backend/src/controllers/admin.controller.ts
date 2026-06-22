import { Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError, successResponse } from '../utils/response.utils';
import { str, int, flt } from '../utils/helpers.utils';
import { notifyUser } from '../services/notification.service';
import { uploadImage } from '../services/cloudinary.service';
import { OrderStatus, Prisma } from '@prisma/client';

export const getAdminAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers, totalSellers, pendingSellers,
      totalCompletedOrders, totalRevenueResult,
      accountSalesCount, diamondSalesCount,
      recentPayments, pendingPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.seller.count({ where: { isApproved: true } }),
      prisma.seller.count({ where: { isApproved: false } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { finalPrice: true } }),
      prisma.order.count({ where: { status: 'COMPLETED', type: 'ACCOUNT' } }),
      prisma.order.count({ where: { status: 'COMPLETED', type: 'DIAMOND' } }),
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' }, take: 5,
        include: { order: { include: { buyer: { select: { name: true } } } } },
      }),
      prisma.payment.findMany({
        where: { status: 'SUBMITTED' },
        include: { order: { include: { buyer: { select: { name: true } } } } },
      }),
    ]);

    return successResponse(res, {
      stats: {
        totalUsers, totalSellers, pendingSellers,
        totalCompletedOrders, accountSalesCount, diamondSalesCount,
        totalRevenue: totalRevenueResult._sum.finalPrice ?? 0,
      },
      recentPayments, pendingPayments,
    }, 'Admin analytics fetched');
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page   = int(req.query.page)  ?? 1;
    const limit  = int(req.query.limit) ?? 10;
    const search = str(req.query.search);
    const role   = str(req.query.role);
    const skip   = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role as any;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, isVerified: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse(res, { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }, 'Users fetched');
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const isActive = req.body.isActive === true || req.body.isActive === 'true';

    if (id === req.user!.id) throw new ApiError(400, 'Cannot alter your own account status');

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, email: true, name: true, isActive: true },
    });

    return successResponse(res, user, `User status updated to ${isActive ? 'active' : 'inactive'}`);
  } catch (err) {
    next(err);
  }
};

export const listSellersQueue = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellers = await prisma.seller.findMany({
      where: { isApproved: false },
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return successResponse(res, sellers, 'Pending sellers fetched');
  } catch (err) {
    next(err);
  }
};

export const approveSeller = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const isApproved = req.body.isApproved === true || req.body.isApproved === 'true';

    const seller = await prisma.seller.findUnique({ where: { id } });
    if (!seller) throw new ApiError(404, 'Seller not found');

    const updatedSeller = await prisma.seller.update({
      where: { id },
      data: { isApproved },
      include: { user: { select: { name: true } } },
    });

    notifyUser({
      userId: seller.userId,
      type: 'SELLER_APPROVED',
      title: isApproved ? 'Seller Account Approved!' : 'Application Rejected',
      message: isApproved
        ? 'Congratulations! You can now upload Mobile Legends accounts for sale.'
        : 'Your application was rejected. Contact support for details.',
      data: { isApproved },
    }).catch(console.error);

    return successResponse(res, updatedSeller, `Seller ${isApproved ? 'approved' : 'rejected'}`);
  } catch (err) {
    next(err);
  }
};

export const verifyPaymentProof = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const isApproved       = req.body.isApproved === true || req.body.isApproved === 'true';
    const rejectionReason  = str(req.body.rejectionReason);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.status !== 'PAYMENT_SUBMITTED') throw new ApiError(400, 'Order payment is not in submitted state');

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (isApproved) {
        await tx.payment.update({
          where: { orderId },
          data: { status: 'VERIFIED', verifiedBy: req.user!.name, verifiedAt: new Date() },
        });

        let nextStatus: OrderStatus = 'PAYMENT_VERIFIED';

        if (order.type === 'ACCOUNT') {
          nextStatus = 'COMPLETED';
          const item = order.items.find((i) => i.accountId !== null);
          if (item?.accountId) {
            await tx.account.update({ where: { id: item.accountId }, data: { status: 'SOLD' } });
          }
          if (order.sellerId) {
            await tx.seller.update({
              where: { id: order.sellerId },
              data: { totalSales: { increment: 1 }, totalRevenue: { increment: order.finalPrice } },
            });
          }
        } else {
          nextStatus = 'PROCESSING';
        }

        return tx.order.update({
          where: { id: orderId },
          data: { status: nextStatus, completedAt: nextStatus === 'COMPLETED' ? new Date() : null },
        });
      } else {
        await tx.payment.update({ where: { orderId }, data: { status: 'FAILED' } });

        if (order.type === 'ACCOUNT') {
          const item = order.items.find((i) => i.accountId !== null);
          if (item?.accountId) {
            await tx.account.update({ where: { id: item.accountId }, data: { status: 'AVAILABLE' } });
          }
        }

        return tx.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            notes: rejectionReason ? `Rejected: ${rejectionReason}` : 'Payment rejected',
          },
        });
      }
    });

    notifyUser({
      userId: order.buyerId,
      type: isApproved ? 'PAYMENT_VERIFIED' : 'ORDER_CANCELLED',
      title: isApproved ? 'Payment Verified!' : 'Payment Rejected',
      message: isApproved
        ? `Payment for order ${order.orderNumber} verified.`
        : `Payment for order ${order.orderNumber} rejected. ${rejectionReason ?? ''}`,
      data: { orderId, isApproved },
    }).catch(console.error);

    return successResponse(res, updatedOrder, isApproved ? 'Payment approved' : 'Payment rejected and order cancelled');
  } catch (err) {
    next(err);
  }
};

export const completeDiamondOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.type !== 'DIAMOND') throw new ApiError(400, 'Only diamond orders can be completed this way');
    if (order.status !== 'PROCESSING') throw new ApiError(400, 'Order must be in PROCESSING status');

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    notifyUser({
      userId: order.buyerId,
      type: 'PAYMENT_COMPLETED',
      title: 'Diamonds Delivered!',
      message: `Your diamond top-up order ${order.orderNumber} has been delivered.`,
      data: { orderId },
    }).catch(console.error);

    return successResponse(res, updatedOrder, 'Diamond order completed');
  } catch (err) {
    next(err);
  }
};

async function getPlatformSellerId(adminUserId: string): Promise<string> {
  const envSellerId = process.env.PLATFORM_SELLER_ID;
  if (envSellerId) {
    const seller = await prisma.seller.findUnique({ where: { id: envSellerId } });
    if (seller) return seller.id;
  }

  let seller = await prisma.seller.findUnique({ where: { userId: adminUserId } });
  if (!seller) {
    seller = await prisma.seller.create({
      data: {
        userId: adminUserId,
        shopName: 'PanneiStore',
        isApproved: true,
      },
    });
  } else if (!seller.isApproved) {
    seller = await prisma.seller.update({
      where: { id: seller.id },
      data: { isApproved: true },
    });
  }
  return seller.id;
}

export const adminCreateAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const listingCode = str(req.body.listingCode)?.trim();
    if (!listingCode) throw new ApiError(400, 'Listing ID is required');

    const existingCode = await prisma.account.findUnique({ where: { listingCode } });
    if (existingCode) throw new ApiError(409, 'Listing ID is already in use');

    const {
      title, titleMyanmar, description, descMyanmar,
      rank, server, heroes = [], skins = [],
    } = req.body;

    if (!title || !rank || !server) {
      throw new ApiError(400, 'Title, rank, and server are required');
    }

    const heroCount    = int(req.body.heroCount)   ?? 0;
    const skinCount    = int(req.body.skinCount)   ?? 0;
    const emblemCount  = int(req.body.emblemCount) ?? 0;
    const price        = flt(req.body.price)       ?? 0;
    const winRate      = flt(req.body.winRate)     ?? 0;
    const totalMatches = int(req.body.totalMatches) ?? 0;
    const level        = int(req.body.level)       ?? 0;
    const isFeatured   = req.body.isFeatured === true || req.body.isFeatured === 'true';

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) throw new ApiError(400, 'At least one account image is required');

    const uploadedImages: { url: string; publicId: string; isPrimary: boolean; order: number }[] = [];
    for (let i = 0; i < files.length; i++) {
      const result = await uploadImage(files[i].buffer, 'accounts');
      uploadedImages.push({ url: result.url, publicId: result.publicId, isPrimary: i === 0, order: i });
    }

    const heroList = typeof heroes === 'string' ? JSON.parse(heroes) : heroes;
    const skinList = typeof skins  === 'string' ? JSON.parse(skins)  : skins;
    const sellerId = await getPlatformSellerId(req.user!.id);

    const account = await prisma.account.create({
      data: {
        listingCode,
        sellerId,
        title, titleMyanmar, description, descMyanmar,
        rank, heroCount, skinCount, emblemCount,
        price: new Prisma.Decimal(price),
        server, winRate, totalMatches, level,
        isFeatured,
        status: 'AVAILABLE',
        images: { create: uploadedImages },
        heroes: { create: heroList },
        skins: { create: skinList },
      },
      include: { images: true, heroes: true, skins: true },
    });

    return successResponse(res, account, 'Account listing created successfully', 201);
  } catch (err) {
    next(err);
  }
};
