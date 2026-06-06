import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../lib/prisma';
import {
  sendAppointmentConfirmation,
  sendCancellationToStudent,
  sendCancellationToProfessional,
} from '../../lib/twilio';
import { sendEmail } from '../../lib/email';
import {
  citaAgendadaTemplate,
  citaCanceladaTemplate,
  citaReagendadaTemplate,
} from '../../lib/emailTemplates';

// ── Helpers de formato ─────────────────────────────────────────────────────────
const formatFecha = (date: Date) =>
  date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Bogota' });

const formatHora = (date: Date) =>
  date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Bogota' });

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
  const colombiaOffset = -5 * 60;
  const localMinutes = citaDate.getUTCHours() * 60 + citaDate.getUTCMinutes() + colombiaOffset;
  const adjustedMinutes = ((localMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const utcDay = citaDate.getUTCDay();
  const totalUTCMinutes = citaDate.getUTCHours() * 60 + citaDate.getUTCMinutes();
  const dayOfWeek = totalUTCMinutes + colombiaOffset < 0
    ? ((utcDay - 1) + 7) % 7
    : totalUTCMinutes + colombiaOffset >= 24 * 60
      ? (utcDay + 1) % 7
      : utcDay;
  const slotMinutes = adjustedMinutes;

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
      message: `Tu cita con ${professional.name} ha sido agendada para el ${formatFecha(citaDate)}.`,
      type:    'SUCCESS',
    },
  });

  // ── Correos al agendar ──────────────────────────────────────────────────────
  const emailData = {
    nombreEstudiante: cita.student.name ?? 'Estudiante',
    nombrePsicologo:  professional.name ?? 'Psicólogo/a',
    fecha:            formatFecha(citaDate),
    hora:             formatHora(citaDate),
    tipo:             type ?? 'Consulta General',
    modo:             mode ?? 'Presencial',
  };

  // Al estudiante
  sendEmail({
    to:      cita.student.email,
    subject: '✅ Cita agendada — Equilibria',
    html:    citaAgendadaTemplate({ ...emailData, esEstudiante: true }),
  }).catch(() => {});

  // Al psicólogo
  sendEmail({
    to:      professional.email,
    subject: '📅 Nueva cita agendada — Equilibria',
    html:    citaAgendadaTemplate({ ...emailData, esEstudiante: false }),
  }).catch(() => {});

  // WhatsApp (existente)
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

  const cita = await prisma.cita.findUnique({
    where: { id },
    include: {
      student:      { select: { id: true, name: true, email: true } },
      professional: { select: { id: true, name: true, email: true } },
    },
  });
  if (!cita) { res.status(404).json({ error: 'Cita no encontrada' }); return; }

  const canEdit =
    user.role === 'ADMIN' ||
    cita.studentId      === user.id ||
    cita.professionalId === user.id;

  if (!canEdit) { res.status(403).json({ error: 'Sin permisos para modificar esta cita' }); return; }

  // Guardar fecha anterior antes de actualizar (para reagendado)
  const fechaAnterior = cita.date;

  const updated = await prisma.cita.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.date   && { date:   new Date(data.date) }),
      ...(data.type   && { type:   data.type }),
      ...(data.mode   && { mode:   data.mode }),
      ...(data.location !== undefined && user.role !== 'USER' && { location: data.location }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.psychNotes !== undefined && { psychNotes: data.psychNotes }),
    },
    include: {
      professional: { select: { id: true, name: true, email: true } },
      student:      { select: { id: true, name: true, email: true } },
    },
  });

  const nuevaFecha = data.date ? new Date(data.date) : null;
  const fueReagendada = nuevaFecha && nuevaFecha.getTime() !== fechaAnterior.getTime();

  // ── Cancelación por psicólogo ───────────────────────────────────────────────
  if (data.status === 'CANCELADA' && cita.professionalId === user.id) {
    await prisma.notification.create({
      data: {
        userId:  cita.studentId,
        title:   'Cita cancelada ❌',
        message: `Tu cita con ${updated.professional.name} ha sido cancelada.`,
        type:    'WARNING',
      },
    });

    const emailData = {
      nombreEstudiante: cita.student.name ?? 'Estudiante',
      nombrePsicologo:  updated.professional.name ?? 'Psicólogo/a',
      fecha:            formatFecha(fechaAnterior),
      hora:             formatHora(fechaAnterior),
    };

    sendEmail({ to: cita.student.email, subject: '❌ Cita cancelada — Equilibria', html: citaCanceladaTemplate({ ...emailData, esEstudiante: true }) }).catch(() => {});
    sendEmail({ to: updated.professional.email, subject: '❌ Cita cancelada — Equilibria', html: citaCanceladaTemplate({ ...emailData, esEstudiante: false }) }).catch(() => {});

    const student = await prisma.user.findUnique({ where: { id: cita.studentId } });
    if (student?.phone) {
      sendCancellationToStudent({
        to: student.phone, studentName: student.name ?? 'Estudiante',
        date: fechaAnterior, professionalName: updated.professional.name ?? 'tu psicólogo/a',
        cancelledBy: 'professional',
      }).catch(() => {});
    }
  }

  // ── Cancelación por estudiante ──────────────────────────────────────────────
  if (data.status === 'CANCELADA' && user.role === 'USER') {
    await prisma.notification.create({
      data: {
        userId:  cita.professionalId,
        title:   'Cita cancelada por estudiante',
        message: `${cita.student.name ?? 'Un estudiante'} canceló su cita del ${formatFecha(fechaAnterior)}.`,
        type:    'WARNING',
      },
    });

    const emailData = {
      nombreEstudiante: cita.student.name ?? 'Estudiante',
      nombrePsicologo:  updated.professional.name ?? 'Psicólogo/a',
      fecha:            formatFecha(fechaAnterior),
      hora:             formatHora(fechaAnterior),
    };

    sendEmail({ to: cita.student.email, subject: '❌ Cita cancelada — Equilibria', html: citaCanceladaTemplate({ ...emailData, esEstudiante: true }) }).catch(() => {});
    sendEmail({ to: updated.professional.email, subject: '❌ Cita cancelada por estudiante — Equilibria', html: citaCanceladaTemplate({ ...emailData, esEstudiante: false }) }).catch(() => {});

    const professional = await prisma.user.findUnique({ where: { id: cita.professionalId } });
    if (professional?.phone) {
      sendCancellationToProfessional({
        to: professional.phone, professionalName: professional.name ?? 'Psicólogo/a',
        date: fechaAnterior, studentName: cita.student.name ?? 'un estudiante',
      }).catch(() => {});
    }
  }

  // ── Reagendado ──────────────────────────────────────────────────────────────
  if (fueReagendada) {
    const emailData = {
      nombreEstudiante: cita.student.name ?? 'Estudiante',
      nombrePsicologo:  updated.professional.name ?? 'Psicólogo/a',
      fechaAnterior:    formatFecha(fechaAnterior),
      horaAnterior:     formatHora(fechaAnterior),
      fechaNueva:       formatFecha(nuevaFecha!),
      horaNueva:        formatHora(nuevaFecha!),
    };

    sendEmail({ to: cita.student.email, subject: '🔄 Cita reagendada — Equilibria', html: citaReagendadaTemplate({ ...emailData, esEstudiante: true }) }).catch(() => {});
    sendEmail({ to: updated.professional.email, subject: '🔄 Cita reagendada — Equilibria', html: citaReagendadaTemplate({ ...emailData, esEstudiante: false }) }).catch(() => {});

    await prisma.notification.create({
      data: {
        userId:  cita.studentId,
        title:   'Cita reagendada 🔄',
        message: `Tu cita fue reagendada al ${formatFecha(nuevaFecha!)}.`,
        type:    'INFO',
      },
    });
  }

  // ── Confirmación por psicólogo ──────────────────────────────────────────────
  if (data.status === 'CONFIRMADA' && cita.professionalId === user.id) {
    await prisma.notification.create({
      data: {
        userId:  cita.studentId,
        title:   'Cita confirmada ✅',
        message: `Tu cita con ${updated.professional.name} fue confirmada.`,
        type:    'SUCCESS',
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

// ── GET /api/citas/professionals ───────────────────────────────────────────────
export const getProfessionals = async (_req: AuthRequest, res: Response): Promise<void> => {
  const professionals = await prisma.user.findMany({
    where:   { role: 'PSYCHOLOGIST' },
    select:  { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
  res.json(professionals);
};