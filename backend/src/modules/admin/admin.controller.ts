import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../lib/prisma';

// GET /api/admin/stats
export const getStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [totalUsers, totalCitas, citasCompletadas, citasPendientes, sosAlerts] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.cita.count(),
    prisma.cita.count({ where: { status: 'COMPLETADA' } }),
    prisma.cita.count({ where: { status: { in: ['PENDIENTE', 'CONFIRMADA'] } } }),
    prisma.notification.count({ where: { type: 'ERROR' } }),
  ]);

  // Citas del mes actual
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const citasThisMonth = await prisma.cita.count({
    where: { createdAt: { gte: startOfMonth } },
  });

  res.json({
    totalUsers,
    totalCitas,
    citasCompletadas,
    citasPendientes,
    citasThisMonth,
    sosAlerts,
  });
};

// GET /api/admin/users?search=&role=&page=&limit=
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, role, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        faculty: true,
        semester: true,
        createdAt: true,
        _count: { select: { citas: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    data: users,
    total,
    page: parseInt(page as string),
    totalPages: Math.ceil(total / parseInt(limit as string)),
  });
};

// GET /api/admin/citas?status=&from=&to=
export const getAllCitas = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, from, to, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: any = {};
  if (status) where.status = status;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from as string);
    if (to) where.date.lte = new Date(to as string);
  }

  const [citas, total] = await Promise.all([
    prisma.cita.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true } },
        professional: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit as string),
    }),
    prisma.cita.count({ where }),
  ]);

  res.json({
    data: citas,
    total,
    page: parseInt(page as string),
    totalPages: Math.ceil(total / parseInt(limit as string)),
  });
};

// PATCH /api/admin/users/:id — cambiar rol o datos de un usuario
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const { role, name, faculty } = req.body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(role && { role }),
      ...(name && { name }),
      ...(faculty !== undefined && { faculty }),
    },
    select: { id: true, name: true, email: true, role: true, faculty: true },
  });

  res.json(updated);
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  if (id === req.user!.id) {
    res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    return;
  }

  // Borrar en orden para respetar foreign keys
  await prisma.notification.deleteMany({ where: { userId: id } });
  await prisma.availableSlot.deleteMany({ where: { professionalId: id } });
  await prisma.cita.deleteMany({ where: { OR: [{ studentId: id }, { professionalId: id }] } });
  await prisma.user.delete({ where: { id } });

  res.status(204).send();
};

// GET /api/admin/reports/cancellations — reporte de cancelaciones por psicólogo
export const getCancellationReport = async (_req: AuthRequest, res: Response): Promise<void> => {
  const psychologists = await prisma.user.findMany({
    where: { role: 'PSYCHOLOGIST' },
    select: {
      id: true, name: true, email: true,
      citasAsProf: {
        where: { status: 'CANCELADA' },
        select: {
          id: true, date: true, type: true,
          student: { select: { name: true, email: true } },
          updatedAt: true,
        },
        orderBy: { date: 'desc' },
        take: 20,
      },
      _count: {
        select: {
          citasAsProf: true,
        },
      },
    },
  });

  const report = psychologists.map(p => ({
    id: p.id,
    name: p.name,
    email: p.email,
    totalCitas: p._count.citasAsProf,
    canceladas: p.citasAsProf.length,
    cancelaciones: p.citasAsProf,
  }));

  res.json(report);
};

// GET /api/admin/reports/psychologists — resumen de actividad por psicólogo
export const getPsychologistReport = async (_req: AuthRequest, res: Response): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const psychologists = await prisma.user.findMany({
    where: { role: 'PSYCHOLOGIST' },
    select: {
      id: true, name: true, email: true,
      citasAsProf: {
        select: { status: true, date: true, createdAt: true },
      },
    },
  });

  const report = psychologists.map(p => {
    const citas = p.citasAsProf;
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      total: citas.length,
      completadas: citas.filter(c => c.status === 'COMPLETADA').length,
      canceladas: citas.filter(c => c.status === 'CANCELADA').length,
      pendientes: citas.filter(c => c.status === 'PENDIENTE' || c.status === 'CONFIRMADA').length,
      esteMes: citas.filter(c => new Date(c.createdAt) >= startOfMonth).length,
    };
  });

  res.json(report);
};
