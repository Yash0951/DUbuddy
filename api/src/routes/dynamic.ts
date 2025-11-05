import { Router } from 'express';
import {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from '../controllers/dynamicController';
import { modelMiddleware } from '../middleware/model';
import { authMiddleware } from '../middleware/auth';
import { rbacMiddleware, ownershipMiddleware } from '../middleware/security';

const router = Router();

router.use('/:modelName', authMiddleware, modelMiddleware, rbacMiddleware);

router.post('/:modelName', createRecord);
router.get('/:modelName', getRecords);
router.get('/:modelName/:id', getRecordById);
router.put('/:modelName/:id', ownershipMiddleware, updateRecord);
router.delete('/:modelName/:id', ownershipMiddleware, deleteRecord);

export default router;
