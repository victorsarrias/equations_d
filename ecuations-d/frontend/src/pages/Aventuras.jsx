// frontend/src/pages/Aventuras.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAventuras } from "../api";

export default function Aventuras() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getAventuras();
        console.log("Aventuras:", data);
        setItems(data);
      } catch (e) {
        console.error(e);
        setErr(e.message || "Error inesperado");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6">Cargando aventuras…</div>;
  if (err) return <div className="p-6 text-red-500">Error: {err}</div>;
  if (!items.length) return <div className="p-6">No hay aventuras registradas.</div>;

  return (
    <div className="mx-auto max-w-6xl p-6 text-slate-100">
     {/* <h1 className="mb-4 text-2xl font-bold">Aventuras</h1>*/}
      <h1 className="mb-4 text-2xl font-bold text-black">Aventuras</h1>
     
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <article
            key={a.slug}
            className="transition overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-700"
          >
            {/* Portada alargada (16:9), sin recortes */}
            <div
              className="flex items-center justify-center bg-slate-800"
              style={{ aspectRatio: "16 / 9" }}
            >
              <img
                src={a.cover_url || "/assets/aventuras/placeholder.jpg"}
                alt={a.titulo}
                className="h-full w-full object-contain"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/assets/aventuras/placeholder.jpg";
                }}
              />
            </div>

            <div className="p-4">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold">{a.titulo}</h3>
                <span className="rounded bg-slate-700 px-2 py-0.5 text-xs">
                  {a.dificultad}
                </span>
              </div>
              <p className="text-sm opacity-80">{a.resumen}</p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => navigate(`/jugar?tema=${a.tema_slug}&av=${a.slug}`)}
                  className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500"
                >
                  JUGAR
                </button>
                <span className="self-center text-xs opacity-70">
                  Tema: {a.tema_titulo}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

