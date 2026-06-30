import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const getStoredSessionRole = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('pf_role');
};

export function ProtectedStudent({ children }) {
  const { user, role, loading } = useAuth();
  const storedRole = getStoredSessionRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isStudentSession = Boolean(user || storedRole === 'student');

  if (!isStudentSession) {
    return <Navigate to="/login" replace />;
  }

  if (role && role !== 'student') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function ProtectedAdmin({ children }) {
  const { user, role, loading } = useAuth();
  const storedRole = getStoredSessionRole();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full" /></div>;

  const isAdminSession = Boolean(user || storedRole === 'admin');

  if (!isAdminSession || role === 'student') return <Navigate to="/admin/login" replace />;
  return children;
}
