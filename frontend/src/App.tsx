import { AuthPage } from './auth/AuthPage';
import { useAuth } from './auth/AuthContext';
import { Dashboard } from './components/Dashboard';

export function App() {
  const { session } = useAuth();
  return session ? <Dashboard /> : <AuthPage />;
}
