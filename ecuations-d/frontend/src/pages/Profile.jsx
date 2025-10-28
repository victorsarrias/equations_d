import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { changePassword } from '../api';

export default function Profile() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [showChange, setShowChange] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setOk('');
    try {
      const res = await changePassword({ currentPassword, newPassword });
      setOk(res.message || 'Contraseña cambiada');
      setCurrentPassword('');
      setNewPassword('');
      setShowChange(false);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 text-white">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Perfil</h1>
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-700/40 border border-emerald-400/40 text-emerald-200">
          {user?.role === 'teacher' ? 'Docente' : user?.role === 'admin' ? 'Admin' : 'Estudiante'}
        </span>
      </div>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border-2 border-emerald-400/40 space-y-6">
        <div className="grid grid-cols-2 gap-4 text-slate-200">
          <div className="font-semibold">Nombre</div>
          <div>{user?.fullName || '-'}</div>
          <div className="font-semibold">Usuario</div>
          <div>{user?.username || '-'}</div>
          <div className="font-semibold">Correo</div>
          <div>{user?.email || '-'}</div>
        </div>

        <div className="space-y-3">
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 font-semibold"
            onClick={() => setShowChange(v => !v)}
          >
            {showChange ? 'Ocultar cambio de contraseña' : 'Cambiar contraseña'}
          </button>

          {showChange && (
            <form onSubmit={onSubmit} className="space-y-3">
              <h2 className="text-xl font-semibold">Cambiar contraseña</h2>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              {ok && <div className="text-green-400 text-sm">{ok}</div>}
              <div>
                <label className="block text-sm mb-1">Contraseña actual</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-12 rounded bg-slate-700 border border-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute inset-y-0 right-2 my-auto px-2 h-8 text-xs rounded bg-slate-600 hover:bg-slate-500"
                    aria-label={showCurrent ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
                  >
                    {showCurrent ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-12 rounded bg-slate-700 border border-slate-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute inset-y-0 right-2 my-auto px-2 h-8 text-xs rounded bg-slate-600 hover:bg-slate-500"
                    aria-label={showNew ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                  >
                    {showNew ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 font-bold disabled:opacity-60">
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          )}
        </div>

        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 font-bold" onClick={logout}>Cerrar sesión</button>
      </div>
    </div>
  );
}
