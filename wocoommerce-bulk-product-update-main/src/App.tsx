import { useAuth } from './features/auth/AuthContext';
import { LoginForm } from './features/auth/LoginForm';
import { Dashboard } from './features/spreadsheet/Dashboard';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Dashboard />;
}

export default App;
