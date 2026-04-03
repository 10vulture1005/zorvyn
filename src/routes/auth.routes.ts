import { Router } from 'express';
import { register, login, refresh } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const authSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['Viewer', 'Analyst', 'Admin']).optional()
  })
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string()
  })
});

router.post('/register', validate(authSchema), register);
router.post('/login', validate(authSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);

export default router;
