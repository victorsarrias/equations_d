import { Link } from "react-router-dom";

export default function Inicio() {
  return (
    <div className="mx-auto max-w-6xl p-6 text-slate-100">
      {/* Hero */}
      <section className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <h1 className="text-3xl font-bold">Ecuations D</h1>
        <p className="mt-2 max-w-3xl opacity-90">
          Un juego educativo para aprender ecuaciones diferenciales en un entorno de aventuras.
          Explora mundos, reúne pistas y arma soluciones paso a paso con ayuda de tus aliados.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            to="/aventuras"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
          >
            Jugar ahora
          </Link>
          <a href="#personajes" className="rounded bg-slate-700 px-4 py-2 hover:bg-slate-600">
            Conoce a los personajes
          </a>
        </div>
      </section>

      {/* Personajes */}
      <section id="personajes" className="mt-8">
     
        <h2 className="mb-4 text-2xl font-bold text-black">Personajes</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Dif */}
          <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            {/* Contenedor alto y alargado hacia abajo */}
            <div className="flex h-[24rem] items-end justify-center bg-slate-800 sm:h-[28rem]">
              <img
                src="/assets/personajes/dif.png"
                alt="Dif, explorador galáctico"
                className="max-h-[22rem] w-auto object-contain drop-shadow-lg sm:max-h-[26rem]"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">Dif — Explorador</h3>
              <p className="mt-1 text-sm opacity-90">
                Marciano galáctico que viaja entre mundos. Aprende resolviendo retos y
                recolectando elementos que forman la solución.
              </p>
            </div>
          </article>

          {/* Giro */}
          <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex h-[24rem] items-end justify-center bg-slate-800 sm:h-[28rem]">
              <img
                src="/assets/personajes/giro.png"
                alt="Giro, asistente matemático"
                className="max-h-[22rem] w-auto object-contain drop-shadow-lg sm:max-h-[26rem]"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">Giro — Asistente</h3>
              <p className="mt-1 text-sm opacity-90">
                Robot consejero que ofrece pistas contextuales cuando presionas
                <em> “Llamar a Giro”</em>.
              </p>
            </div>
          </article>

          {/* Pilot */}
          <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex h-[24rem] items-end justify-center bg-slate-800 sm:h-[28rem]">
              <img
                src="/assets/personajes/pilot.png"
                alt="Pilot, apoyo aéreo"
                className="max-h-[22rem] w-auto object-contain drop-shadow-lg sm:max-h-[26rem]"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">Pilot — Apoyo aéreo</h3>
              <p className="mt-1 text-sm opacity-90">
                Compañero en nave. Brinda apoyo y suministros durante los niveles para que
                avances sin quedar a la deriva.
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
