import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateAccessToken = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });
};

export const generateRefreshToken = (payload: { id: string }) => {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn as any });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.jwt.secret) as { id: string; email: string; role: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.jwt.refreshSecret) as { id: string };
};
