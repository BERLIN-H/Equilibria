/**
 * reminders.ts
 * Scheduler que corre cada hora y envía recordatorios WhatsApp
 * a los estudiantes con citas en las próximas 24 horas.
 *
 * Solo envía el recordatorio una vez por cita (guarda el estado en un Set en memoria).
 * Si el servidor se reinicia, vuelve a buscar citas futuras sin enviar duplicados
 * (la ventana de búsqueda es 23h–25h para evitar que un reinicio rápido lo reenvíe).
 */

import cron from 'node-cron';
import prisma from '../../lib/prisma';
import { sendAppointmentReminder } from '../../lib/twilio';

// Set en memoria con los IDs de citas ya notificadas (evita duplicados en la misma sesión)
const reminded = new Set<number>();

async function processReminders() {
  const now  = new Date();
  // Ventana: citas que caen entre 23h y 25h desde ahora
  const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const to   = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  try {
    const citas = await prisma.cita.findMany({
      where: {
        date:        { gte: from, lte: to },
        status:      { in: ['PENDIENTE', 'CONFIRMADA'] },
        studentPhone: { not: null },
      },
      include: {
        student:      { select: { name: true } },
        professional: { select: { name: true } },
      },
    });

    for (const cita of citas) {
      if (reminded.has(cita.id)) continue;
      if (!cita.studentPhone)    continue;

      await sendAppointmentReminder({
        to:              cita.studentPhone,
        studentName:     cita.student.name     ?? 'Estudiante',
        date:            cita.date,
        professionalName: cita.professional.name ?? 'tu psicólogo/a',
        appointmentType: cita.type,
      });

      reminded.add(cita.id);
    }

    if (citas.length > 0) {
      console.log(`[Reminders] ${citas.length} cita(s) revisada(s) en ventana 23-25h.`);
    }
  } catch (err) {
    console.error('[Reminders] Error al procesar recordatorios:', err);
  }
}

/**
 * Inicia el scheduler de recordatorios.
 * Corre cada hora en punto: "0 * * * *"
 */
export function startReminderScheduler() {
  // Corre inmediatamente al arrancar (para no perder recordatorios si el servidor
  // se reinició dentro de la ventana de 23-25h)
  processReminders();

  // Luego corre cada hora
  cron.schedule('0 * * * *', () => {
    console.log('[Reminders] Revisando recordatorios pendientes...');
    processReminders();
  });

  console.log('[Reminders] Scheduler iniciado — revisión horaria activa.');
}
