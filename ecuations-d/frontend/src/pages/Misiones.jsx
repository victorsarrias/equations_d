import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { misiones as fallbackMissions } from "../data/misiones";
import { getMisiones, getMisionDetail } from "../api";
import { useAuth } from "../context/AuthContext.jsx";

const Pill = ({ estado }) => {
  const map = {
    completado: "bg-gradient-to-r from-green-500 to-emerald-600",
    "en-curso": "bg-gradient-to-r from-yellow-500 to-amber-600",
    disponible: "bg-gradient-to-r from-cyan-500 to-blue-600",
    bloqueado: "bg-gradient-to-r from-slate-600 to-slate-700",
    jugar: "bg-gradient-to-r from-purple-600 to-pink-600"
  };
  const labelMap = {
    completado: "COMPLETADO",
    "en-curso": "EN CURSO",
    disponible: "DISPONIBLE",
    bloqueado: "BLOQUEADO",
    jugar: "JUGAR"
  };

  const className = map[estado] || map.bloqueado;
  const label = labelMap[estado] || estado?.toUpperCase?.() || "SIN ESTADO";

  return (
    <span className={`px-2 py-1 text-xs rounded text-white ${className}`}>
      {label}
    </span>
  );
};

export default function Misiones() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tick, setTick] = useState(0);
  const [missions, setMissions] = useState(fallbackMissions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // Fuerza refresco al volver a la pestaña (para leer localStorage de nuevo)
  useEffect(() => {
    const onFocus = () => setTick((x) => x + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getMisiones();
        if (!active) return;
        if (Array.isArray(data) && data.length) {
          const mapped = data.map((m) => ({
            id: m.id,
            titulo: m.titulo,
            estado: (m.user_completed ? 'completado' : (m.estado_default || 'bloqueado')),
            descripcion: m.descripcion || "",
            dificultad: m.dificultad || "facil",
            environmentKey: m.environment_key || "default",
            temaSlug: m.tema_slug || null,
            temaTitulo: m.tema_titulo || null, prerequisitos: Array.isArray(m.prerequisitos) ? m.prerequisitos : []
          }));
          setMissions(mapped);
          setError("");
        } else {
          setMissions([]);
          setError("No hay misiones disponibles.");
        }
      } catch (err) {
        if (!active) return;
        console.error("Error cargando misiones:", err);
        setMissions(fallbackMissions);
        setError("No se pudo cargar la lista en linea. Mostrando datos locales.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Aplica progreso guardado a los estados
  const items = useMemo(
    () =>
      missions.map((m) => {
        const prog = localStorage.getItem(`progreso:${m.id}`); // 'en-curso' | 'completado'
        const hasSave = !!(token && localStorage.getItem(`resume:${m.id}`));
        let estado = m.estado;
        if (prog === 'completado') estado = 'completado';
        else if (prog === 'en-curso') estado = 'en-curso';

        // allPrereqDone: todos los prerequisitos están completados
        const prereqs = Array.isArray(m.prerequisitos) ? m.prerequisitos : [];
        const allPrereqDone = prereqs.length
          ? prereqs.every(pr => localStorage.getItem(`progreso:${pr.id}`) === 'completado')
          : true;

        // Leer 
        let lastSummary = null;
        try {
          const raw = localStorage.getItem(`summary:${m.id}`);
          if (raw) lastSummary = JSON.parse(raw);
        } catch {}

        return { ...m, estado, hasSave, allPrereqDone, lastSummary };
      }),
    [missions, tick, token]
  );

  // Mapa de desbloqueos: qué misiones se habilitan al completar cada misión
  const unlocksMap = useMemo(() => {
    const map = new Map();
    for (const m of missions) {
      const prereqs = Array.isArray(m.prerequisitos) ? m.prerequisitos : [];
      for (const pr of prereqs) {
        const list = map.get(pr.id) || [];
        list.push({ id: m.id, titulo: m.titulo });
        map.set(pr.id, list);
      }
    }
    return map;
  }, [missions]);

  const handlePlay = (missionId) => {
    if (!token) {
      navigate(`/auth`);
      return;
    }
    localStorage.setItem(`progreso:${missionId}`, "en-curso");
    navigate(`/jugar?tema=${missionId}`);
  };

  const handleResume = (missionId) => {
    if (!token) {
      navigate(`/auth`);
      return;
    }
    navigate(`/jugar?tema=${missionId}&resume=1`);
  };

  const openDetail = async (missionId) => {
    setDetailId(missionId);
    setDetailData(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const data = await getMisionDetail(missionId);
      setDetailData(data);
    } catch (e) {
      setDetailError(e.message || "No se pudo cargar el detalle de la misión");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailId(null);
    setDetailData(null);
    setDetailError("");
    setDetailLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
        Misiones
      </h1>

      {loading && (
        <div className="mb-4 text-slate-200">Cargando misiones...</div>
      )}
      {error && (
        <div className="mb-4 rounded border border-yellow-400/40 bg-yellow-900/40 px-3 py-2 text-sm text-yellow-100">
          {error}
        </div>
      )}

      <div className="rounded-2xl p-4 grid gap-3 bg-gradient-to-br from-purple-900/60 to-pink-900/60 border-2 border-purple-400/30 backdrop-blur-sm">
        {items.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between bg-gradient-to-r from-slate-800/70 to-slate-900/70 hover:from-purple-800/60 hover:to-pink-800/60 border border-purple-400/20 rounded-xl p-3 transition transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/20"
          >
              <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold flex items-center justify-center shadow">
                ★
              </div>
                <div>
                  <p className="font-medium text-white">{m.titulo}</p>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <Pill estado={m.estado} />
                    {m.dificultad && (
                      <span className="px-2 py-0.5 text-[11px] rounded bg-slate-700 text-slate-200 border border-slate-500/50">
                        {m.dificultad}
                      </span>
                    )}
                    {m.prerequisitos && m.prerequisitos.length > 0 && m.allPrereqDone && (
                      <span className="px-2 py-0.5 text-[11px] rounded bg-emerald-700 text-emerald-100 border border-emerald-400/50">Prereqs OK</span>
                    )}
                  </div>
                  {m.temaTitulo && (
                    <p className="text-[11px] text-cyan-200 mt-1">Tema: {m.temaTitulo}</p>
                  )}
                  {m.descripcion && (
                    <p className="text-xs text-slate-300 mt-1 max-w-md">{m.descripcion}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    Prerrequisitos: {m.prerequisitos && m.prerequisitos.length ? m.prerequisitos.map(pr => pr.titulo || pr.id).join(', ') : 'Ninguno'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Desbloquea: {unlocksMap.get(m.id)?.length ? unlocksMap.get(m.id).map(u => u.titulo || u.id).join(', ') : '—'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Recompensas: {m.recompensas ? `Monedas ${m.recompensas.monedas || 0}${(m.recompensas.vidas||0) ? ", Vidas "+m.recompensas.vidas : ""}${(m.recompensas.armas||0) ? ", Armas "+m.recompensas.armas : ""}` : 'No definidas'}
                  </p>
                  {m.lastSummary && (
                    <>
                      <div className="mt-2 text-[11px] text-slate-300">
                        Última partida: {new Date(m.lastSummary.ts || Date.now()).toLocaleString()}
                      </div>
                      <div className="mt-1 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                        <div className="bg-slate-700/50 border border-cyan-400/30 rounded px-2 py-1">
                          <div className="text-cyan-300 font-semibold">Monedas</div>
                          <div className="text-white font-bold">{m.lastSummary.coins ?? 0}</div>
                        </div>
                        <div className="bg-slate-700/50 border border-indigo-400/30 rounded px-2 py-1">
                          <div className="text-indigo-300 font-semibold">Vidas</div>
                          <div className="text-white font-bold">{m.lastSummary.lives ?? 0}</div>
                        </div>
                        <div className="bg-slate-700/50 border border-violet-400/30 rounded px-2 py-1">
                          <div className="text-violet-300 font-semibold">Ecuaciones</div>
                          <div className="text-white font-bold">{m.lastSummary.equationsSolved ?? 0}</div>
                        </div>
                        <div className="bg-slate-700/50 border border-emerald-400/30 rounded px-2 py-1">
                          <div className="text-emerald-300 font-semibold">Tesoros</div>
                          <div className="text-white font-bold">{m.lastSummary.treasures ?? 0}</div>
                        </div>
                        <div className="bg-slate-700/50 border border-amber-400/30 rounded px-2 py-1 col-span-2 sm:col-span-1">
                          <div className="text-amber-300 font-semibold">Munición</div>
                          <div className="text-white font-bold">{m.lastSummary.ammo ?? 0}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
            </div>

            <div className="flex gap-2">
              <button
                className="px-3 py-2 rounded-md text-white font-semibold shadow bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700"
                onClick={() => openDetail(m.id)}
                title="Ver detalle de la misión"
              >
                Detalle
              </button>
              <button
                className={`px-4 py-2 rounded-md text-white font-semibold shadow ${
                  m.estado === "bloqueado"
                    ? "bg-gradient-to-r from-slate-600 to-slate-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/40"
                }`}
                disabled={m.estado === "bloqueado"}
                onClick={() => handlePlay(m.id)}
              >
                {m.estado === "bloqueado" ? "BLOQUEADO" : "JUGAR"}
              </button>

              {m.hasSave && m.estado !== 'completado' && (
                <button
                  className="px-4 py-2 rounded-md text-white font-semibold shadow bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  onClick={() => handleResume(m.id)}
                  title="Continuar donde lo dejaste"
                >
                  CONTINUAR
                </button>
              )}
            </div>
          </div>
        ))}

        {!items.length && !loading && (
          <div className="text-slate-200 text-sm">
            No hay misiones para mostrar por el momento.
          </div>
        )}
      </div>
      {/* Modal Detalle */}
      {detailId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeDetail} />
          <div className="relative z-10 w-full max-w-2xl mx-4 rounded-2xl border-2 border-cyan-400/40 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">Detalle de misión</h2>
              <button className="text-slate-300 hover:text-white" onClick={closeDetail}>✕</button>
            </div>
            {detailLoading && (
              <div className="mt-3 text-slate-200">Cargando detalle...</div>
            )}
            {detailError && (
              <div className="mt-3 rounded border border-yellow-400/50 bg-yellow-900/40 px-3 py-2 text-sm text-yellow-100">{detailError}</div>
            )}
            {!detailLoading && !detailError && detailData && (
              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-xl font-semibold">{detailData.titulo}</div>
                  {detailData.tema_titulo && (
                    <div className="text-sm text-cyan-200">Tema: {detailData.tema_titulo}</div>
                  )}
                </div>
                {detailData.descripcion && (
                  <p className="text-sm text-slate-200">{detailData.descripcion}</p>
                )}
                <div>
                  <div className="text-sm font-semibold text-white/90 mb-1">Pasos clave</div>
                  <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
                    {(detailData.pasos || []).slice(0, 5).map((p) => (
                      <li key={p.paso}><span className="text-slate-300">Paso {p.paso}:</span> {p.titulo}</li>
                    ))}
                    {!(detailData.pasos || []).length && (
                      <li className="text-slate-400">Sin pasos definidos</li>
                    )}
                  </ul>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-600/60 p-3">
                    <div className="text-xs text-slate-300">Prerrequisitos</div>
                    <div className="text-sm text-slate-200">{(detailData.prerequisitos || []).length ? detailData.prerequisitos.map(pr => pr.titulo || pr.id).join(', ') : 'Ninguno'}</div>
                  </div>
                  <div className="rounded-lg border border-slate-600/60 p-3">
                    <div className="text-xs text-slate-300">Desbloquea</div>
                    <div className="text-sm text-slate-200">{(unlocksMap.get(detailId) || []).length ? unlocksMap.get(detailId).map(u => u.titulo || u.id).join(', ') : '—'}</div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-600/60 p-3">
                  <div className="text-xs text-slate-300">Recompensas</div>
                  <div className="text-sm text-slate-200">
                    {detailData.recompensas
                      ? `Monedas ${detailData.recompensas.monedas || 0}${(detailData.recompensas.vidas||0) ? ", Vidas "+detailData.recompensas.vidas : ""}${(detailData.recompensas.armas||0) ? ", Armas "+detailData.recompensas.armas : ""}`
                      : 'No definidas'}
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    className="px-4 py-2 rounded-md text-white font-semibold shadow bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={() => { closeDetail(); handlePlay(detailId); }}
                  >
                    JUGAR
                  </button>
                  {token && localStorage.getItem(`resume:${detailId}`) && (
                    <button
                      className="px-4 py-2 rounded-md text-white font-semibold shadow bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                      onClick={() => { closeDetail(); handleResume(detailId); }}
                    >
                      CONTINUAR
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}





