import { Router } from 'express';
import { queryAuditLogs } from '../controllers/audit.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', requireRoles(['Admin']), queryAuditLogs);

export default router;
