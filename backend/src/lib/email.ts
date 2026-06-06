import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const DEV_EMAIL = process.env.RESEND_DEV_EMAIL;

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const recipient = isDevelopment && DEV_EMAIL ? DEV_EMAIL : to;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: recipient,
    subject: isDevelopment && DEV_EMAIL ? `[PRUEBA -> ${to}] ${subject}` : subject,
    html,
  });

  if (error) console.error('[Email] Error enviando correo:', error);
};
