import { Request, Response, NextFunction } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { ApiError, successResponse } from '../utils/response.utils';
import { str, int, flt } from '../utils/helpers.utils';
import { Prisma } from '@prisma/client';

export const listPackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const all = str(req.query.all) === 'true';
    const where: Prisma.DiamondPackageWhereInput = all ? {} : { isActive: true };

    const packages = await prisma.diamondPackage.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return successResponse(res, packages, 'Diamond packages fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const getPackageById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const pkg = await prisma.diamondPackage.findUnique({ where: { id } });
    if (!pkg) throw new ApiError(404, 'Diamond package not found');
    return successResponse(res, pkg, 'Diamond package fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const createPackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const amount       = int(req.body.amount)       ?? 0;
    const bonusDiamonds = int(req.body.bonusDiamonds) ?? 0;
    const price        = flt(req.body.price)        ?? 0;
    const label        = str(req.body.label);
    const labelMyanmar = str(req.body.labelMyanmar);
    const isPopular    = req.body.isPopular === true || req.body.isPopular === 'true';
    const isBestValue  = req.body.isBestValue === true || req.body.isBestValue === 'true';
    const isActive     = req.body.isActive === undefined ? true : req.body.isActive === true || req.body.isActive === 'true';
    const sortOrder    = int(req.body.sortOrder) ?? 0;

    const pkg = await prisma.diamondPackage.create({
      data: {
        amount, bonusDiamonds,
        price: new Prisma.Decimal(price),
        label, labelMyanmar, isPopular, isBestValue, isActive, sortOrder,
      },
    });

    return successResponse(res, pkg, 'Diamond package created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updatePackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data: Prisma.DiamondPackageUpdateInput = {};

    const amount       = int(req.body.amount);
    const bonusDiamonds = int(req.body.bonusDiamonds);
    const price        = flt(req.body.price);
    const label        = str(req.body.label);
    const labelMyanmar = str(req.body.labelMyanmar);
    const sortOrder    = int(req.body.sortOrder);

    if (amount !== undefined) data.amount = amount;
    if (bonusDiamonds !== undefined) data.bonusDiamonds = bonusDiamonds;
    if (price !== undefined) data.price = new Prisma.Decimal(price);
    if (label !== undefined) data.label = label;
    if (labelMyanmar !== undefined) data.labelMyanmar = labelMyanmar;
    if (req.body.isPopular !== undefined) data.isPopular = req.body.isPopular === true || req.body.isPopular === 'true';
    if (req.body.isBestValue !== undefined) data.isBestValue = req.body.isBestValue === true || req.body.isBestValue === 'true';
    if (req.body.isActive !== undefined) data.isActive = req.body.isActive === true || req.body.isActive === 'true';
    if (sortOrder !== undefined) data.sortOrder = sortOrder;

    const pkg = await prisma.diamondPackage.update({ where: { id }, data });
    return successResponse(res, pkg, 'Diamond package updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deletePackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.diamondPackage.delete({ where: { id } });
    return successResponse(res, null, 'Diamond package deleted successfully');
  } catch (err) {
    next(err);
  }
};

export const verifyPlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mlUserId, mlServerId } = req.body;
    const uid = str(mlUserId) ?? '';
    const sid = str(mlServerId) ?? '';

    if (!uid || !sid) throw new ApiError(400, 'Mobile Legends User ID and Server ID are required');

    if (!/^\d{8,12}$/.test(uid)) throw new ApiError(400, 'Invalid User ID format. Must be 8–12 digits.');
    if (!/^\d{4,5}$/.test(sid))  throw new ApiError(400, 'Invalid Server ID format. Must be 4–5 digits.');

    const lastDigit = parseInt(uid.charAt(uid.length - 1), 10);
    const mockUsernames = [
      'ZenithGamer', 'MascotLuna', 'MLBB_Pro_MM', 'ChouGod_Kyat', 'LaylaMain99',
      'FannyFastHand', 'GusionSlayer', 'AlucardKing', 'EstesAngel', 'TigrealShield',
    ];
    const username = mockUsernames[lastDigit];

    return successResponse(res, { verified: true, username, mlUserId: uid, mlServerId: sid }, 'Player verified successfully');
  } catch (err) {
    next(err);
  }
};
