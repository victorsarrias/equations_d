import { useEffect, useMemo, useState } from "react";

// Simple tablero de memoria: pares (integral <-> solución)
// Uso: <IntegralBoard pairs={[{ key: 'p1', integral: '∫ x dx', solution: 'x^2/2 + C' }, ...]} />

export default function IntegralBoard({ pairs = [], cols = 3 }) {
  const REVEAL_DURATION = 5; // segundos de memorización
  const initialDeck = useMemo(() => {
    const deck = [];
    pairs.forEach((p, i) => {
      const id = p.key || `p${i+1}`;
      deck.push({ id: `${id}-I`, pair: id, kind: 'integral', text: p.integral });
      deck.push({ id: `${id}-S`, pair: id, kind: 'solution', text: p.solution });
    });
    // mezclar
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck.map(c => ({ ...c, flipped: false, matched: false }));
  }, [JSON.stringify(pairs)]);

  const [cards, setCards] = useState(initialDeck);
  const [selected, setSelected] = useState([]); // ids de cartas volteadas temporalmente
  const [revealSeed, setRevealSeed] = useState(0);
  const [revealCountdown, setRevealCountdown] = useState(0); // segundos restantes de memoriza

  const matchedCount = cards.filter(c => c.matched).length / 2;
  const totalPairs = pairs.length;

  const onCardClick = (id) => {
    if (revealCountdown > 0) return; // deshabilitar clicks durante la revelación
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: !c.flipped } : c));
    const clicked = cards.find(c => c.id === id);
    if (!clicked || clicked.matched) return;
    const nextSel = [...selected.filter(x => x !== id), id];
    setSelected(nextSel);
    if (nextSel.length === 2) {
      const [a, b] = nextSel.map(cid => cards.find(c => c.id === cid) || { pair: null });
      if (a.pair && a.pair === b.pair && a.kind !== b.kind) {
        // match
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === a.id || c.id === b.id) ? { ...c, matched: true, flipped: true } : c));
          setSelected([]);
        }, 250);
      } else {
        // no match
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === a.id || c.id === b.id) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 700);
      }
    }
  };

  const reset = () => {
    // remezclar a partir de pairs
    const fresh = pairs.flatMap((p, i) => {
      const id = p.key || `p${i+1}`;
      return [
        { id: `${id}-I`, pair: id, kind: 'integral', text: p.integral },
        { id: `${id}-S`, pair: id, kind: 'solution', text: p.solution }
      ];
    });
    for (let i = fresh.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fresh[i], fresh[j]] = [fresh[j], fresh[i]];
    }
    setCards(fresh.map(c => ({ ...c, flipped: false, matched: false })));
    setSelected([]);
    setRevealSeed((x) => x + 1);
  };

  // Mostrar todas las cartas REVEAL_DURATION s al cargar y al reiniciar, para memorizar
  useEffect(() => {
    // Revela todas temporalmente con cuenta regresiva visible
    setCards(prev => prev.map(c => ({ ...c, flipped: true })));
    setSelected([]);
    setRevealCountdown(REVEAL_DURATION);
    const interval = setInterval(() => {
      setRevealCountdown((s) => {
        if (s <= 1) {
          clearInterval(interval);
          // Ocultar no emparejadas
          setCards(prev => prev.map(c => (c.matched ? { ...c, flipped: true } : { ...c, flipped: false })));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [initialDeck, revealSeed]);

  return (
    <div className="rounded-xl border border-cyan-400/40 bg-slate-900/50 p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-cyan-200 font-semibold">Tablero de integrales</div>
        <div className="flex items-center gap-3">
          {revealCountdown > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-xs px-2 py-0.5 rounded bg-amber-600/80 text-white border border-amber-300/60">
                Memoriza: {revealCountdown}s
              </div>
              <div className="w-24 h-2 rounded bg-amber-900/50 border border-amber-500/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
                  style={{ width: `${(revealCountdown / REVEAL_DURATION) * 100}%` }}
                />
              </div>
            </div>
          )}
          <div className="text-xs text-slate-300">Progreso: {matchedCount}/{totalPairs}</div>
        </div>
      </div>
      <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => (!card.matched ? onCardClick(card.id) : null)}
            className={`relative h-24 rounded-lg border-2 transition-all duration-300 ${card.matched ? 'border-emerald-400/70 bg-emerald-900/30' : card.flipped ? 'border-cyan-400/70 bg-slate-800/70' : 'border-slate-600/60 bg-slate-800/40 hover:border-cyan-400/60 hover:bg-slate-800/60'} overflow-hidden`}
            title={card.kind === 'integral' ? 'Integral' : 'Solución'}
          >
            <div className="absolute inset-0 flex items-center justify-center px-2 text-center">
              <span className={`text-[13px] ${card.matched ? 'text-emerald-200' : 'text-slate-200'}`}>
                {card.flipped || card.matched ? card.text : '¿?'}
              </span>
            </div>
            {!card.flipped && !card.matched && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-slate-900/20" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button onClick={reset} className="text-xs px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 border border-slate-500/60">Reiniciar</button>
      </div>
    </div>
  );
}
