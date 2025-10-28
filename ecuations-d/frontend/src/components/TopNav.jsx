import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSound } from "../hooks/useSound";
import { useAuth } from "../context/AuthContext.jsx";
import { getMenuItems } from "../api";

const FALLBACK_MENU = [
  { id: 1, etiqueta: "Inicio", ruta: "/", orden: 1, requiere_auth: 0, solo_invited: 0 },
  { id: 2, etiqueta: "Misiones", ruta: "/misiones", orden: 2, requiere_auth: 0, solo_invited: 0 },
  { id: 3, etiqueta: "Ejemplos", ruta: "/ejemplos", orden: 3, requiere_auth: 0, solo_invited: 0 },
  { id: 4, etiqueta: "Niveles", ruta: "/niveles", orden: 4, requiere_auth: 0, solo_invited: 0 },
  { id: 5, etiqueta: "Jugar", ruta: "/jugar", orden: 5, requiere_auth: 1, solo_invited: 0 },
  { id: 6, etiqueta: "Ayuda", ruta: "/ayuda", orden: 6, requiere_auth: 0, solo_invited: 0 },
  { id: 5, etiqueta: "Aventuras", ruta: "/aventuras", orden: 5, requiere_auth: 0, solo_invited: 0 },
  { id: 6, etiqueta: "Perfil", ruta: "/perfil", orden: 6, requiere_auth: 1, solo_invited: 0 },
  { id: 7, etiqueta: "Iniciar sesión", ruta: "/auth", orden: 7, requiere_auth: 0, solo_invited: 1 }
];

const BUTTON_STYLES = {
  "/": "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
  "/misiones": "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
  "/ejemplos": "bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700",
  "/niveles": "bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700",
  "/jugar": "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700",
  "/ayuda": "bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700",
  "/aventuras": "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700",
  "/perfil": "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800",
  "/auth": "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
};

export default function TopNav() {
  const { playSound } = useSound();
  const { token, user, logout } = useAuth();
  const location = useLocation();
  const [menu, setMenu] = useState(FALLBACK_MENU);
  const [lastMission, setLastMission] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const items = await getMenuItems();
        if (active && items.length) {
          setMenu(items);
        }
      } catch (err) {
        console.error("No se pudo cargar el menú remoto:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Leer misión en curso para mostrar botón "Continuar"
  useEffect(() => {
    const read = () => {
      try {
        const lm = localStorage.getItem('lastMission');
        if (!lm) { setLastMission(null); return; }
        const prog = localStorage.getItem(`progreso:${lm}`);
        setLastMission(prog === 'en-curso' ? lm : null);
      } catch { setLastMission(null); }
    };
    read();
    const onFocus = () => read();
    const onStorage = (e) => { if (!e || (e.key && (e.key.startsWith('progreso:') || e.key === 'lastMission'))) read(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const baseBtn = "px-4 py-2 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg";
  const visibleMenu = menu.filter((item) => {
    if (item.requiere_auth && !token) return false;
    if (item.solo_invited && token) return false;
    return true;
  });

  const getLabel = (item) => {
    if (item.ruta === "/perfil" && token) {
      return user?.username || item.etiqueta;
    }
    return item.etiqueta;
  };

  const getClasses = (ruta) => `${baseBtn} ${BUTTON_STYLES[ruta] || "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"}`;

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-b-4 border-cyan-400/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre del juego */}
          <Link
            to="/"
            className="flex items-center space-x-3 hover:scale-110 transition-all duration-500 group"
            onMouseEnter={() => playSound("hover")}
            onClick={() => playSound("click")}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-slate-700 via-emerald-700 to-cyan-700 rounded-full flex items-center justify-center shadow-2xl ring-2 ring-cyan-400/70 group-hover:ring-4 group-hover:shadow-cyan-500/40">
              <span className="text-3xl font-bold text-white drop-shadow-lg">E</span>
            </div>
            <div className="text-white group-hover:scale-105 transition-transform duration-300">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                Ecuations-D
              </h1>
              <p className="text-sm text-cyan-200 font-semibold">Software Educativo</p>
            </div>
          </Link>

          {/* Menú de navegación */}
          <div className="flex space-x-2">
            {visibleMenu.map((item) => (
              <Link
                key={`${item.id ?? item.ruta}-${item.ruta}`}
                className={getClasses(item.ruta)}
                to={item.ruta}
                onMouseEnter={() => playSound("hover")}
                onClick={() => playSound("click")}
              >
                {getLabel(item)}
              </Link>
            ))}
            {token && (
              <button
                className={`${baseBtn} bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800`}
                onClick={() => {
                  playSound("click");
                  logout();
                }}
              >
                Salir
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
