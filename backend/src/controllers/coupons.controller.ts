import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError, successResponse } from '../utils/response.utils';
import { str, int, flt } from '../utils/helpers.utils';
import { Prisma } from '@prisma/client';

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code        = str(req.body.code);
    const orderAmount = flt(req.body.orderAmount) ?? 0;

    if (!code) throw new ApiError(400, 'Coupon code is required');

    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw new ApiError(404, 'Coupon code is invalid');
    if (!coupon.isActive) throw new ApiError(400, 'Coupon is inactive');
    if (coupon.expiresAt && new Date() > coupon.expiresAt) throw new ApiError(400, 'Coupon has expired');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new ApiError(400, 'Coupon max usage reached');

    const minAmt = coupon.minOrderAmount ? parseFloat(coupon.minOrderAmount.toString()) : null;
    if (minAmt !== null && orderAmount < minAmt) {
      throw new ApiError(400, `Minimum order MMK ${minAmt} required`);
    }

    const value = parseFloat(coupon.discountValue.toString());
    let discountAmount = 0;

    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderAmount * value) / 100;
      const maxD = coupon.maxDiscount ? parseFloat(coupon.maxDiscount.toString()) : null;
      if (maxD !== null && discountAmount > maxD) discountAmount = maxD;
    } else {
      discountAmount = Math.min(value, orderAmount);
    }

    return successResponse(res, {
      id: coupon.id, code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
    }, 'Coupon is valid');
  } catch (err) {
    next(err);
  }
};

export const listCoupons = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse(res, coupons, 'Coupons fetched');
  } catch (err) {
    next(err);
  }
};

export const createCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const code            = str(req.body.code);
    const description     = str(req.body.description);
    const descMyanmar     = str(req.body.descMyanmar);
    const discountType    = str(req.body.discountType);
    const discountValue   = flt(req.body.discountValue) ?? 0;
    const minOrderAmount  = flt(req.body.minOrderAmount);
    const maxDiscount     = flt(req.body.maxDiscount);
    const maxUses         = int(req.body.maxUses);
    const applicableTo    = str(req.body.applicableTo) ?? 'ALL';
    const isActive        = req.body.isActive !== false && req.body.isActive !== 'false';
    const expiresAt       = str(req.body.expiresAt);

    if (!code) throw new ApiError(400, 'Coupon code is required');

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new ApiError(400, 'Coupon code already exists');

    const coupon = await prisma.coupon.create({
      data: {
        code, description, descMyanmar,
        discountType: discountType as any,
        discountValue: new Prisma.Decimal(discountValue),
        minOrderAmount: minOrderAmount != null ? new Prisma.Decimal(minOrderAmount) : null,
        maxDiscount: maxDiscount != null ? new Prisma.Decimal(maxDiscount) : null,
        maxUses: maxUses ?? null,
        applicableTo, isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return successResponse(res, coupon, 'Coupon created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data: Prisma.CouponUpdateInput = {};

    const code           = str(req.body.code);
    const description    = str(req.body.description);
    const descMyanmar    = str(req.body.descMyanmar);
    const discountType   = str(req.body.discountType);
    const discountValue  = flt(req.body.discountValue);
    const minOrderAmount = flt(req.body.minOrderAmount);
    const maxDiscount    = flt(req.body.maxDiscount);
    const maxUses        = int(req.body.maxUses);
    const applicableTo   = str(req.body.applicableTo);
    const expiresAt      = str(req.body.expiresAt);

    if (code !== undefined) data.code = code;
    if (description !== undefined) data.description = description;
    if (descMyanmar !== undefined) data.descMyanmar = descMyanmar;
    if (discountType !== undefined) data.discountType = discountType as any;
    if (discountValue !== undefined) data.discountValue = new Prisma.Decimal(discountValue);
    if (minOrderAmount !== undefined) data.minOrderAmount = minOrderAmount != null ? new Prisma.Decimal(minOrderAmount) : null;
    if (maxDiscount !== undefined) data.maxDiscount = maxDiscount != null ? new Prisma.Decimal(maxDiscount) : null;
    if (maxUses !== undefined) data.maxUses = maxUses ?? null;
    if (applicableTo !== undefined) data.applicableTo = applicableTo;
    if (req.body.isActive !== undefined) data.isActive = req.body.isActive === true || req.body.isActive === 'true';
    if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const coupon = await prisma.coupon.update({ where: { id }, data });
    return successResponse(res, coupon, 'Coupon updated');
  } catch (err) {
    next(err);
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    return successResponse(res, null, 'Coupon deleted');
  } catch (err) {
    next(err);
  }
};
