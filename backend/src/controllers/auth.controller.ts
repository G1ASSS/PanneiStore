import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { ApiError, successResponse } from '../utils/response.utils';
import { authRateLimiter } from '../middleware/rateLimit.middleware';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, nameMyanmar, phone, language = 'en' } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, nameMyanmar, phone, language },
      select: { id: true, email: true, name: true, role: true, avatar: true, language: true, createdAt: true },
    });

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });
    return successResponse(res, { user, accessToken }, 'Registration successful', 201);
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { seller: { select: { id: true, isApproved: true } } },
    });

    if (!user || !user.passwordHash) throw new ApiError(401, 'Invalid email or password');
    if (!user.isActive) throw new ApiError(403, 'Account has been deactivated');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, 'Invalid email or password');

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

    const { passwordHash: _, ...safeUser } = user;
    return successResponse(res, { user: safeUser, accessToken }, 'Login successful');
  } catch (err) { next(err); }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    let user = await prisma.user.findFirst({ where: { OR: [{ googleId }, { email }] } });

    if (!user) {
      user = await prisma.user.create({
        data: { googleId, email, name, avatar, isVerified: true },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId, avatar: avatar || user.avatar } });
    }

    if (!user.isActive) throw new ApiError(403, 'Account has been deactivated');

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

    const { passwordHash: _, ...safeUser } = user as any;
    return successResponse(res, { user: safeUser, accessToken }, 'Google login successful');
  } catch (err) { next(err); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) throw new ApiError(401, 'Refresh token required');

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) throw new ApiError(401, 'Invalid refresh token');

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    return successResponse(res, { accessToken }, 'Token refreshed');
  } catch (err) { next(err); }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  return successResponse(res, null, 'Logged out successfully');
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, name: true, nameMyanmar: true,
        avatar: true, phone: true, role: true, language: true,
        isVerified: true, createdAt: true,
        seller: { select: { id: true, shopName: true, isApproved: true, rating: true } },
      },
    });
    if (!user) throw new ApiError(404, 'User not found');
    return successResponse(res, { user });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, nameMyanmar, phone, language, avatar } = req.body;
    
    // Check if phone is already taken by another user
    if (phone && phone.trim() !== '') {
      const existing = await prisma.user.findFirst({
        where: { phone, id: { not: req.user!.id } }
      });
      if (existing) {
        throw new ApiError(409, 'This phone number is already registered to another account.');
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, nameMyanmar, phone: phone?.trim() || null, language, avatar },
      select: { id: true, email: true, name: true, nameMyanmar: true, avatar: true, phone: true, role: true, language: true },
    });
    return successResponse(res, { user }, 'Profile updated');
  } catch (err) { next(err); }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.passwordHash) throw new ApiError(400, 'No password set for this account');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new ApiError(400, 'Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash } });
    return successResponse(res, null, 'Password changed successfully');
  } catch (err) { next(err); }
};
