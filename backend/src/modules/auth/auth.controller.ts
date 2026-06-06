import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { supabase } from '../../lib/supabase';
import { AuthRequest } from '../../middlewares/auth.middleware';

// El login/register ahora lo maneja Supabase en el frontend
// Este endpoint sincroniza el usuario de Supabase con nuestra BD
export const syncUser = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) { res.status(401).json({ error: 'No autorizado' }); return; }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user?.email) {
    res.status(401).json({ error: 'Token inválido' });
    return;
  }

  const allowedDomains = ['@uniguajira.edu.co', '@gmail.com'];
  if (!allowedDomains.some(d => user.email?.endsWith(d))) {
    res.status(403).json({ error: 'Solo se permiten cuentas @uniguajira.edu.co' });
    return;
  }

  // Crear usuario en BD si no existe (primer login)
  const dbUser = await prisma.user.upsert({
  where: { email: user.email },
  update: {}, // no sobreescribe nada, respeta cambios manuales
  create: {
    email: user.email,
    name: user.user_metadata?.full_name || user.email.split('@')[0],
    password: '',
    role: 'USER',
  },
  select: { id: true, email: true, name: true, role: true, createdAt: true },
});

  res.json({ user: dbUser });
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) { res.status(401).json({ error: 'No autenticado' }); return; }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }

  res.json(user);
};