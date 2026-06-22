import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../server';
import { ApiError } from '../utils/response.utils';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    sellerId?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.token;

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { seller: { select: { id: true } } },
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Account not found or deactivated');
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name ?? user.email,
      role: user.role,
      sellerId: user.seller?.id,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.token;

    if (!token) return next();

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { seller: { select: { id: true } } },
    });

    if (user?.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name ?? user.email,
        role: user.role,
        sellerId: user.seller?.id,
      };
    }
  } catch (_) {}
  next();
};
