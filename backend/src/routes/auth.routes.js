"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const authSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
        role: zod_1.z.enum(['Viewer', 'Analyst', 'Admin']).optional()
    })
});
const refreshSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string()
    })
});
router.post('/register', (0, validate_middleware_1.validate)(authSchema), auth_controller_1.register);
router.post('/login', (0, validate_middleware_1.validate)(authSchema), auth_controller_1.login);
router.post('/refresh', (0, validate_middleware_1.validate)(refreshSchema), auth_controller_1.refresh);
exports.default = router;
