import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de Equilibria...');

  const adminPassword = await bcrypt.hash('Admin2026!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@equilibria.edu' },
    update: {},
    create: { email: 'admin@equilibria.edu', password: adminPassword, name: 'Administrador Equilibria', role: 'ADMIN' },
  });

  const psycPassword = await bcrypt.hash('Psico2026!', 10);
  const psy = await prisma.user.upsert({
    where: { email: 'dra.rodriguez@equilibria.edu' },
    update: {},
    create: { email: 'dra.rodriguez@equilibria.edu', password: psycPassword, name: 'Dra. Elena Rodríguez', role: 'PSYCHOLOGIST' },
  });

  const psy2 = await prisma.user.upsert({
    where: { email: 'dr.garcia@equilibria.edu' },
    update: {},
    create: { email: 'dr.garcia@equilibria.edu', password: await bcrypt.hash('Psico2026!', 10), name: 'Dr. Andrés García', role: 'PSYCHOLOGIST' },
  });

  const studentPassword = await bcrypt.hash('Estudiante2026!', 10);
  const student = await prisma.user.upsert({
    where: { email: 'mariana@estudiante.edu' },
    update: {},
    create: {
      email: 'mariana@estudiante.edu', password: studentPassword, name: 'Mariana García',
      role: 'USER', faculty: 'Ingeniería de Sistemas', semester: 5,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'carlos@estudiante.edu' },
    update: {},
    create: {
      email: 'carlos@estudiante.edu', password: await bcrypt.hash('Estudiante2026!', 10),
      name: 'Carlos Mendoza', role: 'USER', faculty: 'Psicología', semester: 3,
    },
  });

  // Citas de demo
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  tomorrow.setHours(10, 0, 0, 0);
  nextWeek.setHours(14, 30, 0, 0);
  yesterday.setHours(9, 0, 0, 0);

  await prisma.cita.createMany({
    skipDuplicates: true,
    data: [
      { studentId: student.id, professionalId: psy.id, date: tomorrow, type: 'Ansiedad', mode: 'Presencial', location: 'Consultorio 3', status: 'CONFIRMADA' },
      { studentId: student.id, professionalId: psy2.id, date: nextWeek, type: 'Estrés académico', mode: 'Virtual', status: 'PENDIENTE' },
      { studentId: student.id, professionalId: psy.id, date: yesterday, type: 'Consulta General', mode: 'Presencial', status: 'COMPLETADA' },
      { studentId: student2.id, professionalId: psy.id, date: tomorrow, type: 'Consulta General', mode: 'Presencial', location: 'Consultorio 1', status: 'PENDIENTE' },
    ],
  });

  // Notificaciones de demo
  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      { userId: student.id, title: 'Cita Confirmada', message: 'Tu cita con Dra. Elena Rodríguez ha sido confirmada para mañana a las 10:00 AM.', type: 'SUCCESS' },
      { userId: student.id, title: 'Recordatorio', message: 'Tienes una cita pendiente la próxima semana. Recuerda confirmarla.', type: 'INFO' },
      { userId: student2.id, title: 'Cita Agendada', message: 'Tu cita con Dra. Elena Rodríguez fue agendada exitosamente.', type: 'SUCCESS' },
    ],
  });

  console.log('✅ Seed completado:');
  console.log('   👤 Admin:        admin@equilibria.edu / Admin2026!');
  console.log('   🩺 Psicólogo 1:  dra.rodriguez@equilibria.edu / Psico2026!');
  console.log('   🩺 Psicólogo 2:  dr.garcia@equilibria.edu / Psico2026!');
  console.log('   🎓 Estudiante 1: mariana@estudiante.edu / Estudiante2026!');
  console.log('   🎓 Estudiante 2: carlos@estudiante.edu / Estudiante2026!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
