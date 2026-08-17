# API Reference

Base URL: `/api`

All authenticated endpoints require an `Authorization: Bearer <token>` header. All request/response bodies are JSON unless noted otherwise.

## Authentication

### `POST /api/auth/register`
Body: `{ "name": "string", "email": "string", "password": "string (min 8 chars)" }`
- `201` → `{ status, data: { user, token } }`
- `400` → validation error
- `409` → email already registered

### `POST /api/auth/login`
Body: `{ "email": "string", "password": "string" }`
- `200` → `{ status, data: { user, token } }`
- `401` → invalid credentials

### `POST /api/auth/logout`
- `200` → `{ status, message }` (stateless JWT: client discards the token)

### `GET /api/auth/me`
Requires auth.
- `200` → `{ status, data: { user } }`
- `401` → missing/invalid token

## ASCII Conversion

### `POST /api/ascii/generate`
Requires auth. `multipart/form-data` with:
- `image` (file, required — JPG/PNG/WEBP, max 5MB)
- `width` (number, 20-300, default 100)
- `charset` (string, default `"@%#*+=-:. "`)
- `invert` (boolean)
- `brightness` (number, -100 to 100)
- `contrast` (number, -100 to 100)

Response `200`:
```json
{
  "status": "success",
  "data": {
    "asciiContent": "...",
    "settings": { "width": 100, "charset": "...", "invert": false, "brightness": 0, "contrast": 0 },
    "meta": { "originalWidth": 800, "originalHeight": 600, "outputWidth": 100, "outputHeight": 41, "format": "jpeg" },
    "originalFilename": "photo.jpg"
  }
}
```
- `400` → no file / invalid file type / corrupt image
- `413` → file exceeds 5MB

## Artworks

All require auth. Users may only access their own artworks (`403` otherwise).

| Method | Path | Description |
|---|---|---|
| GET | `/api/artworks` | List the current user's artworks, newest first |
| GET | `/api/artworks/:id` | Get one artwork |
| POST | `/api/artworks` | Create/save an artwork (`title`, `asciiContent`, `originalFilename`, `settings`) |
| PUT | `/api/artworks/:id` | Update `title` / `asciiContent` / `settings` |
| DELETE | `/api/artworks/:id` | Delete an artwork |
| POST | `/api/artworks/:id/share` | Create (or re-enable) a public share link |

## Sharing

### `GET /api/share/:token`
Public — no auth required.
- `200` → `{ status, data: { artwork } }` (only title/ascii/settings/filename/createdAt — no owner info)
- `404` → token doesn't exist or artwork is not public

## Health

### `GET /api/health`
Public.
- `200` → `{ "status": "ok", "timestamp": "...", "database": "connected" | "disconnected" }`

## Error format

All errors: `{ "status": "error", "message": "human readable message" }`. Stack traces are never included outside of local development, and only for unexpected (non-operational) errors.

## HTTP status codes used

`200` OK · `201` Created · `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `409` Conflict · `413` Payload Too Large · `500` Internal Server Error
