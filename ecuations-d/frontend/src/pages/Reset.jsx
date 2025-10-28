import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api';
import { useSound } from '../hooks/useSound';

export default function Reset() {
  const [params] = useSearchParams();
  const initialToken = params.get('token') || '';
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const navigate = useNavigate();
  const { playSound } = useSound();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setOk('');
    try {
      const res = await resetPassword({ token, password });
      setOk(res.message || 'Contraseña actualizada');
      playSound('success');
      setTimeout(() => navigate('/auth'), 1200);
    } catch (e) {
      setError(e.message || 'Error');
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 text-white">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">Restablecer contraseña</h1>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-purple-400/40 p-6 backdrop-blur-sm">
        {error && <div className="mb-3 text-red-400 text-sm break-words">{error}</div>}
        {ok && <div className="mb-3 text-green-400 text-sm">{ok}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Token</label>
            <input value={token} onChange={(e) => setToken(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Nueva contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 font-bold disabled:opacity-60">
            {loading ? 'Procesando...' : 'Restablecer'}
          </button>
        </form>
      </div>
    </div>
  );
}

