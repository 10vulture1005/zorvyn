import { z } from 'zod';

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    type: z.enum(['income', 'expense']),
    category: z.string().min(1),
    date: z.string().datetime(), // ISO datetime string expected
    notes: z.string().optional()
  })
});

export const updateRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive().optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().min(1).optional(),
    date: z.string().datetime().optional(),
    notes: z.string().optional()
  })
});

export const listRecordsSchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    category: z.string().optional(),
    type: z.enum(['income', 'expense']).optional()
  })
});
