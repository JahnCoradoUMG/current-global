# Current Global — Mini red social

Proyecto final de **Desarrollo Web** (UMG). Mini red social full-stack con autenticación, feed, interacciones sociales, tiempo real (Socket.IO), API documentada (Swagger) y despliegue público.

## Tecnologías

| Capa | Stack |
|------|--------|
| Frontend | Next.js (App Router, SSR) + TypeScript — Vercel |
| Backend | NestJS + REST + Socket.IO — Render |
| Base de datos | PostgreSQL + Prisma (migraciones) |
| Auth | JWT + bcrypt |
| Media | Cloudinary |
| Docs API | Swagger / OpenAPI (`/api/docs`) |

## Arquitectura

```text
Browser → Next.js (Vercel) → NestJS API + Socket.IO (Render) → PostgreSQL
                                              ↘ Cloudinary
```

Documentación detallada en [`docs/`](docs/):

| Doc | Contenido |
|-----|-----------|
| [00-system-brief.md](docs/00-system-brief.md) | Visión, alcance, rúbrica 15 pts |
| [01-architecture.md](docs/01-architecture.md) | Arquitectura y diagramas |
| [02-data-model.md](docs/02-data-model.md) | Modelo relacional / ER |
| [03-api-contracts.md](docs/03-api-contracts.md) | Contratos REST |
| [04-realtime.md](docs/04-realtime.md) | Eventos Socket.IO |
| [05-security.md](docs/05-security.md) | Seguridad y secretos |
| [06-deployment.md](docs/06-deployment.md) | Plan de despliegue |
| [07-evaluation-map.md](docs/07-evaluation-map.md) | Trazabilidad evaluación |
| [08-jira-board.md](docs/08-jira-board.md) | Tablero Jira del proyecto |

## URLs públicas

> Se completan al finalizar el despliegue (épica E8).

| Recurso | URL |
|---------|-----|
| Frontend | _TBD_ |
| Backend | _TBD_ |
| Documentación API (Swagger) | _TBD_ (épica E8; ruta `/api/docs`) |
| Repositorio GitHub | https://github.com/JahnCoradoUMG/current-global |

## Configuración local

Requisitos: Node.js 20+, Docker Desktop, npm.

1. Clonar el repositorio.
2. Copiar variables de entorno:

```powershell
Copy-Item .env.example apps\api\.env
Copy-Item .env.example apps\web\.env.local
```

   En `apps/web/.env.local` dejar solo las variables `NEXT_PUBLIC_*`.

3. Instalar dependencias (workspaces):

```bash
npm install
```

4. Levantar PostgreSQL con Docker:

```bash
npm run db:up
```

5. Aplicar migraciones Prisma:

```bash
npm run db:migrate
```

   (Opcional) seed de usuarios demo: `npm run db:seed`  
   Credenciales seed: `alice@example.com` / `bob@example.com` — password `Password123!`

6. Arrancar API y frontend (en dos terminales):

```bash
npm run dev:api
npm run dev:web
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api |
| Health | http://localhost:3001/api/health |
| Swagger | http://localhost:3001/api/docs |

En Swagger, **Authorize** usa el `accessToken` de `POST /api/auth/login` o `POST /api/auth/register`. El documento no incluye secretos ni tokens reales.

Variables: [`.env.example`](.env.example) y [`docs/05-security.md`](docs/05-security.md).

## Gestión del trabajo

- **Jira:** [Current Global - Red Social (`CGRS`)](https://miumg-team-f4691jef.atlassian.net/jira/software/projects/CGRS/boards) — cuenta `cpuacc3@miumg.edu.gt`
- Detalle del tablero: [`docs/08-jira-board.md`](docs/08-jira-board.md)

## Licencia

Uso académico — Universidad Mariano Gálvez de Guatemala.
