import { useMemo } from 'react';
import type { DailyClicks } from '../api/types';
import { fillDays, formatCount, formatDay } from '../lib/format';

const W = 720;
const H = 220;
const M = { top: 10, right: 8, bottom: 26, left: 38 };
const DAYS = 30;

export function DailyClicksChart({ data }: { data: DailyClicks[] }) {
  const days = useMemo(() => fillDays(data, DAYS), [data]);
  const total = days.reduce((sum, d) => sum + d.totalClicks, 0);
  const max = Math.max(4, Math.ceil(Math.max(...days.map((d) => d.totalClicks)) / 4) * 4);
  const ticks = [0, max / 2, max];

  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;
  const slot = innerW / days.length;
  const barW = Math.max(2, slot - 3);
  const y = (v: number) => M.top + innerH - (v / max) * innerH;

  return (
    <figure className="chart">
      <figcaption>
        <strong>{formatCount(total)}</strong> clicks in the last {DAYS} days <span className="muted">(UTC days)</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Bar chart of daily clicks over the last ${DAYS} days, ${total} in total`}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
            <text className="axis" x={M.left - 6} y={y(t) + 4} textAnchor="end">{formatCount(t)}</text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = M.left + i * slot + (slot - barW) / 2;
          const h = (d.totalClicks / max) * innerH;
          return (
            <g key={d.date}>
              <rect className="bar-col" x={x} y={y(d.totalClicks)} width={barW} height={h} rx="1.5">
                <title>{`${formatDay(d.date)}: ${d.totalClicks} click${d.totalClicks === 1 ? '' : 's'}`}</title>
              </rect>
              {((i % 7 === 0 && i < days.length - 2) ||
                  i === days.length - 1) && (
                <text className="axis" x={x + barW / 2} y={H - 8} textAnchor={i === days.length - 1 ? 'end' : 'middle'}>
                  {formatDay(d.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>Daily clicks, last {DAYS} days</caption>
        <thead><tr><th scope="col">Date</th><th scope="col">Clicks</th></tr></thead>
        <tbody>{days.map((d) => <tr key={d.date}><td>{d.date}</td><td>{d.totalClicks}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
