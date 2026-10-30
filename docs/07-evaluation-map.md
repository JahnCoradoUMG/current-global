# Current Global — Mapa de evaluación (15 puntos)

Documento de trazabilidad: requisito académico → módulo/artefacto → evidencia para el PDF.

## Matriz

| Criterio | Pts | Módulos / archivos previstos | Evidencia en PDF / demo |
|----------|-----|------------------------------|-------------------------|
| Frontend funcional | 3 | `apps/web` — `/login`, `/register`, `/feed`, `/u/[username]` | Capturas login, feed, perfil; URL Vercel |
| API y lógica backend | 3 | `apps/api` — Auth, Users, Posts, Likes, Comments, Follows, Feed, Chat | Captura Swagger + Postman/flujo FE |
| Tiempo real | 2 | `RealtimeGateway` + cliente Socket.IO | Captura 2 browsers: like live / chat / notif |
| Seguridad y validación | 2 | bcrypt, JWT guards, ValidationPipe, CORS, `.env.example` | Captura hash en BD o explicación + `.env.example` |
| BD y migraciones | 2 | `apps/api/prisma/schema.prisma` + `apps/api/prisma/migrations` | Captura migrate + diagrama ER (`02-data-model`) |
| Despliegue FE + BE | 3 | Vercel + Render | URLs públicas FE, BE, `/api/docs` |

**Total:** 15 — **Penalización:** −3 sin URLs públicas funcionales.

## Épicas Jira ↔ rúbrica

| Épica | Clave plan | Criterios que desbloquea |
|-------|------------|--------------------------|
| E1 Documentación | docs `00`–`08` | Base de todas |
| E2 Foundation | monorepo, Prisma, env, CORS | BD (parcial), seguridad (parcial) |
| E3 Auth y seguridad | Auth module | Seguridad 2 pts |
| E4 API dominio | Posts…Feed | API 3 pts + BD 2 pts |
| E5 Frontend SSR | apps/web vistas | Frontend 3 pts |
| E6 Tiempo real | Socket.IO | Tiempo real 2 pts |
| E7 Swagger | `/api/docs` | Doc API (requisito) |
| E8 Despliegue | Vercel + Render | Despliegue 3 pts |
| E9 Entrega PDF | Canvas | Entrega formal |

## Issues hijas sugeridas (backlog)

### E1
- Redactar system brief, arquitectura, modelo, API, realtime, security, deployment, evaluation map
- README stub + `.env.example`
- Documentar tablero Jira

### E2
- Scaffold monorepo `apps/web` + `apps/api`
- Prisma schema inicial + migrate
- Config CORS + env loading + health endpoint

### E3
- Register / login / me
- bcrypt + JWT strategy + guards

### E4
- Posts CRUD + Cloudinary upload
- Likes toggle, Comments, Follows
- Feed global + following
- Notifications persistidas

### E5
- UI auth, feed SSR, perfil SSR
- Cliente API + estado auth
- Responsive layout

### E6
- Gateway + auth WS
- Events like/comment/notification/chat
- UI hooks sockets

### E7
- Swagger module + DTOs anotados
- Enlace en README

### E8
- Render API+DB
- Vercel web
- Smoke test prod + actualizar URLs

### E9
- PDF con nombre, carné, capturas, enlaces repo/FE/BE/docs

## Definition of Done global del proyecto

- [ ] Los 6 criterios de la rúbrica tienen evidencia
- [ ] FE, BE y Swagger responden en Internet
- [ ] README con URLs y stack
- [ ] Repo GitHub organizado
- [ ] PDF subido a Canvas antes del 31 de octubre
