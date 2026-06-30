import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('pf_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });
  const [role, setRole] = useState(() => localStorage.getItem('pf_role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pf_token');
    if (token && !user) {
      authService.getMe()
        .then(({ data }) => {
          setUser(data.user);
          setRole(data.role);
          localStorage.setItem('pf_user', JSON.stringify(data.user));
          localStorage.setItem('pf_role', data.role);
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData, userRole) => {
    const normalizedUser = userData && typeof userData === 'object'
      ? { ...userData, role: userData.role || userRole }
      : { role: userRole };

    localStorage.setItem('pf_token', token);
    localStorage.setItem('pf_user', JSON.stringify(normalizedUser));
    localStorage.setItem('pf_role', userRole);
    setUser(normalizedUser);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('pf_token');
    localStorage.removeItem('pf_user');
    localStorage.removeItem('pf_role');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, isStudent: role === 'student', isAdmin: role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
