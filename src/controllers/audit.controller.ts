import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const queryAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, entityId, limit = 50 } = req.query as any;

    const where: any = {};
    if (userId) where.userId = userId;
    if (entityId) where.entityId = entityId;

    const logs = await prisma.auditLog.findMany({
      where,
      take: Number(limit),
      orderBy: { timestamp: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
