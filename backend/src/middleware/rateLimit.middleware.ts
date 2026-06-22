import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { Request } from 'express';

// Skip rate limiting for authenticated admin requests
const skipAdminRequests = (req: Request): boolean => {
  // Skip if the request has a valid Authorization header (logged-in users)
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return true;
  return false;
};

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 1000, // increased from 100 — admin panel makes many requests
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipAdminRequests, // skip for authenticated users
  message: { success: false, message: 'Too many requests, please try again later.' },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // increased from 10 for dev
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes.' },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // increased from 30
  skip: skipAdminRequests,
  message: { success: false, message: 'Upload limit reached, please try again later.' },
});
