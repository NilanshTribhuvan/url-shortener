import { useMemo, useState } from 'react';
import type { UrlItem } from '../api/types';
import { useCopy } from '../hooks/useCopy';
import { formatCount, formatDate, hostOf, linkStatus, pathOf, shortBase } from '../lib/format';
import { EmptyState } from './States';
import { Icon } from './Icon';

type SortKey = 'newest' | 'clicks';

interface Props {
  links: UrlItem[];
  onEditExpiry: (link: UrlItem) => void;
  onDelete: (link: UrlItem) => void;
}

function StatusBadge({ expiresAt }: { expiresAt: string | null }) {
  const status = linkStatus(expiresAt);
  if (status.kind === 'permanent') return <span className="badge">No expiry</span>;
  if (status.kind === 'expired') return <span className="badge badge-danger"><Icon name="alert" size={12} />Expired</span>;
  return <span className="badge badge-warn"><Icon name="clock" size={12} />{status.label}</span>;
}

export function LinksTable({ links, onEditExpiry, onDelete }: Props) {
  const copy = useCopy();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? links.filter((l) => l.shortCode.toLowerCase().includes(q) || l.originalUrl.toLowerCase().includes(q))
      : links;
    return [...filtered].sort((a, b) =>
      sort === 'clicks'
        ? b.clickCount - a.clickCount
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [links, query, sort]);

  return (
    <>
      <div className="toolbar">
        <div className="field field-grow">
          <label htmlFor="link-search" className="sr-only">Search links</label>
          <input
            id="link-search" type="search" placeholder="Search by code or destination"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="link-sort" className="sr-only">Sort links</label>
          <select id="link-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="newest">Newest first</option>
            <option value="clicks">Most clicks</option>
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="link" title="No matching links">Nothing matches “{query}”. Try a different search.</EmptyState>
      ) : (
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Your short links">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Short link</th>
                <th scope="col">Destination</th>
                <th scope="col" className="num">Clicks</th>
                <th scope="col">Created</th>
                <th scope="col">Expiry</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const shortUrl = `${shortBase}/${l.shortCode}`;
                const expired = linkStatus(l.expiresAt).kind === 'expired';
                return (
                  <tr key={l.id} className={expired ? 'row-muted' : undefined}>
                    <td>
                      <a className="mono code" href={shortUrl} target="_blank" rel="noreferrer">
                        {l.shortCode}<span className="sr-only"> (opens in new tab)</span>
                      </a>
                    </td>
                    <td className="dest">
                      <a href={l.originalUrl} target="_blank" rel="noreferrer" title={l.originalUrl}>
                        <strong>{hostOf(l.originalUrl)}</strong>
                        <span className="muted path">{pathOf(l.originalUrl)}</span>
                      </a>
                    </td>
                    <td className="num">{formatCount(l.clickCount)}</td>
                    <td className="nowrap">{formatDate(l.createdAt)}</td>
                    <td><StatusBadge expiresAt={l.expiresAt} /></td>
                    <td>
                      <div className="actions">
                        <button type="button" className="icon-btn" onClick={() => void copy(shortUrl)} aria-label={`Copy short link ${l.shortCode}`} title="Copy link">
                          <Icon name="copy" />
                        </button>
                        <button type="button" className="icon-btn" onClick={() => onEditExpiry(l)} aria-label={`Change expiry for ${l.shortCode}`} title="Change expiry">
                          <Icon name="calendar" />
                        </button>
                        <button type="button" className="icon-btn icon-btn-danger" onClick={() => onDelete(l)} aria-label={`Delete ${l.shortCode}`} title="Delete">
                          <Icon name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
