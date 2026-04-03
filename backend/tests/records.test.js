"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const client_1 = require("@prisma/client");
const auth_utils_1 = require("../src/utils/auth.utils");
const prisma = new client_1.PrismaClient();
let adminToken;
let viewerToken;
let adminId;
(0, globals_1.beforeAll)(async () => {
    // Clear tables
    await prisma.auditLog.deleteMany();
    await prisma.financialRecord.deleteMany();
    await prisma.user.deleteMany();
    // Create Users
    const admin = await prisma.user.create({
        data: { email: 'admin@test.com', password: 'hash', role: 'Admin' }
    });
    adminId = admin.id;
    const viewer = await prisma.user.create({
        data: { email: 'viewer@test.com', password: 'hash', role: 'Viewer' }
    });
    adminToken = (0, auth_utils_1.generateTokens)(admin.id, admin.role).accessToken;
    viewerToken = (0, auth_utils_1.generateTokens)(viewer.id, viewer.role).accessToken;
});
(0, globals_1.afterAll)(async () => {
    await prisma.$disconnect();
});
(0, globals_1.describe)('Financial Records API', () => {
    (0, globals_1.it)('should deny viewer from creating a record (403)', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/records')
            .set('Authorization', `Bearer ${viewerToken}`)
            .send({ amount: 100, type: 'income', category: 'Salary', date: new Date().toISOString() });
        (0, globals_1.expect)(res.status).toBe(403);
    });
    (0, globals_1.it)('should allow admin to create a record', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/records')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ amount: 1500, type: 'income', category: 'Freelance', date: '2023-10-01T10:00:00.000Z' });
        (0, globals_1.expect)(res.status).toBe(201);
        (0, globals_1.expect)(res.body.category).toBe('Freelance');
    });
    (0, globals_1.it)('should filter records by date range', async () => {
        // Add another record in a different date
        await (0, supertest_1.default)(app_1.default)
            .post('/api/records')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ amount: 200, type: 'expense', category: 'Food', date: '2023-11-01T10:00:00.000Z' });
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/records?startDate=2023-10-01T00:00:00.000Z&endDate=2023-10-31T23:59:59.000Z')
            .set('Authorization', `Bearer ${adminToken}`);
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(res.body.data.length).toBe(1);
        (0, globals_1.expect)(res.body.data[0].category).toBe('Freelance');
    });
    (0, globals_1.it)('should return dashboard summary', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/dashboard/summary')
            .set('Authorization', `Bearer ${adminToken}`);
        (0, globals_1.expect)(res.status).toBe(200);
        (0, globals_1.expect)(res.body.totalIncome).toBe(1500);
        (0, globals_1.expect)(res.body.totalExpenses).toBe(200);
        (0, globals_1.expect)(res.body.netBalance).toBe(1300);
    });
});
