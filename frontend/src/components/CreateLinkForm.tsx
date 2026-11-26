import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { ShortenResponse } from '../api/types';
import { useCopy } from '../hooks/useCopy';
import { isHttpUrl, toInstant } from '../lib/format';
import { Icon } from './Icon';

export function CreateLinkForm({ onCreated }: { onCreated: () => void }) {
  const copy = useCopy();
  const [url, setUrl] = useState('');
  const [expires, setExpires] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<ShortenResponse | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isHttpUrl(url)) {
      setError('Enter a full URL starting with http:// or https://');
      return;
    }
    if (expires && new Date(expires).getTime() <= Date.now()) {
      setError('Expiry must be in the future.');
      return;
    }

    setBusy(true);
    try {
      const result = await api.shorten(url.trim(), expires ? toInstant(expires) : undefined);
      setCreated(result);
      setUrl('');
      setExpires('');
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="create-h" className="panel">
      <h2 id="create-h">Shorten a URL</h2>
      <form className="create-form" onSubmit={onSubmit} noValidate>
        <div className="field field-grow">
          <label htmlFor="long-url">Destination URL</label>
          <input
            id="long-url" type="url" inputMode="url" placeholder="https://example.com/a/very/long/path"
            value={url} onChange={(e) => setUrl(e.target.value)}
            aria-invalid={error ? true : undefined} aria-describedby={error ? 'create-error' : undefined}
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="expires">Expires <span className="muted">(optional)</span></label>
          <input id="expires" type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary create-submit" disabled={busy}>
          {busy ? 'Shortening…' : 'Shorten'}
        </button>
      </form>

      {error && <p id="create-error" className="form-error" role="alert">{error}</p>}

      {created && (
        <div className="created" role="status">
          <Icon name="check" />
          <span>Created</span>
          <a href={created.shortUrl} target="_blank" rel="noreferrer" className="mono">{created.shortUrl}</a>
          <button type="button" className="btn btn-small" onClick={() => void copy(created.shortUrl)}>
            <Icon name="copy" />Copy
          </button>
        </div>
      )}
    </section>
  );
}
