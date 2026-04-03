import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logAudit } from '../services/audit.service';

const prisma = new PrismaClient();

export const createRecord = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const userId = req.user!.userId;
    
    const record = await prisma.financialRecord.create({
      data: {
        ...data,
        userId
      }
    });

    await logAudit(userId, 'create', 'FinancialRecord', record.id, null, record);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getRecord = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const record = await prisma.financialRecord.findUnique({ where: { id } });

    if (!record || record.deletedAt) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const listRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { cursor, limit = 10, startDate, endDate, category, type } = req.query as any;
    
    const where: any = { deletedAt: null };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (category) where.category = category;
    if (type) where.type = type;

    const records = await prisma.financialRecord.findMany({
      where,
      take: Number(limit) + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { date: 'desc' }
    });

    let nextCursor: string | null = null;
    let hasMore = false;
    if (records.length > Number(limit)) {
      hasMore = true;
      const nextItem = records.pop();
      nextCursor = nextItem!.id;
    }

    const totalCount = await prisma.financialRecord.count({ where });

    res.json({
      data: records,
      metadata: {
        totalCount,
        nextCursor,
        hasMore
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateRecord = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = req.body;
    const userId = req.user!.userId;

    const existing = await prisma.financialRecord.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const updated = await prisma.financialRecord.update({
      where: { id },
      data
    });

    await logAudit(userId, 'update', 'FinancialRecord', id, existing, updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const softDeleteRecord = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const existing = await prisma.financialRecord.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const deleted = await prisma.financialRecord.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await logAudit(userId, 'soft_delete', 'FinancialRecord', id, existing, deleted);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const restoreRecord = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const existing = await prisma.financialRecord.findUnique({ where: { id } });
    if (!existing || !existing.deletedAt) {
      return res.status(404).json({ message: 'Record not found or not deleted' });
    }

    const restored = await prisma.financialRecord.update({
      where: { id },
      data: { deletedAt: null }
    });

    await logAudit(userId, 'restore', 'FinancialRecord', id, existing, restored);
    res.json(restored);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const purgeRecord = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const existing = await prisma.financialRecord.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await prisma.financialRecord.delete({ where: { id } });

    await logAudit(userId, 'purge', 'FinancialRecord', id, existing, null);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
