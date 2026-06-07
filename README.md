# Equilibria — Centro de Apoyo Psicológico

Plataforma web para gestión de citas y bienestar psicológico universitario de la **Universidad de La Guajira**.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Express · Prisma 7 · PostgreSQL · Supabase · Docker

---

## Características principales

- 🔐 **Autenticación** con Google OAuth restringida a cuentas `@uniguajira.edu.co`
- 👤 **Tres roles:** Estudiante, Psicólogo y Administrador
- 📅 **Gestión de citas** con agendado, confirmación, cancelación y reagendado
- 📧 **Correos transaccionales** HTML con Resend al agendar, cancelar y reagendar
- 📆 **Google Calendar** — eventos creados automáticamente al agendar
- 💬 **WhatsApp** — recordatorios y notificaciones con Twilio
- 🧑‍⚕️ **Ficha clínica** por psicólogo con historial y notas de sesión
- 📊 **Panel de admin** con estadísticas y reportes exportables a PDF y Excel

---

## Requisitos previos

- Node.js 22+
- Una cuenta de [Supabase](https://supabase.com) con proyecto creado
- Docker (opcional, para despliegue)

---

## Configuración del entorno

```bash
git clone <repo-url>
cd equilibria
cp .env.example .env
```

Edita `.env` y completa las variables requeridas:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL de Supabase (pooler) |
| `DIRECT_URL` | Cadena de conexión directa de Supabase (para migraciones) |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio de Supabase (solo backend) |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (frontend) |
| `VITE_SUPABASE_ANON_KEY` | Clave pública de Supabase (frontend) |
| `RESEND_API_KEY` | API key de Resend para correos |
| `EMAIL_FROM` | Remitente de correos (ej. `Equilibria <no-reply@dominio.com>`) |
| `RESEND_DEV_EMAIL` | Correo de prueba en desarrollo |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email de la cuenta de servicio de Google |
| `GOOGLE_PRIVATE_KEY` | Clave privada de la cuenta de servicio |
| `GOOGLE_CALENDAR_ID` | ID del calendario de Google |
| `TWILIO_ACCOUNT_SID` | SID de cuenta Twilio |
| `TWILIO_AUTH_TOKEN` | Token de autenticación Twilio |
| `TWILIO_WHATSAPP_NUMBER` | Número WhatsApp de Twilio |

---

## Desarrollo local

```bash
npm install
npx prisma generate
npx prisma db push       # sincroniza el schema con Supabase
npm run dev              # inicia en http://localhost:3000 con HMR
```

---

## Despliegue con Docker

```bash
docker compose up -d --build
```

La app queda disponible en `http://localhost:3000`.  
Las migraciones se aplican automáticamente al arrancar.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Modo desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run start` | Inicia el build de producción |
| `npm run db:generate` | Regenera el cliente Prisma |
| `npm run db:studio` | Abre Prisma Studio en localhost:5555 |
| `npm run db:seed` | Carga datos de demo en la BD |

---

## Autenticación

El login usa **Google OAuth** a través de Supabase Auth.  
Solo se permiten cuentas del dominio `@uniguajira.edu.co`.

Para pruebas de desarrollo, el dominio `@gmail.com` también está habilitado (configurado en el middleware).

---

## Roles del sistema

| Rol | Descripción |
|---|---|
| `USER` | Estudiante — puede agendar y gestionar sus citas |
| `PSYCHOLOGIST` | Psicólogo — gestiona citas, agenda y fichas clínicas |
| `ADMIN` | Administrador — gestión completa de la plataforma |

Los roles se asignan desde el panel de administración o directamente en la base de datos:

```sql
UPDATE users SET role = 'PSYCHOLOGIST' WHERE email = 'correo@uniguajira.edu.co';
```

---

## Estructura del proyecto

```
.
├── backend/
│   ├── app.ts                  # Configuración Express
│   ├── prisma/                 # Schema y seed
│   ├── src/
│   │   ├── lib/                # Prisma, Supabase, email, calendar, Twilio
│   │   ├── middlewares/        # Auth, roles, validación
│   │   └── modules/            # auth, citas, users, notifications, admin, patients
│   └── schemas/                # Esquemas Zod
├── frontend/
│   └── src/
│       ├── api/                # Clientes Axios por dominio
│       ├── components/         # Componentes compartidos
│       ├── layouts/            # Layout principal
│       ├── lib/                # Cliente Supabase
│       ├── pages/              # Páginas de la app
│       └── store/              # Estado global (Zustand)
├── docs/
│   └── PROJECT_CONTEXT.md      # Documentación técnica completa
├── docker-compose.yml
├── Dockerfile
└── prisma.config.ts
```

---

## API principal

Base: `/api`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/health` | Health check | No |
| POST | `/auth/sync` | Sincronizar usuario OAuth con BD | Token Supabase |
| GET | `/auth/me` | Perfil del usuario autenticado | Sí |
| GET | `/citas` | Listar citas del usuario | Sí |
| POST | `/citas` | Crear cita | Sí |
| PATCH | `/citas/:id` | Actualizar cita | Sí |
| GET | `/patients` | Pacientes del psicólogo | PSYCHOLOGIST |
| GET | `/patients/:id` | Ficha clínica del paciente | PSYCHOLOGIST |
| GET | `/admin/stats` | Estadísticas generales | ADMIN |
| GET | `/admin/users` | Gestión de usuarios | ADMIN |
| GET | `/admin/reports/psychologists` | Reporte de psicólogos | ADMIN |

---

## Variables de entorno para producción

Asegúrate de configurar en producción:

- `NODE_ENV=production`
- `RESEND_DEV_EMAIL` — dejar vacío para que los correos lleguen al destinatario real
- Dominio verificado en Resend para enviar a cualquier correo
- Quitar `@gmail.com` del middleware de autenticación

---

*Desarrollado para la Universidad de La Guajira — Programa de Bienestar Universitario*