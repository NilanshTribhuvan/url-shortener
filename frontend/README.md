# URL Shortener: Dashboard

React + TypeScript + Vite. No UI or chart libraries (the chart is plain SVG).

## Run

```bash
# 1. start the Spring backend on :8080 (as usual)
# 2. then:
cd frontend
npm install
npm run dev          # http://localhost:5173
```

`/api/*` is proxied to `http://localhost:8080` by Vite (see `vite.config.ts`), so the
backend needs **no CORS changes** in development. Override the target with `VITE_BACKEND_URL`.

Short links in the table are built from `VITE_SHORT_BASE_URL` (the backend's `APP_BASE_URL`);
the list endpoint doesn't return `shortUrl`. See `.env.example`.

| Script | |
|---|---|
| `npm run dev` | dev server with API proxy |
| `npm run build` | typecheck + production bundle in `dist/` |
| `npm test` | unit tests (formatting, expiry, date-gap logic) |

## Deploying

Either serve `dist/` from the same origin as the API (reverse proxy), or add CORS to Spring:

```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
    var cfg = new CorsConfiguration();
    cfg.setAllowedOrigins(List.of("https://your-dashboard.example"));
    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    cfg.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    var src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/api/**", cfg);
    return src;
}
// and in SecurityConfig: http.cors(Customizer.withDefaults())
```

## Notes

- The JWT is stored in `localStorage` so sessions survive reloads. That's convenient but readable by any
  XSS; if that matters, move to an httpOnly cookie (needs a backend change).
- Any 401 from an authenticated call, or the token's own `exp`, signs the user out.
- Layout: `components/` (UI), `api/` (typed client + DTO types), `auth/`, `hooks/`, `lib/` (pure helpers).
