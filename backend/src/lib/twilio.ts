/**
 * twilio.ts
 * Intenta enviar mensaje libre primero.
 * Si Twilio rechaza por ventana de 24h, cae al template del sandbox.
 */

let _client: any = null;

async function getClient(): Promise<any | null> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  if (!_client) {
    const twilio = await import('twilio');
    _client = twilio.default(accountSid, authToken);
  }
  return _client;
}

const FROM         = () => process.env.TWILIO_WHATSAPP_NUMBER ?? 'whatsapp:+14155238886';
const CONTENT_SID  = () => process.env.TWILIO_CONTENT_SID ?? 'HXb5b62575e6e4ff6129ad7c8efe1f983e';

function fmtDate(d: Date) {
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

async function sendFreeText(to: string, body: string): Promise<boolean> {
  const client = await getClient();
  if (!client) return false;
  try {
    await client.messages.create({ from: FROM(), to: `whatsapp:${to}`, body });
    console.log(`[Twilio] ✅ Mensaje libre enviado a ${to}`);
    return true;
  } catch (err: any) {
    // Error 63016 = fuera de ventana de 24h del sandbox
    if (err?.code === 63016 || err?.status === 403) {
      console.log(`[Twilio] ⚠️ Fuera de ventana 24h, usando template para ${to}`);
      return false;
    }
    console.error('[Twilio] Error inesperado:', err?.message ?? err);
    return false;
  }
}

async function sendTemplate(to: string, date: Date): Promise<void> {
  const client = await getClient();
  if (!client) return;
  try {
    await client.messages.create({
      from: FROM(),
      to:   `whatsapp:${to}`,
      contentSid: CONTENT_SID(),
      contentVariables: JSON.stringify({ '1': fmtDate(date), '2': fmtTime(date) }),
    });
    console.log(`[Twilio] ✅ Template enviado a ${to}`);
  } catch (err: any) {
    console.error('[Twilio] Error enviando template:', err?.message ?? err);
  }
}

async function send(to: string, body: string, date?: Date): Promise<void> {
  const client = await getClient();
  if (!client) {
    console.log(`[Twilio] Sin credenciales — simulando para ${to}:\n${body}`);
    return;
  }
  const ok = await sendFreeText(to, body);
  if (!ok && date) await sendTemplate(to, date);
}

// ── Confirmación al agendar ───────────────────────────────────────────────────
export async function sendAppointmentConfirmation(opts: {
  to: string; studentName: string; date: Date;
  professionalName: string; appointmentType?: string;
}): Promise<void> {
  const body =
    `✅ *Cita Agendada — Equilibria*\n\n` +
    `Hola ${opts.studentName}, tu cita ha sido registrada.\n\n` +
    `📅 *Fecha:* ${fmtDate(opts.date)}\n` +
    `🕐 *Hora:* ${fmtTime(opts.date)}\n` +
    `👨‍⚕️ *Psicólogo/a:* ${opts.professionalName}\n` +
    (opts.appointmentType ? `📋 *Tipo:* ${opts.appointmentType}\n` : '') +
    `\n_Si necesitas cancelar, hazlo desde la plataforma Equilibria._`;
  await send(opts.to, body, opts.date);
}

// ── Recordatorio 24h antes ────────────────────────────────────────────────────
export async function sendAppointmentReminder(opts: {
  to: string; studentName: string; date: Date;
  professionalName: string; appointmentType?: string;
}): Promise<void> {
  const body =
    `🔔 *Recordatorio — Equilibria*\n\n` +
    `Hola ${opts.studentName}, tienes una cita *mañana*:\n\n` +
    `📅 *Fecha:* ${fmtDate(opts.date)}\n` +
    `🕐 *Hora:* ${fmtTime(opts.date)}\n` +
    `👨‍⚕️ *Psicólogo/a:* ${opts.professionalName}\n` +
    (opts.appointmentType ? `📋 *Tipo:* ${opts.appointmentType}\n` : '') +
    `\n_Si necesitas cancelar, hazlo desde la plataforma Equilibria._`;
  await send(opts.to, body, opts.date);
}

// ── Cancelación al estudiante ─────────────────────────────────────────────────
export async function sendCancellationToStudent(opts: {
  to: string; studentName: string; date: Date; professionalName: string; cancelledBy: string;
}): Promise<void> {
  const body =
    `❌ *Cita Cancelada — Equilibria*\n\n` +
    `Hola ${opts.studentName}, tu cita ha sido cancelada.\n\n` +
    `📅 *Fecha era:* ${fmtDate(opts.date)} a las ${fmtTime(opts.date)}\n` +
    `👨‍⚕️ *Psicólogo/a:* ${opts.professionalName}\n\n` +
    `_Por favor agenda una nueva cita desde la plataforma Equilibria._`;
  await send(opts.to, body, opts.date);
}

// ── Cancelación al psicólogo ──────────────────────────────────────────────────
export async function sendCancellationToProfessional(opts: {
  to: string; professionalName: string; date: Date; studentName: string;
}): Promise<void> {
  const body =
    `❌ *Cita Cancelada — Equilibria*\n\n` +
    `Hola ${opts.professionalName}, el/la estudiante *${opts.studentName}* canceló su cita.\n\n` +
    `📅 *Fecha era:* ${fmtDate(opts.date)} a las ${fmtTime(opts.date)}\n\n` +
    `_El horario ha quedado disponible nuevamente._`;
  await send(opts.to, body, opts.date);
}
