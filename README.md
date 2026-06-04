# Equilibria — Centro de Apoyo Psicológico

Plataforma web para gestión de citas y bienestar psicológico universitario.

**Stack:** React 19 · TypeScript · Vite · Tailwind v4 · Express · Prisma 7 · PostgreSQL · Docker

---

## Levantar el proyecto (5 pasos)

### 1. Clonar y preparar el entorno
```bash
git clone <repo-url>
cd equilibria
cp .env.example .env
```

Edita `.env` y cambia al menos `JWT_SECRET` por un string seguro:
```bash
# Generar un secreto seguro:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Levantar con Docker (producción)
```bash
docker compose up -d --build
```

Esto levanta PostgreSQL + la app automáticamente.
Las migraciones se ejecutan solas al arrancar.

### 3. Cargar datos de prueba (primera vez)
```bash
docker compose exec app npm run db:seed
```

### 4. Acceder
- **App:** http://localhost:3000
- **API Health:** http://localhost:3000/api/health

### 5. Usuarios de demo
| Rol           | Email                           | Contraseña       |
|---------------|---------------------------------|------------------|
| Admin         | admin@equilibria.edu            | Admin2026!       |
| Psicólogo     | dra.rodriguez@equilibria.edu    | Psico2026!       |
| Estudiante    | mariana@estudiante.edu          | Estudiante2026!  |

---

## Desarrollo local (sin Docker)

```bash
npm install
npm run db:generate          # genera el cliente Prisma
npm run db:migrate           # aplica migraciones
npm run dev                  # inicia en localhost:3000 con HMR
```

Necesitas PostgreSQL corriendo localmente o puedes usar solo el contenedor de la BD:
```bash
docker compose up postgres -d
```

---

## Scripts disponibles

| Comando              | Descripción                                |
|----------------------|--------------------------------------------|
| `npm run dev`        | Modo desarrollo con HMR                    |
| `npm run build`      | Build de producción                        |
| `npm run start`      | Inicia el build de producción              |
| `npm run db:migrate` | Crea y aplica una nueva migración          |
| `npm run db:generate`| Regenera el cliente Prisma                 |
| `npm run db:studio`  | Abre Prisma Studio en localhost:5555       |
| `npm run db:seed`    | Carga usuarios de demo                     |

---

## API Endpoints

| Método | Ruta                | Descripción           | Auth |
|--------|---------------------|-----------------------|------|
| GET    | /api/health         | Health check          | No   |
| POST   | /api/auth/login     | Iniciar sesión        | No   |
| POST   | /api/auth/register  | Registrar usuario     | No   |
| GET    | /api/auth/me        | Perfil del usuario    | Sí   |
