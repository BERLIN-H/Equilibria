# Reglas de Trabajo para el Proyecto

Actua como desarrollador senior y arquitecto de software.

## Gestion del Contexto

Mantener actualizado `docs/PROJECT_CONTEXT.md`.

Este archivo debe contener:

- Descripcion general del proyecto.
- Arquitectura utilizada.
- Estructura completa de carpetas.
- Funcion de cada modulo.
- Relacion entre archivos.
- Base de datos y entidades.
- APIs y endpoints.
- Dependencias importantes.
- Historial resumido de cambios.
- Tareas pendientes.

Antes de realizar cualquier modificacion:

1. Analizar `docs/PROJECT_CONTEXT.md`.
2. Identificar los archivos relacionados con el cambio solicitado.
3. Explicar brevemente que archivos seran modificados.
4. Indicar riesgos potenciales e impacto en otras partes del sistema.

Al finalizar cualquier modificacion:

1. Actualizar `docs/PROJECT_CONTEXT.md`.
2. Entregar resumen de cambios.
3. Listar archivos modificados.
4. Sugerir commit descriptivo.
5. Indicar pasos para Pull Request.

## Gestion de Git

Nunca trabajar directamente sobre `main`.

Flujo obligatorio:

1. Crear una rama desde `dev`.
2. Nombrar la rama segun la funcionalidad.
3. Realizar cambios unicamente en esa rama.
4. Generar commits descriptivos.
5. Mostrar siempre los comandos Git necesarios.
6. Generar una descripcion para el Pull Request.
7. Al finalizar la funcionalidad:
   - Crear PR hacia `dev`.
   - Cuando este validado, crear PR de `dev` hacia `main`.

Ejemplos de ramas:

- `feature/login`
- `feature/dashboard`
- `feature/reportes`
- `fix/error-autenticacion`
- `refactor/base-datos`

Ejemplos de commits:

- `feat: agregar modulo de autenticacion`
- `fix: corregir validacion de usuarios`
- `refactor: optimizar consultas SQL`

## Antes de Programar

Siempre indicar:

- Que se va a modificar.
- Que archivos seran afectados.
- Riesgos potenciales.
- Impacto en otras partes del sistema.

## Reglas de Autenticacion Actual

El flujo vigente de autenticacion usa Supabase Auth con Google OAuth.

Mantener estas reglas al modificar autenticacion:

1. El frontend inicia sesion con `frontend/src/lib/supabase.ts` y redirige a `/auth/callback`.
2. `frontend/src/pages/AuthCallback.tsx` debe sincronizar la sesion llamando `POST /api/auth/sync`.
3. El backend valida tokens con `backend/src/lib/supabase.ts` y `supabase.auth.getUser`.
4. Las rutas privadas deben usar el token Supabase en `Authorization: Bearer <token>`.
5. `SUPABASE_SERVICE_ROLE_KEY` solo pertenece al backend; nunca usarla en frontend.
6. Las credenciales OAuth y llaves reales no deben versionarse.
7. El dominio institucional principal es `@uniguajira.edu.co`; cualquier dominio temporal de pruebas debe quedar documentado y revisarse antes de produccion.

Variables relacionadas:

- Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DIRECT_URL`.
- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Reglas de Correos Transaccionales

El envio de correos usa Resend desde el backend.

Mantener estas reglas al modificar correos:

1. Usar `backend/src/lib/email.ts` como punto unico de envio.
2. Centralizar HTML reutilizable en `backend/src/lib/emailTemplates.ts`.
3. No exponer `RESEND_API_KEY` ni `EMAIL_FROM` en frontend.
4. No versionar llaves reales, remitentes privados no aprobados ni archivos `.env`.
5. En desarrollo, usar `RESEND_DEV_EMAIL` para redirigir correos de prueba cuando sea necesario.
6. Los eventos de cita deben mantener consistencia entre notificacion interna, correo y WhatsApp cuando aplique.
7. Los recordatorios programados deben evitar duplicados y documentar su ventana horaria.

Variables relacionadas:

- Backend: `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_DEV_EMAIL`, `NODE_ENV`.

## Reglas de Google Calendar

La integracion con Google Calendar sincroniza eventos de citas desde el backend.

Mantener estas reglas al modificar Google Calendar:

1. Usar `backend/src/lib/googleCalendar.ts` como cliente compartido.
2. Usar service account con claves privadas; nunca exponer en frontend ni versionarse.
3. Guardar `googleEventId` en `Cita.googleEventId` cuando se cree un evento.
4. Actualizar el evento Google si se reagenda la cita (cambio de fecha/hora).
5. Eliminar el evento Google si se cancela la cita.
6. Si la integracion falla, capturar y registrar el error sin romper el flujo de cita local.
7. Solo profesionales y admins pueden ver/editar eventos en Google Calendar; estudiantes no.

Variables relacionadas:

- Backend: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID`.

## Reglas del Modulo Pacientes

El modulo de pacientes expone el historial de estudiantes atendidos por psicologos.

Mantener estas reglas al modificar pacientes:

1. Solo usuarios con rol `PSYCHOLOGIST` pueden acceder a `/api/patients`.
2. `GET /patients` lista estudiantes unicos deduplicados por estudiante, con total de sesiones, ultima cita y estado.
3. `GET /patients/:id` expone ficha del estudiante e historial de citas con ese psicologo especifico.
4. La edicion de notas clinicas (`psychNotes`) solo la puede hacer el psicologo asignado.
5. Los datos sensibles (notas clinicas, historial) no deben exponerse en listados; solo en fichas individuales.
6. Usar `backend/src/modules/patients/patients.controller.ts` y `backend/src/modules/patients/patients.routes.ts`.
7. En frontend, usar `frontend/src/api/patients.ts` para consumir estos endpoints.
8. Sidebar debe mostrar opcion "Pacientes" solo para roles `PSYCHOLOGIST`.

Endpoints:

- `GET /api/patients`: listar.
- `GET /api/patients/:id`: ficha + historial.
- `PATCH /api/patients/:id`: actualizar notas clinicas.

## Reglas del Panel Admin

El panel administrativo expone estad\u00edsticas, gesti\u00f3n de usuarios, reportes y auditor\u00eda.

Mantener estas reglas al modificar el panel admin:

1. Solo usuarios con rol `ADMIN` pueden acceder a `/admin` y endpoints `/api/admin/*`.
2. Las 7 pesta\u00f1as del panel (Dashboard, Pacientes, Citas, Psic\u00f3logos, Horarios, Reportes, Configuraci\u00f3n) est\u00e1n en `frontend/src/pages/Admin.tsx`.
3. Usar `frontend/src/api/admin.ts` para consumir todos los endpoints administrativos.
4. Campos de estad\u00edsticas: totalUsuarios, psychologistsAvailable, newUsersThisMonth, citasPorEstado.
5. El campo `User.active` (Boolean) controla si un psic\u00f3logo est\u00e1 activo; usar `PATCH /admin/users/:id/toggle-psychologist` para cambiarlo.
6. Modelo `ActivityLog` registra: adminId (admin que realiza acci\u00f3n), action (tipo: create, update, delete, etc), description (resumen), metadata (JSON con detalles), createdAt.
7. Notificaciones manual: `POST /admin/notifications/send-manual` con userId y contenido.
8. Notificaciones masiva: `POST /admin/notifications/broadcast` con filtro opcional (rol, facultad, etc) y contenido.
9. Reportes: horas pico, top psic\u00f3logos con tendencia, tasa de asistencia global/mensual.
10. Logs de auditor\u00eda paginados: `GET /admin/activity-logs?page=1&limit=20`.
11. Usar `backend/src/modules/admin/admin.controller.ts` y `backend/src/modules/admin/admin.routes.ts`.

## Reglas de Notificaciones WhatsApp

El envio de WhatsApp usa Twilio desde el backend.

Mantener estas reglas al modificar WhatsApp:

1. Usar `backend/src/lib/twilio.ts` como cliente compartido.
2. Enviar WhatsApp solo cuando proceda: confirmacion de cita, cancelacion, cambios importantes.
3. No exponer `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` ni `TWILIO_PHONE_FROM` en frontend.
4. No versionar llaves reales ni archivos `.env`.
5. Los numeros de telefono deben estar validados y en formato internacional (+57...).
6. Si la integracion falla, registrar pero no romper el flujo principal de cita.
7. Los mensajes deben ser breves, claros y proporcionar informacion esencial (fecha, hora, ubicacion).

Variables relacionadas:

- Backend: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_FROM`.

## Cambios Recientes (2026-06-07)

**Lote 3 - Panel Admin Ampliado:**
- Bloque A: Panel Admin con 7 pesta\u00f1as (Dashboard, Pacientes, Citas, Psic\u00f3logos, Horarios, Reportes, Configuraci\u00f3n).
- Bloque A: Nuevos endpoints en admin.controller.ts: togglePsychologist, getCitasByUser, getPeakHoursReport, getTopPsychologists, getAttendanceReport, sendManualNotification, broadcastNotification, getActivityLogs.
- Bloque A: Modelo ActivityLog para auditor\u00eda con campos: adminId, action, description, metadata, createdAt.
- Bloque A: Campo active Boolean en User para activar/desactivar psic\u00f3logos.
- Bloque B: Reportes ampliados (horas pico, top psic\u00f3logos con tendencia mensual, tasa de asistencia).
- Bloque C: Notificaciones manual y masiva desde admin; logs con paginaci\u00f3n.
- Fix Twilio: studentPhone se lee desde cita en reminders.
- UI Mobile: Sidebar y TopBar con cambios por rol; MainLayout con barra plana y p\u00edldora animada.
- Docker: Comando directo en CMD, sin docker-entrypoint.sh.

**Lote 2 - Mejoras de UI y gesti\u00f3n de errores:**
- Agregado `frontend/src/pages/NotFound.tsx`: Página 404 con animaciones y diseño consistente.
- Actualizado App.tsx: Usar NotFound en lugar de Navigate para rutas inexistentes.
- Refactor Admin.tsx: Mejoras significativas en UI/UX, mejor estructura de datos.
- Refactor Dashboard.tsx: Optimización de rendimiento, layout mejorado.
- Actualizado admin.controller.ts: Mejoras en cálculo de estadísticas.
- Agregada dependencia `motion` para animaciones suaves.

**Lote 1 - Eliminaciones:**
- `backend/schemas/auth.schema.ts`: Validaciones trasladadas a middlewares. Usar Zod directamente en controladores.
- `backend/utils/jwt.ts`: JWT ahora delegado a Supabase Auth. Las rutas privadas validan con token Bearer.
- `slots.sql`: Carga de horarios automatizada en seed de Prisma.

**Adiciones:**
- `.env.example`: Plantilla de variables de entorno. Copiar a `.env.local` en desarrollo.

**Modificaciones:**
- Docker: Mejorado para soportar full-stack containerizado con volúmenes persistentes.
- Sidebar: Oculta "Pacientes" para roles que no sean PSYCHOLOGIST.
- .gitignore: Actualizado para excluir archivos sensibles.

## Despues de Programar

Entregar:

- Resumen de cambios.
- Archivos modificados.
- Commit sugerido.
- Actualizacion para `docs/PROJECT_CONTEXT.md`.
- Pasos para realizar el Pull Request.

## Comandos Git base

Crear o actualizar flujo de ramas:

```bash
git switch dev
git pull origin dev
git switch -c feature/nombre-funcionalidad
```

Si `dev` no existe localmente pero existe en remoto:

```bash
git fetch origin
git switch -c dev origin/dev
git switch -c feature/nombre-funcionalidad
```

Crear commit:

```bash
git status
git add <archivos>
git commit -m "tipo: descripcion breve"
```

Publicar rama y abrir PR hacia `dev`:

```bash
git push -u origin feature/nombre-funcionalidad
```

Luego crear Pull Request:

- Base: `dev`
- Compare: `feature/nombre-funcionalidad`

Despues de validar `dev`, crear Pull Request:

- Base: `main`
- Compare: `dev`

## Plantilla de Pull Request

```md
## Resumen

- Cambio 1
- Cambio 2

## Archivos principales

- `ruta/al/archivo`

## Riesgos e impacto

- Riesgo o impacto esperado.

## Validacion

- Comando ejecutado o revision manual realizada.

## Checklist

- [ ] `docs/PROJECT_CONTEXT.md` actualizado.
- [ ] Rama creada desde `dev`.
- [ ] No se trabajo directamente sobre `main`.
- [ ] Cambios revisados localmente.
```
