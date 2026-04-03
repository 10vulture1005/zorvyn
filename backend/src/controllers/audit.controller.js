"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryAuditLogs = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const queryAuditLogs = async (req, res) => {
    try {
        const { userId, entityId, limit = 50 } = req.query;
        const where = {};
        if (userId)
            where.userId = userId;
        if (entityId)
            where.entityId = entityId;
        const logs = await prisma.auditLog.findMany({
            where,
            take: Number(limit),
            orderBy: { timestamp: 'desc' }
        });
        res.json(logs.map(l => ({
            ...l,
            before: l.beforeState,
            after: l.afterState,
        })));
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.queryAuditLogs = queryAuditLogs;
