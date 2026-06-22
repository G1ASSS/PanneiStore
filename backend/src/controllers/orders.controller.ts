import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError, successResponse } from '../utils/response.utils';
import { str, int } from '../utils/helpers.utils';
import { uploadImage } from '../services/cloudinary.service';
import { notifyUser } from '../services/notification.service';
import { OrderStatus, OrderType, PaymentGateway, Prisma } from '@prisma/client';
import { initiatePayment, PaymentGateway as ServiceGateway } from '../services/payment.service';

const generateOrderNumber = (type: OrderType): string => {
  const prefix = type === 'ACCOUNT' ? 'ACC' : 'DIA';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      type, accountId, diamondPackageId,
      notes, couponCode, paymentGateway,
    } = req.body;
    const quantity  = int(req.body.quantity)  ?? 1;
    const mlUserId  = str(req.body.mlUserId);
    const mlServerId = str(req.body.mlServerId);
    const buyerId = req.user!.id;

    let totalPrice = new Prisma.Decimal(0);
    let sellerId: string | null = null;

    if (type === 'ACCOUNT') {
      if (!accountId) throw new ApiError(400, 'Account ID is required');
      const account = await prisma.account.findUnique({ where: { id: accountId }, include: { seller: true } });
      if (!account) throw new ApiError(404, 'Account not found');
      if (account.status !== 'AVAILABLE') throw new ApiError(400, 'Account is no longer available');
      if (account.seller.userId === buyerId) throw new ApiError(400, 'You cannot purchase your own listing');
      totalPrice = account.price;
      sellerId = account.sellerId;
    } else if (type === 'DIAMOND') {
      if (!diamondPackageId) throw new ApiError(400, 'Diamond package ID is required');
      if (!mlUserId || !mlServerId) throw new ApiError(400, 'ML User ID and Server ID are required');
      const pkg = await prisma.diamondPackage.findUnique({ where: { id: diamondPackageId } });
      if (!pkg) throw new ApiError(404, 'Diamond package not found');
      if (!pkg.isActive) throw new ApiError(400, 'Diamond package is unavailable');
      totalPrice = pkg.price.mul(quantity);
    } else {
      throw new ApiError(400, 'Invalid order type');
    }

    let discountAmount = new Prisma.Decimal(0);
    let couponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: str(couponCode) } });
      if (!coupon || !coupon.isActive) throw new ApiError(400, 'Coupon is invalid or inactive');
      if (coupon.expiresAt && new Date() > coupon.expiresAt) throw new ApiError(400, 'Coupon has expired');
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new ApiError(400, 'Coupon max usage reached');
      if (coupon.minOrderAmount && totalPrice.lt(coupon.minOrderAmount)) {
        throw new ApiError(400, `Minimum order MMK ${coupon.minOrderAmount} required`);
      }
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = totalPrice.mul(coupon.discountValue).div(100);
        if (coupon.maxDiscount && discountAmount.gt(coupon.maxDiscount)) discountAmount = coupon.maxDiscount;
      } else {
        discountAmount = coupon.discountValue;
        if (discountAmount.gt(totalPrice)) discountAmount = totalPrice;
      }
      couponId = coupon.id;
    }

    const finalPrice = totalPrice.sub(discountAmount);
    const orderNumber = generateOrderNumber(type as OrderType);
    const gateway = str(paymentGateway) as PaymentGateway;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber, buyerId, sellerId,
          type: type as OrderType,
          totalPrice, discountAmount, finalPrice,
          status: 'PENDING',
          paymentMethod: str(paymentGateway),
          mlUserId, mlServerId,
          notes: str(notes),
          couponId,
          items: {
            create: {
              accountId: type === 'ACCOUNT' ? accountId : null,
              diamondPackageId: type === 'DIAMOND' ? diamondPackageId : null,
              quantity,
              unitPrice: type === 'ACCOUNT' ? totalPrice : totalPrice.div(quantity),
              subtotal: totalPrice,
            },
          },
        },
        include: {
          items: { include: { account: { include: { images: true } }, diamondPackage: true } },
        },
      });
      if (type === 'ACCOUNT' && accountId) {
        await tx.account.update({ where: { id: accountId }, data: { status: 'PENDING' } });
      }
      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      }
      await tx.payment.create({
        data: { orderId: newOrder.id, gateway, amount: finalPrice, currency: 'MMK', status: 'PENDING' },
      });
      return newOrder;
    });

    notifyUser({
      role: 'ADMIN', type: 'NEW_ORDER',
      title: 'New Order', message: `Order ${orderNumber} placed for MMK ${finalPrice}.`,
      data: { orderId: order.id },
    }).catch(console.error);

    if (order.sellerId) {
      prisma.seller.findUnique({ where: { id: order.sellerId } }).then((seller) => {
        if (seller) notifyUser({
          userId: seller.userId, type: 'NEW_ORDER',
          title: 'Account Order Received', message: `A buyer placed an order for your listing.`,
          data: { orderId: order.id },
        });
      }).catch(console.error);
    }

    let paymentFlowResponse = null;
    const gwStr = str(paymentGateway);
    if (gwStr && gwStr !== 'MANUAL') {
      try {
        paymentFlowResponse = await initiatePayment(gwStr as ServiceGateway, {
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: parseFloat(finalPrice.toString()),
          description: type === 'ACCOUNT' ? `ML Account: ${orderNumber}` : `ML Diamond top-up: ${orderNumber}`,
          callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/orders/webhook/${gwStr.toLowerCase()}`,
          returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/buyer/orders/${order.id}`,
        });
      } catch (err) {
        console.error('Payment gateway initiation failed', err);
      }
    }

    return successResponse(res, { order, paymentFlow: paymentFlowResponse }, 'Order created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const submitPaymentProof = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const transactionId = str(req.body.transactionId);

    const order = await prisma.order.findUnique({ where: { id }, include: { payment: true } });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.buyerId !== req.user!.id) throw new ApiError(403, 'No permission to update this order');
    if (order.status !== 'PENDING') throw new ApiError(400, 'Payment proof can only be submitted for pending orders');

    const file = req.file;
    if (!file) throw new ApiError(400, 'Payment proof image is required');

    const result = await uploadImage(file.buffer, 'receipts');

    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: id },
        data: { proofImageUrl: result.url, transactionId: transactionId ?? null, status: 'SUBMITTED' },
      });
      return tx.order.update({
        where: { id },
        data: { status: 'PAYMENT_SUBMITTED', paymentProof: result.url },
        include: { items: { include: { account: true, diamondPackage: true } } },
      });
    });

    notifyUser({
      role: 'ADMIN', type: 'PAYMENT_COMPLETED',
      title: 'Payment Proof Submitted',
      message: `Payment proof for order ${order.orderNumber}. TX: ${transactionId ?? 'N/A'}.`,
      data: { orderId: order.id },
    }).catch(console.error);

    return successResponse(res, updatedOrder, 'Payment proof submitted successfully');
  } catch (err) {
    next(err);
  }
};

export const getOrderDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        seller: { select: { id: true, shopName: true, userId: true } },
        items: { include: { account: { include: { images: true } }, diamondPackage: true } },
        payment: true,
        review: true,
      },
    });
    if (!order) throw new ApiError(404, 'Order not found');

    const isAdmin  = req.user!.role === 'ADMIN';
    const isBuyer  = order.buyerId === req.user!.id;
    const isSeller = order.seller?.userId === req.user!.id;

    if (!isAdmin && !isBuyer && !isSeller) throw new ApiError(403, 'No permission to view this order');
    return successResponse(res, order, 'Order fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const listBuyerOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page   = int(req.query.page)  ?? 1;
    const limit  = int(req.query.limit) ?? 10;
    const status = str(req.query.status);
    const type   = str(req.query.type);
    const skip   = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { buyerId: req.user!.id };
    if (status) where.status = status as OrderStatus;
    if (type) where.type = type as OrderType;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { account: { include: { images: { take: 1 } } }, diamondPackage: true } },
          seller: { select: { shopName: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse(res, { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }, 'Buyer orders fetched');
  } catch (err) {
    next(err);
  }
};

export const listSellerOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) throw new ApiError(403, 'Seller account not found');

    const page  = int(req.query.page)  ?? 1;
    const limit = int(req.query.limit) ?? 10;
    const status = str(req.query.status);
    const skip  = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { sellerId: seller.id, type: 'ACCOUNT' };
    if (status) where.status = status as OrderStatus;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { account: { include: { images: { take: 1 } } } } },
          buyer: { select: { name: true, email: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return successResponse(res, { orders, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }, 'Seller orders fetched');
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new ApiError(404, 'Order not found');

    const isAdmin = req.user!.role === 'ADMIN';
    const isBuyer = order.buyerId === req.user!.id;
    if (!isAdmin && !isBuyer) throw new ApiError(403, 'No permission to cancel this order');
    if (order.status !== 'PENDING' && !isAdmin) throw new ApiError(400, 'Only pending orders can be cancelled');

    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } });
      await tx.payment.update({ where: { orderId: id }, data: { status: 'FAILED' } });

      if (order.type === 'ACCOUNT') {
        const item = order.items.find((i) => i.accountId !== null);
        if (item && item.accountId) {
          await tx.account.update({ where: { id: item.accountId }, data: { status: 'AVAILABLE' } });
        }
      }
      return updated;
    });

    notifyUser({
      userId: order.buyerId, type: 'ORDER_CANCELLED',
      title: 'Order Cancelled', message: `Order ${order.orderNumber} cancelled.`,
      data: { orderId: order.id },
    }).catch(console.error);

    return successResponse(res, cancelledOrder, 'Order cancelled successfully');
  } catch (err) {
    next(err);
  }
};
