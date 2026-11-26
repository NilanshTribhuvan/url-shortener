import { useAuth } from '../auth/AuthContext';
import { Icon } from './Icon';

export function Header() {
  const { session, logout } = useAuth();
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <p className="brand"><span className="brand-mark" aria-hidden="true" />URL Shortener</p>
        <div className="topbar-user">
          <span className="muted user-email" title={session?.email}>{session?.email}</span>
          <button type="button" className="btn btn-quiet" onClick={logout}>
            <Icon name="logout" />Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
