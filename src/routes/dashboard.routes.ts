import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/summary', requireRoles(['Analyst', 'Admin']), getDashboardSummary);

export default router;
