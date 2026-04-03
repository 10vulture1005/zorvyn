import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import { generateTokens } from '../src/utils/auth.utils';

const prisma = new PrismaClient();
let adminToken: string;
let viewerToken: string;
let adminId: string;

beforeAll(async () => {
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

  adminToken = generateTokens(admin.id, admin.role).accessToken;
  viewerToken = generateTokens(viewer.id, viewer.role).accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Financial Records API', () => {
  it('should deny viewer from creating a record (403)', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 100, type: 'income', category: 'Salary', date: new Date().toISOString() });
    
    expect(res.status).toBe(403);
  });

  it('should allow admin to create a record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 1500, type: 'income', category: 'Freelance', date: '2023-10-01T10:00:00.000Z' });
    
    expect(res.status).toBe(201);
    expect(res.body.category).toBe('Freelance');
  });

  it('should filter records by date range', async () => {
    // Add another record in a different date
    await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 200, type: 'expense', category: 'Food', date: '2023-11-01T10:00:00.000Z' });

    const res = await request(app)
      .get('/api/records?startDate=2023-10-01T00:00:00.000Z&endDate=2023-10-31T23:59:59.000Z')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].category).toBe('Freelance');
  });

  it('should return dashboard summary', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.totalIncome).toBe(1500);
    expect(res.body.totalExpenses).toBe(200);
    expect(res.body.netBalance).toBe(1300);
  });
});
