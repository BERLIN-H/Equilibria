# PROJECT_CONTEXT - Equilibria

Ultima actualizacion: 2026-06-07

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
- Integraciones: Supabase Auth para OAuth Google institucional, Resend para correos transaccionales, Google Calendar para eventos de citas, Twilio para avisos WhatsApp y node-cron para scheduler.

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
|   |   `-- cita.schema.ts
|   |-- src/
|   |   |-- lib/
|   |   |   |-- email.ts
|   |   |   |-- emailTemplates.ts
|   |   |   |-- googleCalendar.ts
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
|   |       |-- patients/
|   |       |   |-- patients.controller.ts
|   |       |   `-- patients.routes.ts
|   |       `-- users/
|   |           |-- users.controller.ts
|   |           `-- users.routes.ts
|-- docs/
|   `-- PROJECT_CONTEXT.md
|-- frontend/
|   `-- src/
|       |-- api/
|       |   |-- admin.ts
|       |   |-- axios.ts
|       |   |-- citas.ts
|       |   |-- notifications.ts
|       |   |-- patients.ts
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
|       |   |-- NotFound.tsx
|       |   |-- Notifications.tsx
|       |   |-- Patients.tsx
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
|-- tsconfig.json
`-- vite.config.ts
```

## Historial resumido de cambios

**Actualizacion 2026-06-07 (Lote 3 - Panel Admin Ampliado):**
- Bloque A: Panel Admin refactorizado con 7 pestañas (Dashboard, Pacientes, Citas, Psicólogos, Horarios, Reportes, Configuración).
- Bloque A: Nuevos endpoints admin: togglePsychologist, getCitasByUser, getPeakHoursReport, getTopPsychologists, getAttendanceReport, sendManualNotification, broadcastNotification, getActivityLogs.
- Bloque A: Modelo ActivityLog para auditoría de actividades del administrador.
- Bloque A: Campo active Boolean en modelo User para gestión de psicólogos activos/inactivos.
- Bloque B: Reportes ampliados con horas pico, top psicólogos con tendencia mensual, tasa de asistencia global y mensual.
- Bloque C: Notificaciones manual y masiva desde panel admin; registro de actividad con paginación.
- Fix Twilio: studentPhone se lee desde cita, no desde usuario en citas.controller.ts.
- UI Mobile: Sidebar con Agenda y Ayuda Urgente ocultos por rol.
- UI Mobile: MainLayout con barra móvil plana, píldora animada e ítems por rol.
- UI Mobile: TopBar con menú desplegable en avatar.
- Docker: Eliminada dependencia de docker-entrypoint.sh, comando directo en CMD.

**Actualizacion 2026-06-06 (Lote 2):**
- Agregado `frontend/src/pages/NotFound.tsx`: Página 404 con diseño consistente y animaciones.
- Actualizado `frontend/src/App.tsx`: Reemplazar fallback de Navigate con componente NotFound.
- Refactor `frontend/src/pages/Admin.tsx`: Mejoras en UI/UX y gestión de datos.
- Refactor `frontend/src/pages/Dashboard.tsx`: Optimización de rendimiento y layout mejorado.
- Actualizado `backend/src/modules/admin/admin.controller.ts`: Mejoras en lógica de estadísticas.
- Actualizado `package.json`: Nuevas dependencias para animaciones (motion).

**Actualizacion 2026-06-06 (Lote 1):**
- Removido `backend/schemas/auth.schema.ts`: validaciones trasladadas a middleware.
- Removido `backend/utils/jwt.ts`: JWT delegado a Supabase Auth.
- Removido `slots.sql`: carga de horarios automatizada.
- Actualizado Docker para arquitectura full-stack containerizada.
- Mejorado Sidebar para mostrar opciones segun roles (Pacientes solo para PSYCHOLOGIST).
- Refactor Dashboard para mejor UX y legibilidad.
- Agregado `.env.example` como plantilla de configuracion.
- Normalizado docker-entrypoint.sh para manejo consistente de volúmenes y permisos.

## Tareas pendientes

- [ ] Pruebas E2E con Playwright para flujos autenticacion OAuth, citas y panel admin.
- [ ] Migracion a Prisma 8 cuando sea disponible.
- [ ] Implementar Circuit Breaker para llamadas a servicios externos (Resend, Google Calendar, Twilio).
- [ ] Agregar logging estructurado con pino.
- [ ] Graficos interactivos en panel admin (Chart.js o similares).
- [ ] Soporte para reasignacion de psicologos en citas existentes.
- [ ] Integracion de pagos para servicios premium.
- [ ] API documentation con Swagger/OpenAPI.
- [ ] Exportar reportes a PDF desde panel admin.
- [ ] Sistema de backups automatizado para base de datos.

## Funcion de cada modulo

- `server.ts`: punto de entrada HTTP. En desarrollo monta Vite como middleware; en produccion sirve `dist/public`.
- `backend/app.ts`: configura Express, CORS, JSON, health check, rutas `/api/*`, scheduler de recordatorios y manejador global de errores.
- `backend/src/modules/auth`: sincronizacion de usuarios autenticados por Supabase y perfil autenticado.
- `backend/src/modules/citas`: gestion de citas, profesionales, proxima cita, disponibilidad, slots, notificaciones transaccionales y sincronizacion con Google Calendar al agendar, cancelar o reagendar.
- `backend/src/modules/citas/reminders.ts`: scheduler de recordatorios de citas por correo para citas en la ventana de 23 a 25 horas.
- `backend/src/modules/patients`: listado e historial de pacientes atendidos por un psicologo. Requiere rol `PSYCHOLOGIST`.
- `backend/src/modules/users`: perfil del usuario autenticado y cambio de password.
- `backend/src/modules/notifications`: listado, conteo y marcado de notificaciones.
- `backend/src/modules/admin`: estadisticas ampliadas, usuarios, citas globales, reportes detallados, auditoría de actividades, gestión de psicólogos, notificaciones manual/masiva. Requiere rol `ADMIN`. Panel con 7 pestañas funcionales.
- `backend/src/middlewares`: autenticacion por token Supabase, control de roles y validacion con Zod.
- `backend/src/lib/prisma.ts`: cliente Prisma compartido con conexion PostgreSQL directa.
- `backend/src/lib/supabase.ts`: cliente Supabase de servidor para validar tokens de acceso.
- `backend/src/lib/email.ts`: cliente Resend compartido para enviar correos transaccionales.
- `backend/src/lib/emailTemplates.ts`: plantillas HTML para citas agendadas, canceladas y reagendadas.
- `backend/src/lib/googleCalendar.ts`: cliente Google Calendar con service account para crear, actualizar y eliminar eventos de citas.
- `backend/src/lib/twilio.ts`: integracion Twilio.
- `backend/prisma/schema.prisma`: modelo de datos Prisma.
- `backend/prisma/seed.ts`: datos iniciales/demo.
- `backend/schemas`: esquemas Zod para auth, citas y perfil.
- `frontend/src/api`: clientes Axios por dominio que consumen `/api`.
- `frontend/src/api/patients.ts`: cliente para pacientes y actualizacion de notas clinicas.
- `frontend/src/lib/supabase.ts`: cliente Supabase de navegador para iniciar OAuth con Google.
- `frontend/src/store/authStore.ts`: estado de autenticacion persistido con token Supabase.
- `frontend/src/App.tsx`: rutas publicas y protegidas de React Router, con componente NotFound para rutas inexistentes.
- `frontend/src/layouts/MainLayout.tsx`: layout principal autenticado.
- `frontend/src/components`: UI compartida, navegacion, barra superior, rutas protegidas y modal de confirmacion.
- `frontend/src/pages`: pantallas funcionales de la aplicacion.
  - `NotFound.tsx`: Página 404 con diseño consistente (nuevo en 2026-06-06).
  - `Admin.tsx`: Dashboard administrativo con estadísticas y gestión de usuarios.
  - `Dashboard.tsx`: Panel de inicio con información personalizada del usuario.
- `frontend/src/pages/Patients.tsx`: vista de pacientes para psicologos, con busqueda, ficha del estudiante, historial y edicion de notas clinicas.

## Relacion entre archivos

- `frontend/src/main.tsx` renderiza `App.tsx`.
- `App.tsx` define `/` como login, `/auth/callback` como retorno OAuth y protege `/dashboard`, `/appointments`, `/agenda`, `/patients`, `/profile`, `/notifications`, `/settings`, `/urgent-help` y `/admin` con `ProtectedRoute`.
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
- `citas.controller.ts` guarda `googleEventId` cuando crea un evento en Google Calendar, elimina el evento si la cita se cancela y lo actualiza si se reagenda.
- `reminders.ts` corre al iniciar y luego cada hora para enviar recordatorios por correo, evitando duplicados en memoria con un `Set`.
- `patients.routes.ts` expone `/api/patients` protegido por `authMiddleware`; el controlador valida que el usuario sea `PSYCHOLOGIST`.
- `Sidebar.tsx` muestra la opcion `Pacientes` solo para usuarios con rol `PSYCHOLOGIST`.

## Base de datos y entidades

Base de datos PostgreSQL administrada con Prisma.

Entidades:

- `User` (`users`): usuarios del sistema. Campos principales: `email`, `name`, `password`, `role`, `phone`, `address`, `faculty`, `semester`, `active` (Boolean, default true).
- `ActivityLog` (`activity_logs`): registro de auditoría de actividades del administrador. Campos: `adminId`, `action`, `description`, `metadata`, `createdAt`.
- `Cita` (`citas`): cita entre estudiante y profesional. Campos: `studentId`, `professionalId`, `date`, `type`, `mode`, `location`, `status`, `notes`, `psychNotes`, `studentPhone`, `googleEventId`.
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

Pacientes, todos requieren auth y rol `PSYCHOLOGIST`:

- `GET /patients`: listar estudiantes atendidos por el psicologo autenticado, deduplicados por estudiante, con total de sesiones, ultima cita y estado.
- `GET /patients/:id`: obtener ficha del estudiante e historial de citas con ese psicologo.

Eventos de comunicacion de citas:

- Al crear una cita: notificacion interna al estudiante, correo al estudiante, correo al psicologo y confirmacion WhatsApp al estudiante.
- Al crear una cita: tambien se crea un evento en Google Calendar y se guarda su `googleEventId`.
- Al cancelar una cita: correos para estudiante y psicologo; si cancela el psicologo tambien se envia WhatsApp al estudiante; si cancela el estudiante se envia WhatsApp al psicologo; si existe `googleEventId`, se elimina el evento.
- Al reagendar una cita: correos para estudiante y psicologo, mas notificacion interna al estudiante; si existe `googleEventId`, se actualiza el evento.
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

**Estadísticas y Usuarios:**
- `GET /admin/stats`: estadísticas ampliadas (total usuarios, psicólogos disponibles, nuevos usuarios, citas por estado).
- `GET /admin/users`: listar usuarios del sistema.
- `PATCH /admin/users/:id`: actualizar usuario.
- `DELETE /admin/users/:id`: eliminar usuario.
- `PATCH /admin/users/:id/toggle-psychologist`: activar/desactivar psicólogo.

**Citas y Reportes:**
- `GET /admin/citas`: citas globales con filtros.
- `GET /admin/citas/:userId`: citas de usuario específico.
- `GET /admin/reports/peak-hours`: horas más solicitadas.
- `GET /admin/reports/top-psychologists`: top psicólogos con tendencia.
- `GET /admin/reports/attendance`: tasa de asistencia global y mensual.
- `GET /admin/reports/cancellations`: reporte de cancelaciones.
- `GET /admin/reports/psychologists`: desempeño de psicólogos.

**Notificaciones y Auditoría:**
- `POST /admin/notifications/send-manual`: notificación manual a usuario.
- `POST /admin/notifications/broadcast`: notificación masiva.
- `GET /admin/activity-logs`: registros de auditoría (paginado).

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
- `googleapis`: integracion con Google Calendar.
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
- 2026-06-04: `feat: initial project structure` - Estructura inicial con modules de auth, citas, users, notifications.
- 2026-06-04: `feat: migrar autenticacion a supabase` - OAuth Google institucional con Supabase Auth; validacion de tokens Supabase en backend.
- 2026-06-04: `feat: agregar correos transaccionales` - Integracion con Resend; plantillas HTML para eventos de citas.
- 2026-06-05: Se agrega integracion Google Calendar: crear, actualizar y eliminar eventos al agendar/cancelar/reagendar citas.
- 2026-06-05: Se agrega modulo `patients`: listado de estudiantes atendidos por psicologos, ficha con historial, edicion de notas clinicas.
- 2026-06-05: Se agrega cliente Twilio para notificaciones WhatsApp en eventos de citas.

## Tareas pendientes

- [ ] Verificar dominio en Resend para producción (`uniguajira.edu.co`)
- [ ] Quitar `@gmail.com` del middleware cuando haya cuentas institucionales reales
- [ ] Revisar y eliminar dependencias legacy: `jsonwebtoken`, `bcryptjs`, `jwt.ts`, `auth.schema.ts`
- [ ] Crear migraciones Prisma versionadas si el esquema cambia
- [ ] Documentar manual de deployment a producción (Docker, CI/CD, secrets)
- [ ] Agregar pruebas automatizadas para endpoints críticos
- [ ] Alinear `seed.ts` con `DIRECT_URL`

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
