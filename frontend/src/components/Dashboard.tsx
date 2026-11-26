import { useCallback, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { UrlItem } from '../api/types';
import { useAsync } from '../hooks/useAsync';
import { AnalyticsPanel, type AnalyticsData } from './AnalyticsPanel';
import { CreateLinkForm } from './CreateLinkForm';
import { Header } from './Header';
import { DeleteDialog, ExpiryDialog } from './LinkDialogs';
import { LinksTable } from './LinksTable';
import { StatsStrip } from './StatsStrip';
import { EmptyState, ErrorState, Skeleton } from './States';

export function Dashboard() {
  const links = useAsync<UrlItem[]>(api.listUrls);
  const analytics = useAsync<AnalyticsData & { total: number }>(async () => {
    const [daily, hot, sources, total] = await Promise.all([
      api.dailyClicks(), api.hotLinks(), api.trafficSources(), api.totalClicks(),
    ]);
    return { daily, hot, sources, total };
  });

  const [editing, setEditing] = useState<UrlItem | null>(null);
  const [deleting, setDeleting] = useState<UrlItem | null>(null);

  const list = links.data ?? [];
  const ownedCodes = useMemo(() => new Set(list.map((l) => l.shortCode)), [list]);
  const ownClicks = useMemo(() => list.reduce((sum, l) => sum + l.clickCount, 0), [list]);

  const refreshAll = useCallback(() => { void links.reload(); void analytics.reload(); }, [links, analytics]);

  const onSaved = useCallback((updated: UrlItem) => {
    links.setData((prev) => prev && prev.map((l) => (l.id === updated.id ? updated : l)));
  }, [links]);

  const onDeleted = useCallback((code: string) => {
    links.setData((prev) => prev && prev.filter((l) => l.shortCode !== code));
    void analytics.reload();
  }, [links, analytics]);

  return (
    <>
      <Header />
      <main className="page">
        <h1 className="sr-only">Dashboard</h1>

        <StatsStrip
          stats={[
            { label: 'Your links', value: links.data ? list.length : null },
            { label: 'Clicks on your links', value: links.data ? ownClicks : null },
            { label: 'Platform clicks', value: analytics.data?.total ?? null, hint: 'All users, all time' },
          ]}
        />

        <CreateLinkForm onCreated={refreshAll} />

        <section aria-labelledby="links-h" className="panel">
          <h2 id="links-h">Your links</h2>
          {links.error && !links.data ? (
            <ErrorState message={`Couldn’t load your links. ${links.error.message}`} onRetry={() => void links.reload()} />
          ) : links.loading && !links.data ? (
            <Skeleton rows={5} label="Loading your links" />
          ) : list.length === 0 ? (
            <EmptyState icon="link" title="No links yet">Paste a URL above to create your first short link.</EmptyState>
          ) : (
            <LinksTable links={list} onEditExpiry={setEditing} onDelete={setDeleting} />
          )}
        </section>

        <section aria-labelledby="analytics-h" className="section">
          <div className="section-head">
            <h2 id="analytics-h">Traffic</h2>
            <p className="muted">Daily clicks and sources count every user’s links. Top links shows only yours.</p>
          </div>
          <AnalyticsPanel
            data={analytics.data}
            loading={analytics.loading}
            error={analytics.error}
            onRetry={() => void analytics.reload()}
            ownedCodes={ownedCodes}
          />
        </section>
      </main>

      {editing && <ExpiryDialog link={editing} onClose={() => setEditing(null)} onSaved={onSaved} />}
      {deleting && <DeleteDialog link={deleting} onClose={() => setDeleting(null)} onDeleted={onDeleted} />}
    </>
  );
}
