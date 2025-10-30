import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameSounds } from '../hooks/useGameSounds';
import { completeMisionSummary } from '../api';
import GameCharacter, { CHARACTER_HEIGHT, CHARACTER_RENDER_OFFSET, CHARACTER_WEAPON_OFFSET, CHARACTER_WEAPON_SIZE } from './GameCharacter';
import Collectible from './Collectible';
import Enemy, { ENEMY_METRICS } from './Enemy';
import ProgressPanel from './ProgressPanel';

const GAME_CONFIG = {
  gravity: 0.8,
  jumpPower: -15,
  moveSpeed: 5,
  worldWidth: 2000,
  worldHeight: 600,
  groundLevel: 500,
  // Ajuste fino para alinear pies con la línea de la carretera
  groundBaselineOffset: 12,
  cameraSpeed: 2,
  collisionDistance: 25, // Distancia más precisa para colisiones
  shootingCooldown: 500, // Cooldown para disparos en ms
  bulletSpeed: 8,
  platformHeight: 20
};

// Tamaño del sprite del personaje (coherente con GameCharacter)
const CHARACTER_SIZE = { width: 128, height: 160 };

// Caja de colisión ajustada y centrada
const COLLISION = {
  character: { width: 128, height: 160 },
  enemyPadding: 0,
};

// Helpers AABB
const getCharacterAABB = (char) => {
  // En este componente, char.y representa los pies (baseline), y char.x el borde izquierdo del sprite
  const left = char.x + (CHARACTER_SIZE.width - COLLISION.character.width) / 2;
  const bottom = char.y;
  const top = bottom - COLLISION.character.height;
  const right = left + COLLISION.character.width;
  return { left, top, right, bottom };
};

const getEnemyAABB = (enemy) => {
  const m = ENEMY_METRICS[enemy.type] || ENEMY_METRICS.default;
  const pad = COLLISION.enemyPadding || 0;
  const left = enemy.x + pad;
  const top = (enemy.y - m.floorOffset) + pad;
  const right = enemy.x + m.width - pad;
  const bottom = (enemy.y - m.floorOffset) + m.height - pad;
  return { left, top, right, bottom };
};

// AABB de la bandera (alineada al suelo visual y al mismo anclaje que el render)
const getFlagAABB = () => {
  const left = GAME_CONFIG.worldWidth - (FINISH_FLAG.width + 8);
  const top = GAME_CONFIG.groundLevel - FINISH_FLAG.height;
  const right = left + FINISH_FLAG.width;
  const bottom = GAME_CONFIG.groundLevel + GAME_CONFIG.groundBaselineOffset;
  return { left, top, right, bottom };
};

// Escala visual para la textura de plataforma (colisión se mantiene con width/height reales)
const PLATFORM_VISUAL_SCALE = 2;
// Zona final: completar misión al entrar en los últimos N px del mundo
const FINISH_ZONE_WIDTH = 200;
// Monedas generadas automáticamente
const COIN_VALUE = 5;
const COIN_VISUAL_SIZE = 48;
const ENEMY_EXPLOSION_DURATION = 400;
const BULLET_VISUAL_SIZE = 14;
const BULLET_TRAIL_LENGTH = 42;
const WEAPON_MUZZLE_ANGLE_DEG = -6; // debe coincidir con el rotate() del arma
const EXPLOSION_SPRITE = '/assets/effects/explosion.gif';
// Bandera de meta (usa la imagen proporcionada bandera.png)
const FINISH_FLAG = { width: 120, height: 240, image: '/assets/decor/bandera.png' };
// Fondos por misión (fallback a 'default')
const ENV_BACKGROUNDS = {
  default: '/assets/aventuras/valle.jpg',
  'empezando-aventura': '/assets/aventuras/valle.jpg',
  modelado: '/assets/aventuras/valle.jpg',
  separables: '/assets/aventuras/galaxia.jpg',
  euler: '/assets/aventuras/galaxia.jpg',
  existencia: '/assets/aventuras/valle.jpg',
  fase: '/assets/aventuras/galaxia.jpg'
};

const MISSION_DATA = {
  "empezando-aventura": {
    title: "Empezando una aventura",
    equation: "dp/dt = kp",
    steps: [
      { step: 1, title: "Modelado inicial", expression: "dp/dt = kp" },
      { step: 2, title: "Separación de variables", expression: "dp/p = kdt" },
      { step: 3, title: "Integración", expression: "∫ dp/p = ∫ kdt" },
      { step: 4, title: "Solución general", expression: "ln(p) = kt + C" },
      { step: 5, title: "Solución explícita", expression: "p = e^(kt+C)" },
      { step: 6, title: "Aplicar condición inicial", expression: "C = ln(p0)" },
      { step: 7, title: "Dato del problema", expression: "p5 = 2p0, 2p0 = p0e^(k·5)" },
      { step: 8, title: "Calcular k", expression: "k = ln(2)/5" },
      { step: 9, title: "Hallar el tiempo en que se triplica", expression: "3p0 = p0e^(k·t), t = 5ln(3)/ln(2)" },
      { step: 10, title: "Hallar el tiempo en que se cuadruplica", expression: "4p0 = p0e^(k·t), t = 5ln(4)/ln(2) = 10 años" }
    ],
    collectibles: [
      { id: 1, x: 300, y: 400, symbol: "dy", type: "fruit", value: 10 },
      { id: 2, x: 500, y: 350, symbol: "0y", type: "fruit", value: 10 },
      { id: 3, x: 700, y: 450, symbol: "e+k", type: "pearl", value: 20 },
      { id: 4, x: 900, y: 380, symbol: "dt", type: "fruit", value: 10 },
      { id: 5, x: 1100, y: 420, symbol: "dy/dx", type: "pearl", value: 30 },
      { id: 6, x: 1300, y: 400, symbol: "y", type: "fruit", value: 10 },
      { id: 7, x: 1500, y: 360, symbol: "kt", type: "pearl", value: 20 },
      { id: 8, x: 1700, y: 440, symbol: "∫", type: "special", value: 50 }
    ],
    enemies: [
      { id: 1, x: 400, y: 480, type: "spike", speed: 0 },
      { id: 2, x: 800, y: 480, type: "moving", speed: 0.5 },
      { id: 3, x: 1200, y: 480, type: "spike", speed: 0 },
      { id: 4, x: 1600, y: 480, type: "moving", speed: 0.5 }
    ],
    platforms: [
      { id: 1, x: 350, y: 400, width: 80, height: 20 },
      { id: 2, x: 600, y: 350, width: 100, height: 20 },
      { id: 3, x: 850, y: 300, width: 80, height: 20 },
      { id: 4, x: 1100, y: 380, width: 120, height: 20 },
      { id: 5, x: 1400, y: 320, width: 90, height: 20 },
      { id: 6, x: 1650, y: 400, width: 80, height: 20 }
    ]
  },
  "modelado": {
    title: "Modelación por medio de E.D",
    equation: "dy/dt = ky",
    steps: [
      { step: 1, title: "Identificar el problema", expression: "Crecimiento poblacional" },
      { step: 2, title: "Establecer variables", expression: "y(t) = población en tiempo t" },
      { step: 3, title: "Formular la E.D", expression: "dy/dt = ky" },
      { step: 4, title: "Separar variables", expression: "dy/y = kdt" },
      { step: 5, title: "Integrar", expression: "ln|y| = kt + C" },
      { step: 6, title: "Resolver para y", expression: "y = Ce^(kt)" },
      { step: 7, title: "Aplicar condición inicial", expression: "y(0) = y₀" },
      { step: 8, title: "Solución particular", expression: "y = y₀e^(kt)" }
    ],
    collectibles: [
      { id: 1, x: 250, y: 400, symbol: "y", type: "fruit", value: 10 },
      { id: 2, x: 450, y: 350, symbol: "t", type: "fruit", value: 10 },
      { id: 3, x: 650, y: 450, symbol: "k", type: "pearl", value: 20 },
      { id: 4, x: 850, y: 380, symbol: "dy", type: "fruit", value: 10 },
      { id: 5, x: 1050, y: 420, symbol: "dt", type: "pearl", value: 30 },
      { id: 6, x: 1250, y: 400, symbol: "ln", type: "fruit", value: 10 },
      { id: 7, x: 1450, y: 360, symbol: "e", type: "pearl", value: 20 },
      { id: 8, x: 1650, y: 440, symbol: "∫", type: "special", value: 50 }
    ],
    enemies: [
      { id: 1, x: 300, y: 480, type: "spike", speed: 0 },
      { id: 2, x: 700, y: 480, type: "moving", speed: 0.5 },
      { id: 3, x: 1100, y: 480, type: "spike", speed: 0 },
      { id: 4, x: 1500, y: 480, type: "moving", speed: 0.5 }
    ],
    platforms: [
      { id: 1, x: 200, y: 400, width: 80, height: 20 },
      { id: 2, x: 500, y: 350, width: 100, height: 20 },
      { id: 3, x: 800, y: 300, width: 80, height: 20 },
      { id: 4, x: 1100, y: 380, width: 120, height: 20 },
      { id: 5, x: 1400, y: 320, width: 90, height: 20 },
      { id: 6, x: 1700, y: 400, width: 80, height: 20 }
    ]
  },
  "separables": {
    title: "Separación de variables",
    equation: "dy/dx = f(x)g(y)",
    steps: [
      { step: 1, title: "Identificar tipo", expression: "dy/dx = f(x)g(y)" },
      { step: 2, title: "Separar variables", expression: "dy/g(y) = f(x)dx" },
      { step: 3, title: "Integrar ambos lados", expression: "∫ dy/g(y) = ∫ f(x)dx" },
      { step: 4, title: "Resolver integrales", expression: "G(y) = F(x) + C" },
      { step: 5, title: "Despejar y", expression: "y = G⁻¹(F(x) + C)" },
      { step: 6, title: "Aplicar condición inicial", expression: "y(x₀) = y₀" },
      { step: 7, title: "Encontrar constante", expression: "C = G(y₀) - F(x₀)" },
      { step: 8, title: "Solución particular", expression: "y = G⁻¹(F(x) + C)" }
    ],
    collectibles: [
      { id: 1, x: 200, y: 400, symbol: "dy", type: "fruit", value: 10 },
      { id: 2, x: 400, y: 350, symbol: "dx", type: "fruit", value: 10 },
      { id: 3, x: 600, y: 450, symbol: "f(x)", type: "pearl", value: 20 },
      { id: 4, x: 800, y: 380, symbol: "g(y)", type: "fruit", value: 10 },
      { id: 5, x: 1000, y: 420, symbol: "∫", type: "pearl", value: 30 },
      { id: 6, x: 1200, y: 400, symbol: "C", type: "fruit", value: 10 },
      { id: 7, x: 1400, y: 360, symbol: "G(y)", type: "pearl", value: 20 },
      { id: 8, x: 1600, y: 440, symbol: "F(x)", type: "special", value: 50 }
    ],
    enemies: [
      { id: 1, x: 250, y: 480, type: "spike", speed: 0 },
      { id: 2, x: 650, y: 480, type: "moving", speed: 0.5 },
      { id: 3, x: 1050, y: 480, type: "spike", speed: 0 },
      { id: 4, x: 1450, y: 480, type: "moving", speed: 0.5 }
    ],
    platforms: [
      { id: 1, x: 150, y: 400, width: 80, height: 20 },
      { id: 2, x: 450, y: 350, width: 100, height: 20 },
      { id: 3, x: 750, y: 300, width: 80, height: 20 },
      { id: 4, x: 1050, y: 380, width: 120, height: 20 },
      { id: 5, x: 1350, y: 320, width: 90, height: 20 },
      { id: 6, x: 1650, y: 400, width: 80, height: 20 }
    ]
  },
  "cualitativo": {
    title: "Procedimiento Cualitativo",
    equation: "dy/dt = f(y)",
    steps: [
      { step: 1, title: "Identificar puntos críticos", expression: "f(y) = 0" },
      { step: 2, title: "Analizar estabilidad", expression: "f'(y) en puntos críticos" },
      { step: 3, title: "Clasificar puntos", expression: "Estable/Inestable/Semiestable" },
      { step: 4, title: "Dibujar línea de fase", expression: "Diagrama de f(y) vs y" },
      { step: 5, title: "Analizar comportamiento", expression: "Tendencias asintóticas" },
      { step: 6, title: "Interpretar resultados", expression: "Comportamiento a largo plazo" },
      { step: 7, title: "Verificar con condiciones iniciales", expression: "y(0) = y₀" },
      { step: 8, title: "Conclusión cualitativa", expression: "Descripción del comportamiento" }
    ],
    collectibles: [
      { id: 1, x: 300, y: 400, symbol: "f(y)", type: "fruit", value: 10 },
      { id: 2, x: 500, y: 350, symbol: "y*", type: "fruit", value: 10 },
      { id: 3, x: 700, y: 450, symbol: "f'(y)", type: "pearl", value: 20 },
      { id: 4, x: 900, y: 380, symbol: "estable", type: "fruit", value: 10 },
      { id: 5, x: 1100, y: 420, symbol: "inestable", type: "pearl", value: 30 },
      { id: 6, x: 1300, y: 400, symbol: "fase", type: "fruit", value: 10 },
      { id: 7, x: 1500, y: 360, symbol: "asintótico", type: "pearl", value: 20 },
      { id: 8, x: 1700, y: 440, symbol: "∞", type: "special", value: 50 }
    ],
    enemies: [
      { id: 1, x: 350, y: 480, type: "spike", speed: 0 },
      { id: 2, x: 750, y: 480, type: "moving", speed: 0.5 },
      { id: 3, x: 1150, y: 480, type: "spike", speed: 0 },
      { id: 4, x: 1550, y: 480, type: "moving", speed: 0.5 }
    ],
    platforms: [
      { id: 1, x: 250, y: 400, width: 80, height: 20 },
      { id: 2, x: 550, y: 350, width: 100, height: 20 },
      { id: 3, x: 850, y: 300, width: 80, height: 20 },
      { id: 4, x: 1150, y: 380, width: 120, height: 20 },
      { id: 5, x: 1450, y: 320, width: 90, height: 20 },
      { id: 6, x: 1750, y: 400, width: 80, height: 20 }
    ]
  },
  "euler": {
    title: "Método de Euler",
    equation: "y_{n+1} = y_n + h·f(x_n, y_n)",
    steps: [
      { step: 1, title: "Definir paso", expression: "h = (b-a)/n" },
      { step: 2, title: "Condición inicial", expression: "y₀ = y(a)" },
      { step: 3, title: "Fórmula de Euler", expression: "y_{n+1} = y_n + h·f(x_n, y_n)" },
      { step: 4, title: "Calcular puntos", expression: "x_n = a + n·h" },
      { step: 5, title: "Iterar método", expression: "Para n = 0, 1, 2, ..." },
      { step: 6, title: "Evaluar función", expression: "f(x_n, y_n)" },
      { step: 7, title: "Actualizar solución", expression: "y_{n+1} = y_n + h·f(x_n, y_n)" },
      { step: 8, title: "Resultado aproximado", expression: "y(b) ≈ y_n" }
    ],
    collectibles: [
      { id: 1, x: 300, y: 400, symbol: "h", type: "fruit", value: 10 },
      { id: 2, x: 500, y: 350, symbol: "y₀", type: "fruit", value: 10 },
      { id: 3, x: 700, y: 450, symbol: "f(x,y)", type: "pearl", value: 20 },
      { id: 4, x: 900, y: 380, symbol: "x_n", type: "fruit", value: 10 },
      { id: 5, x: 1100, y: 420, symbol: "y_n", type: "pearl", value: 30 },
      { id: 6, x: 1300, y: 400, symbol: "n", type: "fruit", value: 10 },
      { id: 7, x: 1500, y: 360, symbol: "≈", type: "pearl", value: 20 },
      { id: 8, x: 1700, y: 440, symbol: "Euler", type: "special", value: 50 }
    ],
    enemies: [
      { id: 1, x: 400, y: 480, type: "spike", speed: 0 },
      { id: 2, x: 800, y: 480, type: "moving", speed: 0.5 },
      { id: 3, x: 1200, y: 480, type: "spike", speed: 0 },
      { id: 4, x: 1600, y: 480, type: "moving", speed: 0.5 }
    ],
    platforms: [
      { id: 1, x: 350, y: 400, width: 80, height: 20 },
      { id: 2, x: 650, y: 350, width: 100, height: 20 },
      { id: 3, x: 950, y: 300, width: 80, height: 20 },
      { id: 4, x: 1250, y: 380, width: 120, height: 20 },
      { id: 5, x: 1550, y: 320, width: 90, height: 20 },
      { id: 6, x: 1850, y: 400, width: 80, height: 20 }
    ]
  },
  "existencia": {
    title: "Existencia y unicidad",
    equation: "dy/dx = f(x,y), y(x₀) = y₀",
    steps: [
      { step: 1, title: "Teorema de existencia", expression: "f continua en región" },
      { step: 2, title: "Teorema de unicidad", expression: "f Lipschitz en y" },
      { step: 3, title: "Verificar continuidad", expression: "f ∈ C(D)" },
      { step: 4, title: "Verificar Lipschitz", expression: "|f(x,y₁)-f(x,y₂)| ≤ L|y₁-y₂|" },
      { step: 5, title: "Aplicar teorema", expression: "Solución única existe" },
      { step: 6, title: "Intervalo de existencia", expression: "|x-x₀| ≤ h" },
      { step: 7, title: "Construir solución", expression: "Método de Picard" },
      { step: 8, title: "Conclusión", expression: "Solución única y continua" }
    ],
    collectibles: [
      { id: 1, x: 250, y: 400, symbol: "∃", type: "fruit", value: 10 },
      { id: 2, x: 450, y: 350, symbol: "!", type: "fruit", value: 10 },
      { id: 3, x: 650, y: 450, symbol: "C(D)", type: "pearl", value: 20 },
      { id: 4, x: 850, y: 380, symbol: "L", type: "fruit", value: 10 },
      { id: 5, x: 1050, y: 420, symbol: "h", type: "pearl", value: 30 },
      { id: 6, x: 1250, y: 400, symbol: "Picard", type: "fruit", value: 10 },
      { id: 7, x: 1450, y: 360, symbol: "única", type: "pearl", value: 20 },
      { id: 8, x: 1650, y: 440, symbol: "✓", type: "special", value: 50 }
    ],
    enemies: [
      { id: 1, x: 300, y: 480, type: "spike", speed: 0 },
      { id: 2, x: 700, y: 480, type: "moving", speed: 0.5 },
      { id: 3, x: 1100, y: 480, type: "spike", speed: 0 },
      { id: 4, x: 1500, y: 480, type: "moving", speed: 0.5 }
    ],
    platforms: [
      { id: 1, x: 200, y: 400, width: 80, height: 20 },
      { id: 2, x: 500, y: 350, width: 100, height: 20 },
      { id: 3, x: 800, y: 300, width: 80, height: 20 },
      { id: 4, x: 1100, y: 380, width: 120, height: 20 },
      { id: 5, x: 1400, y: 320, width: 90, height: 20 },
      { id: 6, x: 1700, y: 400, width: 80, height: 20 }
    ]
  },
  "fase": {
    title: "Equilibrio y línea de fase",
    equation: "dy/dt = f(y)",
    steps: [
      { step: 1, title: "Encontrar puntos críticos", expression: "f(y) = 0" },
      { step: 2, title: "Clasificar estabilidad", expression: "f'(y*) < 0 estable" },
      { step: 3, title: "Dibujar línea de fase", expression: "Diagrama de f(y)" },
      { step: 4, title: "Analizar comportamiento", expression: "Flechas de dirección" },
      { step: 5, title: "Identificar atractores", expression: "Puntos estables" },
      { step: 6, title: "Identificar repulsores", expression: "Puntos inestables" },
      { step: 7, title: "Interpretar dinámica", expression: "Comportamiento global" },
      { step: 8, title: "Aplicar a problemas", expression: "Modelos reales" }
    ],
    collectibles: [
      { id: 1, x: 300, y: 400, symbol: "y*", type: "fruit", value: 10 },
      { id: 2, x: 500, y: 350, symbol: "f'(y)", type: "fruit", value: 10 },
      { id: 3, x: 700, y: 450, symbol: "→", type: "pearl", value: 20 },
      { id: 4, x: 900, y: 380, symbol: "←", type: "fruit", value: 10 },
      { id: 5, x: 1100, y: 420, symbol: "●", type: "pearl", value: 30 },
      { id: 6, x: 1300, y: 400, symbol: "○", type: "fruit", value: 10 },
      { id: 7, x: 1500, y: 360, symbol: "fase", type: "pearl", value: 20 },
      { id: 8, x: 1700, y: 440, symbol: "∞", type: "special", value: 50 }
    ],
    enemies: [
      { id: 1, x: 400, y: 480, type: "spike", speed: 0 },
      { id: 2, x: 800, y: 480, type: "moving", speed: 0.5 },
      { id: 3, x: 1200, y: 480, type: "spike", speed: 0 },
      { id: 4, x: 1600, y: 480, type: "moving", speed: 0.5 }
    ],
    platforms: [
      { id: 1, x: 350, y: 400, width: 80, height: 20 },
      { id: 2, x: 650, y: 350, width: 100, height: 20 },
      { id: 3, x: 950, y: 300, width: 80, height: 20 },
      { id: 4, x: 1250, y: 380, width: 120, height: 20 },
      { id: 5, x: 1550, y: 320, width: 90, height: 20 },
      { id: 6, x: 1850, y: 400, width: 80, height: 20 }
    ]
  },
  "bifurcaciones": {
    title: "Bifurcaciones",
    equation: "dy/dt = f(y,μ)",
    steps: [
      { step: 1, title: "Identificar parámetro", expression: "μ ∈ ℝ" },
      { step: 2, title: "Encontrar puntos críticos", expression: "f(y,μ) = 0" },
      { step: 3, title: "Calcular valores críticos", expression: "μ = μ_c" },
      { step: 4, title: "Analizar estabilidad", expression: "∂f/∂y en puntos críticos" },
      { step: 5, title: "Clasificar bifurcación", expression: "Saddle-node, pitchfork, etc." },
      { step: 6, title: "Dibujar diagrama", expression: "y vs μ" },
      { step: 7, title: "Interpretar cambios", expression: "Comportamiento cualitativo" },
      { step: 8, title: "Aplicar a sistemas", expression: "Modelos con parámetros" }
    ],
    collectibles: [
      { id: 1, x: 300, y: 400, symbol: "μ", type: "fruit", value: 10 },
      { id: 2, x: 500, y: 350, symbol: "μ_c", type: "fruit", value: 10 },
      { id: 3, x: 700, y: 450, symbol: "∂f/∂y", type: "pearl", value: 20 },
      { id: 4, x: 900, y: 380, symbol: "saddle", type: "fruit", value: 10 },
      { id: 5, x: 1100, y: 420, symbol: "pitchfork", type: "pearl", value: 30 },
      { id: 6, x: 1300, y: 400, symbol: "bifurcación", type: "fruit", value: 10 },
      { id: 7, x: 1500, y: 360, symbol: "cambio", type: "pearl", value: 20 },
      { id: 8, x: 1700, y: 440, symbol: "⚡", type: "special", value: 50 }
    ],
    enemies: [
      { id: 1, x: 400, y: 480, type: "spike", speed: 0 },
      { id: 2, x: 800, y: 480, type: "moving", speed: 0.5 },
      { id: 3, x: 1200, y: 480, type: "spike", speed: 0 },
      { id: 4, x: 1600, y: 480, type: "moving", speed: 0.5 }
    ],
    platforms: [
      { id: 1, x: 350, y: 400, width: 80, height: 20 },
      { id: 2, x: 650, y: 350, width: 100, height: 20 },
      { id: 3, x: 950, y: 300, width: 80, height: 20 },
      { id: 4, x: 1250, y: 380, width: 120, height: 20 },
      { id: 5, x: 1550, y: 320, width: 90, height: 20 },
      { id: 6, x: 1850, y: 400, width: 80, height: 20 }
    ]
  },
  "lineales": {
    title: "E. D. lineales",
    equation: "dy/dx + P(x)y = Q(x)",
    steps: [
      { step: 1, title: "Forma estándar", expression: "dy/dx + P(x)y = Q(x)" },
      { step: 2, title: "Factor integrante", expression: "μ(x) = e^∫P(x)dx" },
      { step: 3, title: "Multiplicar ecuación", expression: "μ(x)dy/dx + μ(x)P(x)y = μ(x)Q(x)" },
      { step: 4, title: "Reconocer derivada", expression: "d/dx[μ(x)y] = μ(x)Q(x)" },
      { step: 5, title: "Integrar ambos lados", expression: "μ(x)y = ∫μ(x)Q(x)dx + C" },
      { step: 6, title: "Despejar y", expression: "y = (∫μ(x)Q(x)dx + C)/μ(x)" },
      { step: 7, title: "Aplicar condición inicial", expression: "y(x₀) = y₀" },
      { step: 8, title: "Solución particular", expression: "y = función de x" }
    ],
    collectibles: [
      { id: 1, x: 300, y: 400, symbol: "P(x)", type: "fruit", value: 10 },
      { id: 2, x: 500, y: 350, symbol: "Q(x)", type: "fruit", value: 10 },
      { id: 3, x: 700, y: 450, symbol: "μ(x)", type: "pearl", value: 20 },
      { id: 4, x: 900, y: 380, symbol: "e^∫", type: "fruit", value: 10 },
      { id: 5, x: 1100, y: 420, symbol: "d/dx", type: "pearl", value: 30 },
      { id: 6, x: 1300, y: 400, symbol: "∫", type: "fruit", value: 10 },
      { id: 7, x: 1500, y: 360, symbol: "C", type: "pearl", value: 20 },
      { id: 8, x: 1700, y: 440, symbol: "lineal", type: "special", value: 50 }
    ],
    enemies: [
      { id: 1, x: 400, y: 480, type: "spike", speed: 0 },
      { id: 2, x: 800, y: 480, type: "moving", speed: 0.5 },
      { id: 3, x: 1200, y: 480, type: "spike", speed: 0 },
      { id: 4, x: 1600, y: 480, type: "moving", speed: 0.5 }
    ],
    platforms: [
      { id: 1, x: 350, y: 400, width: 80, height: 20 },
      { id: 2, x: 650, y: 350, width: 100, height: 20 },
      { id: 3, x: 950, y: 300, width: 80, height: 20 },
      { id: 4, x: 1250, y: 380, width: 120, height: 20 },
      { id: 5, x: 1550, y: 320, width: 90, height: 20 },
      { id: 6, x: 1850, y: 400, width: 80, height: 20 }
    ]
  },
  "cambio": {
    title: "Cambios de variable",
    equation: "Sustitución: u = g(x,y)",
    steps: [
      { step: 1, title: "Identificar sustitución", expression: "u = g(x,y)" },
      { step: 2, title: "Calcular du/dx", expression: "du/dx = ∂g/∂x + ∂g/∂y · dy/dx" },
      { step: 3, title: "Sustituir en ecuación", expression: "Ecuación en términos de u" },
      { step: 4, title: "Resolver nueva ecuación", expression: "Método apropiado" },
      { step: 5, title: "Encontrar solución u", expression: "u = f(x)" },
      { step: 6, title: "Despejar y", expression: "y = h(x,u)" },
      { step: 7, title: "Verificar solución", expression: "Sustituir en original" },
      { step: 8, title: "Aplicar condiciones", expression: "y(x₀) = y₀" }
    ],
    collectibles: [
      { id: 1, x: 300, y: 400, symbol: "u", type: "fruit", value: 10 },
      { id: 2, x: 500, y: 350, symbol: "g(x,y)", type: "fruit", value: 10 },
      { id: 3, x: 700, y: 450, symbol: "∂g/∂x", type: "pearl", value: 20 },
      { id: 4, x: 900, y: 380, symbol: "∂g/∂y", type: "fruit", value: 10 },
      { id: 5, x: 1100, y: 420, symbol: "du/dx", type: "pearl", value: 30 },
      { id: 6, x: 1300, y: 400, symbol: "f(x)", type: "fruit", value: 10 },
      { id: 7, x: 1500, y: 360, symbol: "h(x,u)", type: "pearl", value: 20 },
      { id: 8, x: 1700, y: 440, symbol: "↻", type: "special", value: 50 }
    ],
    enemies: [
      { id: 1, x: 400, y: 480, type: "spike", speed: 0 },
      { id: 2, x: 800, y: 480, type: "moving", speed: 0.5 },
      { id: 3, x: 1200, y: 480, type: "spike", speed: 0 },
      { id: 4, x: 1600, y: 480, type: "moving", speed: 0.5 }
    ],
    platforms: [
      { id: 1, x: 350, y: 400, width: 80, height: 20 },
      { id: 2, x: 650, y: 350, width: 100, height: 20 },
      { id: 3, x: 950, y: 300, width: 80, height: 20 },
      { id: 4, x: 1250, y: 380, width: 120, height: 20 },
      { id: 5, x: 1550, y: 320, width: 90, height: 20 },
      { id: 6, x: 1850, y: 400, width: 80, height: 20 }
    ]
  }
};

export default function Game({ missionId = "empezando-aventura", onComplete, onExit }) {
  const [gameState, setGameState] = useState({
    lives: 3,
    coins: 0,
    treasures: 0,
    equationsSolved: 0,
    currentStep: 0,
    isPaused: false,
    isGameOver: false,
    isComplete: false,
    isInvulnerable: false,
    isMusicPlaying: false,
    giroActive: false,
    lastShotTime: 0
  });

  const [character, setCharacter] = useState({
    x: 100,
    y: GAME_CONFIG.groundLevel + GAME_CONFIG.groundBaselineOffset,
    vx: 0,
    vy: 0,
    isJumping: false,
    isGrounded: true,
    direction: 1
  });

  const [camera, setCamera] = useState({ x: 0 });
  const [collectibles, setCollectibles] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [enemyExplosions, setEnemyExplosions] = useState([]);
  const [giro, setGiro] = useState({ x: 0, y: 0, isActive: false });
  const [showDebugCollisions, setShowDebugCollisions] = useState(false);
  const [completeCountdown, setCompleteCountdown] = useState(0);
  const [collectedLog, setCollectedLog] = useState([]); // últimos items recolectados
  const [finishPrompt, setFinishPrompt] = useState(false);
  const resourceCards = [
    { id: 'coins', label: 'MONEDAS', value: gameState.coins, icon: '$', gradient: 'from-cyan-400 to-blue-500', border: 'border-cyan-300/60' },
    { id: 'lives', label: 'VIDAS', value: gameState.lives, icon: 'L', gradient: 'from-blue-500 to-indigo-600', border: 'border-indigo-400/60' },
    { id: 'equations', label: 'ECUACIONES', value: gameState.equationsSolved, icon: 'E', gradient: 'from-indigo-500 to-violet-600', border: 'border-violet-400/60' },
    { id: 'ammo', label: 'MUNICION', value: gameState.ammo ?? 10, icon: 'AM', gradient: 'from-amber-400 to-orange-500', border: 'border-amber-300/60' },
    { id: 'treasures', label: 'TESOROS', value: gameState.treasures, icon: 'T', gradient: 'from-emerald-400 to-cyan-500', border: 'border-emerald-300/60' }
  ];
  // Estado de teclas presionadas para movimiento/disparo
  const [keys, setKeys] = useState({});
  
  const gameLoopRef = useRef();
  const lastSoundTime = useRef({});
  const backgroundMusicRef = useRef(null);
  const explosionTimeoutsRef = useRef(new Set());
  const sounds = useGameSounds();
  // Refs para evitar cierres obsoletos en los handlers de teclado
  const characterRef = useRef(character);
  const gameStateRef = useRef(gameState);
  const completionLockRef = useRef(false);
  const mission = MISSION_DATA[missionId];
  const bgImage = ENV_BACKGROUNDS[missionId] || ENV_BACKGROUNDS.default;
  const vanishingEnemiesRef = useRef(new Set());

  // Enemigos realmente visibles: excluye los que acaban de ser impactados
  const visibleEnemies = useMemo(
    () => enemies.filter(e => !vanishingEnemiesRef.current.has(e.id)),
    [enemies]
  );

  // Mantener refs sincronizados con el state actual
  useEffect(() => { characterRef.current = character; }, [character]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Si no hay misión válida, mostrar error
  if (!mission) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-slate-800 p-8 rounded-lg text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Error de Misión</h2>
          <p className="mb-4">No se encontró la misión: {missionId}</p>
          <button 
            onClick={onExit}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Volver a Misiones
          </button>
        </div>
      </div>
    );
  }

  // Overlay de misión terminada (texto claro)
  if (gameState.isComplete) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-slate-800 p-8 rounded-lg text-white text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Misión completada</h2>
          {/* Resumen de totales */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div className="bg-slate-700/60 rounded p-2 border border-cyan-400/30">
              <div className="text-cyan-300 font-semibold">Monedas</div>
              <div className="text-white text-lg font-bold">{gameState.coins}</div>
            </div>
            <div className="bg-slate-700/60 rounded p-2 border border-indigo-400/30">
              <div className="text-indigo-300 font-semibold">Vidas</div>
              <div className="text-white text-lg font-bold">{gameState.lives}</div>
            </div>
            <div className="bg-slate-700/60 rounded p-2 border border-violet-400/30">
              <div className="text-violet-300 font-semibold">Ecuaciones</div>
              <div className="text-white text-lg font-bold">{gameState.equationsSolved}</div>
            </div>
            <div className="bg-slate-700/60 rounded p-2 border border-emerald-400/30">
              <div className="text-emerald-300 font-semibold">Tesoros</div>
              <div className="text-white text-lg font-bold">{gameState.treasures}</div>
            </div>
            <div className="bg-slate-700/60 rounded p-2 border border-amber-400/30 col-span-2">
              <div className="text-amber-300 font-semibold">Munición</div>
              <div className="text-white text-lg font-bold">{gameState.ammo ?? 0}</div>
            </div>
          </div>

          <p className="text-slate-200">Redirigiendo a Misiones en {Math.max(0, completeCountdown)}s...</p>
        </div>
      </div>
    );
  }

  // Función para reproducir sonidos con throttling
  const playSound = useCallback((soundName, minInterval = 100) => {
    const now = Date.now();
    if (!lastSoundTime.current[soundName] || now - lastSoundTime.current[soundName] > minInterval) {
      if (sounds[soundName]) {
        sounds[soundName]();
        lastSoundTime.current[soundName] = now;
      }
    }
  }, [sounds]);

  // Inicializar juego
  useEffect(() => {
    if (mission) {
      // Generar monedas a partir de plataformas + extras de suelo
      const platformsData = mission.platforms || [];
      const coins = [];
      platformsData.forEach((p) => {
        coins.push({
          id: `${missionId}-coin-platform-${p.id}`,
          x: p.x + p.width / 2 - COIN_VISUAL_SIZE / 2,
          y: p.y - COIN_VISUAL_SIZE - 12,
          type: 'coin',
          value: COIN_VALUE,
        });
      });
      coins.push({ id: `${missionId}-coin-bonus-1`, x: GAME_CONFIG.worldWidth * 0.25 - COIN_VISUAL_SIZE / 2, y: GAME_CONFIG.groundLevel - COIN_VISUAL_SIZE - 40, type: 'coin', value: COIN_VALUE });
      coins.push({ id: `${missionId}-coin-bonus-2`, x: GAME_CONFIG.worldWidth * 0.5 - COIN_VISUAL_SIZE / 2, y: GAME_CONFIG.groundLevel - COIN_VISUAL_SIZE - 70, type: 'coin', value: COIN_VALUE });
      coins.push({ id: `${missionId}-coin-bonus-3`, x: GAME_CONFIG.worldWidth * 0.75 - COIN_VISUAL_SIZE / 2, y: GAME_CONFIG.groundLevel - COIN_VISUAL_SIZE - 50, type: 'coin', value: COIN_VALUE });

      const baseCollectibles = mission.collectibles || [];
      setCollectibles([...baseCollectibles, ...coins]);

      // Alinear enemigos al mismo Y (suelo) corrigiendo por sprite
      const aligned = (mission.enemies || []).map((e) => {
        const m = ENEMY_METRICS[e.type] || ENEMY_METRICS.default;
        const baseline = GAME_CONFIG.groundLevel + GAME_CONFIG.groundBaselineOffset;
        const yAligned = baseline - (m?.height || 0) + (m?.floorOffset || 0);
        return { ...e, y: yAligned };
      });
      setEnemies(aligned || []);
      setPlatforms(platformsData);
    }
  }, [missionId, mission]);

  // Sistema de música de fondo
  useEffect(() => {
    const startBackgroundMusic = () => {
      if (!backgroundMusicRef.current && gameState.isMusicPlaying) {
        // Crear música de fondo usando Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        
        oscillator.start();
        backgroundMusicRef.current = { oscillator, gainNode, audioContext };
      }
    };

    const stopBackgroundMusic = () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.oscillator.stop();
        backgroundMusicRef.current.audioContext.close();
        backgroundMusicRef.current = null;
      }
    };

    if (gameState.isMusicPlaying) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }

    return () => {
      stopBackgroundMusic();
    };
  }, [gameState.isMusicPlaying]);

  // Sistema de teclas optimizado - INDEPENDIENTE
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Bloquear entradas cuando ya se tocó la bandera
      if (completionLockRef.current) {
        try { e.preventDefault(); } catch {}
        return;
      }
      // Prevenir comportamiento por defecto para teclas de juego
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyP', 'KeyX'].includes(e.code)) {
        e.preventDefault();
      }
      
      // Manejar debug de colisiones
      if (e.code === 'KeyD') {
        setShowDebugCollisions(prev => !prev);
        return;
      }
      
      // Manejar pausa
      if (e.code === 'KeyP') {
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
        return;
      }
      
      // Manejar disparos (usar punta del arma y dirección de movimiento)
      if (e.code === 'KeyX') {
        const gs = gameStateRef.current || {};
        const c = characterRef.current || character;
        if (gs.isPaused || gs.isGameOver) { return; }
        const now = Date.now();
        const last = Number(gs.lastShotTime || 0);
        if (now - last >= GAME_CONFIG.shootingCooldown) {
          const effectiveDir = (c.vx !== 0 ? Math.sign(c.vx) : ((c.direction || 1)));
          // Punta del arma coherente con GameCharacter
          const tipLocalRight = CHARACTER_WEAPON_OFFSET.x + CHARACTER_WEAPON_SIZE.width / 2;
          const tipLocalLeft = CHARACTER_SIZE.width - tipLocalRight;
          const muzzleLocalX = effectiveDir === 1 ? tipLocalRight : tipLocalLeft;
          const muzzleX = c.x + muzzleLocalX;
          const muzzleY = (c.y - CHARACTER_HEIGHT) + CHARACTER_WEAPON_OFFSET.y + CHARACTER_WEAPON_SIZE.height / 2;

          const speed = GAME_CONFIG.bulletSpeed || 8;
          const vx = speed * effectiveDir;
          const vy = 0;

          const tipAdvance = 6;
          const sx = muzzleX + tipAdvance * effectiveDir;
          const sy = muzzleY;

          const minSpawn = c.x - 4;
          const maxSpawn = c.x + CHARACTER_SIZE.width + 4;
          const spawnX = Math.max(minSpawn, Math.min(sx, maxSpawn));

          setBullets(prev => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, x: spawnX, y: sy, vx, vy }]);
          setGameState(prev => ({ ...prev, lastShotTime: now }));
          playSound('shoot', 80);
        }
      }

      setKeys(prev => ({ ...prev, [e.code]: true }));
    };

    const handleKeyUp = (e) => {
      // Bloquear entradas cuando ya se tocó la bandera
      if (completionLockRef.current) return;
      setKeys(prev => ({ ...prev, [e.code]: false }));
    };

    // Usar passive: false para poder prevenir comportamiento por defecto
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Sistema de movimiento del personaje - COMPLETAMENTE INDEPENDIENTE
  const updateCharacter = useCallback(() => {
    if (gameState.isPaused || gameState.isGameOver || gameState.isComplete || completionLockRef.current) return;

    setCharacter(prevChar => {
      let newChar = { ...prevChar };

      // Movimiento horizontal
      if (keys['ArrowLeft'] || keys['KeyA']) {
        newChar.vx = -GAME_CONFIG.moveSpeed;
        newChar.direction = -1;
      } else if (keys['ArrowRight'] || keys['KeyD']) {
        newChar.vx = GAME_CONFIG.moveSpeed;
        newChar.direction = 1;
      } else {
        newChar.vx = 0;
      }

      // Salto
      if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && newChar.isGrounded) {
        newChar.vy = GAME_CONFIG.jumpPower;
        newChar.isJumping = true;
        newChar.isGrounded = false;
        playSound('jump', 200); // Throttling de 200ms para saltos
      }

      // Aplicar gravedad
      const prevBottom = newChar.y; // baseline en pies
      newChar.vy += GAME_CONFIG.gravity;
      newChar.y += newChar.vy;

      // Verificar colisiones con plataformas usando cruce de borde superior
      let onPlatform = false;
      if (newChar.vy >= 0) {
        const currentBottom = newChar.y;
        const nextX = newChar.x + newChar.vx;
        for (const platform of platforms) {
          const platformTop = platform.y;
          const isDescending = prevBottom <= platformTop && currentBottom >= platformTop - 1;
          if (!isDescending) continue;

          const edgeTolerance = 0;
          // Pies centrados según caja de colisión del personaje (usar X del siguiente frame)
          const feetLeft = nextX + (CHARACTER_SIZE.width - COLLISION.character.width) / 2;
          const feetRight = feetLeft + COLLISION.character.width;
          const platformLeft = platform.x;
          // Usar el ancho visual completo de la plataforma (imagen escalada)
          const platformRight = platform.x + platform.width * PLATFORM_VISUAL_SCALE;
          // Margen sin soporte a ambos lados (no sostener a -10px en bordes)
          const SUPPORT_INSET = 10;
          const effectiveLeft = platformLeft + SUPPORT_INSET;
          const effectiveRight = platformRight - SUPPORT_INSET;
          // Require minimum horizontal overlap (avoid edge grazing support)
          const minOverlap = 6;
          const overlap = Math.min(feetRight, effectiveRight) - Math.max(feetLeft, effectiveLeft);
          const hasSupport = overlap >= minOverlap;
          if (hasSupport) {
            newChar.y = platformTop; // pies sobre la plataforma
            newChar.vy = 0;
            newChar.isJumping = false;
            newChar.isGrounded = true;
            onPlatform = true;
            break;
          }
        }
      }

      // colisión con el suelo (solo si no está en una plataforma)
      if (!onPlatform && newChar.y >= GAME_CONFIG.groundLevel + GAME_CONFIG.groundBaselineOffset) {
        newChar.y = GAME_CONFIG.groundLevel + GAME_CONFIG.groundBaselineOffset;
        newChar.vy = 0;
        newChar.isJumping = false;
        newChar.isGrounded = true;
      }

      // Actualizar posición
      newChar.x += newChar.vx;

      // Limitar movimiento horizontal (resta ancho del sprite)
      newChar.x = Math.max(0, Math.min(newChar.x, GAME_CONFIG.worldWidth - CHARACTER_SIZE.width));

      return newChar;
    });
  }, [keys, playSound, gameState.isPaused, gameState.isGameOver, gameState.isComplete, platforms]);

  // Sistema de enemigos - INDEPENDIENTE del personaje
  const updateEnemies = useCallback(() => {
    if (gameState.isPaused || gameState.isGameOver || gameState.isComplete || completionLockRef.current) return;

    setEnemies(prev => {
      return prev.map(enemy => {
        // Mover enemigo independientemente
        if (enemy.type === 'moving') {
          const newX = enemy.x + enemy.speed;
          // Verificar límites antes de mover
          if (newX > GAME_CONFIG.worldWidth - 50 || newX < 0) {
            enemy.speed *= -1;
          } else {
            enemy.x = newX;
          }
        }
        return enemy;
      });
    });
  }, [gameState.isPaused, gameState.isGameOver, gameState.isComplete]);

  // Sistema de balas - INDEPENDIENTE
  const updateBullets = useCallback(() => {
    if (gameState.isPaused || gameState.isGameOver || gameState.isComplete) return;

    setBullets(prev => {
      const next = [];
      for (const bullet of prev) {
        const nx = bullet.x + bullet.vx;
        const ny = bullet.y + bullet.vy;

        // Chequear impacto inmediato contra enemigos con bounding box
        let hit = false;
        setEnemies(prevEnemies => prevEnemies.filter(enemy => {
          const metrics = ENEMY_METRICS[enemy.type] || ENEMY_METRICS.default;
          const left = enemy.x;
          const top = enemy.y - metrics.floorOffset;
          const right = left + metrics.width;
          const bottom = top + metrics.height;
          const intersects = nx >= left - 6 && nx <= right + 6 && ny >= top - 6 && ny <= bottom + 6;
          if (intersects) { hit = true; return false; }
          return true;
        }));
        if (hit) {
          playSound('enemy', 120);
          const id = `${Date.now()}-${Math.random()}`;
          const effect = { id, x: nx, y: ny, size: 48 };
          setEnemyExplosions(prev => [...prev, effect]);
          const tid = setTimeout(() => {
            setEnemyExplosions(prev => prev.filter(e => e.id !== id));
            explosionTimeoutsRef.current.delete(tid);
          }, ENEMY_EXPLOSION_DURATION);
          explosionTimeoutsRef.current.add(tid);
          continue;
        }

        // Mantener balas dentro del mundo
        if (nx > 0 && nx < GAME_CONFIG.worldWidth && ny > 0 && ny < GAME_CONFIG.worldHeight) {
          next.push({ ...bullet, x: nx, y: ny });
        }
      }
      return next;
    });
  }, [gameState.isPaused, gameState.isGameOver, gameState.isComplete, playSound]);

  // Versión unificada: elimina enemigo y bala en el mismo ciclo usando snapshot de enemigos
  const updateBullets2 = useCallback(() => {
    if (gameState.isPaused || gameState.isGameOver || gameState.isComplete || completionLockRef.current) return;
    const hitEnemyIds = new Set();
    const snapshotEnemies = enemies.filter(e => !vanishingEnemiesRef.current.has(e.id));
    setBullets(prev => {
      const next = [];
      for (const bullet of prev) {
        const nx = bullet.x + bullet.vx;
        const ny = bullet.y + bullet.vy;
        let hit = false;
        for (const enemy of snapshotEnemies) {
          const metrics = ENEMY_METRICS[enemy.type] || ENEMY_METRICS.default;
          const left = enemy.x;
          const top = enemy.y - metrics.floorOffset;
          const right = left + metrics.width;
          const bottom = top + metrics.height;
          if (nx >= left - 6 && nx <= right + 6 && ny >= top - 6 && ny <= bottom + 6) {
            hit = true;
            hitEnemyIds.add(String(enemy.id));
            // Explosión breve
            const id = `${Date.now()}-${Math.random()}`;
            const effect = { id, x: left + metrics.width / 2, y: top + metrics.height / 2, size: Math.max(metrics.width, metrics.height) };
            vanishingEnemiesRef.current.add(enemy.id); setEnemyExplosions(prevE => [...prevE, effect]);
            const tid = setTimeout(() => {
              setEnemyExplosions(prevE => prevE.filter(e => e.id !== id));
              explosionTimeoutsRef.current.delete(tid);
            }, ENEMY_EXPLOSION_DURATION);
            explosionTimeoutsRef.current.add(tid);
            break;
          }
        }
        if (hit) { playSound('enemy', 120); continue; }
        if (nx > 0 && nx < GAME_CONFIG.worldWidth && ny > 0 && ny < GAME_CONFIG.worldHeight) {
          next.push({ ...bullet, x: nx, y: ny });
        }
      }
      return next;
    });
    if (hitEnemyIds.size > 0) {
      setEnemies(prev => prev.filter(e => !hitEnemyIds.has(String(e.id))));
      hitEnemyIds.forEach(id => vanishingEnemiesRef.current.delete(id));
      setGameState(prev => ({ ...prev, equationsSolved: prev.equationsSolved + hitEnemyIds.size }));
    }
  }, [enemies, gameState.isPaused, gameState.isGameOver, gameState.isComplete, playSound]);

  // Actualizar cámara basada en la posición del personaje
  useEffect(() => {
    setCamera(prev => ({
      x: Math.max(0, character.x - 400)
    }));
  }, [character.x]);

  // Sistema de colisiones mejorado con bounding boxes
  const checkCollisions = useCallback(() => {
    if (gameState.isPaused || gameState.isGameOver || gameState.isComplete || completionLockRef.current) return;

    // Verificar coleccionables (bounding boxes precisos)
    setCollectibles(prev => {
      return prev.filter(item => {
        const characterBox = getCharacterAABB(character);
        const size = item.type === 'coin' ? COIN_VISUAL_SIZE : 32;
        const itemBox = {
          left: item.x,
          right: item.x + size,
          top: item.y,
          bottom: item.y + size
        };

        const overlap = !(
          characterBox.right < itemBox.left ||
          characterBox.left > itemBox.right ||
          characterBox.bottom < itemBox.top ||
          characterBox.top > itemBox.bottom
        );

        if (overlap) {
          // Registrar en panel de recolectados
          try {
            const label = item.symbol || (item.type === 'coin' ? '$' : item.type || '?');
            setCollectedLog(prev => [{ id: item.id, label, type: item.type, ts: Date.now() }, ...prev].slice(0, 8));
          } catch {}
          setGameState(prevState => {
            const newState = { ...prevState };
            if (item.type === 'coin') newState.coins += item.value || 1;
            if (item.type === 'special') {
              newState.treasures += 1;
              newState.equationsSolved += 1;
              newState.currentStep = Math.min(newState.currentStep + 1, mission.steps.length - 1);
            }
            if (item.type === 'ammo') {
              newState.ammo = Math.min((newState.ammo ?? 0) + (item.value ?? 6), 60);
            }
            playSound('collect', 50);
            return newState;
          });
          return false; // Remover el objeto recolectado
        }
        return true;
      });
    });

    // Evitar colisión con 'fantasmas' justo tras la explosión
    if (vanishingEnemiesRef.current.size > 0) {
      return;
    }

    // Verificar colisiones con enemigos usando bounding boxes
    setEnemies(prev => {
      return prev.map(enemy => {
        // Definir bounding boxes más precisos
        const characterBox = getCharacterAABB(character);
        
        const enemyBox = getEnemyAABB(enemy);
        
        // Verificar intersección de bounding boxes
        const isColliding = !(
          characterBox.right < enemyBox.left ||
          characterBox.left > enemyBox.right ||
          characterBox.bottom < enemyBox.top ||
          characterBox.top > enemyBox.bottom
        );
        
        // Solo activar colisión si hay intersección real y no es invulnerable
        if (isColliding && !gameState.isInvulnerable) {
          // colisión con enemigo
          setGameState(prevState => {
            if (prevState.lives > 0) {
              playSound('damage', 500);
              // Activar invencibilidad temporal
              setTimeout(() => {
                setGameState(currentState => ({ ...currentState, isInvulnerable: false }));
              }, 2000); // 2 segundos de invencibilidad
              return { ...prevState, lives: prevState.lives - 1, isInvulnerable: true };
            } else {
              return { ...prevState, isGameOver: true };
            }
          });
        }
        
        return enemy;
      });
    });
  }, [character.x, character.y, mission, playSound, gameState.isPaused, gameState.isGameOver, gameState.isComplete, gameState.isInvulnerable]);

  // Sistema de colisiones bala-enemigo
  const checkBulletCollisions = useCallback(() => {
    if (gameState.isPaused || gameState.isGameOver || gameState.isComplete) return;

    setBullets(prevBullets => {
      return prevBullets.filter(bullet => {
        let bulletHit = false;

        setEnemies(prevEnemies => {
          return prevEnemies.filter(enemy => {
            const metrics = ENEMY_METRICS[enemy.type] || ENEMY_METRICS.default;
            const enemyLeft = enemy.x;
            const enemyTop = enemy.y - metrics.floorOffset;
            const enemyRight = enemyLeft + metrics.width;
            const enemyBottom = enemyTop + metrics.height;

            const nextX = bullet.x + bullet.vx;
            const nextY = bullet.y + bullet.vy;

            const intersects = (
              nextX >= enemyLeft - 6 &&
              nextX <= enemyRight + 6 &&
              nextY >= enemyTop - 6 &&
              nextY <= enemyBottom + 6
            );

            if (intersects) {
              bulletHit = true;
              playSound('enemy', 200);
              return false; // remover enemigo golpeado
            }
            return true;
          });
        });

        return !bulletHit; // remover la bala si golpeó
      });
    });
  }, [gameState.isPaused, gameState.isGameOver, gameState.isComplete, playSound]);

  // Verificar si se completó la misión (fin de pista, colisión con bandera o requisitos completos)
  useEffect(() => {
    if (gameState.isComplete) return;
//     // Completa si se recolectó todo y se avanzaron los pasos, o si entra en la zona final
//     const missionComplete = (collectibles.length === 0) && (gameState.currentStep >= mission.steps.length - 1);
//     const atWorldEndZone = (character.x + CHARACTER_SIZE.width) >= (GAME_CONFIG.worldWidth - FINISH_ZONE_WIDTH);
//     // También completa si el clamp horizontal alcanzó el límite exacto
//     const atClampLimit = character.x >= (GAME_CONFIG.worldWidth - CHARACTER_SIZE.width - 1);
//     const atWorldEnd = atWorldEndZone || atClampLimit;

    // Colisión con bandera usando AABB helpers (mismos anclajes que debug)
    const charBox = getCharacterAABB({ x: character.x, y: character.y });
    const flagBox = getFlagAABB();
    const PAD = 24; // tolerancia para asegurar contacto visible (acercamiento)
    const touchFlag = !(
      charBox.right < (flagBox.left + PAD) ||
      charBox.left > (flagBox.right - PAD) ||
      charBox.bottom < flagBox.top ||
      charBox.top > flagBox.bottom
    );
    if (touchFlag) {
      if (completionLockRef.current) return;
      completionLockRef.current = true;
      try { console.log('[Game] Bandera tocada'); } catch {}
      // Congelar lógica del juego y mostrar aviso (sin reiniciar posiciones)
      playSound('complete', 200);
      setFinishPrompt(true);
      return;
    }
  }, [character.x, character.y, gameState.isComplete, playSound]);

  // Al completar, solo mostrar mensaje (sin redirigir automáticamente)
  useEffect(() => {
    if (!gameState.isComplete) return;
    // Opcional: persistir resumen, pero no redirigir
    try {
      const summary = {
        missionId,
        ts: Date.now(),
        coins: gameState.coins,
        lives: gameState.lives,
        ammo: gameState.ammo ?? 0,
        treasures: gameState.treasures,
        equationsSolved: gameState.equationsSolved
      };
      localStorage.setItem(`summary:${missionId}`, JSON.stringify(summary));
      completeMisionSummary(missionId, summary).catch(() => {});
    } catch {}
  }, [gameState.isComplete, missionId, gameState.coins, gameState.lives, gameState.ammo, gameState.treasures, gameState.equationsSolved]);

  // Bucle de movimiento del personaje - 30 FPS
  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 30;
    const frameTime = 1000 / targetFPS;

    const characterLoop = (currentTime) => {
      if (currentTime - lastTime >= frameTime) {
        updateCharacter();
        lastTime = currentTime;
      }
      gameLoopRef.current = requestAnimationFrame(characterLoop);
    };

    gameLoopRef.current = requestAnimationFrame(characterLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [updateCharacter]);

  // Bucle de enemigos - 20 FPS (más lento, independiente)
  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 20;
    const frameTime = 1000 / targetFPS;

    const enemyLoop = (currentTime) => {
      if (currentTime - lastTime >= frameTime) {
        updateEnemies();
        lastTime = currentTime;
      }
      requestAnimationFrame(enemyLoop);
    };

    requestAnimationFrame(enemyLoop);
  }, [updateEnemies]);

  // Bucle de balas - 30 FPS
  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 30;
    const frameTime = 1000 / targetFPS;

    const bulletLoop = (currentTime) => {
      if (currentTime - lastTime >= frameTime) {
        updateBullets2();
        lastTime = currentTime;
      }
      requestAnimationFrame(bulletLoop);
    };

    requestAnimationFrame(bulletLoop);
  }, [updateBullets2]);

  // Bucle de colisiones - 10 FPS (más lento, independiente)
  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 10;
    const frameTime = 1000 / targetFPS;

    const collisionLoop = (currentTime) => {
      if (currentTime - lastTime >= frameTime) {
        checkCollisions();
        lastTime = currentTime;
      }
      requestAnimationFrame(collisionLoop);
    };

    requestAnimationFrame(collisionLoop);
  }, [checkCollisions]);

  // Bucle de colisiones de balas - 15 FPS
  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 15;
    const frameTime = 1000 / targetFPS;

    const bulletCollisionLoop = (currentTime) => {
      if (currentTime - lastTime >= frameTime) {
        checkBulletCollisions();
        lastTime = currentTime;
      }
      requestAnimationFrame(bulletCollisionLoop);
    };

    requestAnimationFrame(bulletCollisionLoop);
  }, [checkBulletCollisions]);

  // Limpiar efectos pendientes
  useEffect(() => {
    return () => {
      explosionTimeoutsRef.current.forEach(id => clearTimeout(id));
      explosionTimeoutsRef.current.clear();
    };
  }, []);

  const handleCallGiro = () => {
    playSound('powerUp', 1000);
    setGameState(prev => ({ ...prev, lives: Math.min(prev.lives + 1, 5), giroActive: true }));
    setGiro({ x: character.x - 50, y: character.y - 20, isActive: true });
    
    // Giro desaparece después de 5 segundos
    setTimeout(() => {
      setGiro(prev => ({ ...prev, isActive: false }));
      setGameState(prev => ({ ...prev, giroActive: false }));
    }, 5000);
  };

  const handlePauseResume = () => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const handleToggleMusic = () => {
    setGameState(prev => ({ ...prev, isMusicPlaying: !prev.isMusicPlaying }));
  };

  // Nota: la redirección ahora la gestiona el overlay con cuenta regresiva de 5s

  if (gameState.isPaused) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-slate-800 p-8 rounded-lg text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Juego Pausado</h2>
          <p className="mb-4">Presiona P para reanudar</p>
          <button 
            onClick={handlePauseResume}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Reanudar
          </button>
        </div>
      </div>
    );
  }

  if (gameState.isGameOver) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-slate-800 p-8 rounded-lg text-white text-center">
          <h2 className="text-2xl font-bold mb-4">¡Game Over!</h2>
          <p className="mb-4">Se acabaron las vidas</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (gameState.isComplete) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-slate-800 p-8 rounded-lg text-white text-center">
          <h2 className="text-2xl font-bold mb-4">¡Misión Completada!</h2>
          <p className="mb-4">Has resuelto la ecuación paso a paso</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
            >
              Continuar
            </button>
            <button 
              onClick={onExit}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Panel: últimos recolectados */}
      {collectedLog.length > 0 && (
        <div className="absolute top-24 left-4 z-40 bg-slate-900/85 border border-cyan-400/40 rounded-lg px-3 py-2 w-52 pointer-events-none">
          <div className="text-[11px] font-bold uppercase tracking-wide text-cyan-300 mb-1">Recolectados</div>
          <div className="flex flex-wrap gap-1">
            {collectedLog.map(entry => (
              <span key={`col-${entry.id}-${entry.ts}`} className="px-2 py-0.5 text-xs rounded bg-slate-700/70 border border-slate-500/50 text-slate-100">
                {entry.label}
              </span>
            ))}
          </div>
        </div>
      )}
      {finishPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-lg text-white text-center max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Mision terminada</h2>
            <p className="mb-6 text-slate-200">Has llegado a la bandera.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (typeof onComplete === 'function') onComplete();
                  else window.location.href = '/misiones';
                }}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded font-semibold"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* HUD de recursos (arriba centrado) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-stretch justify-center gap-3 px-4 pointer-events-none">
        {resourceCards.map(card => (
          <div
            key={card.id}
            className={`min-w-[130px] bg-gradient-to-br ${card.gradient} border ${card.border} rounded-xl px-4 py-2 shadow-lg shadow-black/40 flex flex-col gap-1 pointer-events-auto`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wide text-white/80 text-center">{card.label}</span>
            <div className="text-white text-lg font-extrabold flex items-center justify-center gap-2">
              <span>{card.icon}</span>
              <span>{card.value}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Fondo con imagen + velo + estrellas */}
      <div className="absolute inset-0">
        <img src={bgImage} alt="Fondo" className="w-full h-full object-cover" />
        {/* Suelo */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-slate-800 to-slate-700 relative">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-80"></div>
        </div>
        {/* Plataforma base */}
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-slate-600 to-slate-500 relative" />
      </div>

      {/* Mundo del juego */}
      <div 
        className="relative w-full h-full"
        style={{ 
          transform: `translateX(-${camera.x}px)`,
          width: `${GAME_CONFIG.worldWidth}px`
        }}
      >
        {/* Suelo simplificado */}
        <div 
          className="absolute"
          style={{
            left: 0,
            top: GAME_CONFIG.groundLevel,
            width: GAME_CONFIG.worldWidth,
            height: GAME_CONFIG.worldHeight - GAME_CONFIG.groundLevel,
            backgroundImage: "url('/assets/decor/road.png')",
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            backgroundColor: '#1f1f1f'
          }}
        >
          {/* Línea de energía en el suelo */}
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-80"></div>
        </div>

        {/* Bandera de meta al final de la pista */}
        <img
          src={FINISH_FLAG.image}
          alt="Meta"
          className="absolute pointer-events-none select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
          style={{
            left: GAME_CONFIG.worldWidth - FINISH_FLAG.width - 8,
            top: GAME_CONFIG.groundLevel - FINISH_FLAG.height,
            width: FINISH_FLAG.width,
            height: FINISH_FLAG.height,
            zIndex: 6
          }}
        />

        {showDebugCollisions && (() => {
          const left = GAME_CONFIG.worldWidth - (FINISH_FLAG.width + 8);
          const top = GAME_CONFIG.groundLevel - FINISH_FLAG.height;
          const right = left + FINISH_FLAG.width;
          const bottom = GAME_CONFIG.groundLevel + GAME_CONFIG.groundBaselineOffset;
          return (
            <div
              className="absolute border-2 border-yellow-400 bg-yellow-400/10"
              style={{ left, top, width: right - left, height: bottom - top, zIndex: 6 }}
            >
              <div className="absolute -top-6 left-0 text-yellow-300 text-xs font-bold">Flag Box</div>
            </div>
          );
        })()}

        {/* Personaje */}
        <GameCharacter 
          x={character.x} 
          y={character.y} 
          direction={character.direction}
          isJumping={character.isJumping}
          isInvulnerable={gameState.isInvulnerable}
          baseline={true}
        />

        {/* Debug de colisiones del personaje */}
        {showDebugCollisions && (() => {
          const box = getCharacterAABB(character);
          return (
            <div
              className="absolute border-2 border-emerald-400 bg-emerald-400/20"
              style={{
                left: box.left,
                top: box.top,
                width: box.right - box.left,
                height: box.bottom - box.top,
                zIndex: 20
              }}
            >
              <div className="absolute -top-6 left-0 text-emerald-300 text-xs font-bold">
                DIF Collision Box
              </div>
            </div>
          );
        })()}

        {/* Coleccionables */}
        {collectibles.map(item => (
          <Collectible
            key={item.id}
            x={item.x}
            y={item.y}
            symbol={item.symbol}
            type={item.type}
          />
        ))}

        {/* Plataformas flotantes con textura */}
        {platforms.map(platform => (
          <img
            key={platform.id}
            src="/assets/decor/base_florante.png"
            alt="Plataforma flotante"
            className="absolute pointer-events-none select-none"
            style={{
              left: platform.x,
              top: platform.y - platform.height * (PLATFORM_VISUAL_SCALE - 1),
              width: platform.width * PLATFORM_VISUAL_SCALE,
              height: platform.height * PLATFORM_VISUAL_SCALE,
              zIndex: 3,
              objectFit: 'contain'
            }}
          />
        ))}

        {/* Enemigos */}
        {visibleEnemies.map(enemy => (
          <Enemy
            key={enemy.id}
            x={enemy.x}
            y={enemy.y}
            type={enemy.type}
          />
        ))}

        {/* Debug de colisiones de enemigos (AABB real) */}
        {showDebugCollisions && visibleEnemies.map(enemy => {
          const box = getEnemyAABB(enemy);
          return (
            <div
              key={`debug-${enemy.id}`}
              className="absolute border-2 border-emerald-400 bg-emerald-400/20"
              style={{
                left: box.left,
                top: box.top,
                width: box.right - box.left,
                height: box.bottom - box.top,
                zIndex: 20
              }}
            >
              <div className="absolute -top-6 left-0 text-emerald-300 text-xs font-bold">
                Enemy Collision Box
              </div>
            </div>
          );
        })}

        {/* Balas */}
        {bullets.map(bullet => {
          const isRight = bullet.vx >= 0;
          return (
            <>
              {/* Estela de la bala */}
              <div
                key={`${bullet.id}-trail`}
                className="absolute"
                style={{
                  left: (isRight ? bullet.x - BULLET_TRAIL_LENGTH : bullet.x) - BULLET_VISUAL_SIZE / 2,
                  top: bullet.y - BULLET_VISUAL_SIZE * 0.18,
                  width: BULLET_TRAIL_LENGTH,
                  height: BULLET_VISUAL_SIZE * 0.36,
                  background: 'linear-gradient(to right, rgba(255,200,0,0.0) 0%, rgba(255,220,0,0.45) 60%, rgba(255,255,200,0.75) 100%)',
                  filter: 'blur(0.5px)',
                  transform: isRight ? 'none' : 'scaleX(-1)',
                  zIndex: 7,
                  borderRadius: BULLET_VISUAL_SIZE * 0.18
                }}
              />
              {/* Núcleo de la bala */}
              <div
                key={bullet.id}
                className="absolute rounded-full"
                style={{
                  left: bullet.x - BULLET_VISUAL_SIZE / 2,
                  top: bullet.y - BULLET_VISUAL_SIZE / 2,
                  width: BULLET_VISUAL_SIZE,
                  height: BULLET_VISUAL_SIZE,
                  background: 'radial-gradient(circle, rgba(255,250,180,0.95) 0%, rgba(255,210,0,0.85) 40%, rgba(255,140,0,0.6) 70%, rgba(255,0,0,0.0) 100%)',
                  boxShadow: '0 0 10px rgba(255,210,0,0.8)',
                  zIndex: 8
                }}
              />
            </>
          );
        })}

        {/* Explosiones de enemigos */}
        {enemyExplosions.map(ex => (
          <div
            key={ex.id}
            className="absolute pointer-events-none select-none"
            style={{
              left: ex.x - ex.size / 2,
              top: ex.y - ex.size / 2,
              width: ex.size,
              height: ex.size,
              zIndex: 9
            }}
          >
            {/* Sprite de explosión si existe */}
            <img
              src={EXPLOSION_SPRITE}
              alt="Explosion"
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            {/* Fallback desenfocado por si no hay sprite */}
            <div
              className="absolute inset-0"
              style={{
                borderRadius: '9999px',
                background: 'radial-gradient(circle, rgba(255,200,0,0.9) 0%, rgba(255,90,0,0.7) 45%, rgba(255,0,0,0.0) 70%)',
                boxShadow: '0 0 24px rgba(255,150,0,0.8), 0 0 48px rgba(255,100,0,0.5)'
              }}
            />
          </div>
        ))}

        {/* Giro el robot asistente */}
        {giro.isActive && (
          <div
            className="absolute transition-all duration-300"
            style={{
              left: giro.x,
              top: giro.y,
              zIndex: 15
            }}
          >
            <img
              src="/assets/personajes/giro.png"
              alt="Giro Robot"
              className="w-16 h-20 object-contain"
            />
            {/* Nombre de Giro */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="text-white text-xs px-2 py-1 rounded font-bold bg-green-600/80">
                <span className="text-green-300">GIRO</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel de progreso */}
      <ProgressPanel 
        gameState={gameState}
        mission={mission}
        onCallGiro={handleCallGiro}
        onExit={onExit}
        onPauseResume={handlePauseResume}
        onToggleMusic={handleToggleMusic}
      />
    </div>
  );
}


















