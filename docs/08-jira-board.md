# Current Global — Tablero Jira

## Identidad del sitio

| Campo | Valor |
|-------|-------|
| Cuenta | `cpuacc3@miumg.edu.gt` |
| Usuario | 2316955 - CESAR JAHN CARLO PUAC CORADO |
| Account ID | `712020:0c100fc1-7ae3-446a-a726-4353ee917dd5` |
| Sitio | [miumg-team-f4691jef.atlassian.net](https://miumg-team-f4691jef.atlassian.net) |
| Cloud ID | `3b68aa54-d9b1-4cc3-b72c-cba69a4d590f` |
| Nombre del espacio | **Current Global - Red Social** |
| Clave | **CGRS** |
| Tipo | Kanban — gestionado por el equipo |
| Producto | **Current Global** |
| Tablero | [Abrir proyecto CGRS](https://miumg-team-f4691jef.atlassian.net/jira/software/projects/CGRS/boards) |
| Browse | [https://miumg-team-f4691jef.atlassian.net/browse/CGRS](https://miumg-team-f4691jef.atlassian.net/browse/CGRS) |

> Espacio exclusivo de Current Global. No mezclar trabajo con `FA`, `GYM` ni `SCRUM`.

## Estado

| Paso | Estado |
|------|--------|
| Auth MCP con cuenta UMG | Hecho |
| Proyecto Kanban CGRS | Hecho |
| Épicas E1–E9 | Hecho (`CGRS-1` … `CGRS-9`) |
| Issues hijas | Hecho (`CGRS-10` …) |
| E1 Documentación | Listo |
| E2 Foundation | Listo (monorepo + Docker Postgres + Prisma + health) |
| E3 Auth y seguridad | Listo (register/login JWT, bcrypt, guards, DTOs) |
| E4 API dominio | Listo (posts, likes, comments, follows, feed, notifs) |
| E5 Frontend SSR | Listo (login/register, feed SSR, perfil SSR) |
| E6 Tiempo real | Listo (Socket.IO JWT, likes/comments/notifs live, chat 1-a-1) |
| E7 Swagger | Listo (`/api/docs`, DTOs anotados, enlace local en README) |

## Épicas

| Key | Resumen | Rúbrica |
|-----|---------|---------|
| [CGRS-1](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-1) | E1 Documentación | Base |
| [CGRS-2](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-2) | E2 Foundation | BD / env |
| [CGRS-3](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-3) | E3 Auth y seguridad | 2 pts |
| [CGRS-4](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-4) | E4 API dominio | 3 pts API + BD |
| [CGRS-5](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-5) | E5 Frontend SSR | 3 pts |
| [CGRS-6](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-6) | E6 Tiempo real | 2 pts |
| [CGRS-7](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-7) | E7 Swagger | Docs API |
| [CGRS-8](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-8) | E8 Despliegue | 3 pts |
| [CGRS-9](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-9) | E9 Entrega PDF | Canvas 31/oct |

## Issues hijas (resumen)

| Epic | Keys | Notas |
|------|------|-------|
| E1 | CGRS-10, CGRS-11, CGRS-12 | Docs |
| E2 | CGRS-13, CGRS-14, CGRS-15 | Ver títulos reales abajo |
| E3 | CGRS-16, CGRS-17, CGRS-18 | Auth — ver títulos abajo |
| E4 | CGRS-19, CGRS-20, CGRS-21 | API dominio — ver títulos abajo |
| E5 | CGRS-22, CGRS-23, CGRS-24 | Frontend — ver títulos abajo |
| E6 | CGRS-25, CGRS-26, CGRS-27 | Realtime — ver títulos abajo |
| E7 | CGRS-28 | Swagger — ver título abajo |
| E8 | CGRS-29, CGRS-30, CGRS-31 | Deploy |
| E9 | CGRS-32 | PDF |

### E2 — títulos reales en Jira

| Key | Resumen |
|-----|---------|
| [CGRS-13](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-13) | Scaffold monorepo Next.js + NestJS |
| [CGRS-14](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-14) | CORS, env loading y GET /api/health |
| [CGRS-15](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-15) | Prisma schema + migración inicial |

**Infra local asociada a E2:** `docker-compose.yml` (PostgreSQL 16) para migrate y pruebas sin Render.

### E3 — títulos reales en Jira

| Key | Resumen |
|-----|---------|
| [CGRS-16](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-16) | Register con bcrypt |
| [CGRS-17](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-17) | Login JWT + /auth/me + guards |
| [CGRS-18](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-18) | ValidationPipe y formato de errores |

Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer).

### E4 — títulos reales en Jira

| Key | Resumen |
|-----|---------|
| [CGRS-19](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-19) | CRUD Posts + Cloudinary |
| [CGRS-21](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-21) | Likes y comentarios |
| [CGRS-20](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-20) | Follows, feed y notificaciones |

También: `UsersModule` (`GET /users/:username`, `PATCH /users/me`, `GET /users/:username/posts`). Emisión Socket.IO diferida a E6.

### E5 — títulos reales en Jira

| Key | Resumen |
|-----|---------|
| [CGRS-22](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-22) | UI auth login y register |
| [CGRS-23](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-23) | Feed SSR |
| [CGRS-24](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-24) | Perfil de usuario SSR |

Rutas FE: `/login`, `/register`, `/feed`, `/u/[username]`. Auth cookie `cg_token` para SSR.

### E6 — títulos reales en Jira

| Key | Resumen |
|-----|---------|
| [CGRS-25](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-25) | Gateway Socket.IO + auth handshake |
| [CGRS-26](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-26) | Eventos live likes / comments / notifs |
| [CGRS-27](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-27) | Chat 1-a-1 en vivo |

API: `RealtimeGateway` (JWT en handshake, rooms `user`/`post`/`conversation`), emits desde likes/comments/notifs, `ChatModule` REST. FE: `SocketProvider`, contadores live en `PostCard`, badge/toast en nav, `/chat`, `/chat/[id]`, `/notifications`.

### E7 — títulos reales en Jira

| Key | Resumen |
|-----|---------|
| [CGRS-28](https://miumg-team-f4691jef.atlassian.net/browse/CGRS-28) | Configurar Swagger NestJS en /api/docs |

UI en `http://localhost:3001/api/docs` (Bearer JWT, DTOs y respuestas). La URL pública de Render queda en E8.

## Orden de trabajo sugerido

1. ~~Cerrar E1–E7~~.
2. E8 Despliegue → E9 PDF.
