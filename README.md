# URL Shortener

A Bitly-style URL shortening service built with Spring Boot 3, Java 17,
MongoDB Atlas, Spring Security, and JWT authentication.

The application supports URL shortening, 302 redirects, click tracking,
URL expiration, JWT authentication, and per-user URL ownership.

## Stack

- Java 17, Spring Boot 3.3
- Spring Security + JWT (jjwt 0.12.x)
- MongoDB (Atlas or local)
- Maven

## Run it

### MongoDB

This project connects to MongoDB Atlas. You need:

1. An Atlas cluster with a database user (username + password)
2. Your IP whitelisted under Network Access (or `0.0.0.0/0` for local dev)
3. A connection string with a database name appended, e.g.
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/urlshortener`

No Docker is used anywhere in this project — the app runs directly from
your IDE, and the database is fully hosted on Atlas.

### Environment variables

Set these in your IDE run configuration (IntelliJ: Run → Edit Configurations →
Environment variables) or export them in your shell:

| Variable                     | Purpose                                   | Example                                                 |
|-------------------------------|--------------------------------------------|----------------------------------------------------------|
| `MONGODB_URI`                  | Atlas connection string                    | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/urlshortener` |
| `APP_BASE_URL`                 | Used to build the full short URL in responses | `http://localhost:8080`                              |
| `JWT_SECRET`                   | Signing key for tokens (32+ chars)         | a long random string, keep it out of source control      |

### Run

From your IDE: click the green run arrow on `UrlShortenerApplication.main()`.
From the terminal: `./mvnw spring-boot:run`

## Auth flow

Every route except `/api/auth/**` and the public redirect (`GET /{code}`)
requires a JWT. Register once to create an account, then log in to get a
token, and send that token on every subsequent request.

```
1. POST /api/auth/register  →  account created (no token yet)
2. POST /api/auth/login     →  { token, userId, email }
3. Use that token as:  Authorization: Bearer <token>
4. Every /api/... request (except /api/auth/**) now identifies you
   as that userId — no need to send it yourself, it can't be faked.
```

Passwords are hashed with BCrypt (strength 12) before storage — the raw
password is never persisted. Login and register return identical error
messages ("Invalid email or password") on failure, so a wrong password
can't be distinguished from an unregistered email.

## API

| Method | Endpoint                     | Auth required | Description                                  |
|--------|-------------------------------|:--------------:|------------------------------------------------|
| POST   | `/api/auth/register`           | No             | Create a new account                            |
| POST   | `/api/auth/login`               | No             | Authenticate, returns a JWT                    |
| POST   | `/api/shorten`                  | Yes            | Create a short URL, owned by the caller       |
| GET    | `/{code}`                        | No             | 302 redirect to the original URL              |
| GET    | `/api/stats/{code}`             | Yes (owner)    | Click count, createdAt, expiresAt              |
| PUT    | `/api/{code}`                    | Yes (owner)    | Update a URL's `expiresAt`                     |
| DELETE | `/api/{code}`                    | Yes (owner)    | Delete a short URL                             |
| GET    | `/api/urls`                      | Yes            | List the caller's own URLs                     |

"Owner" endpoints return `404` (not `403`) for a code that exists but
belongs to someone else — same response as a code that doesn't exist at
all, so ownership can't be probed from the outside.

### Example: register → login → shorten → list

```bash
# 1. Register (creates the account, no token returned)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "test1234", "name": "Your Name"}'
# → User registered successfully

# 2. Log in (this is what returns the token)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "test1234"}'
# → { "token": "eyJ...", "userId": "...", "email": "you@example.com" }

# 3. Shorten a URL (use the token from step 2)
curl -X POST http://localhost:8080/api/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ..." \
  -d '{"originalUrl": "https://example.com/some/long/path"}'

# 4. List your own URLs
curl http://localhost:8080/api/urls \
  -H "Authorization: Bearer eyJ..."

# 5. Follow the redirect — no token needed, this stays public
curl -i http://localhost:8080/<shortCode>
```

### Example: expiry

```bash
curl -X POST http://localhost:8080/api/shorten \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ..." \
  -d '{"originalUrl": "https://example.com", "expiresAt": "2026-12-31T23:59:00Z"}'
```

After `expiresAt` passes, `GET /{code}` returns `410 Gone`. MongoDB's TTL
background sweep (runs ~every 60s) physically deletes the document
afterward — the app doesn't wait on that sweep for correctness, it checks
expiry inline on every redirect.

## Data model

**`urls` collection**

| Field         | Type     | Notes                                              |
|----------------|-----------|------------------------------------------------------|
| `id`            | ObjectId  | Auto-generated                                      |
| `shortCode`     | String    | Unique index, 6-char Base62                          |
| `originalUrl`   | String    | Indexed for per-user dedup                            |
| `clickCount`    | long      | Incremented atomically via `$inc`, never read-then-write |
| `createdAt`     | Instant   |                                                      |
| `expiresAt`     | Instant   | Nullable. TTL-indexed (`expireAfterSeconds = 0`)      |
| `userId`        | String    | Owner — set from the JWT, not client input           |

**`users` collection**

| Field           | Type    | Notes                                  |
|------------------|----------|-------------------------------------------|
| `id`              | ObjectId | Auto-generated                            |
| `email`           | String   | Unique index                              |
| `passwordHash`    | String   | BCrypt hash only — raw password never stored |
| `name`            | String   |                                            |
| `createdAt`        | Instant  |                                            |

## Design notes

- **Hashing**: `Base62Encoder` + MD5 of the original URL, first 6 chars,
  with collision retries by salting the input on each attempt.
- **Atomic click increment**: `MongoTemplate.findAndModify` with `$inc`,
  avoiding the read-then-write race a naive counter would have.
- **302, not 301**: browsers cache 301s aggressively, which would make an
  updated or expired destination invisible to returning visitors.
- **Per-user dedup**: shortening the same URL twice as the *same* user
  returns the existing short code; a *different* user gets their own.
  Prevents one person's link accidentally colliding with another's.
- **Stateless JWT auth**: no server-side session store. Each request is
  verified independently via the token's signature.

## Tests

```bash
./mvnw test
```

Currently covers the Base62 encoder. Integration tests for the auth flow
and ownership isolation are a good next addition.

## Possible next steps

- Integration tests with Testcontainers (auth flow, ownership isolation)
- Per-click analytics via the `click_events` collection (model included,
  not yet wired up)
- Rate limiting on `/api/auth/login` to slow down credential stuffing
- Token refresh instead of a flat 24h expiry
