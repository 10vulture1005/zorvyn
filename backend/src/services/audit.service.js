"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const logAudit = async (userId, action, entityType, entityId, beforeState, afterState) => {
    await prisma.auditLog.create({
        data: {
            userId,
            action,
            entityType,
            entityId,
            beforeState: beforeState ?? null,
            afterState: afterState ?? null
        }
    });
};
exports.logAudit = logAudit;
