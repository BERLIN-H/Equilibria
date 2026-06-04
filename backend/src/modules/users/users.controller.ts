import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../lib/prisma';

// GET /api/users/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true, role: true, phone: true, address: true, faculty: true, semester: true, createdAt: true },
  });

  if (!user) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  res.json(user);
};

// PATCH /api/users/me
export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, address, faculty, semester } = req.body;

  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(faculty !== undefined && { faculty }),
      ...(semester !== undefined && { semester }),
    },
    select: { id: true, email: true, name: true, role: true, phone: true, address: true, faculty: true, semester: true },
  });

  res.json(updated);
};

// PATCH /api/users/me/password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const bcrypt = await import('bcryptjs');
  const prisma = (await import('../../lib/prisma')).default;

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) { res.status(401).json({ error: 'La contraseña actual es incorrecta' }); return; }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: req.user!.id }, data: { password: hashed } });
  res.json({ ok: true });
};
