import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-6">Cargando…</div>;
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}


