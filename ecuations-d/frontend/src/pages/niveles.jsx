import { useEffect, useState } from 'react';
import { useSound } from '../hooks/useSound';
import { getNiveles, completeNivel } from '../api';

export default function Niveles() {
  const { playSound } = useSound();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [earnedRewards, setEarnedRewards] = useState(null);
  const [levels, setLevels] = useState([]);
  const [maxUnlocked, setMaxUnlocked] = useState(1);
  const [lockMsg, setLockMsg] = useState('');

  // Generar 40 niveles con retos matemáticos
  const generateLevels = () => {
    const levels = [];
    for (let i = 1; i <= 40; i++) {
      let challenge, answer, difficulty, rewards;
      
      if (i <= 10) {
        // Niveles 1-10: Sumas y restas básicas
        const a = Math.floor(Math.random() * 50) + 1;
        const b = Math.floor(Math.random() * 50) + 1;
        const operation = Math.random() > 0.5 ? '+' : '-';
        if (operation === '+') {
          challenge = `${a} + ${b} = ?`;
          answer = a + b;
        } else {
          const max = Math.max(a, b);
          const min = Math.min(a, b);
          challenge = `${max} - ${min} = ?`;
          answer = max - min;
        }
        difficulty = 'Fácil';
        rewards = { coins: 10, lives: 1, weapons: 0 };
      } else if (i <= 20) {
        // Niveles 11-20: Multiplicaciones
        const a = Math.floor(Math.random() * 12) + 1;
        const b = Math.floor(Math.random() * 12) + 1;
        challenge = `${a} × ${b} = ?`;
        answer = a * b;
        difficulty = 'Intermedio';
        rewards = { coins: 20, lives: 2, weapons: 1 };
      } else if (i <= 30) {
        // Niveles 21-30: Ecuaciones simples
        const x = Math.floor(Math.random() * 20) + 1;
        const a = Math.floor(Math.random() * 10) + 1;
        const b = a * x + Math.floor(Math.random() * 20) + 1;
        challenge = `${a}x + ${b - a * x} = ${b}`;
        answer = x;
        difficulty = 'Avanzado';
        rewards = { coins: 30, lives: 3, weapons: 2 };
      } else {
        // Niveles 31-40: Ecuaciones cuadráticas simples
        const x = Math.floor(Math.random() * 10) + 1;
        const a = Math.floor(Math.random() * 3) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = a * x * x + b * x;
        challenge = `${a}x² + ${b}x = ${c}`;
        answer = x;
        difficulty = 'Experto';
        rewards = { coins: 50, lives: 5, weapons: 3 };
      }

      levels.push({
        id: i,
        challenge,
        answer,
        difficulty,
        rewards,
        completed: false
      });
    }
    return levels;
  };

  // Versión alineada a Ecuaciones Diferenciales
  const generateLevelsDE = () => {
    const levels = [];
    for (let i = 1; i <= 40; i++) {
      let challenge, answer, difficulty, rewards;

      if (i <= 10) {
        // 1-10: Orden de la EDO (1 a 3)
        const order = Math.floor(Math.random() * 3) + 1; // 1..3
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        const c = Math.floor(Math.random() * 5) + 1;
        let eq;
        if (order === 1) {
          eq = `y' + ${a}y = ${b}`;
        } else if (order === 2) {
          eq = `y'' + ${a}y' - ${b}y = 0`;
        } else {
          eq = `y''' - ${a}y' + ${c}y = 0`;
        }
        challenge = `Orden de la EDO: ${eq}`;
        answer = order;
        difficulty = 'Basico';
        rewards = { coins: 10, lives: 1, weapons: 0 };
      } else if (i <= 20) {
        // 11-20: Derivada de polinomio en un punto f'(x0)
        const a = Math.floor(Math.random() * 4) + 1; // 1..4
        const b = Math.floor(Math.random() * 6) - 3; // -3..2
        const c = Math.floor(Math.random() * 6) - 3; // -3..2
        const x0 = Math.floor(Math.random() * 4) + 1; // 1..4
        const d = Math.floor(Math.random() * 6) - 3; // d no afecta f'
        const fp = 3 * a * x0 * x0 + 2 * b * x0 + c;
        const sB = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
        const sC = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
        const sD = d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}`;
        challenge = `Si f(x) = ${a}x^3 ${sB}x^2 ${sC}x ${sD}, calcula f'(${x0})`;
        answer = fp;
        difficulty = 'Intermedio';
        rewards = { coins: 20, lives: 2, weapons: 1 };
      } else if (i <= 30) {
        // 21-30: PVI: y' = ax + b, y(0)=c0 -> y(n)
        const a = (Math.floor(Math.random() * 5) - 2) * 2; // pares -4..4
        const b = Math.floor(Math.random() * 11) - 5; // -5..5
        const c0 = Math.floor(Math.random() * 11) - 5; // -5..5
        const n = Math.floor(Math.random() * 3) + 1; // 1..3
        const yn = (a / 2) * n * n + b * n + c0;
        const sB = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
        challenge = `Resuelve: y' = ${a}x ${sB}, y(0) = ${c0}. Calcula y(${n})`;
        answer = yn;
        difficulty = 'Avanzado';
        rewards = { coins: 30, lives: 3, weapons: 2 };
      } else {
        // 31-40: 2º orden con aceleración constante: y'' = a2, y'(0)=v0, y(0)=y0 -> y(n)
        const a2 = (Math.floor(Math.random() * 5) - 2) * 2; // pares -4..4
        const v0 = Math.floor(Math.random() * 7) - 3; // -3..3
        const y0 = Math.floor(Math.random() * 11) - 5; // -5..5
        const n = Math.floor(Math.random() * 3) + 1; // 1..3
        const yn = y0 + v0 * n + (a2 / 2) * n * n;
        challenge = `Dada y'' = ${a2}, y'(0) = ${v0}, y(0) = ${y0}. Calcula y(${n})`;
        answer = yn;
        difficulty = 'Experto';
        rewards = { coins: 50, lives: 5, weapons: 3 };
      }

      levels.push({ id: i, challenge, answer, difficulty, rewards, completed: false });
    }
    return levels;
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const remote = await getNiveles();
        if (!remote || !remote.length) throw new Error('no-remote-levels');
        if (!active) return;
        setLevels(remote.map((r) => ({
          id: r.id,
          challenge: r.challenge,
          answer: r.answer,
          difficulty: r.difficulty,
          rewards: r.rewards,
          completed: !!r.completed,
        })));
        // Calcular desbloqueo según completados (siguiente al mayor completado)
        const completedIds = remote.filter(r => r.completed).map(r => r.id);
        const maxCompleted = completedIds.length ? Math.max(...completedIds) : 0;
        const unlocked = Math.min(40, Math.max(1, maxCompleted + 1));
        setMaxUnlocked(unlocked);
        // Persistir también en localStorage para coherencia con UI si se navega sin red
        try {
          localStorage.setItem('nivel:maxUnlocked', String(unlocked));
          for (const id of completedIds) localStorage.setItem(`nivel:completed:${id}`, '1');
        } catch {}
      } catch (e) {
        // Fallback local si API falla
        const base = generateLevelsDE();
        let unlocked = 1;
        try {
          const stored = parseInt(localStorage.getItem('nivel:maxUnlocked'));
          if (!isNaN(stored) && stored >= 1) unlocked = Math.min(40, Math.max(1, stored));
        } catch {}
        const completedIds = new Set();
        try {
          for (let i = 1; i <= 40; i++) {
            if (localStorage.getItem(`nivel:completed:${i}`) === '1') completedIds.add(i);
          }
        } catch {}
        if (completedIds.size) {
          const maxCompleted = Math.max(...Array.from(completedIds));
          unlocked = Math.max(unlocked, Math.min(40, maxCompleted + 1));
        }
        if (!active) return;
        setLevels(base.map(l => ({ ...l, completed: completedIds.has(l.id) })));
        setMaxUnlocked(unlocked);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleLevelClick = (level) => {
    playSound('click');
    if (!level.completed && level.id > maxUnlocked) {
      setLockMsg(`Nivel bloqueado. Completa el nivel ${maxUnlocked} primero.`);
      setTimeout(() => setLockMsg(''), 1800);
      return;
    }
    setSelectedLevel(level);
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setEarnedRewards(null);
  };

  const handleSubmitAnswer = () => {
    if (userAnswer.trim() === '') return;
    
    const correct = parseInt(userAnswer) === selectedLevel.answer;
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      playSound('levelComplete');
      setEarnedRewards(selectedLevel.rewards);
      // Marcar nivel como completado
      try { localStorage.setItem(`nivel:completed:${selectedLevel.id}`, '1'); } catch {}
      setLevels(prev => prev.map(l => l.id === selectedLevel.id ? { ...l, completed: true } : l));
      setMaxUnlocked(prev => {
        const next = Math.min(40, Math.max(prev, selectedLevel.id + 1));
        try { localStorage.setItem('nivel:maxUnlocked', String(next)); } catch {}
        return next;
      });
      // Sincronizar con backend (mejor esfuerzo)
      try { completeNivel(selectedLevel.id); } catch {}
    } else {
      playSound('error');
    }
  };

  const closeChallenge = () => {
    playSound('click');
    setSelectedLevel(null);
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setEarnedRewards(null);
  };

  return (
    <div className="mx-auto max-w-6xl p-6 text-white">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4 relative">
          🎮 Niveles
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-40 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full shadow-lg"></div>
        </h1>
        <p className="text-lg text-yellow-100 max-w-3xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-yellow-400/30">
          Existen diferentes niveles enumerados desde 1 a 40. Cada nivel es un breve reto matemático. 
          Si eliges jugar cualquiera de estos desafíos, puedes obtener recompensas como monedas, vidas, 
          armas y munición necesaria que te servirán cuando te encuentres cursando en alguna de las misiones.
        </p>
      </div>
      {lockMsg && (
        <div className="mb-6 text-center text-sm text-yellow-200 bg-yellow-900/40 border border-yellow-400/40 rounded px-3 py-2">
          {lockMsg}
        </div>
      )}

      {/* Grid de niveles circulares */}
      <div className="grid grid-cols-8 gap-4 mb-8">
        {levels.map((level) => (
          <div
            key={level.id}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 shadow-lg border-2 ${
              level.completed 
                ? 'bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-green-300 shadow-green-500/50 cursor-pointer hover:scale-110' 
                : level.id <= maxUnlocked 
                  ? 'bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 border-blue-300 shadow-blue-500/50 cursor-pointer hover:scale-110' 
                  : 'bg-gradient-to-br from-gray-500 to-gray-700 border-gray-400 shadow-gray-700/40 cursor-not-allowed opacity-70'
            }`}
            onClick={() => handleLevelClick(level)}
            onMouseEnter={() => playSound('hover')}
          >
            {level.completed ? '✓' : level.id}
          </div>
        ))}
      </div>

      {/* Panel de recompensas */}
      <div className="flex justify-center space-x-8 mb-8">
        <div className="text-center bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30">
          <div className="text-2xl font-bold text-yellow-400 mb-2">💰 Monedas</div>
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-2 border-yellow-300">
            $
          </div>
        </div>
        <div className="text-center bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
          <div className="text-2xl font-bold text-blue-400 mb-2">⚔️ Armas</div>
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-2 border-blue-300">
            ⚔️
          </div>
        </div>
        <div className="text-center bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-red-400/30">
          <div className="text-2xl font-bold text-red-400 mb-2">❤️ Vidas</div>
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-2 border-red-300">
            ❤️
          </div>
        </div>
      </div>

      {/* Modal de reto matemático */}
      {selectedLevel && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 max-w-md w-full mx-4 border-2 border-purple-400 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Nivel {selectedLevel.id} - {selectedLevel.difficulty}
              </h2>
              <button
                onClick={closeChallenge}
                className="text-slate-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {!showResult ? (
              <div>
                <div className="bg-slate-700 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-green-400 mb-4">Reto Matemático:</h3>
                  <p className="text-2xl font-bold text-center text-white mb-6">
                    {selectedLevel.challenge}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tu respuesta:
                  </label>
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu respuesta..."
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleSubmitAnswer}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                >
                  Verificar Respuesta
                </button>
              </div>
            ) : (
              <div>
                <div className={`rounded-lg p-6 mb-6 ${isCorrect ? 'bg-green-700' : 'bg-red-700'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                    {isCorrect ? '¡Correcto! 🎉' : 'Incorrecto 😞'}
                  </h3>
                  <p className="text-white">
                    {isCorrect 
                      ? `¡Excelente! La respuesta correcta era ${selectedLevel.answer}` 
                      : `La respuesta correcta era ${selectedLevel.answer}`
                    }
                  </p>
                </div>

                {isCorrect && earnedRewards && (
                  <div className="bg-slate-700 rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-semibold text-yellow-400 mb-4">¡Recompensas Obtenidas!</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl">💰</div>
                        <div className="text-white font-bold">{earnedRewards.coins} Monedas</div>
                      </div>
                      <div>
                        <div className="text-2xl">❤️</div>
                        <div className="text-white font-bold">{earnedRewards.lives} Vidas</div>
                      </div>
                      <div>
                        <div className="text-2xl">⚔️</div>
                        <div className="text-white font-bold">{earnedRewards.weapons} Armas</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const nextId = (selectedLevel?.id || 0) + 1;
                      const next = levels.find(l => l.id === nextId);
                      if (next) {
                        setSelectedLevel({ ...next });
                        setUserAnswer('');
                        setShowResult(false);
                        setIsCorrect(false);
                        setEarnedRewards(null);
                      } else {
                        closeChallenge();
                      }
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                  >
                    Siguiente nivel
                  </button>
                  <button
                    onClick={closeChallenge}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
