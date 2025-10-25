import { useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { pasosPorTema } from "../data/pasos";
import { ayudasPorTema } from "../data/ayudas"; // <-- NUEVO

export default function Jugar() {
  const [sp] = useSearchParams();
  const tema = sp.get("tema") || "demo";

  const correctos = pasosPorTema[tema] || pasosPorTema.demo;
  const ayudas = ayudasPorTema[tema] || ayudasPorTema.demo; // <-- NUEVO

  // estado del juego
  const [seleccion, setSeleccion] = useState([]); // índices elegidos en orden
  const [mensaje, setMensaje] = useState("");
  const [completado, setCompletado] = useState(false);

  const disponibles = useMemo(() => {
    const usados = new Set(seleccion);
    return correctos.map((t, i) => ({ i, t, usado: usados.has(i) }));
  }, [correctos, seleccion]);

  function elegir(i) {
    if (completado) return;
    if (seleccion.includes(i)) return;
    setSeleccion([...seleccion, i]);
    setMensaje("");
  }

  function pista() {
    if (completado) return;
    const siguienteIndiceCorrecto = seleccion.length; // 0..n-1
    // agrega el índice correcto siguiente
    setSeleccion((prev) => [...prev, siguienteIndiceCorrecto]);
    setMensaje("Sugerencia aplicada: se añadió el siguiente paso correcto.");
  }

  function comprobar() {
    if (seleccion.length !== correctos.length) {
      setMensaje("Aún faltan pasos por elegir.");
      return;
    }
    // ¿coinciden posiciones?
    const ok = seleccion.every((idx, pos) => idx === pos);
    if (ok) {
      setCompletado(true);
      setMensaje("¡Nivel completado! 🎉");
      localStorage.setItem(`progreso:${tema}`, "completado");
    } else {
      // buscar primer error
      const pos = seleccion.findIndex((idx, p) => idx !== p);
      setMensaje(`Revisa el paso ${pos + 1}.`);
    }
  }

  function reiniciar() {
    setSeleccion([]);
    setCompletado(false);
    setMensaje("");
  }

  const ayudaActual = ayudas[Math.min(seleccion.length, ayudas.length - 1)]; // <-- NUEVO

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Jugar — {tema}</h1>

      <div className="bg-slate-800 rounded-xl p-4 text-white">
        <p className="mb-3">Objetivo: ordena los pasos del método.</p>

        {/* disponibles */}
        <div className="grid gap-2 sm:grid-cols-2 mb-4">
          {disponibles.map(({ i, t, usado }) => (
            <button
              key={i}
              className={`text-left p-3 rounded border
                ${
                  usado ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-700"
                }
                border-slate-600`}
              onClick={() => elegir(i)}
              disabled={usado || completado}
            >
              {t}
            </button>
          ))}
        </div>

        {/* selección del jugador */}
        <div className="mb-4">
          <p className="text-sm mb-2 opacity-80">Tu orden:</p>
          <ol className="list-decimal pl-5 space-y-1">
            {seleccion.map((idx, k) => (
              <li key={k}>{correctos[idx]}</li>
            ))}
          </ol>
        </div>

        {/* controles */}
        <div className="flex gap-2 mb-3">
          <button
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
            onClick={pista}
            disabled={completado || seleccion.length >= correctos.length}
          >
            PISTA
          </button>
          <button
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50"
            onClick={comprobar}
            disabled={completado || seleccion.length === 0}
          >
            COMPROBAR
          </button>
          <button
            className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-500"
            onClick={reiniciar}
          >
            REINICIAR
          </button>
        </div>

        {mensaje && (
          <div className="mt-2 px-3 py-2 rounded bg-slate-700">{mensaje}</div>
        )}
        {completado && (
          <div className="mt-3 flex gap-2">
            <a
              href="/misiones"
              className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white"
            >
              Siguiente nivel
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
