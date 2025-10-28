import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import GameSimple from "../components/GameSimple.jsx";
import Game from "../components/Game";
import { getMisionDetail, completeMision } from "../api";
import { usePreloadImages } from "../hooks/usePreloadImages";
import IntegralBoard from "../components/IntegralBoard.jsx";

const normalizeMissionDetail = (data) => {
  if (!data) return null;
  return {
    id: data.id,
    title: data.titulo,
    description: data.descripcion || "",
    environmentKey: data.environment_key || "default",
    steps: (data.pasos || []).map((p) => ({
      step: p.paso,
      title: p.titulo,
      expression: p.expresion
    })),
    collectibles: (data.collectibles || []).map((c) => ({
      id: c.orden,
      x: c.pos_x,
      y: c.pos_y,
      symbol: c.simbolo,
      type: c.tipo,
      value: c.valor
    })),
    enemies: (data.enemigos || []).map((e) => ({
      id: e.orden,
      x: e.pos_x,
      y: e.pos_y,
      type: e.tipo,
      speed: Number(e.velocidad)
    })),
    platforms: (data.plataformas || []).map((p) => ({
      id: p.orden,
      x: p.pos_x,
      y: p.pos_y,
      width: p.ancho,
      height: p.alto
    }))
  };
};

export default function Jugar() {
  class ErrorBoundary extends React.Component {
    constructor(props){ super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(){ return { hasError: true }; }
    componentDidCatch(err, info){ console.error('Error en GameSimple:', err, info); }
    render(){
      if (this.state.hasError) {
        const { tema, resume, onComplete, onExit } = this.props;
        return (
          <Game missionId={tema} resume={resume} onComplete={onComplete} onExit={onExit} />
        );
      }
      return this.props.children;
    }
  }
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const tema = sp.get("tema") || "empezando-aventura";
  const resume = sp.get("resume") === '1';
  const [gameMode, setGameMode] = useState("platform"); // "platform" o "traditional"
  const [missionData, setMissionData] = useState(null);
  const [missionLoading, setMissionLoading] = useState(true);
  const [missionError, setMissionError] = useState("");
  const av = sp.get("av") || null;
  const [showBoard, setShowBoard] = useState(Boolean(av));

  const getPairsFor = (slug) => {
    const base = [
      { key: 'p1', integral: '∫ x dx', solution: 'x^2/2 + C' },
      { key: 'p2', integral: '∫ cos x dx', solution: 'sin x + C' },
      { key: 'p3', integral: '∫ e^x dx', solution: 'e^x + C' },
      { key: 'p4', integral: '∫ 1/x dx', solution: 'ln|x| + C' },
      { key: 'p5', integral: '∫ 2x dx', solution: 'x^2 + C' },
      { key: 'p6', integral: '∫ 0 dx', solution: 'C' },
    ];
    if (!slug) return base.slice(0, 6);
    if (slug.includes('bifur') || slug.includes('fase')) {
      return [
        { key: 'q1', integral: '∫ k dx', solution: 'kx + C' },
        { key: 'q2', integral: '∫ 1/(1+x^2) dx', solution: 'arctan x + C' },
        { key: 'q3', integral: '∫ y\' dt', solution: 'y + C' },
      ];
    }
    return base.slice(0, 6);
  };

  // Preload opcional (desactivado por defecto). Activable con ?preload=1
  const ENABLE_PRELOAD_DEFAULT = false;
  const enablePreload = (sp.get("preload") === '1') || ENABLE_PRELOAD_DEFAULT;

  useEffect(() => {
    let active = true;
    setMissionLoading(true);
    setMissionError("");

    (async () => {
      try {
        const data = await getMisionDetail(tema);
        if (!active) return;
        setMissionData(normalizeMissionDetail(data));
      } catch (err) {
        if (!active) return;
        console.error("Error cargando misión:", err);
        setMissionData(null);
        setMissionError("No se pudo cargar la misión en línea. Se usarán datos locales.");
      } finally {
        if (active) setMissionLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [tema]);

  // Derivar assets de imagen a precargar (entorno + decor)
  const preloadUrls = useMemo(() => {
    const env = (missionData && missionData.environmentKey) || "default";
    const envImage = env === 'cosmic' ? '/assets/aventuras/galaxia.jpg' : '/assets/aventuras/valle.jpg';
    return [
      envImage,
      '/assets/decor/nave-blue.png',
      '/assets/decor/base_florante.png',
    ];
  }, [missionData]);

  const { loading: preloading, progress } = usePreloadImages(preloadUrls, { enabled: enablePreload });

  // Guardar la última misión para permitir "Continuar" desde el menú/portada
  useEffect(() => {
    try {
      localStorage.setItem('lastMission', tema);
      const key = `progreso:${tema}`;
      const current = localStorage.getItem(key);
      if (current !== 'completado') {
        localStorage.setItem(key, 'en-curso');
      }
    } catch {}
  }, [tema]);

  const handleGameComplete = async () => {
    try {
      // Persistir en backend (si hay sesión) y en localStorage
      await completeMision(tema).catch(() => {});
    } catch {}
    try { localStorage.setItem(`progreso:${tema}`, "completado"); } catch {}
    navigate("/misiones");
  };

  const handleGameExit = () => {
    navigate("/misiones");
  };

  // Si el tablero aparece (por venir desde Aventuras), autociérralo a los 5s para no bloquear
  useEffect(() => {
    if (!showBoard) return;
    const t = setTimeout(() => setShowBoard(false), 5000);
    return () => clearTimeout(t);
  }, [showBoard]);

  return (
    <div className="fixed inset-0">
      {/* Mensajes de estado */}
      {missionLoading && (
        <div className="absolute top-4 right-4 z-50 rounded bg-slate-900/80 px-4 py-2 text-sm text-slate-200">
          Cargando misión...
        </div>
      )}
      {missionError && !missionLoading && (
        <div className="absolute top-4 right-4 z-50 max-w-sm rounded border border-yellow-400/60 bg-yellow-900/70 px-4 py-2 text-sm text-yellow-100">
          {missionError}
        </div>
      )}

      {/* Selector de modo de juego */}
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 flex gap-2">
          <button
            className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
              gameMode === "platform"
                ? "bg-blue-600 text-white"
                : "bg-slate-600 text-slate-300 hover:bg-slate-500"
            }`}
            onClick={() => setGameMode("platform")}
          >
            Plataforma
          </button>
          <button
            className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
              gameMode === "traditional"
                ? "bg-blue-600 text-white"
                : "bg-slate-600 text-slate-300 hover:bg-slate-500"
            }`}
            onClick={() => setGameMode("traditional")}
          >
            Tradicional
          </button>
        </div>
      </div>

      {/* Juego de plataforma */}
      {gameMode === "platform" && (!preloading) && (
        <ErrorBoundary tema={tema} resume={resume} onComplete={handleGameComplete} onExit={handleGameExit}>
          <GameSimple
            missionId={tema}
            missionData={missionData}
            resume={resume}
            onComplete={handleGameComplete}
            onExit={handleGameExit}
          />
        </ErrorBoundary>
      )}

      {/* Tablero de integrales al iniciar desde Aventuras (RF-013) */}
      {showBoard && (
        <div className="absolute inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowBoard(false)} />
          <div className="relative z-10 w-full max-w-3xl mx-4">
            <div className="mb-2 text-white text-lg font-bold">Tablero de integrales</div>
            <div className="rounded-2xl border-2 border-cyan-400/40 bg-slate-900/90 backdrop-blur-md p-4">
              <IntegralBoard pairs={getPairsFor(av || tema)} cols={3} />
              <div className="mt-4 flex justify-end">
                <button onClick={() => setShowBoard(false)} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Continuar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de precarga opcional */}
      {gameMode === "platform" && enablePreload && preloading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-50">
          <div className="rounded-xl border-2 border-cyan-400/50 bg-slate-800/80 px-6 py-4 text-white text-sm">
            Cargando recursos... {Math.round(progress * 100)}%
          </div>
        </div>
      )}

      {/* Juego tradicional (placeholder) */}
      {gameMode === "traditional" && (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Modo Tradicional</h2>
            <p className="mb-4">Próximamente disponible</p>
            <button
              onClick={() => setGameMode("platform")}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Cambiar a Modo Plataforma
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
