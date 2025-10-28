import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSound } from '../hooks/useSound';

export default function Ayuda() {
  const imgSrc = "/assets/personajes/dif_matematico_1.png";
  const fallback = "/assets/personajes/pilot.png";
  const { playSound } = useSound();
  const [showDemo, setShowDemo] = useState(false);
  const tips = useMemo(() => ([
    '💡 Recuerda que puedes llamar a Giro si te quedas atascado en una ecuación.',
    '⚡ Evita a los enemigos rojos: representan ecuaciones con errores de signo.',
    '🎯 Lee el panel de avance para saber qué te falta por completar.',
  ]), []);
  const [tipIndex, setTipIndex] = useState(0);
  const [typed, setTyped] = useState('');

  // Animación de escritura para los consejos de Giro
  useEffect(() => {
    let i = 0;
    let active = true;
    const text = tips[tipIndex];
    setTyped('');

    function typeNext() {
      if (!active) return;
      if (i <= text.length) {
        setTyped(text.slice(0, i));
        i += 1;
        setTimeout(typeNext, 35);
      } else {
        setTimeout(() => {
          if (!active) return;
          setTipIndex((idx) => (idx + 1) % tips.length);
        }, 1400);
      }
    }
    typeNext();
    return () => { active = false; };
  }, [tipIndex, tips]);

  return (
    <div className="max-w-6xl mx-auto p-6 text-white space-y-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Ayuda</h1>

      {/* Intro con imagen y explicación */}
      <div className="grid md:grid-cols-2 gap-6 items-center bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-pink-400/40 p-6">
        <div className="flex justify-center">
          <img
            src={imgSrc}
            alt="Asesor"
            onError={(e) => { e.currentTarget.src = fallback; }}
            className="max-h-80 object-contain drop-shadow-xl"
          />
        </div>
        <div className="leading-relaxed text-slate-200">
          <h2 className="text-2xl font-semibold mb-3">¿En qué consiste Ecuations‑D?</h2>
          <p>
            Ecuations‑D es una aplicación educativa con enfoque lúdico para aprender
            ecuaciones diferenciales. Exploras misiones, ejemplos y niveles para practicar conceptos
            como separación de variables, lineales de primer orden y análisis cualitativo. A medida que avanzas
            desbloqueas retos en el modo Jugar y puedes seguir tu progreso.
          </p>
          <ul className="list-disc ml-6 mt-3 space-y-1 text-slate-300">
            <li><b>Misiones:</b> actividades guiadas paso a paso.</li>
            <li><b>Ejemplos:</b> material de referencia con explicaciones.</li>
            <li><b>Niveles:</b> retos rápidos para afianzar conceptos.</li>
            <li><b>Jugar:</b> modo interactivo con objetivos y coleccionables.</li>
          </ul>
        </div>
      </div>

      {/* 1. Guía interactiva paso a paso */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-fuchsia-400/40 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">1. Guía interactiva</h2>
          <button
            className="px-4 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 font-semibold"
            onClick={() => { setShowDemo((v) => !v); playSound('click'); }}
          >
            {showDemo ? 'Ocultar demostración' : 'Ver demostración'}
          </button>
        </div>
        {showDemo && (
          <DemoModalPlay onClose={() => setShowDemo(false)} />
        )}
      </section>

      {/* 2. Explicación de paneles */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-cyan-400/40 p-6">
        <h2 className="text-2xl font-semibold mb-4">2. Paneles e íconos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card icon="🪙" title="Monedas" text="Recompensa por recolectar y resolver pasos." />
          <Card icon="❤️" title="Vidas" text="Intentos disponibles en el nivel." />
          <Card icon="∑" title="Ecuaciones" text="Objetivos matemáticos completados." />
          <Card icon="🗝️" title="Tesoros" text="Coleccionables especiales del mundo." />
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <Card icon="⚡" title="Energía" text="Estado del personaje/jugador en el HUD." />
          <Card icon="📈" title="Progreso" text="Avance total del nivel o misión." />
          <Card icon="🎚️" title="Dificultad" text="Nivel de reto actual." />
        </div>
      </section>

      {/* 3. Consejos de Giro */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-emerald-400/40 p-6">
        <h2 className="text-2xl font-semibold mb-3">3. Consejos de Giro</h2>
        <div className="relative bg-slate-700/50 rounded-lg p-4">
          <div className="text-sm text-slate-100 whitespace-pre-wrap">{typed}</div>
          <div className="absolute -top-3 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-slate-700/50" />
        </div>
      </section>

      {/* 4. Diccionario */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-indigo-400/40 p-6">
        <h2 className="text-2xl font-semibold mb-4">4. Diccionario de símbolos</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Glossary sym="dy/dx" desc="Derivada de y con respecto a x." />
          <Glossary sym="k" desc="Constante de proporcionalidad." />
          <Glossary sym="C" desc="Constante de integración." />
        </div>
      </section>

      {/* 5. Modos de juego */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-yellow-400/40 p-6">
        <h2 className="text-2xl font-semibold mb-4">5. Modos de juego</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card icon="🧩" title="Ejemplos" text="Modo de práctica y referencia." />
          <Card icon="⚔️" title="Misiones" text="Retos guiados por niveles." />
          <Card icon="🚀" title="Jugar" text="Combate interactivo con ecuaciones." />
        </div>
      </section>

      {/* 6. Créditos / Historia */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-rose-400/40 p-6">
        <h2 className="text-2xl font-semibold mb-3">6. Historia y créditos</h2>
        <p className="text-slate-200">
          Dif, Giro y Pilot exploran mundos matemáticos para restaurar el equilibrio de las ecuaciones.
          Este proyecto educativo busca hacer el aprendizaje más ameno combinando juego y teoría.
        </p>
        <p className="text-slate-400 text-sm mt-2">Versión 1.0 — Colaboradores: equipo académico y desarrollo.</p>
      </section>

      {/* 7. Centro de práctica */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-teal-400/40 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">7. Centro de práctica</h2>
          <p className="text-slate-300">Entra en un entorno sin enemigos para practicar mecánicas básicas.</p>
        </div>
        <Link to="/jugar" className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 font-semibold">Ir a Jugar</Link>
      </section>
    </div>
  );
}

// Versión interactiva que responde a teclado (A/D/W/Space)
function DemoModalPlay({ onClose }) {
  const areaRef = useRef(null);
  const reqRef = useRef(0);
  const keys = useRef({ left: false, right: false, up: false, space: false });
  const size = 36;
  const speed = 180; // px/s
  const jump = 360; // px/s
  const gravity = 900; // px/s^2

  const [state, setState] = useState({ x: 20, y: 0, vy: 0, onGround: true, collected: false });

  useEffect(() => {
    function onKeyDown(e) {
      const k = (e.key || '').toLowerCase();
      if (["arrowup", "arrowleft", "arrowright", " ", "w", "a", "d"].includes(k) || e.code === 'Space') e.preventDefault();
      if (k === 'a' || k === 'arrowleft') keys.current.left = true;
      if (k === 'd' || k === 'arrowright') keys.current.right = true;
      if (k === 'w' || k === 'arrowup') keys.current.up = true;
      if (k === ' ' || e.code === 'Space') keys.current.space = true;
    }
    function onKeyUp(e) {
      const k = (e.key || '').toLowerCase();
      if (k === 'a' || k === 'arrowleft') keys.current.left = false;
      if (k === 'd' || k === 'arrowright') keys.current.right = false;
      if (k === 'w' || k === 'arrowup') keys.current.up = false;
      if (k === ' ' || e.code === 'Space') keys.current.space = false;
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  useEffect(() => {
    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const el = areaRef.current;
      if (el) {
        const w = el.clientWidth;
        const h = el.clientHeight;
        const ground = h - 14;
        setState((s) => {
          let { x, y, vy, onGround, collected } = s;
          // Horizontal
          let vx = 0;
          if (keys.current.left) vx -= speed;
          if (keys.current.right) vx += speed;
          x += vx * dt;
          x = Math.max(6, Math.min(w - size - 6, x));

          // Vertical / salto
          const groundY = ground - size;
          if (onGround && keys.current.up) { vy = -jump; onGround = false; }
          if (!onGround) {
            vy += gravity * dt; y += vy * dt;
            if (y >= groundY) { y = groundY; vy = 0; onGround = true; }
          } else { y = groundY; }

          // Moneda
          const coinX = w - 80; const coinY = ground - 22;
          const nearCoin = Math.abs(x - coinX) < 40 && Math.abs((y + size) - coinY) < 40;
          if (!collected && nearCoin && keys.current.space) collected = true;

          return { x, y, vy, onGround, collected };
        });
      }
      reqRef.current = requestAnimationFrame(loop);
    }
    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, []);

  const coinStyle = (container) => {
    const w = container?.clientWidth || 400;
    const h = container?.clientHeight || 200;
    const ground = h - 14;
    return { left: Math.max(0, w - 80) + 'px', top: Math.max(0, ground - 22) + 'px' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[90vw] max-w-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-fuchsia-400/50 rounded-xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 px-3 py-1 rounded bg-slate-700 hover:bg-slate-600">Cerrar</button>
        <h3 className="text-xl font-semibold mb-4">Demostración</h3>
        <div className="grid md:grid-cols-2 gap-4 items-center">
          <div className="rounded-lg bg-slate-700/60 p-4">
            <p className="text-slate-200">Controles básicos:</p>
            <ul className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-100">
              <li>W/↑: Saltar</li>
              <li>A/←: Izquierda</li>
              <li>D/→: Derecha</li>
              <li>Espacio: Interactuar</li>
            </ul>
            <p className="mt-3 text-slate-300">Ejemplo: “Pulsa W para saltar sobre la variable x(t)”.</p>
          </div>
          <div ref={areaRef} className="relative h-48 rounded-lg bg-slate-700/40 overflow-hidden">
            {/* Suelo */}
            <div className="absolute bottom-3 left-3 right-3 h-3 bg-slate-500/60 rounded" />
            {/* Jugador */}
            <div className="absolute w-9 h-9 bg-emerald-500/90 rounded" style={{ left: state.x, top: state.y }} />
            {/* Moneda */}
            {!state.collected && (
              <div className="absolute w-5 h-5 bg-amber-300 rounded-full shadow" style={coinStyle(areaRef.current)} title="Acércate y pulsa Espacio" />
            )}
            {state.collected && (<div className="absolute top-3 right-3 text-xs bg-emerald-700/70 px-2 py-1 rounded">¡Moneda!</div>)}
            <div className="absolute top-3 right-3 text-xs bg-slate-800/70 px-2 py-1 rounded">Demo</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, text }) {
  return (
    <div className="rounded-lg bg-slate-700/50 p-4 border border-slate-600/50">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-semibold text-slate-100">{title}</div>
      <div className="text-slate-300 text-sm">{text}</div>
    </div>
  );
}

function Glossary({ sym, desc }) {
  return (
    <div className="rounded-lg bg-slate-700/50 p-4 border border-slate-600/50">
      <div className="font-mono text-lg text-sky-200">{sym}</div>
      <div className="text-slate-300 text-sm">{desc}</div>
    </div>
  );
}

function DemoModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[90vw] max-w-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-fuchsia-400/50 rounded-xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 px-3 py-1 rounded bg-slate-700 hover:bg-slate-600">Cerrar</button>
        <h3 className="text-xl font-semibold mb-4">Demostración</h3>
        <div className="grid md:grid-cols-2 gap-4 items-center">
          <div className="rounded-lg bg-slate-700/60 p-4">
            <p className="text-slate-200">Controles básicos:</p>
            <ul className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-100">
              <li>W/↑: Saltar</li>
              <li>A/←: Izquierda</li>
              <li>D/→: Derecha</li>
              <li>Espacio: Interactuar</li>
            </ul>
            <p className="mt-3 text-slate-300">Ejemplo: “Pulsa W para saltar sobre la variable x(t)”.</p>
          </div>
          <div className="relative h-48 rounded-lg bg-slate-700/40 overflow-hidden">
            <div className="absolute bottom-4 left-4 w-12 h-12 bg-emerald-500/80 rounded-md animate-bounce" />
            <div className="absolute bottom-5 left-24 right-5 h-3 bg-slate-500/60 rounded" />
            <div className="absolute top-3 right-3 text-xs bg-slate-800/70 px-2 py-1 rounded">Demo</div>
          </div>
        </div>
      </div>
    </div>
  );
}
