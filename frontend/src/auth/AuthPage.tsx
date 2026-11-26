import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isRegister) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  function switchMode(next: 'login' | 'register') {
    setMode(next);
    setError(null);
  }

  return (
    <main className="auth">
      <div className="auth-panel">
        <p className="brand"><span className="brand-mark" aria-hidden="true" />URL Shortener</p>
        <h1>{isRegister ? 'Create your account' : 'Sign in'}</h1>
        <p className="muted">
          {isRegister ? 'Register once, then manage your short links and see how they perform.'
                      : 'Manage your short links and see how they perform.'}
        </p>

        <form onSubmit={onSubmit} noValidate={false} className="stack">
          {isRegister && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password" type="password" required value={password}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch muted">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" className="link-btn" onClick={() => switchMode(isRegister ? 'login' : 'register')}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </main>
  );
}
