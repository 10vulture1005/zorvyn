"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'supersecret_change_in_production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.REFRESH_SECRET || 'refresh_supersecret_change_in_production',
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '7d'
};
