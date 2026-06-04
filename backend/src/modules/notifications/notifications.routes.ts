import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import * as notifController from './notifications.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', notifController.getNotifications);
router.get('/unread-count', notifController.getUnreadCount);
router.patch('/read-all', notifController.markAllRead);
router.patch('/:id/read', notifController.markOneRead);

export default router;
