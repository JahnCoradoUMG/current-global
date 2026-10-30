# Current Global — Seguridad

## 1. Objetivos (rúbrica: 2 pts)

- Hash de contraseñas (bcrypt)
- Validación de datos de entrada
- CORS configurado
- Manejo de secretos vía variables de entorno (`.env.example` sin datos sensibles)

## 2. Autenticación y contraseñas

| Aspecto | Decisión |
|---------|----------|
| Algoritmo | bcrypt |
| Cost factor | ≥ 10 (`BCRYPT_ROUNDS=12` recomendado) |
| Tokens | JWT HS256, `Authorization: Bearer` |
| Expiración | `JWT_EXPIRES_IN` (ej. `7d`) |
| Almacenamiento FE | Cookie `cg_token` (MVP) para SSR de feed/perfil + llamadas cliente con Bearer |

**Nunca** persistir ni loguear contraseñas en claro.  
**Nunca** devolver `passwordHash` en responses.

## 3. Autorización

- `JwtAuthGuard` en rutas protegidas.
- Ownership checks:
  - Eliminar post → solo `authorId === userId`
  - Chat → solo participantes de la conversación
- Self-follow prohibido.

## 4. Validación

- NestJS `ValidationPipe` global: `whitelist`, `forbidNonWhitelisted`, `transform`.
- DTOs con `class-validator` (`IsEmail`, `MinLength`, `MaxLength`, `Matches` para username).
- Mensajes de error coherentes (ver contratos API).

## 5. CORS

```ts
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
});
```

En producción: `CORS_ORIGIN=https://<proyecto>.vercel.app` (URL real del FE).

Socket.IO: misma política de origin en el gateway.

## 6. Secretos y variables

| Variable | Quién | Sensible |
|----------|-------|----------|
| `DATABASE_URL` | API | Sí |
| `JWT_SECRET` | API | Sí (≥ 32 chars aleatorios) |
| `JWT_EXPIRES_IN` | API | No |
| `BCRYPT_ROUNDS` | API | No |
| `CORS_ORIGIN` | API | No |
| `PORT` | API | No |
| `CLOUDINARY_CLOUD_NAME` | API | Semi |
| `CLOUDINARY_API_KEY` | API | Sí |
| `CLOUDINARY_API_SECRET` | API | Sí |
| `NEXT_PUBLIC_API_URL` | Web | No (público) |
| `NEXT_PUBLIC_WS_URL` | Web | No (público) |

**Política:**
- `.env` en `.gitignore`
- Solo `.env.example` en el repo
- Secretos en Vercel/Render dashboards, nunca en commits ni capturas del PDF

## 7. Uploads

- Solo imágenes (`image/jpeg`, `image/png`, `image/webp`)
- Límite de tamaño (ej. 5 MB)
- Subida a Cloudinary; no servir desde disco del API

## 8. Hardening adicional (recomendado, no bloqueante)

- Helmet en NestJS
- Rate limit en `/auth/login` y `/auth/register`
- HTTPS obligatorio en producción (Vercel/Render lo proveen)

## 9. Checklist de seguridad pre-entrega

- [x] bcrypt verificado (hash en BD distinto al plaintext) — E3 Auth
- [x] JWT requerido en rutas privadas (401 sin token) — `JwtAuthGuard` en `/api/auth/me`
- [x] CORS solo origen del frontend — `CORS_ORIGIN` (E2)
- [x] `.env` no está en git
- [x] `.env.example` completo y sin secretos reales
- [x] Swagger no expone secretos — E7: `/api/docs` sin `passwordHash`, sin `JWT_SECRET` y sin tokens reales
