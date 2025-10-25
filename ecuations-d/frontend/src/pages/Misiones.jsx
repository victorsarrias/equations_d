import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { misiones } from "../data/misiones";

const Pill = ({ estado }) => {
  const map = {
    "completado": "bg-green-600",
    "en-curso": "bg-yellow-600",
    "bloqueado": "bg-slate-600",
    "jugar": "bg-blue-600",
  };
  const label = {
    "completado": "COMPLETADO",
    "en-curso": "EN CURSO",
    "bloqueado": "BLOQUEADO",
    "jugar": "JUGAR",
  }[estado];
  return <span className={`px-2 py-1 text-xs rounded text-white ${map[estado]}`}>{label}</span>;
};

export default function Misiones() {
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  // Fuerza refresco al volver a la pestaña (para leer localStorage de nuevo)
  useEffect(() => {
    const onFocus = () => setTick((x) => x + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Aplica progreso guardado a los estados
  const items = misiones.map((m) => {
    const prog = localStorage.getItem(`progreso:${m.id}`); // "en-curso" | "completado"
    let estado = m.estado;
    if (prog === "completado") estado = "completado";
    else if (prog === "en-curso") estado = "en-curso";
    return { ...m, estado };
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Misiones</h1>

      <div className="rounded-2xl p-4 grid gap-3 bg-slate-900/80">
        {items.map((m) => (
          <div key={m.id} className="flex items-center justify-between bg-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center">🛰️</div>
              <div>
                <p className="font-medium text-white">{m.titulo}</p>
                <div className="mt-1">
                  <Pill estado={m.estado} />
                </div>
              </div>
            </div>

            <button
              className={`px-4 py-2 rounded-md text-white ${
                m.estado === "bloqueado" ? "bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
              }`}
              disabled={m.estado === "bloqueado"}
              onClick={() => {
                localStorage.setItem(`progreso:${m.id}`, "en-curso");
                navigate(`/jugar?tema=${m.id}`);
              }}
            >
              {m.estado === "bloqueado" ? "BLOQUEADO" : "JUGAR"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
