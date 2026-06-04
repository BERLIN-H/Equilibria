import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import * as adminController from './admin.controller';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/citas', adminController.getAllCitas);
router.get('/reports/cancellations', adminController.getCancellationReport);
router.get('/reports/psychologists', adminController.getPsychologistReport);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

export default router;
