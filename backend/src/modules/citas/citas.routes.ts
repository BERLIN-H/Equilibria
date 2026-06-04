import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createCitaSchema, updateCitaSchema } from '../../../schemas/cita.schema';
import * as citasController from './citas.controller';
import * as slotsController from './slots.controller';

const router = Router();
router.use(authMiddleware);

// Slots de disponibilidad
router.get('/slots/available', slotsController.getAvailableSlots);
router.get('/slots/config',    slotsController.getSlotConfig);
router.post('/slots/config',   slotsController.createSlot);
router.delete('/slots/config/:id', slotsController.deleteSlot);

// Citas
router.get('/professionals', citasController.getProfessionals);
router.get('/next',          citasController.getNextCita);
router.get('/',              citasController.getCitas);
router.post('/',             validate(createCitaSchema), citasController.createCita);
router.patch('/:id',         validate(updateCitaSchema), citasController.updateCita);
router.delete('/:id',        citasController.deleteCita);

export default router;
