import { Router } from 'express';
import { getPatients, getPatientById } from './patients.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/',    authMiddleware, getPatients);
router.get('/:id', authMiddleware, getPatientById);

export default router;