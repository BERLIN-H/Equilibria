export const citaAgendadaTemplate = ({
  nombreEstudiante,
  nombrePsicologo,
  fecha,
  hora,
  tipo,
  modo,
  ubicacion,
  esEstudiante,
}: {
  nombreEstudiante: string;
  nombrePsicologo: string;
  fecha: string;
  hora: string;
  tipo: string;
  modo: string;
  ubicacion?: string;
  esEstudiante: boolean;
}) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cita Agendada</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a5276,#2e86c1);padding:40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">⚖️</div>
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;letter-spacing:1px;">EQUILIBRIA</h1>
            <p style="color:#a9cce3;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Centro de Apoyo Psicológico</p>
          </td>
        </tr>

        <!-- Badge -->
        <tr>
          <td style="padding:0;text-align:center;">
            <div style="display:inline-block;background:#e8f5e9;border:2px solid #4caf50;border-radius:50px;padding:10px 28px;margin:24px auto;font-size:15px;color:#2e7d32;font-weight:600;">
              ✅ Cita Confirmada
            </div>
          </td>
        </tr>

        <!-- Saludo -->
        <tr>
          <td style="padding:0 40px 24px;">
            <p style="font-size:16px;color:#2c3e50;margin:0;">
              Hola, <strong>${esEstudiante ? nombreEstudiante : 'Dr(a). ' + nombrePsicologo}</strong>
            </p>
            <p style="font-size:15px;color:#5d6d7e;margin:12px 0 0;line-height:1.6;">
              ${esEstudiante
                ? `Tu cita con <strong>${nombrePsicologo}</strong> ha sido agendada exitosamente.`
                : `El estudiante <strong>${nombreEstudiante}</strong> ha agendado una cita contigo.`
              }
            </p>
          </td>
        </tr>

        <!-- Detalles -->
        <tr>
          <td style="padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
              <tr style="background:#eaf2fb;">
                <td colspan="2" style="padding:16px 20px;font-size:13px;font-weight:700;color:#1a5276;letter-spacing:1px;text-transform:uppercase;">
                  📋 Detalles de la Cita
                </td>
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
                <td style="padding:14px 20px;font-size:14px;color:#718096;border-bottom:1px solid #e2e8f0;">🧠 Tipo</td>
                <td style="padding:14px 20px;font-size:14px;color:#2d3748;font-weight:600;border-bottom:1px solid #e2e8f0;">${tipo}</td>
              </tr>
              <tr>
                <td style="padding:14px 20px;font-size:14px;color:#718096;${ubicacion ? 'border-bottom:1px solid #e2e8f0;' : ''}">📍 Modalidad</td>
                <td style="padding:14px 20px;font-size:14px;color:#2d3748;font-weight:600;${ubicacion ? 'border-bottom:1px solid #e2e8f0;' : ''}">${modo}</td>
              </tr>
              ${ubicacion ? `
              <tr>
                <td style="padding:14px 20px;font-size:14px;color:#718096;">🏢 Lugar</td>
                <td style="padding:14px 20px;font-size:14px;color:#2d3748;font-weight:600;">${ubicacion}</td>
              </tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#a0aec0;">Este correo fue enviado automáticamente por Equilibria.</p>
            <p style="margin:8px 0 0;font-size:12px;color:#a0aec0;">Universidad de La Guajira — Centro de Apoyo Psicológico</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export const citaCanceladaTemplate = ({
  nombreEstudiante,
  nombrePsicologo,
  fecha,
  hora,
  esEstudiante,
}: {
  nombreEstudiante: string;
  nombrePsicologo: string;
  fecha: string;
  hora: string;
  esEstudiante: boolean;
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
              <div style="display:inline-block;background:#fdecea;border:2px solid #e53935;border-radius:50px;padding:10px 28px;font-size:15px;color:#c62828;font-weight:600;">
                ❌ Cita Cancelada
              </div>
            </div>
            <p style="font-size:16px;color:#2c3e50;margin:0;">
              Hola, <strong>${esEstudiante ? nombreEstudiante : 'Dr(a). ' + nombrePsicologo}</strong>
            </p>
            <p style="font-size:15px;color:#5d6d7e;margin:12px 0 24px;line-height:1.6;">
              ${esEstudiante
                ? `Tu cita del <strong>${fecha} a las ${hora}</strong> con <strong>${nombrePsicologo}</strong> ha sido cancelada.`
                : `La cita del <strong>${fecha} a las ${hora}</strong> con el estudiante <strong>${nombreEstudiante}</strong> ha sido cancelada.`
              }
            </p>
            <p style="font-size:14px;color:#718096;margin:0;">Si tienes dudas, comunícate con el Centro de Apoyo Psicológico.</p>
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

export const citaReagendadaTemplate = ({
  nombreEstudiante,
  nombrePsicologo,
  fechaAnterior,
  horaAnterior,
  fechaNueva,
  horaNueva,
  esEstudiante,
}: {
  nombreEstudiante: string;
  nombrePsicologo: string;
  fechaAnterior: string;
  horaAnterior: string;
  fechaNueva: string;
  horaNueva: string;
  esEstudiante: boolean;
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
                🔄 Cita Reagendada
              </div>
            </div>
            <p style="font-size:16px;color:#2c3e50;margin:0;">
              Hola, <strong>${esEstudiante ? nombreEstudiante : 'Dr(a). ' + nombrePsicologo}</strong>
            </p>
            <p style="font-size:15px;color:#5d6d7e;margin:12px 0 24px;line-height:1.6;">
              Tu cita ha sido reagendada a una nueva fecha.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
              <tr style="background:#fdecea;">
                <td colspan="2" style="padding:12px 20px;font-size:13px;font-weight:700;color:#c62828;">❌ Fecha anterior</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-size:14px;color:#718096;width:40%;">📅 Fecha</td>
                <td style="padding:12px 20px;font-size:14px;color:#2d3748;font-weight:600;text-decoration:line-through;">${fechaAnterior}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-size:14px;color:#718096;border-bottom:2px solid #e2e8f0;">🕐 Hora</td>
                <td style="padding:12px 20px;font-size:14px;color:#2d3748;font-weight:600;text-decoration:line-through;border-bottom:2px solid #e2e8f0;">${horaAnterior}</td>
              </tr>
              <tr style="background:#e8f5e9;">
                <td colspan="2" style="padding:12px 20px;font-size:13px;font-weight:700;color:#2e7d32;">✅ Nueva fecha</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-size:14px;color:#718096;">📅 Fecha</td>
                <td style="padding:12px 20px;font-size:14px;color:#2d3748;font-weight:600;">${fechaNueva}</td>
              </tr>
              <tr>
                <td style="padding:12px 20px;font-size:14px;color:#718096;">🕐 Hora</td>
                <td style="padding:12px 20px;font-size:14px;color:#2d3748;font-weight:600;">${horaNueva}</td>
              </tr>
            </table>
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