import { useState, useEffect, memo } from 'react';
const COIN_SPRITE = '/assets/decor/moneda.gif';
const COIN_SIZE = 48;

const Collectible = memo(({ x, y, symbol, type }) => {
  const [isCollected, setIsCollected] = useState(false);
  const [bounce, setBounce] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBounce(prev => (prev + 1) % 60);
    }, 150); // Reducir frecuencia de animaciÃ³n
    return () => clearInterval(interval);
  }, []);

  if (isCollected) return null;

  const bounceOffset = Math.sin(bounce * 0.1) * 3;
  const glowIntensity = Math.sin(bounce * 0.2) * 0.3 + 0.7;

  if (type === 'coin') {
    return (
      <div
        className="absolute pointer-events-none select-none transition-transform duration-200"
        style={{
          left: x,
          top: y + bounceOffset,
          width: COIN_SIZE,
          height: COIN_SIZE,
          zIndex: 6
        }}
      >
        <img
          src={COIN_SPRITE}
          alt="Moneda"
          className="w-full h-full object-contain drop-shadow-[0_0_16px_rgba(255,215,0,0.8)]"
        />
      </div>
    );
  }


  const getTypeStyles = () => {
    switch (type) {
      case 'ammo':
        return {
          bg: 'from-amber-400 to-orange-600',
          border: 'border-amber-300',
          glow: 'shadow-amber-400/70',
          size: 'w-8 h-8',
          shape: 'rounded-md',
          pattern: 'circuit'
        };
      case 'fruit':
        return {
          bg: 'from-emerald-400 to-cyan-500',
          border: 'border-emerald-300',
          glow: 'shadow-emerald-400/70',
          size: 'w-6 h-6',
          shape: 'rounded-lg',
          pattern: 'hexagon'
        };
      case 'pearl':
        return {
          bg: 'from-blue-400 to-purple-600',
          border: 'border-blue-300',
          glow: 'shadow-blue-400/70',
          size: 'w-7 h-7',
          shape: 'rounded-full',
          pattern: 'circuit'
        };
      case 'special':
        return {
          bg: 'from-yellow-400 to-pink-500',
          border: 'border-yellow-300',
          glow: 'shadow-yellow-400/80',
          size: 'w-8 h-8',
          shape: 'rounded-lg',
          pattern: 'diamond'
        };
      default:
        return {
          bg: 'from-slate-400 to-slate-600',
          border: 'border-slate-300',
          glow: 'shadow-slate-400/50',
          size: 'w-6 h-6',
          shape: 'rounded-lg',
          pattern: 'hexagon'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`absolute ${styles.size} transition-all duration-300`}
      style={{
        left: x,
        top: y + bounceOffset,
        zIndex: 5
      }}
    >
      {/* Efecto de energÃ­a futurista */}
      <div 
        className={`absolute inset-0 ${styles.shape} ${styles.glow} animate-pulse`}
        style={{
          boxShadow: `0 0 ${25 * glowIntensity}px rgba(34, 197, 94, ${glowIntensity}), 0 0 ${15 * glowIntensity}px rgba(59, 130, 246, ${glowIntensity})`
        }}
      ></div>

      {/* Objeto principal futurista */}
      <div className={`relative ${styles.size} ${styles.shape} bg-gradient-to-br ${styles.bg} border-2 ${styles.border} flex items-center justify-center overflow-hidden`}>
        {/* PatrÃ³n futurista de fondo */}
        {styles.pattern === 'hexagon' && (
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-gradient-to-br from-transparent via-white/20 to-transparent transform rotate-45"></div>
          </div>
        )}
        {styles.pattern === 'circuit' && (
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-1 left-1 w-2 h-0.5 bg-white rounded-full"></div>
            <div className="absolute top-1 right-1 w-2 h-0.5 bg-white rounded-full"></div>
            <div className="absolute bottom-1 left-1 w-2 h-0.5 bg-white rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-2 h-0.5 bg-white rounded-full"></div>
          </div>
        )}
        {styles.pattern === 'diamond' && (
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-gradient-to-br from-white/30 via-transparent to-white/30 transform rotate-45"></div>
          </div>
        )}

        {/* SÃ­mbolo matemÃ¡tico futurista */}
        <span className="text-white font-bold text-sm drop-shadow-lg relative z-10">
          {symbol}
        </span>

        {/* Efecto de partÃ­culas de energÃ­a */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-cyan-300 rounded-full animate-ping opacity-80"></div>
          <div className="absolute bottom-0 right-1/2 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-80" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute left-0 top-1/2 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
          <div className="absolute right-0 top-1/2 w-1 h-1 bg-pink-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Efecto de rotaciÃ³n futurista */}
        <div className={`absolute inset-0 ${styles.shape} border border-white/40 animate-spin`} style={{ animationDuration: '4s' }}></div>
        <div className={`absolute inset-1 ${styles.shape} border border-cyan-300/60 animate-spin`} style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
      </div>

      {/* Efecto de recolecciÃ³n futurista */}
      <div className={`absolute inset-0 ${styles.shape} bg-gradient-to-br from-white/30 via-transparent to-white/30 animate-ping`}></div>
    </div>
  );
});

Collectible.displayName = 'Collectible';

export default Collectible;


