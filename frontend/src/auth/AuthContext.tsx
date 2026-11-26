import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, clearSession, loadSession, saveSession, setUnauthorizedHandler, tokenExpiry } from '../api/client';
import type { Session } from '../api/types';
import { useToast } from '../components/Toast';

interface AuthApi {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthApi | null>(null);

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { notify } = useToast();
  const [session, setSession] = useState<Session | null>(() => loadSession());

  const logout = useCallback(() => { clearSession(); setSession(null); }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, userId, email: confirmed } = await api.login(email, password);
    const next = { token, userId, email: confirmed };
    saveSession(next);
    setSession(next);
  }, []);

  // The backend's register returns no token, so sign in straight after.
  const register = useCallback(async (name: string, email: string, password: string) => {
    await api.register(name, email, password);
    await login(email, password);
  }, [login]);

  // Any 401 from an authenticated call ends the session.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setSession(null);
      notify('Your session expired. Sign in again.', 'error');
    });
    return () => setUnauthorizedHandler(null);
  }, [notify]);

  // Sign out proactively when the JWT's own exp passes.
  useEffect(() => {
    if (!session) return;
    const exp = tokenExpiry(session.token);
    if (exp === null) return;
    const ms = Math.min(exp - Date.now(), 2 ** 31 - 1);
    const timer = window.setTimeout(() => { logout(); notify('Your session expired. Sign in again.', 'error'); }, Math.max(ms, 0));
    return () => window.clearTimeout(timer);
  }, [session, logout, notify]);

  const value = useMemo(() => ({ session, login, register, logout }), [session, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
