import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../lib/prisma';

// ── GET /api/patients ─────────────────────────────────────────────────────────
// Lista todos los estudiantes que han tenido citas con este psicólogo
export const getPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;

  if (user.role !== 'PSYCHOLOGIST') {
    res.status(403).json({ error: 'Solo psicólogos pueden acceder a esta sección' });
    return;
  }

  const citas = await prisma.cita.findMany({
    where: { professionalId: user.id },
    include: {
      student: {
        select: { id: true, name: true, email: true, faculty: true, semester: true, phone: true },
      },
    },
    orderBy: { date: 'desc' },
  });

  // Deduplicar por studentId y agregar última cita y total de sesiones
  const patientsMap = new Map<number, any>();
  for (const cita of citas) {
    const s = cita.student;
    if (!patientsMap.has(s.id)) {
      patientsMap.set(s.id, {
        ...s,
        totalSesiones: 0,
        ultimaCita: null,
        estadoUltimaCita: null,
      });
    }
    const p = patientsMap.get(s.id);
    p.totalSesiones += 1;
    if (!p.ultimaCita || cita.date > p.ultimaCita) {
      p.ultimaCita = cita.date;
      p.estadoUltimaCita = cita.status;
    }
  }

  res.json(Array.from(patientsMap.values()));
};

// ── GET /api/patients/:id ─────────────────────────────────────────────────────
// Ficha clínica completa del estudiante
export const getPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const studentId = parseInt(req.params.id);

  if (user.role !== 'PSYCHOLOGIST') {
    res.status(403).json({ error: 'Solo psicólogos pueden acceder a esta sección' });
    return;
  }

  // Verificar que este psicólogo ha atendido a este estudiante
  const hasRelation = await prisma.cita.findFirst({
    where: { professionalId: user.id, studentId },
  });

  if (!hasRelation) {
    res.status(403).json({ error: 'No tienes acceso al historial de este estudiante' });
    return;
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, email: true, faculty: true, semester: true, phone: true, createdAt: true },
  });

  if (!student) {
    res.status(404).json({ error: 'Estudiante no encontrado' });
    return;
  }

  const citas = await prisma.cita.findMany({
    where: { professionalId: user.id, studentId },
    orderBy: { date: 'desc' },
    select: {
      id: true, date: true, type: true, mode: true,
      status: true, notes: true, psychNotes: true, location: true,
    },
  });

  res.json({ student, citas });
};