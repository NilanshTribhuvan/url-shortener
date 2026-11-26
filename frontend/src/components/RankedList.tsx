import type { CSSProperties } from 'react';
import { formatCount } from '../lib/format';

export interface RankedItem { key: string; label: string; hint?: string; value: number }

export function RankedList({ items, label }: { items: RankedItem[]; label: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ol className="ranked" aria-label={label}>
      {items.map((item) => (
        <li key={item.key} style={{ '--pct': `${(item.value / max) * 100}%` } as CSSProperties}>
          <div className="ranked-row">
            <span className="ranked-label" title={item.hint ?? item.label}>
              <span className="mono">{item.label}</span>
              {item.hint && <span className="muted ranked-hint">{item.hint}</span>}
            </span>
            <span className="num">{formatCount(item.value)}</span>
          </div>
          <div className="ranked-track" aria-hidden="true"><div className="ranked-fill" /></div>
        </li>
      ))}
    </ol>
  );
}
