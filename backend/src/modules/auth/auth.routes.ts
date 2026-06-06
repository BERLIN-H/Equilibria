import { Router } from 'express';
import { syncUser, me } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/sync', syncUser);        // llamado tras login con Google
router.get('/me', authMiddleware, me); // obtener usuario autenticado

export default router;