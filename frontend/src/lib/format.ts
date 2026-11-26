import type { DailyClicks } from '../api/types';

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
export const formatCount = (n: number): string =>
  n < 10_000 ? n.toLocaleString('en') : compact.format(n);

const dateFmt = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' });
export const formatDate = (iso: string): string => dateFmt.format(new Date(iso));

const dayFmt = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', timeZone: 'UTC' });
export const formatDay = (yyyyMmDd: string): string => dayFmt.format(new Date(`${yyyyMmDd}T00:00:00Z`));

export function hostOf(url: string): string {
  try { return new URL(url).host.replace(/^www\./, ''); } catch { return url; }
}

export function pathOf(url: string): string {
  try {
    const u = new URL(url);
    const p = u.pathname + u.search;
    return p === '/' ? '' : p;
  } catch { return ''; }
}

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

export type LinkStatus =
  | { kind: 'permanent' }
  | { kind: 'scheduled'; label: string }
  | { kind: 'expired' };

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function linkStatus(expiresAt: string | null, now: number = Date.now()): LinkStatus {
  if (!expiresAt) return { kind: 'permanent' };
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return { kind: 'expired' };
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return { kind: 'scheduled', label: `Expires ${rtf.format(minutes, 'minute')}` };
  const hours = Math.round(diff / 3_600_000);
  if (hours < 48) return { kind: 'scheduled', label: `Expires ${rtf.format(hours, 'hour')}` };
  return { kind: 'scheduled', label: `Expires ${rtf.format(Math.round(diff / 86_400_000), 'day')}` };
}

/** Backend only returns days that had clicks; fill the gaps so the chart has a true time axis (UTC days). */
export function fillDays(data: DailyClicks[], days = 30, now: Date = new Date()): DailyClicks[] {
  const byDate = new Map(data.map((d) => [d.date, d.totalClicks]));
  const out: DailyClicks[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, totalClicks: byDate.get(key) ?? 0 });
  }
  return out;
}

const REFERRER_LABELS: Record<string, string> = { DIRECT: 'Direct', OTHER: 'Other', UNKNOWN: 'Unknown' };
export const referrerLabel = (r: string): string => REFERRER_LABELS[r] ?? r;

/** <input type="datetime-local"> value (local time) -> ISO instant */
export const toInstant = (localValue: string): string => new Date(localValue).toISOString();

/** ISO instant -> <input type="datetime-local"> value (local time) */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export const shortBase: string =
  import.meta.env?.VITE_SHORT_BASE_URL ??
  (import.meta.env?.DEV ? 'http://localhost:8080' : window.location.origin);
