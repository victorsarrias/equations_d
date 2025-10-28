import { useState } from 'react';
import { login, registerUser, forgotPassword } from '../api';
import { useSound } from '../hooks/useSound';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const { playSound } = useSound();
  const { login: saveSession } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    username: ''
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setOk('');
    try {
      if (mode === 'login') {
        const res = await login({ email: form.email, password: form.password });
        setOk('Sesión iniciada');
        playSound('success');
        saveSession(res);
        navigate('/perfil');
      } else {
        const res = await registerUser({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          username: form.username,
          password: form.password,
        });
        setOk('Registro exitoso. Ya puedes iniciar sesión.');
        playSound('success');
        setMode('login');
      }
    } catch (e) {
      setError(e.message || 'Error');
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setOk('');
    try {
      const res = await forgotPassword(forgotEmail || form.email);
      setOk((res && res.message) || 'Si el correo existe, enviaremos instrucciones.');
      if (res && res.debugToken) {
        setOk(((res && res.message) || 'Revisa tu correo.') + ` (token: ${res.debugToken})`);
      }
      setForgotEmail('');
      playSound('success');
    } catch (e) {
      setError(e.message || 'Error');
      playSound('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 text-white">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">{mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}</h1>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-purple-400/40 p-6 backdrop-blur-sm">
        <div className="flex gap-2 mb-4">
          <button className={`flex-1 py-2 rounded-lg font-semibold ${mode==='login' ? 'bg-purple-600' : 'bg-slate-700'}`} onClick={() => { setMode('login'); playSound('click'); }}>Iniciar sesión</button>
          <button className={`flex-1 py-2 rounded-lg font-semibold ${mode==='register' ? 'bg-purple-600' : 'bg-slate-700'}`} onClick={() => { setMode('register'); playSound('click'); }}>Registrarse</button>
        </div>

        {error && <div className="mb-3 text-red-400 text-sm break-words">{error}</div>}
        {ok && <div className="mb-3 text-green-400 text-sm">{ok}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm mb-1">Nombre completo</label>
                <input name="fullName" value={form.fullName} onChange={onChange} className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Número de celular</label>
                <input name="phone" value={form.phone} onChange={onChange} className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Nombre de usuario</label>
                <input name="username" value={form.username} onChange={onChange} className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Rol</label>
                <select name="role" value={form.role || 'student'} onChange={onChange} className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600">
                  <option value="student">Estudiante</option>
                  <option value="teacher">Docente</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm mb-1">Correo</label>
            <input type="email" name="email" value={form.email} onChange={onChange} className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={onChange} className="w-full px-3 py-2 rounded bg-slate-700 border border-slate-600" required />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 font-bold disabled:opacity-60">
            {loading ? 'Procesando...' : (mode === 'login' ? 'Iniciar sesión' : 'Registrarse')}
          </button>
        </form>

        {/* Recuperación de contraseña (desarrollador) */}
        <div className="mt-6 p-4 bg-slate-800/70 rounded-lg border border-slate-700">
          <div className="text-sm mb-2">¿Olvidaste tu contraseña?</div>
          <form onSubmit={handleForgot} className="flex gap-2">
            <input
              type="email"
              placeholder="Tu correo"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-slate-700 border border-slate-600"
              required
            />
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600">
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>
          <div className="text-xs text-slate-400 mt-2">En desarrollo: en local se mostrará un token para probar el restablecimiento.</div>
        </div>
      </div>
    </div>
  );
}
