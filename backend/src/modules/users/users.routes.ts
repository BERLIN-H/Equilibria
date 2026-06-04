import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { updateProfileSchema } from '../../../schemas/cita.schema';
import * as usersController from './users.controller';

const router = Router();
router.use(authMiddleware);

router.get('/me', usersController.getMe);
router.patch('/me', validate(updateProfileSchema), usersController.updateMe);
router.patch('/me/password', usersController.changePassword);

export default router;
