import { useState, useMemo } from "react";

function Acordeon({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/60">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="text-left font-semibold">{title}</span>
        <span className="text-slate-300">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 text-slate-200/90">{children}</div>}
    </div>
  );
}

export default function Ejemplos() {
  const [selectedExample, setSelectedExample] = useState(null);

  const examples = [
    {
      id: 1,
      title: "Modelación por medio de ecuaciones diferenciales",
      description: "Método de resolución para EDOs de primer orden",
      imageUrl: "/assets/examples/modelación.jpg",
    },
    {
      id: 2,
      title: "Separación de variables",
      description: "Método clásico para EDOs",
      imageUrl: "/assets/examples/separacion_variables.jpg",
    },
    {
      id: 3,
      title: "Campos de pendientes",
      description: "Representación gráfica de soluciones",
      imageUrl: "/assets/examples/campos_de_pendientes.jpg",
    },
    
    // … añade los demás
  ];

  // Simulación para el ejemplo 1.1 (Modelación)
  const [k, setK] = useState(0.5);
  const [p0, setP0] = useState(10);
  const [tmax, setTmax] = useState(5);
  const [dt, setDt] = useState(0.1);

  const { euler, analytic } = useMemo(() => {
    const steps = Math.max(1, Math.floor(tmax / dt));
    let t = 0;
    let p = p0;
    const eArr = [{ t, p }];
    const aArr = [{ t, p: p0 }];

    for (let i = 0; i < steps; i++) {
      p = p + dt * k * p;
      t = (i + 1) * dt;
      eArr.push({ t, p });
      aArr.push({ t, p: p0 * Math.exp(k * t) });
    }
    return { euler: eArr, analytic: aArr };
  }, [k, p0, tmax, dt]);

  return (
    <div className="mx-auto max-w-6xl p-6 text-slate-100">
      <h1 className="text-2xl font-bold mb-6 text-black">Ejemplos</h1>

      {/* Grid de tarjetas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {examples.map((example) => (
          <div
            key={example.id}
            className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 transition duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setSelectedExample(example)}
          >
            <img
              src={example.imageUrl}
              alt={example.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{example.title}</h3>
              <p className="text-sm text-slate-400 mt-2">{example.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Panel de detalle */}
      {selectedExample && (
        <div className="mt-8 p-6 bg-slate-800 rounded-xl">
          <h2 className="text-3xl font-semibold mb-4">{selectedExample.title}</h2>
          <img
            src={selectedExample.imageUrl}
            alt={selectedExample.title}
            className="w-full h-60 object-cover rounded-lg mb-4"
          />
          <p className="text-lg">{selectedExample.description}</p>

          {/* Si es el ejemplo 1.1 mostramos más */}
          {selectedExample.id === 1 && (
            <div className="mt-6 space-y-4">
              <Acordeon title="Planteamiento" defaultOpen>
                dp/dt = k·p con p(0)=p₀ describe procesos de crecimiento o decaimiento exponencial.
              </Acordeon>
              <Acordeon title="Solución analítica">
                p(t) = p₀·e^(k·t)
              </Acordeon>
              <Acordeon title="Método de Euler">
                p_{n+1} = p_n + Δt·k·p_n
              </Acordeon>
              <Acordeon title="Simulación interactiva" defaultOpen>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <label className="text-sm">
                    k
                    <input
                      type="number"
                      step="0.1"
                      value={k}
                      onChange={(e) => setK(parseFloat(e.target.value || 0))}
                      className="mt-1 w-full rounded border border-slate-600 bg-slate-800 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm">
                    p₀
                    <input
                      type="number"
                      step="1"
                      value={p0}
                      onChange={(e) => setP0(parseFloat(e.target.value || 0))}
                      className="mt-1 w-full rounded border border-slate-600 bg-slate-800 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm">
                    t max
                    <input
                      type="number"
                      step="0.5"
                      value={tmax}
                      onChange={(e) => setTmax(parseFloat(e.target.value || 0))}
                      className="mt-1 w-full rounded border border-slate-600 bg-slate-800 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm">
                    Δt
                    <input
                      type="number"
                      step="0.05"
                      min="0.01"
                      value={dt}
                      onChange={(e) => setDt(parseFloat(e.target.value || 0.01))}
                      className="mt-1 w-full rounded border border-slate-600 bg-slate-800 px-3 py-2"
                    />
                  </label>
                </div>

                <div className="overflow-x-auto rounded border border-slate-700">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="px-3 py-2 text-left">t</th>
                        <th className="px-3 py-2 text-left">Euler</th>
                        <th className="px-3 py-2 text-left">Analítica</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                      {euler.map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">{row.t.toFixed(2)}</td>
                          <td className="px-3 py-2">{row.p.toFixed(4)}</td>
                          <td className="px-3 py-2">{analytic[idx].p.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Acordeon>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
