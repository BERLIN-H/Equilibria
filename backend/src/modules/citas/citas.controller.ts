import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../lib/prisma';
import {
  sendAppointmentConfirmation,
  sendCancellationToStudent,
  sendCancellationToProfessional,
} from '../../lib/twilio';

// ── GET /api/citas ─────────────────────────────────────────────────────────────
export const getCitas = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const { status, from, to } = req.query;

  const where: any = {};
  if (user.role === 'USER')              where.studentId      = user.id;
  else if (user.role === 'PSYCHOLOGIST') where.professionalId = user.id;

  if (status) where.status = status;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from as string);
    if (to)   where.date.lte = new Date(to as string);
  }

  const citas = await prisma.cita.findMany({
    where,
    include: {
      student:      { select: { id: true, name: true, email: true, faculty: true, semester: true } },
      professional: { select: { id: true, name: true, email: true } },
    },
    orderBy: { date: 'asc' },
  });

  const sanitized = citas.map((c: any) => {
    if (user.role === 'USER') {
      const { location, studentPhone, ...rest } = c;
      return rest;
    }
    return c;
  });

  res.json(sanitized);
};

// ── GET /api/citas/next ────────────────────────────────────────────────────────
export const getNextCita = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;

  const cita = await prisma.cita.findFirst({
    where: {
      studentId: user.id,
      status: { in: ['PENDIENTE', 'CONFIRMADA'] },
      date: { gte: new Date() },
    },
    include: { professional: { select: { id: true, name: true, email: true } } },
    orderBy: { date: 'asc' },
  });

  if (!cita) { res.json(null); return; }
  const { location, studentPhone, ...rest } = cita as any;
  res.json(rest);
};

// ── POST /api/citas ────────────────────────────────────────────────────────────
export const createCita = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const { professionalId, date, type, mode, notes, studentPhone } = req.body;

  // Validar teléfono (obligatorio, +57 + 10 dígitos)
  const cleanPhone = (studentPhone ?? '').replace(/\s/g, '');
  if (!cleanPhone || !/^\+57\d{10}$/.test(cleanPhone)) {
    res.status(400).json({ error: 'Número de teléfono inválido. Debe tener formato +57XXXXXXXXXX' });
    return;
  }

  const professional = await prisma.user.findUnique({ where: { id: professionalId } });
  if (!professional || professional.role !== 'PSYCHOLOGIST') {
    res.status(400).json({ error: 'El profesional seleccionado no es válido' });
    return;
  }

  const citaDate = new Date(date);

  // Convertir a hora de Colombia (UTC-5) para comparar con los slots de disponibilidad
  // que están definidos en hora local
  const colombiaOffset = -5 * 60; // minutos
  const localMinutes = citaDate.getUTCHours() * 60 + citaDate.getUTCMinutes() + colombiaOffset;
  const adjustedMinutes = ((localMinutes % (24 * 60)) + 24 * 60) % (24 * 60);

  // El día de la semana también debe calcularse en hora Colombia
  const utcDay = citaDate.getUTCDay();
  const totalUTCMinutes = citaDate.getUTCHours() * 60 + citaDate.getUTCMinutes();
  const dayOfWeek = totalUTCMinutes + colombiaOffset < 0 
    ? ((utcDay - 1) + 7) % 7 
    : totalUTCMinutes + colombiaOffset >= 24 * 60 
      ? (utcDay + 1) % 7 
      : utcDay;
  const slotMinutes = adjustedMinutes;

  // Verificar que el horario esté dentro de un bloque disponible
  const matchingSlot = await (prisma as any).availableSlot.findFirst({
    where: {
      professionalId,
      dayOfWeek,
      active: true,
      startHour: { lte: slotMinutes },
      endHour:   { gte: slotMinutes + 1 },
    },
  });

  if (!matchingSlot) {
    res.status(400).json({ error: 'El horario seleccionado no está dentro de la disponibilidad del profesional' });
    return;
  }

  const durationMin = matchingSlot.durationMin ?? 50;
  const slotEnd = new Date(citaDate.getTime() + durationMin * 60 * 1000);

  // Verificar que ese slot no esté ocupado
  const overlap = await prisma.cita.findFirst({
    where: {
      professionalId,
      status: { in: ['PENDIENTE', 'CONFIRMADA'] },
      date: { gte: citaDate, lt: slotEnd },
    },
  });

  if (overlap) {
    res.status(409).json({ error: 'El horario seleccionado ya está ocupado' });
    return;
  }

  const cita = await prisma.cita.create({
    data: {
      studentId: user.id,
      professionalId,
      date: citaDate,
      type: type ?? 'Consulta General',
      mode: mode ?? 'Presencial',
      notes,
      studentPhone: cleanPhone,
      // location NO se asigna al crear; la asigna el psicólogo después
    },
    include: {
      professional: { select: { id: true, name: true, email: true } },
      student:      { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId:  user.id,
      title:   'Cita Agendada',
      message: `Tu cita con ${professional.name} ha sido agendada para el ${citaDate.toLocaleDateString('es-CO', { dateStyle: 'full' })}.`,
      type:    'SUCCESS',
    },
  });

  sendAppointmentConfirmation({
    to:               cleanPhone,
    studentName:      cita.student.name ?? 'Estudiante',
    date:             citaDate,
    professionalName: professional.name ?? 'tu psicólogo/a',
    appointmentType:  type,
  }).catch(() => {});

  const { location, studentPhone: sp, ...rest } = cita as any;
  res.status(201).json(rest);
};

// ── PATCH /api/citas/:id ───────────────────────────────────────────────────────
export const updateCita = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const id   = parseInt(req.params.id);
  const data = req.body;

  const cita = await prisma.cita.findUnique({ where: { id } });
  if (!cita) { res.status(404).json({ error: 'Cita no encontrada' }); return; }

  const canEdit =
    user.role === 'ADMIN' ||
    cita.studentId      === user.id ||
    cita.professionalId === user.id;

  if (!canEdit) { res.status(403).json({ error: 'Sin permisos para modificar esta cita' }); return; }

  const updated = await prisma.cita.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.date   && { date:   new Date(data.date) }),
      ...(data.type   && { type:   data.type }),
      ...(data.mode   && { mode:   data.mode }),
      // Solo psicólogo/admin asigna location
      ...(data.location !== undefined && user.role !== 'USER' && { location: data.location }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.psychNotes !== undefined && { psychNotes: data.psychNotes }),
    },
    include: {
      professional: { select: { id: true, name: true } },
      student:      { select: { id: true, name: true } },
    },
  });

  if (data.status && cita.professionalId === user.id) {
    const statusLabel: Record<string, string> = {
      CONFIRMADA: 'confirmada ✅',
      CANCELADA:  'cancelada ❌',
      COMPLETADA: 'marcada como completada',
    };
    await prisma.notification.create({
      data: {
        userId:  cita.studentId,
        title:   `Cita ${statusLabel[data.status] ?? 'actualizada'}`,
        message: `Tu cita ha sido ${statusLabel[data.status] ?? 'actualizada'} por tu profesional.`,
        type:    data.status === 'CONFIRMADA' ? 'SUCCESS' : data.status === 'CANCELADA' ? 'WARNING' : 'INFO',
      },
    });

    // WhatsApp al estudiante si el psicólogo cancela
    if (data.status === 'CANCELADA') {
      const student = await prisma.user.findUnique({ where: { id: cita.studentId } });
      if (student && (student as any).phone) {
        sendCancellationToStudent({
          to:               (student as any).phone,
          studentName:      student.name ?? 'Estudiante',
          date:             cita.date,
          professionalName: updated.professional.name ?? 'tu psicólogo/a',
          cancelledBy:      'professional',
        }).catch(() => {});
      }
    }
  }

  // WhatsApp al psicólogo si el estudiante cancela
  if (data.status === 'CANCELADA' && user.role === 'USER') {
    const professional = await prisma.user.findUnique({ where: { id: cita.professionalId } });
    if (professional && (professional as any).phone) {
      sendCancellationToProfessional({
        to:               (professional as any).phone,
        professionalName: professional.name ?? 'Psicólogo/a',
        date:             cita.date,
        studentName:      updated.student.name ?? 'un estudiante',
      }).catch(() => {});
    }
    // Notificación interna al psicólogo
    await prisma.notification.create({
      data: {
        userId:  cita.professionalId,
        title:   'Cita cancelada por estudiante',
        message: `El/la estudiante ${updated.student.name ?? ''} canceló su cita del ${cita.date.toLocaleDateString('es-CO')}.`,
        type:    'WARNING',
      },
    });
  }

  if (user.role === 'USER') {
    const { location, studentPhone, ...rest } = updated as any;
    res.json(rest);
    return;
  }
  res.json(updated);
};

// ── DELETE /api/citas/:id ──────────────────────────────────────────────────────
export const deleteCita = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const id   = parseInt(req.params.id);

  const cita = await prisma.cita.findUnique({ where: { id } });
  if (!cita) { res.status(404).json({ error: 'Cita no encontrada' }); return; }

  if (user.role !== 'ADMIN' && cita.studentId !== user.id) {
    res.status(403).json({ error: 'Sin permisos para eliminar esta cita' });
    return;
  }

  await prisma.cita.delete({ where: { id } });
  res.status(204).send();
};

// ── GET /api/citas/professionals ──────────────────────────────────────────────
export const getProfessionals = async (_req: AuthRequest, res: Response): Promise<void> => {
  const professionals = await prisma.user.findMany({
    where:   { role: 'PSYCHOLOGIST' },
    select:  { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
  res.json(professionals);
};
