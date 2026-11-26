import { formatCount } from '../lib/format';

interface Stat { label: string; value: number | null; hint?: string }

export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <dl className="stats">
      {stats.map((s) => (
        <div key={s.label} className="stat">
          <dt>{s.label}</dt>
          <dd>{s.value === null ? '–' : formatCount(s.value)}</dd>
          {s.hint && <p className="stat-hint">{s.hint}</p>}
        </div>
      ))}
    </dl>
  );
}
