const jwt = require('jsonwebtoken');

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export const generateTokens = (payload: JWTPayload) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

  const token = jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });

  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });

  return { token, refreshToken };
};

export const verifyRefreshToken = (refreshToken: string): JWTPayload => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  return jwt.verify(refreshToken, refreshSecret) as JWTPayload;
};

export const generateAccessToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};