# Current Global — System Brief

**Producto:** Current Global  
**Tipo:** Mini red social universitaria (MVP de producción)  
**Curso:** Desarrollo Web — Proyecto Final  
**Entrega:** 31 de octubre  
**Cuenta de gestión:** `cpuacc3@miumg.edu.gt`  
**Tablero:** Jira proyecto `Current Global`

---

## 1. Visión

Current Global es una mini red social web que permite a usuarios registrados compartir publicaciones (texto o multimedia), interactuar con likes y comentarios, seguir a otros usuarios, recibir notificaciones en tiempo real y chatear de forma privada. El sistema demuestra dominio de arquitectura cliente-servidor, API REST, base de datos relacional, SSR, WebSockets, seguridad y despliegue cloud público.

## 2. Problema

Las prácticas académicas suelen quedar en demos locales. Current Global resuelve eso con un producto **completo, desplegado y documentado**, alineado a una rúbrica de 15 puntos (frontend, API, tiempo real, seguridad, BD/migraciones y despliegue).

## 3. Propuesta de valor

- Experiencia social mínima pero completa (feed, perfil, interacciones, chat).
- API documentada con Swagger/OpenAPI pública.
- Tiempo real observable (notificaciones, contadores, chat).
- Seguridad básica sólida (bcrypt, JWT, CORS, secretos fuera del repo).
- Despliegue dual: frontend (Vercel) + backend/DB (Render).

## 4. Persona

| Atributo | Descripción |
|----------|-------------|
| Quién | Estudiante / usuario registrado |
| Objetivo | Publicar, interactuar y comunicarse en una red social simple |
| Canales | Navegador web (desktop y móvil responsive) |
| Auth | Email + contraseña → JWT |

## 5. Alcance MVP (IN)

| Capacidad | Detalle |
|-----------|---------|
| Auth | Registro, login, logout; contraseñas con bcrypt; JWT Bearer |
| Publicaciones | Crear, listar, eliminar (autor); texto y/o imagen (Cloudinary) |
| Likes | Toggle like; contador en vivo vía Socket.IO |
| Comentarios | Crear/listar; contador en vivo |
| Follows | Seguir / dejar de seguir |
| Feeds | General (global) y personalizado (siguiendo) |
| Perfil | Vista pública de usuario + sus posts |
| Notificaciones | Like, comment, follow — push en tiempo real |
| Chat | Conversaciones 1-a-1 con mensajes en vivo |
| Docs API | Swagger en `/api/docs` |
| Despliegue | Frontend y backend públicos |

## 6. Fuera de alcance (OUT)

- Stories / reels / videos largos
- Grupos o páginas
- Chat grupal
- Recuperación de contraseña por email (puede quedar como mejora)
- Moderación avanzada / reportes
- App móvil nativa
- GraphQL (se usa REST)
- Multi-tenant / roles admin complejos

## 7. Objetivos de calidad

- **Funcional:** cubre la rúbrica 15/15.
- **Mantenible:** monorepo `apps/web` + `apps/api`, módulos NestJS claros, Prisma.
- **Escalable (MVP):** paginación, índices en BD, rooms Socket.IO por recurso.
- **Seguro:** secretos en env, CORS restringido, validación de DTOs, hash de passwords.
- **Documentado:** `docs/` + Swagger + README con URLs públicas.

## 8. Matriz de evaluación (15 puntos)

| Criterio | Pts | Cómo se cumple en Current Global |
|----------|-----|------------------------|
| Frontend funcional | 3 | Next.js SSR: login/registro, feed, perfil; consume API desplegada; UI responsive |
| API y lógica backend | 3 | NestJS REST: auth, users, posts, likes, comments, follows, feed, chat; validación + errores coherentes |
| Tiempo real | 2 | Socket.IO: notificaciones, contadores likes/comentarios, chat |
| Seguridad y validación | 2 | bcrypt, JWT, CORS, class-validator, `.env.example` sin secretos |
| BD y migraciones | 2 | PostgreSQL + Prisma schema + migraciones reproducibles |
| Despliegue FE + BE | 3 | Vercel + Render; URLs públicas + Swagger |

**Penalización:** −3 si no hay enlaces públicos funcionales de frontend o backend.

## 9. Definition of Done por épica

| Épica | DoD |
|-------|-----|
| E1 Documentación | Docs `00`–`07` + README stub + `.env.example` en repo |
| E2 Foundation | Monorepo corre local; Prisma migrate; CORS y env cargados |
| E3 Auth | Registro/login OK; password hasheado; JWT protege rutas |
| E4 API dominio | CRUD/interacciones; tests manuales vía Swagger/HTTP |
| E5 Frontend SSR | Tres vistas principales operativas y responsive |
| E6 Tiempo real | Al menos notifs + contadores + chat demostrables en 2 clientes |
| E7 Swagger | `/api/docs` público y documentado en README |
| E8 Despliegue | FE, BE y docs accesibles por URL/IP pública |
| E9 PDF | PDF académico con capturas + enlaces vivos en Canvas |

## 10. Stack cerrado

| Capa | Tecnología | Host |
|------|------------|------|
| Frontend | Next.js (App Router, SSR) + TypeScript | Vercel |
| Backend | NestJS + REST + Socket.IO | Render |
| BD | PostgreSQL + Prisma | Render Postgres |
| Auth | JWT + bcrypt | — |
| Media | Cloudinary | Cloudinary |
| Docs API | `@nestjs/swagger` → `/api/docs` | Backend |

## 11. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Fecha 31 oct | Priorizar rúbrica; chat 1-a-1 mínimo viable |
| CORS / cookies cross-origin | JWT en header + `CORS_ORIGIN` explícito |
| Media en VPS | Cloudinary, no disco local |
| Socket.IO en Render | Mismo origen API; `NEXT_PUBLIC_WS_URL` |
| Penalización despliegue | Checklist en `06-deployment.md` antes de PDF |

## 12. Referencias internas

- Arquitectura → [`01-architecture.md`](01-architecture.md)
- Modelo de datos → [`02-data-model.md`](02-data-model.md)
- Contratos API → [`03-api-contracts.md`](03-api-contracts.md)
- Tiempo real → [`04-realtime.md`](04-realtime.md)
- Seguridad → [`05-security.md`](05-security.md)
- Despliegue → [`06-deployment.md`](06-deployment.md)
- Mapa de evaluación → [`07-evaluation-map.md`](07-evaluation-map.md)
- Jira → [`08-jira-board.md`](08-jira-board.md)
