import { Router } from 'express';
import { createRecord, getRecord, listRecords, updateRecord, softDeleteRecord, restoreRecord, purgeRecord } from '../controllers/record.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createRecordSchema, updateRecordSchema, listRecordsSchema } from '../validators/record.validate';

const router = Router();

router.use(authenticate);

router.post('/', requireRoles(['Admin']), validate(createRecordSchema), createRecord);
router.get('/', requireRoles(['Analyst', 'Admin']), validate(listRecordsSchema), listRecords);
router.get('/:id', requireRoles(['Analyst', 'Admin']), getRecord);
router.put('/:id', requireRoles(['Admin']), validate(updateRecordSchema), updateRecord);
router.delete('/:id', requireRoles(['Admin']), softDeleteRecord);
router.post('/:id/restore', requireRoles(['Admin']), restoreRecord);
router.delete('/:id/purge', requireRoles(['Admin']), purgeRecord);

export default router;
