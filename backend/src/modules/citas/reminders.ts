import cron from 'node-cron';
import prisma from '../../lib/prisma';
import { sendEmail } from '../../lib/email';

const reminded = new Set<number>();

const formatFecha = (date: Date) =>
  date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Bogota' });

const formatHora = (date: Date) =>
  date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Bogota' });

const recordatorioTemplate = ({
  nombreEstudiante,
  nombrePsicologo,
  fecha,
  hora,
  tipo,
}: {
  nombreEstudiante: string;
  nombrePsicologo: string;
  fecha: string;
  hora: string;
  tipo: string;
}) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a5276,#2e86c1);padding:40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">⚖️</div>
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">EQUILIBRIA</h1>
            <p style="color:#a9cce3;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Centro de Apoyo Psicológico</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="display:inline-block;background:#fff8e1;border:2px solid #f9a825;border-radius:50px;padding:10px 28px;font-size:15px;color:#f57f17;font-weight:600;">
                ⏰ Recordatorio de Cita
              </div>
            </div>
            <p style="font-size:16px;color:#2c3e50;margin:0 0 8px;">
              Hola, <strong>${nombreEstudiante}</strong>
            </p>
            <p style="font-size:15px;color:#5d6d7e;margin:0 0 24px;line-height:1.6;">
              Te recordamos que tienes una cita <strong>mañana</strong> con <strong>${nombrePsicologo}</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
              <tr style="background:#eaf2fb;">
                <td colspan="2" style="padding:16px 20px;font-size:13px;font-weight:700;color:#1a5276;letter-spacing:1px;text-transform:uppercase;">📋 Detalles</td>
              </tr>
              <tr>
                <td style="padding:14px 20px;font-size:14px;color:#718096;width:40%;border-bottom:1px solid #e2e8f0;">📅 Fecha</td>
                <td style="padding:14px 20px;font-size:14px;color:#2d3748;font-weight:600;border-bottom:1px solid #e2e8f0;">${fecha}</td>
              </tr>
              <tr>
                <td style="padding:14px 20px;font-size:14px;color:#718096;border-bottom:1px solid #e2e8f0;">🕐 Hora</td>
                <td style="padding:14px 20px;font-size:14px;color:#2d3748;font-weight:600;border-bottom:1px solid #e2e8f0;">${hora}</td>
              </tr>
              <tr>
                <td style="padding:14px 20px;font-size:14px;color:#718096;">🧠 Tipo</td>
                <td style="padding:14px 20px;font-size:14px;color:#2d3748;font-weight:600;">${tipo}</td>
              </tr>
            </table>
            <p style="font-size:13px;color:#a0aec0;margin:24px 0 0;text-align:center;">
              Si no puedes asistir, por favor cancela tu cita con anticipación desde la plataforma.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#a0aec0;">Equilibria — Universidad de La Guajira</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

async function processReminders() {
  const now  = new Date();
  const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const to   = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  try {
    const citas = await prisma.cita.findMany({
      where: {
        date:   { gte: from, lte: to },
        status: { in: ['PENDIENTE', 'CONFIRMADA'] },
      },
      include: {
        student:      { select: { name: true, email: true } },
        professional: { select: { name: true } },
      },
    });

    for (const cita of citas) {
      if (reminded.has(cita.id)) continue;

      await sendEmail({
        to:      cita.student.email,
        subject: '⏰ Recordatorio de cita — Equilibria',
        html:    recordatorioTemplate({
          nombreEstudiante: cita.student.name     ?? 'Estudiante',
          nombrePsicologo:  cita.professional.name ?? 'tu psicólogo/a',
          fecha:            formatFecha(cita.date),
          hora:             formatHora(cita.date),
          tipo:             cita.type,
        }),
      });

      reminded.add(cita.id);
    }

    if (citas.length > 0) {
      console.log(`[Reminders] ${citas.length} recordatorio(s) enviado(s) por correo.`);
    }
  } catch (err) {
    console.error('[Reminders] Error al procesar recordatorios:', err);
  }
}

export function startReminderScheduler() {
  processReminders();
  cron.schedule('0 * * * *', () => {
    console.log('[Reminders] Revisando recordatorios pendientes...');
    processReminders();
  });
  console.log('[Reminders] Scheduler iniciado — revisión horaria activa.');
}