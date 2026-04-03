"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDashboardSummary = async (req, res) => {
    try {
        const records = await prisma.financialRecord.findMany({
            where: { deletedAt: null }
        });
        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryTotals = {};
        const trends = {};
        records.forEach(rc => {
            if (rc.type === 'income') {
                totalIncome += rc.amount;
            }
            else if (rc.type === 'expense') {
                totalExpenses += rc.amount;
                categoryTotals[rc.category] = (categoryTotals[rc.category] || 0) + rc.amount;
            }
            const month = rc.date.toISOString().slice(0, 7); // YYYY-MM
            if (!trends[month]) {
                trends[month] = { income: 0, expense: 0 };
            }
            if (rc.type === 'income')
                trends[month].income += rc.amount;
            if (rc.type === 'expense')
                trends[month].expense += rc.amount;
        });
        const netBalance = totalIncome - totalExpenses;
        // Top 5 categories
        const topCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, total]) => ({ category, total }));
        res.json({
            totalIncome,
            totalExpenses,
            netBalance,
            topCategories,
            monthlyTrends: trends
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.getDashboardSummary = getDashboardSummary;
