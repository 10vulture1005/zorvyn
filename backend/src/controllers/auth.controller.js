"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const auth_utils_1 = require("../utils/auth.utils");
const prisma = new client_1.PrismaClient();
const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await (0, auth_utils_1.hashPassword)(password);
        const userRole = role || 'Viewer';
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, role: userRole }
        });
        const tokens = (0, auth_utils_1.generateTokens)(user.id, user.role);
        res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, ...tokens });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.status === 'inactive') {
            return res.status(401).json({ message: 'Invalid credentials or inactive user' });
        }
        const isMatch = await (0, auth_utils_1.comparePassword)(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const tokens = (0, auth_utils_1.generateTokens)(user.id, user.role);
        res.json({ user: { id: user.id, email: user.email, role: user.role }, ...tokens });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }
        const decoded = (0, auth_utils_1.verifyRefreshToken)(refreshToken);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.status === 'inactive') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const tokens = (0, auth_utils_1.generateTokens)(user.id, user.role);
        res.json(tokens);
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};
exports.refresh = refresh;
