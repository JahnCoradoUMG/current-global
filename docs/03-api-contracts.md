# Current Global — Contratos API (REST)

**Base URL (prod):** `https://<API_HOST>/api`  
**Auth:** `Authorization: Bearer <accessToken>`  
**Docs vivos:** `GET /api/docs` (Swagger UI)  
**Content-Type:** `application/json` (excepto upload multipart)

## 1. Convenciones

### Éxito
- `200` OK, `201` Created, `204` No Content

### Error uniforme
```json
{
  "statusCode": 400,
  "message": "Validation failed / detalle",
  "error": "Bad Request"
}
```

| Código | Uso |
|--------|-----|
| 400 | Validación / regla de negocio |
| 401 | Sin token o token inválido |
| 403 | Autenticado pero sin permiso |
| 404 | Recurso no encontrado |
| 409 | Conflicto (email/username duplicado) |

### Paginación
Query: `page` (default 1), `limit` (default 20, max 50).  
Respuesta:
```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

---

## 2. Auth — `/api/auth`

### `POST /api/auth/register` (público)
**Body:**
```json
{
  "email": "user@example.com",
  "username": "cesar",
  "password": "Secret123!",
  "displayName": "Cesar Puac"
}
```
**201:** `{ "user": { "id", "email", "username", "displayName", "avatarUrl" }, "accessToken": "..." }`

### `POST /api/auth/login` (público)
**Body:** `{ "email": "...", "password": "..." }`  
**200:** mismo shape que register.

### `GET /api/auth/me` (protegido)
**200:** usuario actual (sin passwordHash).

---

## 3. Users — `/api/users`

### `GET /api/users/search?q&limit` (protegido)
Busca por `username` o `displayName`, sin distinguir mayúsculas. La ruta estática va antes de `/:username`.

Query: `q` (mínimo 2 caracteres), `limit` (default 8, máximo 20).

**200:**
```json
{
  "data": [
    {
      "id": "...",
      "username": "cesar",
      "displayName": "Cesar Puac",
      "avatarUrl": null
    }
  ]
}
```

No incluye `email`. **400** si `q` tiene menos de 2 caracteres.

### `GET /api/users/:username` (protegido o público según decisión MVP: protegido)
Perfil + contadores: `postsCount`, `followersCount`, `followingCount`, `isFollowing`.

### `GET /api/users/:username/posts?page&limit` (protegido)
Lista paginada de posts del usuario (mismo shape que ítems de feed).

### `PATCH /api/users/me` (protegido)
**Body parcial:** `{ "displayName?", "bio?", "avatarUrl?" }`

---

## 4. Posts — `/api/posts`

### `POST /api/posts` (protegido)
- JSON: `{ "content": "Hola Current Global" }`
- o `multipart/form-data`: `content`, `file` (imagen)

**201:** post con author embebido.

### `GET /api/posts/:id` (protegido)
Detalle + `likesCount`, `commentsCount`, `likedByMe`.

### `DELETE /api/posts/:id` (protegido, solo autor)
**204**

---

## 5. Likes — anidados en posts

### `POST /api/posts/:id/like` (protegido)
Toggle. **200:** `{ "liked": true, "likesCount": 12 }`  
Emite WS `post:like:updated` a la room `post:{id}` (y `notification:new` al autor si aplica).

### `DELETE /api/posts/:id/like` (protegido) — opcional si toggle unificado en POST
Si se usa solo toggle en POST, este endpoint puede omitirse.

---

## 6. Comments — `/api/posts/:id/comments`

### `GET /api/posts/:id/comments?page&limit`
Lista paginada.

### `POST /api/posts/:id/comments` (protegido)
**Body:** `{ "content": "Nice!" }`  
**201:** comment + notificación al autor. Emite WS `post:comment:updated` a la room `post:{id}` (y `notification:new` al autor si aplica).

---

## 7. Follows — `/api/users/:username/follow`

### `POST /api/users/:username/follow` (protegido)
Follow. **201/200** + notificación `FOLLOW`.

### `DELETE /api/users/:username/follow` (protegido)
Unfollow. **204**

---

## 8. Feed — `/api/feed`

### `GET /api/feed?type=global|following&page&limit` (protegido)
Cada ítem:
```json
{
  "id": "...",
  "content": "...",
  "mediaUrl": null,
  "createdAt": "...",
  "author": { "id", "username", "displayName", "avatarUrl" },
  "likesCount": 3,
  "commentsCount": 1,
  "likedByMe": false
}
```

---

## 9. Notifications — `/api/notifications`

### `GET /api/notifications?page&limit` (protegido)
### `PATCH /api/notifications/:id/read` (protegido)
### `POST /api/notifications/read-all` (protegido)

Shape:
```json
{
  "id": "...",
  "type": "LIKE",
  "actor": { "username", "displayName", "avatarUrl" },
  "entityId": "...",
  "readAt": null,
  "createdAt": "..."
}
```

---

## 10. Chat — `/api/chat`

### `GET /api/chat/conversations` (protegido)
Lista DMs con último mensaje y peer.

### `POST /api/chat/conversations` (protegido)
**Body:** `{ "username": "otro" }` — find-or-create 1-a-1.

### `GET /api/chat/conversations/:id/messages?page&limit` (protegido)
### `POST /api/chat/conversations/:id/messages` (protegido)
**Body:** `{ "content": "Hola" }`  
Persiste + emite `chat:message:new`.

---

## 11. Health

### `GET /api/health` (público)
`{ "status": "ok" }` — útil para Render/Vercel checks.

---

## 12. Seguridad de contratos

- Nunca devolver `passwordHash`.
- Validar ownership en delete post / enviar mensaje.
- Rate limiting básico opcional (fuera del mínimo de rúbrica; recomendable en auth).

## 13. Trazabilidad Swagger

Cada DTO se anota con `@ApiProperty` / `@ApiBearerAuth` para que `/api/docs` refleje este documento 1:1.
