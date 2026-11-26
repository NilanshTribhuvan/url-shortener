import type {
  AuthResponse, DailyClicks, HotLink, Session, ShortenResponse, TrafficSource, UrlItem,
} from './types';

const SESSION_KEY = 'urlshortener.session';

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/* ---------- session persistence ---------- */

export function tokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    const exp = tokenExpiry(session.token);
    if (exp !== null && exp <= Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* storage blocked */ }
}

export function clearSession(): void {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* storage blocked */ }
}

/* ---------- transport ---------- */

let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.message === 'string' && body.message) return body.message;
  } catch { /* not JSON */ }
  return `Request failed (${res.status})`;
}

async function request<T>(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    auth?: boolean;
    responseType?: 'json' | 'text';
  } = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = true,
    responseType,
  } = init;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = loadSession()?.token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(path, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check that the backend is running.');
  }

  if (res.status === 401 && auth) {
    unauthorizedHandler?.();
    throw new ApiError(401, 'Your session has expired. Please sign in again.');
  }
  if (!res.ok) throw new ApiError(res.status, await readError(res));
  if (res.status === 204) return undefined as T;

  if (responseType === 'text') {
    return (await res.text()) as T;
  }

  const type = res.headers.get('content-type') ?? '';

  return (type.includes('json') ? res.json() : res.text()) as Promise<T>;
}

/* ---------- endpoints ---------- */

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (name: string, email: string, password: string) =>
      request<string>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
        auth: false,
        responseType: 'text',
      }),

  listUrls: () => request<UrlItem[]>('/api/urls'),
  shorten: (originalUrl: string, expiresAt?: string) =>
    request<ShortenResponse>('/api/shorten', { method: 'POST', body: { originalUrl, expiresAt } }),
  // Sending expiresAt: null clears the expiry.
  updateExpiry: (code: string, expiresAt: string | null) =>
    request<ShortenResponse>(`/api/${encodeURIComponent(code)}`, { method: 'PUT', body: { expiresAt } }),
  deleteUrl: (code: string) =>
    request<void>(`/api/${encodeURIComponent(code)}`, { method: 'DELETE' }),

  dailyClicks: () => request<DailyClicks[]>('/api/analytics/daily-clicks'),
  hotLinks: () => request<HotLink[]>('/api/analytics/hot-links'),
  trafficSources: () => request<TrafficSource[]>('/api/analytics/traffic-sources'),
  totalClicks: () => request<number>('/api/analytics/total-clicks'),
};
