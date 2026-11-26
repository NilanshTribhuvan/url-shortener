import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { UrlItem } from '../api/types';
import { hostOf, toInstant, toLocalInput } from '../lib/format';
import { Modal } from './Modal';
import { useToast } from './Toast';

interface ExpiryProps { link: UrlItem; onClose: () => void; onSaved: (updated: UrlItem) => void }

export function ExpiryDialog({ link, onClose, onSaved }: ExpiryProps) {
  const { notify } = useToast();
  const [value, setValue] = useState(link.expiresAt ? toLocalInput(link.expiresAt) : '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(expiresAt: string | null) {
    setBusy(true);
    setError(null);
    try {
      const res = await api.updateExpiry(link.shortCode, expiresAt);
      onSaved({ ...link, expiresAt: res.expiresAt });
      notify(expiresAt ? 'Expiry updated' : 'Expiry removed');
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value) { setError('Pick a date and time, or remove the expiry.'); return; }
    if (new Date(value).getTime() <= Date.now()) { setError('Expiry must be in the future.'); return; }
    void save(toInstant(value));
  }

  return (
    <Modal title={`Expiry for ${link.shortCode}`} onClose={onClose}>
      <form onSubmit={onSubmit} className="stack">
        <p className="muted">After this time the link returns “410 Gone” instead of redirecting.</p>
        <div className="field">
          <label htmlFor="expiry-input">Expires at</label>
          <input id="expiry-input" type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          {link.expiresAt && (
            <button type="button" className="btn btn-quiet push-left" disabled={busy} onClick={() => void save(null)}>
              Remove expiry
            </button>
          )}
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

interface DeleteProps { link: UrlItem; onClose: () => void; onDeleted: (code: string) => void }

export function DeleteDialog({ link, onClose, onDeleted }: DeleteProps) {
  const { notify } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await api.deleteUrl(link.shortCode);
      onDeleted(link.shortCode);
      notify(`Deleted ${link.shortCode}`);
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal title={`Delete ${link.shortCode}?`} onClose={onClose}>
      <div className="stack">
        <p>
          <span className="mono">{link.shortCode}</span> will stop redirecting to{' '}
          <strong>{hostOf(link.originalUrl)}</strong>. Anyone holding this link will get an error. This can’t be undone.
        </p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" disabled={busy} onClick={() => void confirm()}>
            {busy ? 'Deleting…' : 'Delete link'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
