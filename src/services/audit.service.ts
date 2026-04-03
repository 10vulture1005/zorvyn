import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logAudit = async (
  userId: string | undefined,
  action: string,
  entityType: string,
  entityId: string,
  beforeState?: any,
  afterState?: any
) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      beforeState: beforeState ? JSON.stringify(beforeState) : null,
      afterState: afterState ? JSON.stringify(afterState) : null
    }
  });
};
