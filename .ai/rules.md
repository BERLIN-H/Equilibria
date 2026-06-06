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
