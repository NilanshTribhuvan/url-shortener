// Mirrors the Spring DTOs / Url entity. Instants arrive as ISO-8601 strings.
export interface AuthResponse { token: string; userId: string; email: string }

export interface UrlItem {
  id: string;
  shortCode: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
  expiresAt: string | null;
  userId: string;
}

export interface ShortenResponse {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string | null;
}

export interface DailyClicks { date: string; totalClicks: number }
export interface HotLink { shortCode: string; originalUrl: string; totalClicks: number }
export interface TrafficSource { referrer: string; totalClicks: number }

export interface Session { token: string; userId: string; email: string }
