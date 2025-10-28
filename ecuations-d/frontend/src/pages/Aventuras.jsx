// frontend/src/pages/Aventuras.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAventuras } from "../api";
import { aventuras as aventurasEstaticas } from "../data/aventuras";

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
        console.log("Usando datos estáticos de aventuras");
        setItems(aventurasEstaticas);
        setErr("");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-white">Cargando aventuras…</div>;
  if (!items.length) return <div className="p-6 text-white">No hay aventuras registradas.</div>;

  return (
    <div className="min-h-screen p-6">
      {/* Título grande y semi-transparente como en la imagen */}
      <h1 className="text-6xl font-bold text-white/80 mb-8 text-center">
        Aventuras
      </h1>
     
      <div className="max-w-7xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <article
            key={a.slug}
            className="group transition-all duration-300 overflow-hidden rounded-2xl border-2 border-slate-600/40 bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover:from-blue-800/60 hover:to-purple-800/60 hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/20 backdrop-blur-sm transform hover:-translate-y-2 hover:scale-[1.02]"
          >
            {/* Portada con imagen */}
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: "16 / 9" }}
            >
              <img
                src={a.cover_url || "/assets/aventuras/placeholder.jpg"}
                alt={a.titulo}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/assets/aventuras/placeholder.jpg";
                }}
              />
              {/* Overlay sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

              <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-white text-lg">{a.titulo}</h3>
                <span className="rounded-full bg-slate-600 px-3 py-1 text-xs text-white font-medium">
                  {a.dificultad}
                </span>
              </div>
                
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  {a.resumen}
                </p>
                <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(`/jugar?tema=${a.tema_slug}&av=${a.slug}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/40"
                >
                  JUGAR
                </button>
                <span className="text-xs text-slate-400">
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



