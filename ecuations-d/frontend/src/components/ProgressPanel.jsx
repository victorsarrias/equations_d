import { useState } from 'react';

export default function ProgressPanel({ gameState, mission, onCallGiro, onExit, onPauseResume, onToggleMusic, onSaveGame, onRestart, onRetryCheckpoint }) {
  const [showSteps, setShowSteps] = useState(false);

  if (!mission) return null;

  return (
    <div className="absolute right-0 top-0 w-[305px] h-full bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm border-l-2 border-blue-400/50 p-4 overflow-y-auto z-40">
      <div className="mb-4 text-center">
        <h2 className="text-white text-lg font-bold">Panel de Avance</h2>
        <p className="text-xs text-slate-300 mt-1">Misiones, ecuaciones y acciones rapidas</p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowSteps(prev => !prev)}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/40"
        >
          {showSteps ? 'Ocultar pasos' : 'Progreso'}
        </button>
      </div>

      {showSteps && (
        <div className="mb-6">
          <h3 className="text-white text-md font-bold mb-3 text-center">Solucion paso a paso</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {mission.steps.map((step, index) => {
              const isCompleted = index <= gameState.currentStep;
              return (
                <div
                  key={step.step}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-600/20 border-green-400/50 text-green-100'
                      : 'bg-slate-700/30 border-slate-600/50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">PASO {step.step}</span>
                    {isCompleted && <span className="text-green-400 text-xs">✓</span>}
                  </div>
                  <div className="text-xs font-semibold mb-1">{step.title}</div>
                  <div className="text-xs font-mono bg-slate-800/50 p-2 rounded border">
                    {step.expression}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-white text-md font-bold mb-3 text-center">Ecuacion principal</h3>
        <div className="bg-slate-800/50 border border-blue-400/50 rounded-lg p-4 text-center">
          <div className="text-white text-lg font-mono">{mission.equation}</div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onPauseResume}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/40 flex items-center justify-center gap-2"
        >
          <span className="text-lg">{gameState.isPaused ? '⏯' : '⏸'}</span>
          {gameState.isPaused ? 'Reanudar' : 'Pausar'}
        </button>

        {onRetryCheckpoint && (
          <button
            onClick={onRetryCheckpoint}
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/40 flex items-center justify-center gap-2"
          >
            Reintentar desde checkpoint
          </button>
        )}

        {onRestart && (
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-800 hover:to-rose-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/40"
          >
            Reiniciar nivel
          </button>
        )}

        <button
          onClick={onToggleMusic}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-500/40 flex items-center justify-center gap-2"
        >
          <span className="text-lg">{gameState.isMusicPlaying ? '🔈' : '🔇'}</span>
          {gameState.isMusicPlaying ? 'Silenciar' : 'Musica'}
        </button>

        {onSaveGame && !gameState.isComplete && (
          <button
            onClick={onSaveGame}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/40 flex items-center justify-center gap-2"
          >
            <span className="text-lg">💾</span>
            Guardar partida
          </button>
        )}

        <button
          onClick={onCallGiro}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40 flex items-center justify-center gap-2"
        >
          <span className="text-lg">🤖</span>
          Llamar a Giro
        </button>

        <button
          onClick={onExit}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-500/40"
        >
          Salir
        </button>
      </div>

      <div className="mt-6 text-xs text-slate-400 space-y-1">
        <div className="font-bold">Controles:</div>
        <div>← → / A D : mover</div>
        <div>↑ / W / Espacio : saltar</div>
        <div>X : disparar</div>
        <div>P : pausar / reanudar</div>
        <div>R : reiniciar nivel</div>
        <div>C : reintentar desde checkpoint</div>
        <div>D : debug de colisiones</div>
        <div>Recolecta objetos para avanzar</div>
        <div>Camina sobre las plataformas</div>
        <div>Destruye enemigos con disparos</div>
      </div>
    </div>
  );
}
