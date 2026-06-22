import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ApiError } from '../utils/response.utils';

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};

export const requireSeller = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required'));
  if (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN') {
    return next(new ApiError(403, 'Seller account required'));
  }
  if (!req.user.sellerId && req.user.role !== 'ADMIN') {
    return next(new ApiError(403, 'Please complete seller registration'));
  }
  next();
};

export const requireAdmin = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required'));
  if (req.user.role !== 'ADMIN') {
    return next(new ApiError(403, 'Admin access required'));
  }
  next();
};
