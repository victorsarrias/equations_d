import { memo } from "react";

export const ENEMY_METRICS = {
  // baselineAdjust corrige el alineado de los pies con el camino
  spike:   { width: 118, height: 118, floorOffset: 46, baselineAdjust: -6, image: "/assets/enemies/alien-gunner.png" },
  moving:  { width: 132, height: 132, floorOffset: 50, baselineAdjust: -6, image: "/assets/enemies/alien-brute.png" },
  default: { width: 118, height: 118, floorOffset: 46, baselineAdjust: -6, image: "/assets/enemies/alien-gunner.png" }
};

const Enemy = memo(({ x, y, type, debug = false }) => {
  const metrics = ENEMY_METRICS[type] || ENEMY_METRICS.default;

  return (
    <div
      className="absolute select-none"
      style={{
        left: x,
        top: y - metrics.floorOffset,
        width: metrics.width,
        height: metrics.height,
        zIndex: 5
      }}
    >
      {debug && (
        <div
          className="absolute inset-0 border-2 border-red-400 bg-red-400/10 pointer-events-none"
          style={{ zIndex: 1 }}
        />
      )}
      <img
        src={metrics.image}
        alt="Enemigo"
        draggable={false}
        className="w-full h-full object-contain drop-shadow-[0_0_14px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
});

Enemy.displayName = "Enemy";

export default Enemy;
