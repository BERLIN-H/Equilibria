import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticación requerido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Token inválido o expirado' });
    return;
  }

  // Verificar dominio — temporal: permite gmail para pruebas
  const allowedDomains = ['@uniguajira.edu.co', '@gmail.com'];
  if (!allowedDomains.some(d => user.email?.endsWith(d))) {
    res.status(403).json({ error: 'Solo se permiten cuentas @uniguajira.edu.co' });
    return;
  }

  const { default: prisma } = await import('../lib/prisma');
  const dbUser = await prisma.user.findUnique({ where: { email: user.email } });

  if (!dbUser) {
    res.status(404).json({ error: 'Usuario no encontrado en el sistema' });
    return;
  }

  req.user = { id: dbUser.id, email: dbUser.email, role: dbUser.role };
  next();
};