"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.auditLog.deleteMany();
    await prisma.financialRecord.deleteMany();
    await prisma.user.deleteMany();
    const hash = await bcrypt_1.default.hash('password123', 10);
    const admin = await prisma.user.create({
        data: { email: 'admin@zorvyn.com', password: hash, role: 'Admin' }
    });
    const analyst = await prisma.user.create({
        data: { email: 'analyst@zorvyn.com', password: hash, role: 'Analyst' }
    });
    const viewer = await prisma.user.create({
        data: { email: 'viewer@zorvyn.com', password: hash, role: 'Viewer' }
    });
    await prisma.financialRecord.createMany({
        data: [
            { amount: 5000, type: 'income', category: 'Salary', date: new Date('2026-03-01'), userId: admin.id },
            { amount: 1200, type: 'expense', category: 'Rent', date: new Date('2026-03-02'), userId: admin.id },
            { amount: 300, type: 'expense', category: 'Food', date: new Date('2026-03-05'), userId: admin.id },
            { amount: 150, type: 'expense', category: 'Utilities', date: new Date('2026-03-10'), userId: admin.id },
            { amount: 800, type: 'income', category: 'Freelance', date: new Date('2026-03-15'), userId: admin.id },
            { amount: 50, type: 'expense', category: 'Entertainment', date: new Date('2026-03-20'), userId: admin.id }
        ]
    });
    console.log('Seeding finished.');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
