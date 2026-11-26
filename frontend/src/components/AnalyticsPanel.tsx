import type { DailyClicks, HotLink, TrafficSource } from '../api/types';
import { hostOf, referrerLabel } from '../lib/format';
import { DailyClicksChart } from './DailyClicksChart';
import { RankedList } from './RankedList';
import { EmptyState, ErrorState, Skeleton } from './States';

export interface AnalyticsData {
  daily: DailyClicks[];
  hot: HotLink[];
  sources: TrafficSource[];
}

interface Props {
  data: AnalyticsData | null;
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  /** Only show hot links that belong to the signed-in user. */
  ownedCodes: Set<string>;
}

export function AnalyticsPanel({ data, loading, error, onRetry, ownedCodes }: Props) {
  if (error && !data) return <ErrorState message={`Couldn’t load analytics. ${error.message}`} onRetry={onRetry} />;
  if (loading && !data) return <Skeleton rows={5} label="Loading analytics" />;
  if (!data) return null;

  const mine = data.hot.filter((h) => ownedCodes.has(h.shortCode)).slice(0, 6);
  const sources = data.sources.slice(0, 6);

  return (
    <div className="analytics">
      <div className="panel panel-wide">
        <h3>Clicks per day</h3>
        <DailyClicksChart data={data.daily} />
      </div>

      <div className="panel">
        <h3>Your top links</h3>
        {mine.length === 0 ? (
          <EmptyState icon="inbox" title="No clicks yet">Clicks on your links will rank here.</EmptyState>
        ) : (
          <RankedList
            label="Your most clicked links"
            items={mine.map((h) => ({ key: h.shortCode, label: h.shortCode, hint: hostOf(h.originalUrl), value: h.totalClicks }))}
          />
        )}
      </div>

      <div className="panel">
        <h3>Traffic sources</h3>
        {sources.length === 0 ? (
          <EmptyState icon="inbox" title="No traffic yet">Referrers appear once links get visited.</EmptyState>
        ) : (
          <RankedList
            label="Clicks by referrer"
            items={sources.map((s) => ({ key: s.referrer, label: referrerLabel(s.referrer), value: s.totalClicks }))}
          />
        )}
      </div>
    </div>
  );
}
