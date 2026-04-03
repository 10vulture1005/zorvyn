import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, config.jwtSecret as jwt.Secret, {
    expiresIn: config.jwtExpiresIn as any,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ userId, role }, config.refreshSecret as jwt.Secret, {
    expiresIn: config.refreshExpiresIn as any,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.refreshSecret);
};
