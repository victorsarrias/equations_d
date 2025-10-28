import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({ user: null, token: null, loading: true, login: () => {}, logout: () => {} });

function isJwtValid(token) {
  try {
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) return false;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload && typeof payload.exp === 'number') {
      return payload.exp * 1000 > Date.now();
    }
    return true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const clearOnBoot = String(import.meta.env.VITE_CLEAR_AUTH_ON_BOOT || '').toLowerCase() === 'true';
      if (clearOnBoot) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch {}

    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && isJwtValid(t)) {
      setToken(t);
      if (u) {
        try { setUser(JSON.parse(u)); } catch { setUser(null); }
      }
    } else {
      // Asegurar que no quede una sesión fantasma
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (payload) => {
    localStorage.setItem('token', payload.token);
    if (payload.user) localStorage.setItem('user', JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user || null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
