import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './src/modules/auth/auth.routes';
import citasRoutes from './src/modules/citas/citas.routes';
import usersRoutes from './src/modules/users/users.routes';
import notificationsRoutes from './src/modules/notifications/notifications.routes';
import adminRoutes from './src/modules/admin/admin.routes';
import { startReminderScheduler } from './src/modules/citas/reminders';

const app = express();

// Arranca el scheduler de recordatorios WhatsApp (24h antes de cada cita)
startReminderScheduler();

app.use(cors());
app.use(express.json());

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Equilibria API', timestamp: new Date().toISOString() });
});

// Módulos
app.use('/api/auth', authRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
