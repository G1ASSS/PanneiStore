import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { ApiError, successResponse } from '../utils/response.utils';
import { authRateLimiter } from '../middleware/rateLimit.middleware';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, nameMyanmar, phone, language = 'en' } = req.body;

    if (!phone || phone.trim() === '') {
      throw new ApiError(400, 'Phone number is required');
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, 'Email already registered');

    const existingPhone = await prisma.user.findUnique({ where: { phone: phone.trim() } });
    if (existingPhone) throw new ApiError(409, 'Phone number already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, nameMyanmar, phone: phone.trim(), language },
      select: { id: true, email: true, name: true, role: true, avatar: true, language: true, createdAt: true },
    });

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    // Send welcome email (fire and forget — don't block response)
    sendWelcomeEmail(user.email, user.name).catch(console.error);

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
    const { idToken, email, name, avatar } = req.body;

    if (!email) throw new ApiError(400, 'Email is required');

    // Extract googleId from the idToken (NextAuth already verified this with Google)
    let googleId: string | undefined;
    if (idToken) {
      try {
        // The idToken is a JWT — decode the payload to get the 'sub' (Google user ID)
        const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        googleId = payload.sub;
      } catch {
        // If we can't decode it, continue without googleId
      }
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(googleId ? [{ googleId }] : []),
          { email },
        ],
      },
    });

    if (!user) {
      // New user — create account (no phone required for Google sign-in)
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name: name || email.split('@')[0],
          avatar,
          isVerified: true,
        },
      });
      // Send welcome email (fire and forget)
      sendWelcomeEmail(user.email, user.name).catch(console.error);
    } else {
      // Existing user — link Google ID if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: avatar || user.avatar },
        });
      }
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

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError(400, 'Email is required');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return successResponse(res, null, 'If that email is registered, we have sent a reset link.');
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    // In development, the URL goes to localhost. In prod, it should be the real frontend URL.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user.email, resetLink);

    return successResponse(res, null, 'If that email is registered, we have sent a reset link.');
  } catch (err) { next(err); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) throw new ApiError(400, 'Token and new password are required');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() } // Token must not be expired
      }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired password reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return successResponse(res, null, 'Password successfully reset');
  } catch (err) { next(err); }
};
