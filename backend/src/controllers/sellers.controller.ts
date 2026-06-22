import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError, successResponse } from '../utils/response.utils';
import { str } from '../utils/helpers.utils';
import { notifyUser } from '../services/notification.service';
import { Prisma } from '@prisma/client';

export const registerSeller = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { shopName, shopNameMyanmar, bio, bioMyanmar, avatar } = req.body;

    const existingSeller = await prisma.seller.findUnique({ where: { userId } });
    if (existingSeller) {
      throw new ApiError(400, 'You have already applied or registered as a seller');
    }

    const seller = await prisma.$transaction(async (tx) => {
      // Create seller profile
      const newSeller = await tx.seller.create({
        data: {
          userId,
          shopName,
          shopNameMyanmar,
          bio,
          bioMyanmar,
          avatar,
          isApproved: false,
        },
      });

      // Update User Role to SELLER
      await tx.user.update({
        where: { id: userId },
        data: { role: 'SELLER' },
      });

      return newSeller;
    });

    // Notify admins of new seller application
    notifyUser({
      role: 'ADMIN',
      type: 'SYSTEM',
      title: 'New Seller Application',
      titleMyanmar: 'ရောင်းသူအကောင့် လျှောက်ထားလွှာသစ်',
      message: `${shopName} has applied to become a seller.`,
      messageMyanmar: `${shopNameMyanmar || shopName} မှ ရောင်းသူအဖြစ် လျှောက်ထားလာပါသည်။`,
      data: { sellerId: seller.id },
    }).catch(console.error);

    return successResponse(res, seller, 'Seller registration submitted for admin approval', 201);
  } catch (err) {
    next(err);
  }
};

export const getSellerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = str(req.params.id)!;

    const seller = await prisma.seller.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, createdAt: true, avatar: true } },
        accounts: {
          where: { status: 'AVAILABLE' },
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: { images: { orderBy: { order: 'asc' } } },
        },
      },
    });

    if (!seller) throw new ApiError(404, 'Seller not found');

    return successResponse(res, seller, 'Seller profile fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const getMySellerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user!.id },
      include: { user: { select: { email: true, name: true, phone: true } } },
    });

    if (!seller) throw new ApiError(404, 'Seller profile not found');

    return successResponse(res, seller, 'My seller profile fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const updateSellerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { shopName, shopNameMyanmar, bio, bioMyanmar, avatar, isActive } = req.body;

    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) throw new ApiError(404, 'Seller profile not found');

    const updateData: Prisma.SellerUpdateInput = {};
    if (shopName !== undefined) updateData.shopName = shopName;
    if (shopNameMyanmar !== undefined) updateData.shopNameMyanmar = shopNameMyanmar;
    if (bio !== undefined) updateData.bio = bio;
    if (bioMyanmar !== undefined) updateData.bioMyanmar = bioMyanmar;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (isActive !== undefined && req.user!.role === 'ADMIN') updateData.isActive = isActive;

    const updatedSeller = await prisma.seller.update({
      where: { id: seller.id },
      data: updateData,
    });

    return successResponse(res, updatedSeller, 'Seller profile updated successfully');
  } catch (err) {
    next(err);
  }
};

export const getSellerDashboardAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) throw new ApiError(404, 'Seller profile not found');

    const [totalListings, soldListings, activeListings, totalRevenueResult, recentOrders] = await Promise.all([
      prisma.account.count({ where: { sellerId: seller.id } }),
      prisma.account.count({ where: { sellerId: seller.id, status: 'SOLD' } }),
      prisma.account.count({ where: { sellerId: seller.id, status: 'AVAILABLE' } }),
      prisma.order.aggregate({
        where: { sellerId: seller.id, status: 'COMPLETED' },
        _sum: { finalPrice: true },
      }),
      prisma.order.findMany({
        where: { sellerId: seller.id },
        include: {
          items: {
            include: {
              account: { include: { images: { take: 1 } } },
            },
          },
          buyer: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Format analytics charts (last 6 months sales activity)
    // We can group sales by month in JS for database compatibility
    const completedOrders = await prisma.order.findMany({
      where: {
        sellerId: seller.id,
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 5)), // Last 6 months
        },
      },
      select: { finalPrice: true, createdAt: true },
    });

    const monthlySales: { [key: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlySales[monthName] = 0;
    }

    completedOrders.forEach(o => {
      const m = new Date(o.createdAt);
      const label = `${months[m.getMonth()]} ${m.getFullYear().toString().slice(-2)}`;
      if (monthlySales[label] !== undefined) {
        monthlySales[label] += parseFloat(o.finalPrice.toString());
      }
    });

    const salesChart = Object.keys(monthlySales).map(key => ({
      month: key,
      sales: monthlySales[key],
    }));

    return successResponse(res, {
      stats: {
        totalListings,
        activeListings,
        soldListings,
        totalRevenue: totalRevenueResult._sum.finalPrice || 0,
        rating: seller.rating,
        responseRate: seller.responseRate,
      },
      recentOrders,
      salesChart,
    }, 'Seller dashboard analytics fetched successfully');
  } catch (err) {
    next(err);
  }
};
