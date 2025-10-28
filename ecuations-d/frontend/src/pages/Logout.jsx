import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    try { logout(); } catch {}
    navigate('/');
  }, [logout, navigate]);
  return null;
}
