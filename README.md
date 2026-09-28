# URL Shortener

Bitly-style URL shortening service built with Spring Boot 3 + MongoDB.
Covers Phases 1–3 of the mentorship guide (core API, click tracking, expiry).
Phase 4 (JWT auth + ownership) is left as your next extension — see below.

## Stack

- Java 17, Spring Boot 3.3
- MongoDB 7
- Maven
- Docker / Docker Compose

## Run it

### Option A — Docker Compose (easiest)

```bash
docker compose up --build
```

This starts MongoDB and the app together. API is available at `http://localhost:8080`.

### Option B — Local Mongo + Maven

1. Start Mongo locally (or `docker run -p 27017:27017 mongo:7`)
2. Run:

```bash
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/urlshortener ./mvnw spring-boot:run
```

## API

| Method | Endpoint             | Description                              |
|--------|-----------------------|-------------------------------------------|
| POST   | `/api/shorten`         | Create a short URL                        |
| GET    | `/{code}`               | 302 redirect to the original URL          |
| GET    | `/api/stats/{code}`     | Click count, createdAt, expiresAt         |
| DELETE | `/api/{code}`           | Delete a short URL                        |
| GET    | `/api/urls`             | List all URLs                             |

### Create a short URL

```bash
curl -X POST http://localhost:8080/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com/some/very/long/path"}'
```

Response:

```json
{
  "shortCode": "aB3kZ9",
  "shortUrl": "http://localhost:8080/aB3kZ9",
  "originalUrl": "https://example.com/some/very/long/path",
  "createdAt": "2026-09-14T10:00:00Z",
  "expiresAt": null
}
```

### With an expiry (TTL index)

```bash
curl -X POST http://localhost:8080/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com", "expiresAt": "2026-12-31T00:00:00Z"}'
```

After that instant passes, the redirect returns `410 Gone`, and MongoDB's
TTL background job (runs every ~60s) will physically delete the document.

### Follow the redirect

```bash
curl -i http://localhost:8080/aB3kZ9
# HTTP/1.1 302 Found
# Location: https://example.com/some/very/long/path
```

### Check stats

```bash
curl http://localhost:8080/api/stats/aB3kZ9
```

## How the pieces map to the guide

- **Hashing**: `Base62Encoder` + MD5 in `UrlService.md5Base62` — first 6 chars
  of the Base62-encoded digest, with collision retries by salting the input.
- **Atomic click increment**: `UrlService.incrementClickCount` uses
  `MongoTemplate.findAndModify` with `$inc`, never read-then-write.
- **TTL index**: `Url.expiresAt` is annotated `@Indexed(expireAfterSeconds = 0)`.
  The redirect handler also checks expiry inline and returns 410 proactively,
  since the TTL background sweep isn't instant.
- **302 not 301**: `UrlController.redirect` explicitly returns `HttpStatus.FOUND`.

## Next steps (Phase 4 — auth)

1. Add `spring-boot-starter-security` + `jjwt`.
2. Add a `User` document and `/api/auth/register` / `/api/auth/login`.
3. Populate `Url.userId` on creation from the authenticated principal.
4. Scope `GET /api/urls` and `DELETE /api/{code}` to `userId == currentUser`.

## Tests

```bash
./mvnw test
```
