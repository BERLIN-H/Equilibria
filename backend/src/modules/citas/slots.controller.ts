import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../lib/prisma';

// GET /api/citas/slots/available?professionalId=X&date=YYYY-MM-DD
// Devuelve los bloques libres para un profesional en una fecha
export const getAvailableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  const { professionalId, date } = req.query;

  if (!professionalId || !date) {
    res.status(400).json({ error: 'professionalId y date son requeridos' });
    return;
  }

  const profId = parseInt(professionalId as string);
  const targetDate = new Date(date as string);

  // Calcular día de semana en hora Colombia (UTC-5)
  const colombiaOffset = -5 * 60;
  const utcMidnightMinutes = targetDate.getUTCHours() * 60 + targetDate.getUTCMinutes();
  const localMidnightMinutes = utcMidnightMinutes + colombiaOffset;
  let dayOfWeek = targetDate.getUTCDay();
  if (localMidnightMinutes < 0) dayOfWeek = ((dayOfWeek - 1) + 7) % 7;
  else if (localMidnightMinutes >= 24 * 60) dayOfWeek = (dayOfWeek + 1) % 7;

  // Traer bloques configurados para ese día de la semana
  const slots = await prisma.availableSlot.findMany({
    where: { professionalId: profId, dayOfWeek, active: true },
    orderBy: { startHour: 'asc' },
  });

  if (slots.length === 0) {
    res.json([]);
    return;
  }

  // Traer citas ya reservadas ese día para ese profesional
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const booked = await prisma.cita.findMany({
    where: {
      professionalId: profId,
      status: { in: ['PENDIENTE', 'CONFIRMADA'] },
      date: { gte: dayStart, lte: dayEnd },
    },
    select: { date: true },
  });

  const bookedMinutes = new Set(
    booked.map(c => {
      const d = new Date(c.date);
      // Convertir a hora Colombia (UTC-5)
      const minutesUTC = d.getUTCHours() * 60 + d.getUTCMinutes();
      return ((minutesUTC + colombiaOffset) % (24 * 60) + 24 * 60) % (24 * 60);
    })
  );

  // Generar todos los bloques individuales y filtrar los ocupados
  const freeSlots: string[] = [];

  for (const slot of slots) {
    const duration = slot.durationMin;
    let current = slot.startHour;
    while (current + duration <= slot.endHour) {
      if (!bookedMinutes.has(current)) {
        const hh = String(Math.floor(current / 60)).padStart(2, '0');
        const mm = String(current % 60).padStart(2, '0');
        freeSlots.push(`${hh}:${mm}`);
      }
      current += duration;
    }
  }

  res.json(freeSlots);
};

// GET /api/citas/slots/config — bloques configurados del psicólogo autenticado
export const getSlotConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  if (user.role !== 'PSYCHOLOGIST' && user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Solo psicólogos/admins pueden ver la configuración' });
    return;
  }

  const slots = await prisma.availableSlot.findMany({
    where: { professionalId: user.id },
    orderBy: [{ dayOfWeek: 'asc' }, { startHour: 'asc' }],
  });

  res.json(slots);
};

// POST /api/citas/slots/config — crear bloque de disponibilidad
export const createSlot = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  if (user.role !== 'PSYCHOLOGIST' && user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Sin permisos' });
    return;
  }

  const { dayOfWeek, startHour, endHour, durationMin } = req.body;

  if (dayOfWeek === undefined || startHour === undefined || endHour === undefined) {
    res.status(400).json({ error: 'dayOfWeek, startHour y endHour son requeridos' });
    return;
  }

  const slot = await prisma.availableSlot.create({
    data: {
      professionalId: user.id,
      dayOfWeek,
      startHour,
      endHour,
      durationMin: durationMin ?? 50,
    },
  });

  res.status(201).json(slot);
};

// DELETE /api/citas/slots/config/:id — eliminar bloque
export const deleteSlot = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const id = parseInt(req.params.id);

  const slot = await prisma.availableSlot.findUnique({ where: { id } });
  if (!slot) { res.status(404).json({ error: 'Bloque no encontrado' }); return; }
  if (slot.professionalId !== user.id && user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Sin permisos' });
    return;
  }

  await prisma.availableSlot.delete({ where: { id } });
  res.status(204).send();
};
