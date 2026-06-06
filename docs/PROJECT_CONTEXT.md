# PROJECT_CONTEXT - Equilibria

Ultima actualizacion: 2026-06-06

## Descripcion general

Equilibria es una plataforma web para gestion de citas y bienestar psicologico universitario. Permite autenticacion de usuarios, gestion de citas, agenda, notificaciones, administracion de usuarios/reportes y comunicaciones por correo y WhatsApp.

## Arquitectura utilizada

- Aplicacion full-stack TypeScript en un solo repositorio.
- Frontend: React 19, Vite, React Router, Zustand, Tailwind CSS v4, Axios y lucide-react.
- Backend: Express 4 con modulos por dominio, middlewares de autenticacion, roles y validacion.
- Base de datos: PostgreSQL con Prisma 7.
- Runtime local: `tsx server.ts`, con Vite en modo middleware durante desarrollo.
- Runtime produccion: build Vite estatico servido desde Express y bundle backend generado con esbuild.
- Infraestructura: Docker/Docker Compose para PostgreSQL y aplicacion.
- Integraciones: Supabase Auth para OAuth Google institucional, Resend para correos transaccionales, Twilio para avisos WhatsApp y node-cron para scheduler.

## Estructura completa de carpetas y archivos

```text
.
|-- .ai/
|   `-- rules.md
|-- backend/
|   |-- app.ts
|   |-- prisma/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- schemas/
|   |   |-- auth.schema.ts
|   |   `-- cita.schema.ts
|   |-- src/
|   |   |-- lib/
|   |   |   |-- email.ts
|   |   |   |-- emailTemplates.ts
|   |   |   |-- prisma.ts
|   |   |   |-- supabase.ts
|   |   |   `-- twilio.ts
|   |   |-- middlewares/
|   |   |   |-- auth.middleware.ts
|   |   |   |-- role.middleware.ts
|   |   |   `-- validate.middleware.ts
|   |   `-- modules/
|   |       |-- admin/
|   |       |   |-- admin.controller.ts
|   |       |   `-- admin.routes.ts
|   |       |-- auth/
|   |       |   |-- auth.controller.ts
|   |       |   `-- auth.routes.ts
|   |       |-- citas/
|   |       |   |-- citas.controller.ts
|   |       |   |-- citas.routes.ts
|   |       |   |-- reminders.ts
|   |       |   `-- slots.controller.ts
|   |       |-- notifications/
|   |       |   |-- notifications.controller.ts
|   |       |   `-- notifications.routes.ts
|   |       `-- users/
|   |           |-- users.controller.ts
|   |           `-- users.routes.ts
|   `-- utils/
|       `-- jwt.ts
|-- docs/
|   `-- PROJECT_CONTEXT.md
|-- frontend/
|   `-- src/
|       |-- api/
|       |   |-- admin.ts
|       |   |-- axios.ts
|       |   |-- citas.ts
|       |   |-- notifications.ts
|       |   `-- users.ts
|       |-- components/
|       |   |-- ConfirmModal.tsx
|       |   |-- ProtectedRoute.tsx
|       |   |-- Sidebar.tsx
|       |   `-- TopBar.tsx
|       |-- layouts/
|       |   `-- MainLayout.tsx
|       |-- pages/
|       |   |-- Admin.tsx
|       |   |-- Agenda.tsx
|       |   |-- Appointments.tsx
|       |   |-- Dashboard.tsx
|       |   |-- Login.tsx
|       |   |-- AuthCallback.tsx
|       |   |-- Notifications.tsx
|       |   |-- Profile.tsx
|       |   |-- Settings.tsx
|       |   `-- UrgentHelp.tsx
|       |-- store/
|       |   `-- authStore.ts
|       |-- lib/
|       |   `-- supabase.ts
|       |-- App.tsx
|       |-- index.css
|       `-- main.tsx
|-- Dockerfile
|-- README.md
|-- docker-compose.yml
|-- docker-entrypoint.sh
|-- index.html
|-- package-lock.json
|-- package.json
|-- prisma.config.ts
|-- server.ts
|-- slots.sql
|-- tsconfig.json
`-- vite.config.ts
```

## Funcion de cada modulo

- `server.ts`: punto de entrada HTTP. En desarrollo monta Vite como middleware; en produccion sirve `dist/public`.
- `backend/app.ts`: configura Express, CORS, JSON, health check, rutas `/api/*`, scheduler de recordatorios y manejador global de errores.
- `backend/src/modules/auth`: sincronizacion de usuarios autenticados por Supabase y perfil autenticado.
- `backend/src/modules/citas`: gestion de citas, profesionales, proxima cita, disponibilidad, slots y notificaciones transaccionales al agendar, cancelar o reagendar.
- `backend/src/modules/citas/reminders.ts`: scheduler de recordatorios de citas por correo para citas en la ventana de 23 a 25 horas.
- `backend/src/modules/users`: perfil del usuario autenticado y cambio de password.
- `backend/src/modules/notifications`: listado, conteo y marcado de notificaciones.
- `backend/src/modules/admin`: estadisticas, usuarios, citas globales y reportes administrativos. Requiere rol `ADMIN`.
- `backend/src/middlewares`: autenticacion por token Supabase, control de roles y validacion con Zod.
- `backend/src/lib/prisma.ts`: cliente Prisma compartido con conexion PostgreSQL directa.
- `backend/src/lib/supabase.ts`: cliente Supabase de servidor para validar tokens de acceso.
- `backend/src/lib/email.ts`: cliente Resend compartido para enviar correos transaccionales.
- `backend/src/lib/emailTemplates.ts`: plantillas HTML para citas agendadas, canceladas y reagendadas.
- `backend/src/lib/twilio.ts`: integracion Twilio.
- `backend/prisma/schema.prisma`: modelo de datos Prisma.
- `backend/prisma/seed.ts`: datos iniciales/demo.
- `backend/schemas`: esquemas Zod para auth, citas y perfil.
- `frontend/src/api`: clientes Axios por dominio que consumen `/api`.
- `frontend/src/lib/supabase.ts`: cliente Supabase de navegador para iniciar OAuth con Google.
- `frontend/src/store/authStore.ts`: estado de autenticacion persistido con token Supabase.
- `frontend/src/App.tsx`: rutas publicas y protegidas de React Router.
- `frontend/src/layouts/MainLayout.tsx`: layout principal autenticado.
- `frontend/src/components`: UI compartida, navegacion, barra superior, rutas protegidas y modal de confirmacion.
- `frontend/src/pages`: pantallas funcionales de la aplicacion.

## Relacion entre archivos

- `frontend/src/main.tsx` renderiza `App.tsx`.
- `App.tsx` define `/` como login, `/auth/callback` como retorno OAuth y protege `/dashboard`, `/appointments`, `/agenda`, `/profile`, `/notifications`, `/settings`, `/urgent-help` y `/admin` con `ProtectedRoute`.
- `Login.tsx` inicia OAuth Google con Supabase y redirige a `/auth/callback`.
- `AuthCallback.tsx` procesa la sesion Supabase, llama `/api/auth/sync`, guarda usuario/token en `authStore` y redirige al dashboard.
- Los clientes en `frontend/src/api/*.ts` usan `frontend/src/api/axios.ts`, que agrega automaticamente el token persistido desde `localStorage`.
- `backend/app.ts` monta las rutas de cada modulo bajo `/api`.
- Las rutas llaman a sus controladores; los controladores usan Prisma y utilidades compartidas.
- `auth.middleware.ts` valida el token Supabase, verifica dominio permitido y carga el usuario interno desde Prisma.
- `role.middleware.ts` restringe rutas administrativas.
- `validate.middleware.ts` valida payloads con esquemas Zod.
- `schema.prisma` define entidades usadas por controladores, seed y consultas Prisma.
- `citas.controller.ts` envia notificaciones internas, correos Resend y avisos WhatsApp segun el evento de cita.
- `reminders.ts` corre al iniciar y luego cada hora para enviar recordatorios por correo, evitando duplicados en memoria con un `Set`.

## Base de datos y entidades

Base de datos PostgreSQL administrada con Prisma.

Entidades:

- `User` (`users`): usuarios del sistema. Campos principales: `email`, `name`, `password`, `role`, `phone`, `address`, `faculty`, `semester`.
- `Cita` (`citas`): cita entre estudiante y profesional. Campos: `studentId`, `professionalId`, `date`, `type`, `mode`, `location`, `status`, `notes`, `psychNotes`, `studentPhone`.
- `AvailableSlot` (`available_slots`): disponibilidad de profesionales por dia, rango horario y duracion.
- `Notification` (`notifications`): mensajes para usuarios, con tipo, estado de lectura y fecha.

Enums:

- `Role`: `USER`, `ADMIN`, `PSYCHOLOGIST`.
- `CitaStatus`: `PENDIENTE`, `CONFIRMADA`, `CANCELADA`, `COMPLETADA`.
- `NotificationType`: `INFO`, `SUCCESS`, `WARNING`, `ERROR`.

Relaciones:

- Un `User` puede tener muchas citas como estudiante (`StudentCitas`).
- Un `User` puede tener muchas citas como profesional (`ProfCitas`).
- Un `User` puede tener muchas notificaciones.
- Un `User` profesional puede tener muchos slots disponibles.

## APIs y endpoints

Base: `/api`

- `GET /health`: health check publico.

Auth:

- `POST /auth/sync`: sincronizar el usuario autenticado por Supabase con la base de datos local. Requiere `Authorization: Bearer <supabase_access_token>`.
- `GET /auth/me`: obtener usuario autenticado. Requiere auth.

Citas y slots, todos requieren auth:

- `GET /citas/slots/available`: slots disponibles.
- `GET /citas/slots/config`: configuracion de slots.
- `POST /citas/slots/config`: crear slot.
- `DELETE /citas/slots/config/:id`: eliminar slot.
- `GET /citas/professionals`: listar profesionales.
- `GET /citas/next`: obtener proxima cita.
- `GET /citas`: listar citas.
- `POST /citas`: crear cita.
- `PATCH /citas/:id`: actualizar cita.
- `DELETE /citas/:id`: eliminar cita.

Eventos de comunicacion de citas:

- Al crear una cita: notificacion interna al estudiante, correo al estudiante, correo al psicologo y confirmacion WhatsApp al estudiante.
- Al cancelar una cita: correos para estudiante y psicologo; si cancela el psicologo tambien se envia WhatsApp al estudiante; si cancela el estudiante se envia WhatsApp al psicologo.
- Al reagendar una cita: correos para estudiante y psicologo, mas notificacion interna al estudiante.
- Al confirmar una cita por el psicologo: notificacion interna al estudiante.
- Recordatorios: correos a estudiantes con citas `PENDIENTE` o `CONFIRMADA` entre 23 y 25 horas desde la ejecucion del scheduler.

Usuarios, todos requieren auth:

- `GET /users/me`: obtener perfil.
- `PATCH /users/me`: actualizar perfil.
- `PATCH /users/me/password`: cambiar password.

Notificaciones, todos requieren auth:

- `GET /notifications`: listar notificaciones.
- `GET /notifications/unread-count`: conteo no leidas.
- `PATCH /notifications/read-all`: marcar todas como leidas.
- `PATCH /notifications/:id/read`: marcar una como leida.

Admin, todos requieren auth y rol `ADMIN`:

- `GET /admin/stats`: estadisticas.
- `GET /admin/users`: usuarios.
- `GET /admin/citas`: citas globales.
- `GET /admin/reports/cancellations`: reporte de cancelaciones.
- `GET /admin/reports/psychologists`: reporte de psicologos.
- `PATCH /admin/users/:id`: actualizar usuario.
- `DELETE /admin/users/:id`: eliminar usuario.

## Dependencias importantes

- `react`, `react-dom`, `react-router-dom`: frontend SPA.
- `vite`, `@vitejs/plugin-react`: desarrollo/build frontend.
- `tailwindcss`, `@tailwindcss/vite`: estilos.
- `zustand`: estado cliente.
- `axios`: consumo de API.
- `lucide-react`, `motion`: UI e interacciones.
- `express`, `cors`: API HTTP.
- `zod`: validacion de entradas.
- `@supabase/supabase-js`: OAuth Google y validacion de tokens Supabase.
- `resend`: envio de correos transaccionales.
- `jsonwebtoken`, `bcryptjs`: dependencias historicas para autenticacion/password; revisar si siguen siendo necesarias despues de completar la migracion a Supabase.
- `@prisma/client`, `prisma`, `@prisma/adapter-pg`, `pg`: ORM y PostgreSQL.
- `twilio`: mensajes WhatsApp/SMS.
- `node-cron`: tareas programadas.
- `tsx`, `typescript`, `esbuild`: desarrollo y build.

## Scripts relevantes

- `npm run dev`: inicia servidor en desarrollo con HMR.
- `npm run build`: compila frontend y backend.
- `npm run start`: inicia build de produccion.
- `npm run lint`: ejecuta `tsc --noEmit`.
- `npm run db:migrate`: aplica migraciones Prisma.
- `npm run db:generate`: genera cliente Prisma.
- `npm run db:studio`: abre Prisma Studio.
- `npm run db:seed`: carga datos demo.

## Variables de entorno relevantes

- `DIRECT_URL`: cadena de conexion PostgreSQL directa usada por Prisma runtime y configuracion Prisma.
- `DATABASE_URL`: aun aparece en `backend/prisma/seed.ts`; revisar si debe migrarse a `DIRECT_URL` para consistencia.
- `SUPABASE_URL`: URL del proyecto Supabase usada por el backend.
- `SUPABASE_SERVICE_ROLE_KEY`: service role key del backend. No debe exponerse en frontend ni commits.
- `RESEND_API_KEY`: API key de Resend usada por el backend para correos transaccionales.
- `EMAIL_FROM`: remitente verificado en Resend para los correos salientes.
- `RESEND_DEV_EMAIL`: destinatario opcional para redirigir correos en desarrollo.
- `VITE_SUPABASE_URL`: URL del proyecto Supabase expuesta al cliente Vite.
- `VITE_SUPABASE_ANON_KEY`: anon key de Supabase expuesta al cliente Vite.

## Historial resumido de cambios

- 2026-06-04: Se crea este documento de contexto del proyecto.
- 2026-06-04: Se crea `.ai/rules.md` con reglas operativas de trabajo, Git, documentacion y entrega.
- 2026-06-04: Se corrigen errores TypeScript antes de publicar la rama: relaciones Prisma en reportes admin, nombre de estudiante en confirmaciones de cita y configuracion Prisma.
- 2026-06-05: Se migra el flujo de autenticacion a Supabase OAuth con Google institucional, se agrega callback frontend, sincronizacion `/auth/sync`, validacion de tokens Supabase en middleware y variables de entorno Supabase/DIRECT_URL.
- 2026-06-06: Se agrega envio de correos transaccionales con Resend para citas agendadas, canceladas, reagendadas y recordatorios; se documentan plantillas HTML y variables de entorno de email, incluido destinatario de pruebas por entorno.

## Tareas pendientes

- Mantener este archivo actualizado despues de cada cambio funcional, fix o refactor.
- Confirmar y versionar la rama `dev` remota si aun no existe.
- Crear migraciones Prisma versionadas si el esquema cambia.
- Agregar o mantener pruebas automatizadas para endpoints criticos.
- Revisar codificacion de caracteres en documentos existentes si aparecen textos corruptos.
- Revisar dependencias y esquemas de autenticacion legacy (`jsonwebtoken`, `bcryptjs`, `backend/schemas/auth.schema.ts`, `backend/utils/jwt.ts`) despues de completar la migracion a Supabase.
- Alinear `backend/prisma/seed.ts` con `DIRECT_URL` o documentar por que conserva `DATABASE_URL`.
- Verificar el remitente `EMAIL_FROM` en Resend antes de produccion.
- Configurar `RESEND_DEV_EMAIL` en desarrollo si se desea redirigir correos de prueba.
- Documentar variables de entorno requeridas para Supabase, PostgreSQL, Resend y Twilio.
- Completar documentacion de reglas de negocio por rol y estado de cita.
