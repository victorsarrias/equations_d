import { memo } from "react";

export const CHARACTER_WEAPON_OFFSET = { x: 98, y: 60 };
export const CHARACTER_WEAPON_SIZE = { width: 200, height: 78 };
export const CHARACTER_RENDER_OFFSET = 12;
export const CHARACTER_HEIGHT = 160; // debe coincidir con h-40 (160px)

const GameCharacter = memo(({ x, y, direction, isJumping, isInvulnerable, baseline = false, noRenderOffset = false, debug = false }) => {
  return (
    <div
      className="absolute transition-all duration-100"
      style={{
        left: x,
        top: noRenderOffset ? y : (baseline ? (y - CHARACTER_HEIGHT) : (y + CHARACTER_RENDER_OFFSET)),
        transform: `scaleX(${direction})`,
        transformOrigin: 'center bottom',
        zIndex: 10
      }}
    >
      {debug && (
        <div
          className="absolute border-2 border-green-400 bg-green-400/10"
          style={{ left: 0, top: 0, width: CHARACTER_SIZE.width, height: CHARACTER_SIZE.height, zIndex: 1 }}
        />
      )}
      <div className="relative">
        <img
          src="/assets/personajes/dif.png"
          alt="DIF"
          className={`w-32 h-40 object-contain drop-shadow-[0_0_10px_rgba(0,255,255,0.35)] ${
            isInvulnerable ? 'animate-pulse' : ''
          }`}
          style={{ filter: isInvulnerable ? 'drop-shadow(0 0 6px rgba(255,0,0,0.8))' : 'none' }}
          draggable={false}
        />

        <img
          src="/assets/weapons/dif/plasma-rifle.png"
          alt="Blaster de DIF"
          className="absolute select-none pointer-events-none"
          style={{
            width: `${CHARACTER_WEAPON_SIZE.width}px`,
            height: `${CHARACTER_WEAPON_SIZE.height}px`,
            left: `${CHARACTER_WEAPON_OFFSET.x - CHARACTER_WEAPON_SIZE.width / 2}px`,
            top: `${CHARACTER_WEAPON_OFFSET.y}px`,
            transform: 'rotate(-6deg)'
          }}
          draggable={false}
        />

        {isJumping && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <div className="w-6 h-1 bg-blue-400 rounded-full opacity-60"></div>
          </div>
        )}

        {isInvulnerable && (
          <div className="absolute inset-0 border border-red-500 rounded-full animate-pulse opacity-60"></div>
        )}
      </div>

      <div className="absolute -top-12 left-1/2 -translate-x-1/2">
        <div className={`text-white text-base px-2 py-1 rounded font-bold ${
          isInvulnerable ? 'bg-red-600/80' : 'bg-slate-800/80'
        }`}>
          <span className="text-cyan-300">DIF</span>
        </div>
      </div>
    </div>
  );
});

GameCharacter.displayName = "GameCharacter";

export default GameCharacter;
