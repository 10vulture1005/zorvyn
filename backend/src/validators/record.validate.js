"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRecordsSchema = exports.updateRecordSchema = exports.createRecordSchema = void 0;
const zod_1 = require("zod");
exports.createRecordSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive(),
        type: zod_1.z.enum(['income', 'expense']),
        category: zod_1.z.string().min(1),
        date: zod_1.z.string().datetime(), // ISO datetime string expected
        notes: zod_1.z.string().optional()
    })
});
exports.updateRecordSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive().optional(),
        type: zod_1.z.enum(['income', 'expense']).optional(),
        category: zod_1.z.string().min(1).optional(),
        date: zod_1.z.string().datetime().optional(),
        notes: zod_1.z.string().optional()
    })
});
exports.listRecordsSchema = zod_1.z.object({
    query: zod_1.z.object({
        cursor: zod_1.z.string().optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
        category: zod_1.z.string().optional(),
        type: zod_1.z.enum(['income', 'expense']).optional()
    })
});
