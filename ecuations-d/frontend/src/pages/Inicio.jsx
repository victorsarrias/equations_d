import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSound } from "../hooks/useSound";
import { getHomeContent } from "../api";

const FALLBACK_HERO = {
  titulo: "Ecuations-D",
  subtitulo: "",
  contenido:
    "Un juego educativo para aprender ecuaciones diferenciales en un entorno de aventuras. Explora mundos, reúne pistas y arma soluciones paso a paso con ayuda de tus aliados.",
  cta_text: "Jugar ahora",
  cta_url: "/aventuras"
};

const FALLBACK_HERO_SECONDARY = {
  titulo: "Conoce a los personajes",
  subtitulo: "",
  cta_text: "Conoce a los personajes",
  cta_url: "#personajes"
};

const FALLBACK_PERSONAJES = [
  {
    slug: "dif",
    nombre: "Dif",
    rol: "Explorador",
    descripcion:
      "Marciano galáctico que viaja entre mundos. Aprende resolviendo retos y recolectando elementos que forman la solución.",
    imagen_url: "/assets/personajes/dif.png"
  },
  {
    slug: "giro",
    nombre: "Giro",
    rol: "Asistente",
    descripcion:
      "Robot consejero que ofrece pistas contextuales cuando presionas \"Llamar a Giro\".",
    imagen_url: "/assets/personajes/giro.png"
  },
  {
    slug: "pilot",
    nombre: "Pilot",
    rol: "Apoyo aéreo",
    descripcion:
      "Compañero en nave. Brinda apoyo y suministros durante los niveles para que avances sin quedar a la deriva.",
    imagen_url: "/assets/personajes/pilot.png"
  }
];

const CHARACTER_STYLES = {
  dif: {
    card: "border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/80 to-cyan-950/60 hover:shadow-cyan-500/25",
    overlay: "from-cyan-800/40 to-cyan-600/20",
    title: "text-cyan-300",
    body: "text-cyan-100"
  },
  giro: {
    card: "border-2 border-indigo-400/50 bg-gradient-to-br from-slate-900/80 to-indigo-950/60 hover:shadow-indigo-500/25",
    overlay: "from-indigo-800/40 to-sky-700/20",
    title: "text-sky-300",
    body: "text-sky-100"
  },
  pilot: {
    card: "border-2 border-lime-400/50 bg-gradient-to-br from-stone-900/80 to-emerald-950/60 hover:shadow-lime-500/25",
    overlay: "from-emerald-800/40 to-emerald-600/20",
    title: "text-lime-300",
    body: "text-emerald-100"
  }
};

const DEFAULT_CHARACTER_STYLE = {
  card: "border-2 border-slate-500/40 bg-gradient-to-br from-slate-900/80 to-slate-800/80 hover:shadow-cyan-500/10",
  overlay: "from-slate-800/40 to-slate-600/20",
  title: "text-sky-200",
  body: "text-slate-200"
};

const renderCTA = ({ url, text, playSoundFn }) => {
  if (!url || !text) return null;
  if (url.startsWith("#")) {
    return (
      <a
        href={url}
        className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-500/50"
        onMouseEnter={() => playSoundFn("hover")}
        onClick={() => playSoundFn("click")}
      >
        {text}
      </a>
    );
  }
  return (
    <Link
      to={url}
      className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm text-white font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-emerald-500/40"
      onMouseEnter={() => playSoundFn("hover")}
      onClick={() => playSoundFn("click")}
    >
      {text}
    </Link>
  );
};

export default function Inicio() {
  const { playSound } = useSound();
  const { token } = useAuth();
  const [sections, setSections] = useState([]);
  const [personajes, setPersonajes] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [lastMission, setLastMission] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getHomeContent();
        if (!active) return;
        setSections(data.sections ?? []);
        setPersonajes(data.personajes ?? []);
      } catch (err) {
        if (!active) return;
        console.error("No se pudo cargar la página de inicio:", err);
        setFetchError("Mostrando contenido predeterminado.");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Leer misión en curso para mostrar CTA "Continuar"
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
    return () => { window.removeEventListener('focus', onFocus); window.removeEventListener('storage', onStorage); };
  }, []);

  const hero = sections.find((s) => s.slug === "hero") || FALLBACK_HERO;
  const heroSecondary = sections.find((s) => s.slug === "hero-secundario") || FALLBACK_HERO_SECONDARY;
  const personajesList = personajes.length ? personajes : FALLBACK_PERSONAJES;

  return (
    <div className="mx-auto max-w-6xl p-6 text-white">
      {fetchError && (
        <div className="mb-4 rounded-lg border border-yellow-400/60 bg-yellow-900/30 px-4 py-2 text-sm text-yellow-200">
          {fetchError}
        </div>
      )}

      {/* Layout: Izquierda hero, derecha personajes */}
      <section className="grid gap-8 lg:grid-cols-3">
        {/* Panel izquierdo: Hero */}
        <article className="rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-br from-slate-900/85 to-slate-800/70 p-6 backdrop-blur-sm shadow-2xl">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent mb-3">
            {hero.titulo}
          </h1>
          {hero.subtitulo && (
            <p className="text-sm text-teal-200 font-semibold mb-2">{hero.subtitulo}</p>
          )}
          <p className="mt-1 max-w-3xl text-sm text-slate-200 leading-relaxed">
            {hero.contenido}
          </p>
          <div className="mt-5 flex gap-3 flex-wrap">
            {renderCTA({ url: hero.cta_url, text: hero.cta_text, playSoundFn: playSound })}
            {renderCTA({ url: heroSecondary.cta_url, text: heroSecondary.cta_text, playSoundFn: playSound })}
            {token && lastMission && (
              <Link
                to={`/jugar?tema=${encodeURIComponent(lastMission)}&resume=1`}
                className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-amber-500/40"
                onMouseEnter={() => playSound("hover")}
                onClick={() => playSound("click")}
              >
                Continuar
              </Link>
            )}
          </div>
        </article>

        {/* Panel derecho: Encabezado + 3 tarjetas */}
        <article className="lg:col-span-2 rounded-2xl border-2 border-cyan-400/30 bg-gradient-to-br from-slate-900/60 to-slate-800/60 p-6 backdrop-blur-sm shadow-2xl">
          <h2 className="text-3xl font-bold mb-1 text-center bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
            {heroSecondary.titulo || "Conoce a los personajes"}
          </h2>
          <p className="text-center text-slate-200 text-sm mb-4">
            {(heroSecondary.subtitulo && heroSecondary.subtitulo.trim()) || personajesList.slice(0,3).map(p => p.nombre).join(", ")}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {personajesList.slice(0,3).map((personaje) => {
              const styles = CHARACTER_STYLES[personaje.slug] || DEFAULT_CHARACTER_STYLE;
              return (
                <article
                  key={personaje.slug || personaje.nombre}
                  className={`overflow-hidden rounded-2xl backdrop-blur-sm shadow-xl transition-all duration-300 hover:scale-105 ${styles.card}`}
                >
                  <div className={`flex h-56 items-end justify-center bg-gradient-to-t ${styles.overlay} sm:h-64`}>
                    <img
                      src={personaje.imagen_url || "/assets/personajes/placeholder.png"}
                      alt={personaje.nombre}
                      className="max-h-44 w-auto object-contain drop-shadow-2xl sm:max-h-52 character-anim character-hover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/personajes/placeholder.png";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className={`text-lg font-bold mb-1 ${styles.title}`}>
                      {personaje.nombre} - {personaje.rol}
                    </h3>
                    <p className={`${styles.body} text-sm leading-relaxed`}>
                      {personaje.descripcion}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
