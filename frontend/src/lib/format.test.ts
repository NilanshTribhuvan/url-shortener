import { describe, expect, it } from 'vitest';
import { fillDays, formatCount, hostOf, isHttpUrl, linkStatus, pathOf, referrerLabel, toInstant, toLocalInput } from './format';

describe('urls', () => {
  it('extracts host without www', () => expect(hostOf('https://www.example.com/a?b=1')).toBe('example.com'));
  it('returns input for unparseable urls', () => expect(hostOf('nope')).toBe('nope'));
  it('extracts path + query, hiding bare root', () => {
    expect(pathOf('https://example.com/')).toBe('');
    expect(pathOf('https://example.com/a/b?x=1')).toBe('/a/b?x=1');
  });
  it('accepts only http(s)', () => {
    expect(isHttpUrl('https://example.com')).toBe(true);
    expect(isHttpUrl(' http://example.com ')).toBe(true);
    expect(isHttpUrl('ftp://example.com')).toBe(false);
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('example.com')).toBe(false);
  });
});

describe('linkStatus', () => {
  const now = Date.parse('2026-11-24T12:00:00Z');
  it('treats null as permanent', () => expect(linkStatus(null, now)).toEqual({ kind: 'permanent' }));
  it('flags past dates as expired', () => expect(linkStatus('2026-11-24T11:59:00Z', now).kind).toBe('expired'));
  it('labels near-future expiries', () => {
    expect(linkStatus('2026-11-24T12:30:00Z', now)).toEqual({ kind: 'scheduled', label: 'Expires in 30 minutes' });
    expect(linkStatus('2026-11-27T12:00:00Z', now)).toEqual({ kind: 'scheduled', label: 'Expires in 3 days' });
  });
});

describe('fillDays', () => {
  it('returns a contiguous UTC window ending today with zero-filled gaps', () => {
    const out = fillDays([{ date: '2026-11-22', totalClicks: 7 }], 5, new Date('2026-11-24T08:00:00Z'));
    expect(out.map((d) => d.date)).toEqual(['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23', '2026-11-24']);
    expect(out.map((d) => d.totalClicks)).toEqual([0, 0, 7, 0, 0]);
  });
});

describe('misc', () => {
  it('formats counts', () => {
    expect(formatCount(1234)).toBe('1,234');
    expect(formatCount(12_500)).toBe('12.5K');
  });
  it('maps referrer sentinels', () => {
    expect(referrerLabel('DIRECT')).toBe('Direct');
    expect(referrerLabel('news.ycombinator.com')).toBe('news.ycombinator.com');
  });
  it('round-trips datetime-local values', () => {
    const iso = '2026-12-31T23:59:00.000Z';
    expect(toInstant(toLocalInput(iso))).toBe(iso);
  });
});
