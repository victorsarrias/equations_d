export default function Ayuda() {
  const imgSrc = "/assets/help/asesor.png";
  const fallback = "/assets/personajes/pilot.png";
  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Ayuda</h1>

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
    </div>
  );
}

