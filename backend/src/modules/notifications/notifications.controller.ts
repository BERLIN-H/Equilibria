import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import prisma from '../../lib/prisma';

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(notifications);
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, read: false },
    data: { read: true },
  });
  res.json({ ok: true });
};

// PATCH /api/notifications/:id/read
export const markOneRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const notif = await prisma.notification.findUnique({ where: { id } });

  if (!notif || notif.userId !== req.user!.id) {
    res.status(404).json({ error: 'Notificación no encontrada' });
    return;
  }

  await prisma.notification.update({ where: { id }, data: { read: true } });
  res.json({ ok: true });
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  const count = await prisma.notification.count({
    where: { userId: req.user!.id, read: false },
  });
  res.json({ count });
};
