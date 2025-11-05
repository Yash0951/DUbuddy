import { Router } from 'express';
import { publishModel } from '../controllers/modelController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.post('/models/publish', authMiddleware, adminMiddleware, publishModel);

export default router;
