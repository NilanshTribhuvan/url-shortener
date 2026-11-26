import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export function Skeleton({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <div className="skeleton" role="status" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton-row" />)}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="state state-error" role="alert">
      <Icon name="alert" size={20} />
      <p>{message}</p>
      <button type="button" className="btn" onClick={onRetry}><Icon name="refresh" />Try again</button>
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="state">
      <Icon name={icon} size={22} />
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}
