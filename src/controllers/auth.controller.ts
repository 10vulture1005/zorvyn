import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken } from '../utils/auth.utils';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role || 'Viewer';

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role: userRole }
    });

    const tokens = generateTokens(user.id, user.role);
    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, ...tokens });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.status === 'inactive') {
      return res.status(401).json({ message: 'Invalid credentials or inactive user' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokens = generateTokens(user.id, user.role);
    res.json({ user: { id: user.id, email: user.email, role: user.role }, ...tokens });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken) as { userId: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.status === 'inactive') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const tokens = generateTokens(user.id, user.role);
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};
