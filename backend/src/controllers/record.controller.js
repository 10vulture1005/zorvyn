"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgeRecord = exports.restoreRecord = exports.softDeleteRecord = exports.updateRecord = exports.listRecords = exports.getRecord = exports.createRecord = void 0;
const client_1 = require("@prisma/client");
const audit_service_1 = require("../services/audit.service");
const prisma = new client_1.PrismaClient();
const createRecord = async (req, res) => {
    try {
        const data = req.body;
        const userId = req.user.userId;
        const record = await prisma.financialRecord.create({
            data: {
                ...data,
                userId
            }
        });
        await (0, audit_service_1.logAudit)(userId, 'create', 'FinancialRecord', record.id, null, record);
        res.status(201).json(record);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.createRecord = createRecord;
const getRecord = async (req, res) => {
    try {
        const id = req.params.id;
        const record = await prisma.financialRecord.findUnique({ where: { id } });
        if (!record || record.deletedAt) {
            return res.status(404).json({ message: 'Record not found' });
        }
        res.json(record);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getRecord = getRecord;
const listRecords = async (req, res) => {
    try {
        const { cursor, limit = 10, startDate, endDate, category, type } = req.query;
        const where = { deletedAt: null };
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        if (category)
            where.category = category;
        if (type)
            where.type = type;
        const records = await prisma.financialRecord.findMany({
            where,
            take: Number(limit) + 1,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { date: 'desc' }
        });
        let nextCursor = null;
        let hasMore = false;
        if (records.length > Number(limit)) {
            hasMore = true;
            const nextItem = records.pop();
            nextCursor = nextItem.id;
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
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.listRecords = listRecords;
const updateRecord = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const userId = req.user.userId;
        const existing = await prisma.financialRecord.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            return res.status(404).json({ message: 'Record not found' });
        }
        const updated = await prisma.financialRecord.update({
            where: { id },
            data
        });
        await (0, audit_service_1.logAudit)(userId, 'update', 'FinancialRecord', id, existing, updated);
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.updateRecord = updateRecord;
const softDeleteRecord = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const existing = await prisma.financialRecord.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            return res.status(404).json({ message: 'Record not found' });
        }
        const deleted = await prisma.financialRecord.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        await (0, audit_service_1.logAudit)(userId, 'soft_delete', 'FinancialRecord', id, existing, deleted);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.softDeleteRecord = softDeleteRecord;
const restoreRecord = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const existing = await prisma.financialRecord.findUnique({ where: { id } });
        if (!existing || !existing.deletedAt) {
            return res.status(404).json({ message: 'Record not found or not deleted' });
        }
        const restored = await prisma.financialRecord.update({
            where: { id },
            data: { deletedAt: null }
        });
        await (0, audit_service_1.logAudit)(userId, 'restore', 'FinancialRecord', id, existing, restored);
        res.json(restored);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.restoreRecord = restoreRecord;
const purgeRecord = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const existing = await prisma.financialRecord.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: 'Record not found' });
        }
        await prisma.financialRecord.delete({ where: { id } });
        await (0, audit_service_1.logAudit)(userId, 'purge', 'FinancialRecord', id, existing, null);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.purgeRecord = purgeRecord;
