import { google } from 'googleapis';

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key:   process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

export const crearEventoCalendar = async ({
  titulo,
  descripcion,
  fechaInicio,
  fechaFin,
}: {
  titulo: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  emailEstudiante: string;
  emailPsicologo: string;
}): Promise<string | null> => {
  try {
    const { data } = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary:     titulo,
        description: descripcion,
        start: { dateTime: fechaInicio.toISOString(), timeZone: 'America/Bogota' },
        end:   { dateTime: fechaFin.toISOString(),    timeZone: 'America/Bogota' },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email',  minutes: 24 * 60 },
            { method: 'popup',  minutes: 30 },
          ],
        },
      },
    });

    console.log(`[Calendar] Evento creado: ${data.id}`);
    return data.id ?? null;
  } catch (err) {
    console.error('[Calendar] Error creando evento:', err);
    return null;
  }
};

export const eliminarEventoCalendar = async (eventId: string): Promise<void> => {
  try {
    await calendar.events.delete({ calendarId: CALENDAR_ID, eventId });
    console.log(`[Calendar] Evento eliminado: ${eventId}`);
  } catch (err) {
    console.error('[Calendar] Error eliminando evento:', err);
  }
};

export const actualizarEventoCalendar = async ({
  eventId,
  fechaInicio,
  fechaFin,
}: {
  eventId: string;
  fechaInicio: Date;
  fechaFin: Date;
}): Promise<void> => {
  try {
    await calendar.events.patch({
      calendarId: CALENDAR_ID,
      eventId,
      requestBody: {
        start: { dateTime: fechaInicio.toISOString(), timeZone: 'America/Bogota' },
        end:   { dateTime: fechaFin.toISOString(),    timeZone: 'America/Bogota' },
      },
    });
    console.log(`[Calendar] Evento actualizado: ${eventId}`);
  } catch (err) {
    console.error('[Calendar] Error actualizando evento:', err);
  }
};