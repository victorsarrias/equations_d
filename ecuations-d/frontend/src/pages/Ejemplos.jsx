import { useState } from 'react';

export default function Ejemplos() {
  const [openId, setOpenId] = useState(null);

  // Lista de ejemplos con contenido detallado
  const examples = [
    {     
      id: 1,
      title: "Modelación por medio de ecuaciones diferenciales",
      description: "Método de resolución para EDOs de primer orden",
      imageUrl: "/assets/examples/modelación.jpg",
      examples: [
        {
          title: "Crecimiento Poblacional",
          problem: "Una población de bacterias crece a una tasa proporcional a su tamaño actual. Si inicialmente hay 1000 bacterias y después de 2 horas hay 3000, ¿cuántas habrá después de 5 horas?",
          solution: [
            "1. Identificamos la variable: P(t) = población en el tiempo t",
            "2. Establecemos la ecuación diferencial: dP/dt = kP",
            "3. Separamos variables: dP/P = k dt",
            "4. Integramos: ∫dP/P = ∫k dt",
            "5. Obtenemos: ln|P| = kt + C",
            "6. Aplicamos exponencial: P(t) = Ce^(kt)",
            "7. Usamos condiciones iniciales: P(0) = 1000 → C = 1000",
            "8. Usamos P(2) = 3000: 3000 = 1000e^(2k) → k = ln(3)/2",
            "9. Solución final: P(t) = 1000e^(t·ln(3)/2)",
            "10. Para t = 5: P(5) = 1000e^(5·ln(3)/2) ≈ 15,588 bacterias"
          ]
        },
        {
          title: "Ley de Enfriamiento de Newton",
          problem: "Un objeto a 100°C se coloca en un ambiente a 20°C. Si después de 10 minutos la temperatura es 60°C, ¿cuál será la temperatura después de 30 minutos?",
          solution: [
            "1. Ley de Newton: dT/dt = -k(T - T_ambiente)",
            "2. Sustituimos: dT/dt = -k(T - 20)",
            "3. Separamos variables: dT/(T - 20) = -k dt",
            "4. Integramos: ln|T - 20| = -kt + C",
            "5. Aplicamos exponencial: T - 20 = Ce^(-kt)",
            "6. Solución general: T(t) = 20 + Ce^(-kt)",
            "7. Condición inicial T(0) = 100: 100 = 20 + C → C = 80",
            "8. Condición T(10) = 60: 60 = 20 + 80e^(-10k)",
            "9. Despejamos k: k = ln(0.5)/(-10) ≈ 0.0693",
            "10. Solución final: T(t) = 20 + 80e^(-0.0693t)",
            "11. Para t = 30: T(30) = 20 + 80e^(-0.0693·30) ≈ 30.5°C"
          ]
        },
        {
          title: "Modelo de Decaimiento Radioactivo",
          problem: "El carbono-14 tiene una vida media de 5730 años. Si una muestra contiene 80% de carbono-14 original, ¿cuántos años tiene?",
          solution: [
            "1. Ecuación de decaimiento: dN/dt = -λN",
            "2. Separamos variables: dN/N = -λ dt",
            "3. Integramos: ln|N| = -λt + C",
            "4. Solución: N(t) = N₀e^(-λt)",
            "5. Vida media: N(T₁/₂) = N₀/2",
            "6. Sustituimos: N₀/2 = N₀e^(-λT₁/₂)",
            "7. Despejamos λ: λ = ln(2)/T₁/₂ = ln(2)/5730",
            "8. Si N(t) = 0.8N₀: 0.8N₀ = N₀e^(-λt)",
            "9. Simplificamos: 0.8 = e^(-λt)",
            "10. Aplicamos logaritmo: ln(0.8) = -λt",
            "11. Despejamos t: t = -ln(0.8)/λ = -ln(0.8)·5730/ln(2) ≈ 1844 años"
          ]
        }
      ]
    },
    {
      id: 2,
      title: "Separación de variables",
      description: "Método clásico para EDOs",
      imageUrl: "/assets/examples/separacion_variables.jpg",
      examples: [
        {
          title: "Ecuación Homogénea",
          problem: "Resolver: dy/dx = (x² + y²)/(2xy)",
          solution: [
            "1. Verificamos si es homogénea: f(tx, ty) = f(x, y)",
            "2. f(tx, ty) = ((tx)² + (ty)²)/(2(tx)(ty)) = t²(x² + y²)/(2t²xy) = f(x, y) ✓",
            "3. Hacemos sustitución: y = vx, dy = vdx + xdv",
            "4. Sustituimos: vdx + xdv = (x² + (vx)²)/(2x(vx))",
            "5. Simplificamos: vdx + xdv = (x² + v²x²)/(2vx²)",
            "6. Factorizamos: vdx + xdv = x²(1 + v²)/(2vx²) = (1 + v²)/(2v)",
            "7. Separamos: xdv = (1 + v²)/(2v) - v = (1 + v² - 2v²)/(2v) = (1 - v²)/(2v)",
            "8. Reorganizamos: 2v/(1 - v²) dv = dx/x",
            "9. Integramos: ∫2v/(1 - v²) dv = ∫dx/x",
            "10. Usamos sustitución u = 1 - v²: -ln|1 - v²| = ln|x| + C",
            "11. Aplicamos exponencial: 1/(1 - v²) = Cx",
            "12. Sustituimos v = y/x: 1/(1 - (y/x)²) = Cx",
            "13. Solución implícita: x²/(x² - y²) = Cx → x = C(x² - y²)"
          ]
        },
        {
          title: "Ecuación de Bernoulli",
          problem: "Resolver: dy/dx + y = xy³",
          solution: [
            "1. Forma estándar: dy/dx + P(x)y = Q(x)yⁿ",
            "2. Identificamos: P(x) = 1, Q(x) = x, n = 3",
            "3. Hacemos sustitución: u = y^(1-n) = y^(-2)",
            "4. Derivamos: du/dx = -2y^(-3) dy/dx",
            "5. Despejamos dy/dx: dy/dx = -(y³/2) du/dx",
            "6. Sustituimos en la ecuación original:",
            "7. -(y³/2) du/dx + y = xy³",
            "8. Dividimos por y³: -(1/2) du/dx + y^(-2) = x",
            "9. Sustituimos u = y^(-2): -(1/2) du/dx + u = x",
            "10. Reorganizamos: du/dx - 2u = -2x",
            "11. Factor integrante: μ = e^(∫-2dx) = e^(-2x)",
            "12. Multiplicamos: e^(-2x) du/dx - 2e^(-2x)u = -2xe^(-2x)",
            "13. Lado izquierdo es derivada: d/dx[e^(-2x)u] = -2xe^(-2x)",
            "14. Integramos: e^(-2x)u = ∫-2xe^(-2x)dx = xe^(-2x) + (1/2)e^(-2x) + C",
            "15. Despejamos u: u = x + 1/2 + Ce^(2x)",
            "16. Sustituimos u = y^(-2): y^(-2) = x + 1/2 + Ce^(2x)",
            "17. Solución: y² = 1/(x + 1/2 + Ce^(2x))"
          ]
        },
        {
          title: "Ecuación Exacta",
          problem: "Resolver: (2xy + 1)dx + (x² + 2y)dy = 0",
          solution: [
            "1. Verificamos si es exacta: ∂M/∂y = ∂N/∂x",
            "2. M = 2xy + 1, N = x² + 2y",
            "3. ∂M/∂y = 2x, ∂N/∂x = 2x ✓ (Es exacta)",
            "4. Buscamos F(x,y) tal que ∂F/∂x = M y ∂F/∂y = N",
            "5. Integramos M respecto a x: F = ∫(2xy + 1)dx = x²y + x + g(y)",
            "6. Derivamos respecto a y: ∂F/∂y = x² + g'(y) = N = x² + 2y",
            "7. Igualamos: x² + g'(y) = x² + 2y",
            "8. Despejamos g'(y): g'(y) = 2y",
            "9. Integramos: g(y) = y² + C",
            "10. Solución: F(x,y) = x²y + x + y² = C",
            "11. Verificación: ∂F/∂x = 2xy + 1 = M ✓, ∂F/∂y = x² + 2y = N ✓"
          ]
        }
      ]
    },
    {
      id: 3,
      title: "Campos de pendientes",
      description: "Representación gráfica de soluciones",
      imageUrl: "/assets/examples/campos_de_pendientes.jpg",
      examples: [
        {
          title: "Campo de Pendientes Básico",
          problem: "Dibujar el campo de pendientes para dy/dx = x - y",
          solution: [
            "1. La pendiente en cada punto (x,y) es m = x - y",
            "2. Para x = 0: m = -y (pendientes negativas si y > 0)",
            "3. Para y = 0: m = x (pendientes positivas si x > 0)",
            "4. En la línea y = x: m = 0 (pendientes horizontales)",
            "5. Arriba de y = x: m < 0 (pendientes hacia abajo)",
            "6. Abajo de y = x: m > 0 (pendientes hacia arriba)",
            "7. Las curvas solución tienden a la línea y = x - 1",
            "8. Solución general: y = x - 1 + Ce^(-x)",
            "9. Para C = 0: y = x - 1 (línea recta)",
            "10. Para C > 0: curvas por encima de la línea",
            "11. Para C < 0: curvas por debajo de la línea"
          ]
        },
        {
          title: "Campo de Pendientes con Puntos de Equilibrio",
          problem: "Analizar dy/dx = y² - 4",
          solution: [
            "1. Puntos de equilibrio: y² - 4 = 0 → y = ±2",
            "2. Para y > 2: dy/dx > 0 (soluciones crecientes)",
            "3. Para -2 < y < 2: dy/dx < 0 (soluciones decrecientes)",
            "4. Para y < -2: dy/dx > 0 (soluciones crecientes)",
            "5. En y = 2: punto de equilibrio inestable",
            "6. En y = -2: punto de equilibrio estable",
            "7. Solución general: y = 2(Ce^(4x) + 1)/(Ce^(4x) - 1)",
            "8. Para C = 0: y = -2 (solución constante)",
            "9. Para C → ∞: y → 2 (asíntota horizontal)",
            "10. Las soluciones con y(0) > 2 tienden a +∞",
            "11. Las soluciones con y(0) < 2 tienden a -2"
          ]
        },
        {
          title: "Campo de Pendientes Periódico",
          problem: "Estudiar dy/dx = sin(x) + cos(y)",
          solution: [
            "1. La pendiente es periódica en ambas variables",
            "2. Período en x: 2π, Período en y: 2π",
            "3. Puntos de equilibrio: sin(x) + cos(y) = 0",
            "4. Esto ocurre cuando sin(x) = -cos(y)",
            "5. Usando identidad: sin(x) = sin(y + π/2)",
            "6. Soluciones: x = y + π/2 + 2πn o x = π - y - π/2 + 2πn",
            "7. Líneas de pendiente cero: y = -x + π/2 + 2πn",
            "8. Líneas de pendiente máxima: y = x - π/2 + 2πn",
            "9. El campo tiene simetría rotacional",
            "10. Las soluciones pueden ser periódicas o cuasiperiódicas",
            "11. Comportamiento complejo cerca de los puntos de equilibrio"
          ]
        }
      ]
    },
    {
      id: 4,
      title: "Método de Euler",
      description: "Aproximación numérica para EDOs",
      imageUrl: "/assets/examples/metodo_euler.jpg",
      examples: [
        {
          title: "Aproximación Básica",
          problem: "Aproximar y(1) para dy/dx = x + y, y(0) = 1, usando h = 0.2",
          solution: [
            "1. Fórmula de Euler: y_{n+1} = y_n + h·f(x_n, y_n)",
            "2. Condiciones: x₀ = 0, y₀ = 1, h = 0.2",
            "3. Paso 1: x₁ = 0 + 0.2 = 0.2",
            "4. y₁ = 1 + 0.2(0 + 1) = 1 + 0.2 = 1.2",
            "5. Paso 2: x₂ = 0.2 + 0.2 = 0.4",
            "6. y₂ = 1.2 + 0.2(0.2 + 1.2) = 1.2 + 0.28 = 1.48",
            "7. Paso 3: x₃ = 0.4 + 0.2 = 0.6",
            "8. y₃ = 1.48 + 0.2(0.4 + 1.48) = 1.48 + 0.376 = 1.856",
            "9. Paso 4: x₄ = 0.6 + 0.2 = 0.8",
            "10. y₄ = 1.856 + 0.2(0.6 + 1.856) = 1.856 + 0.4912 = 2.3472",
            "11. Paso 5: x₅ = 0.8 + 0.2 = 1.0",
            "12. y₅ = 2.3472 + 0.2(0.8 + 2.3472) = 2.3472 + 0.62944 = 2.9766",
            "13. Aproximación: y(1) ≈ 2.9766"
          ]
        },
        {
          title: "Comparación con Solución Exacta",
          problem: "Comparar Euler con solución exacta para dy/dx = 2x, y(0) = 1",
          solution: [
            "1. Solución exacta: y = x² + 1",
            "2. Usando h = 0.5, aproximamos y(2)",
            "3. Euler: y₁ = 1 + 0.5(2·0) = 1, y₂ = 1 + 0.5(2·0.5) = 1.5",
            "4. y₃ = 1.5 + 0.5(2·1) = 2.5, y₄ = 2.5 + 0.5(2·1.5) = 4",
            "5. Aproximación Euler: y(2) ≈ 4",
            "6. Solución exacta: y(2) = 2² + 1 = 5",
            "7. Error absoluto: |4 - 5| = 1",
            "8. Error relativo: 1/5 = 20%",
            "9. Con h = 0.25: y(2) ≈ 4.5 (error = 10%)",
            "10. Con h = 0.125: y(2) ≈ 4.75 (error = 5%)",
            "11. El error es proporcional a h (método de primer orden)"
          ]
        },
        {
          title: "Método de Euler Mejorado",
          problem: "Aplicar Euler mejorado a dy/dx = y - x, y(0) = 2, h = 0.1",
          solution: [
            "1. Fórmula mejorada: y_{n+1} = y_n + (h/2)[f(x_n,y_n) + f(x_{n+1},y_n^*)]",
            "2. Donde y_n^* = y_n + h·f(x_n,y_n) (predicción de Euler)",
            "3. Condiciones: x₀ = 0, y₀ = 2, h = 0.1",
            "4. Paso 1: y₀^* = 2 + 0.1(2 - 0) = 2.2",
            "5. y₁ = 2 + 0.05[(2-0) + (2.2-0.1)] = 2 + 0.05[2 + 2.1] = 2.205",
            "6. Paso 2: y₁^* = 2.205 + 0.1(2.205 - 0.1) = 2.3155",
            "7. y₂ = 2.205 + 0.05[(2.205-0.1) + (2.3155-0.2)] = 2.205 + 0.05[2.105 + 2.1155] = 2.416",
            "8. El método mejorado tiene error O(h²) vs O(h) del Euler básico",
            "9. Es más preciso pero requiere más cálculos por paso",
            "10. Para h = 0.1: y(1) ≈ 4.371 (Euler mejorado)",
            "11. Solución exacta: y(1) = e + 1 ≈ 3.718"
          ]
        }
      ]
    },
    {
      id: 5,
      title: "Existencia y unicidad de soluciones",
      description: "Teorema fundamental de EDOs",
      imageUrl: "/assets/examples/existencia_y_unicidad.jpg",
      examples: [
        {
          title: "Teorema de Picard-Lindelöf",
          problem: "Verificar existencia y unicidad para dy/dx = √y, y(0) = 0",
          solution: [
            "1. Función: f(x,y) = √y",
            "2. Verificamos continuidad: f es continua para y ≥ 0",
            "3. Verificamos Lipschitz: |f(x,y₁) - f(x,y₂)| = |√y₁ - √y₂|",
            "4. Usando desigualdad: |√y₁ - √y₂| ≤ |y₁ - y₂|/(2√min(y₁,y₂))",
            "5. No es Lipschitz en y = 0 (división por cero)",
            "6. Teorema no garantiza unicidad en y = 0",
            "7. Soluciones múltiples: y = 0 y y = x²/4",
            "8. Ambas satisfacen y(0) = 0 y dy/dx = √y",
            "9. La no unicidad se debe a la violación de la condición de Lipschitz",
            "10. En y > 0: f es Lipschitz localmente",
            "11. Existe solución única para y(0) = a > 0"
          ]
        },
        {
          title: "Condición de Lipschitz",
          problem: "Verificar si f(x,y) = y² satisface condición de Lipschitz",
          solution: [
            "1. Función: f(x,y) = y²",
            "2. Diferencia: |f(x,y₁) - f(x,y₂)| = |y₁² - y₂²| = |y₁ - y₂||y₁ + y₂|",
            "3. Para condición de Lipschitz: |f(x,y₁) - f(x,y₂)| ≤ L|y₁ - y₂|",
            "4. Necesitamos: |y₁ + y₂| ≤ L para todo y₁, y₂",
            "5. Pero |y₁ + y₂| puede ser arbitrariamente grande",
            "6. No existe L tal que |y₁ + y₂| ≤ L para todo y₁, y₂",
            "7. f(x,y) = y² NO satisface condición de Lipschitz global",
            "8. Sin embargo, es Lipschitz localmente en conjuntos acotados",
            "9. En |y| ≤ M: |y₁ + y₂| ≤ 2M, entonces L = 2M",
            "10. Teorema garantiza existencia y unicidad local",
            "11. Solución puede explotar en tiempo finito"
          ]
        },
        {
          title: "Aplicación Práctica",
          problem: "Analizar dy/dx = 1/(x² + y²), y(0) = 1",
          solution: [
            "1. Función: f(x,y) = 1/(x² + y²)",
            "2. Dominio: D = {(x,y) | x² + y² ≠ 0}",
            "3. Punto inicial (0,1) ∈ D ✓",
            "4. Verificamos continuidad: f es continua en D",
            "5. Verificamos Lipschitz: ∂f/∂y = -2y/(x² + y²)²",
            "6. |∂f/∂y| = 2|y|/(x² + y²)² ≤ 2|y|/(x² + y²)²",
            "7. En una vecindad de (0,1): |∂f/∂y| ≤ 2/(1 + ε)² < ∞",
            "8. f satisface condición de Lipschitz localmente",
            "9. Teorema garantiza existencia y unicidad local",
            "10. Solución existe en algún intervalo (-δ, δ)",
            "11. La solución puede no existir globalmente"
          ]
        }
      ]
    },
    {
      id: 6,
      title: "Equilibrio y línea de fase",
      description: "Estudio del comportamiento de las soluciones",
      imageUrl: "/assets/examples/equilibrio_linea_fase.jpg",
      examples: [
        {
          title: "Análisis de Estabilidad",
          problem: "Analizar dy/dx = y(1 - y) para y > 0",
          solution: [
            "1. Puntos de equilibrio: y(1 - y) = 0 → y = 0, y = 1",
            "2. Para 0 < y < 1: dy/dx > 0 (soluciones crecientes)",
            "3. Para y > 1: dy/dx < 0 (soluciones decrecientes)",
            "4. En y = 0: f'(0) = 1 - 2(0) = 1 > 0 (inestable)",
            "5. En y = 1: f'(1) = 1 - 2(1) = -1 < 0 (estable)",
            "6. Línea de fase: ←→ 0 ←→ 1 ←",
            "7. Solución general: y = 1/(1 + Ce^(-x))",
            "8. Para y(0) = a ∈ (0,1): C = (1-a)/a > 0",
            "9. Solución tiende a 1 cuando x → ∞",
            "10. Para y(0) = a > 1: C = (1-a)/a < 0",
            "11. Solución tiende a 1 cuando x → ∞"
          ]
        },
        {
          title: "Bifurcación Saddle-Node",
          problem: "Estudiar dy/dx = r + y²",
          solution: [
            "1. Puntos de equilibrio: r + y² = 0 → y = ±√(-r)",
            "2. Para r > 0: No hay puntos de equilibrio reales",
            "3. Para r = 0: y = 0 (punto de equilibrio no hiperbólico)",
            "4. Para r < 0: y = ±√(-r) (dos puntos de equilibrio)",
            "5. Análisis de estabilidad: f'(y) = 2y",
            "6. En y = √(-r): f'(√(-r)) = 2√(-r) > 0 (inestable)",
            "7. En y = -√(-r): f'(-√(-r)) = -2√(-r) < 0 (estable)",
            "8. Diagrama de bifurcación:",
            "9. r < 0: dos equilibrios (uno estable, uno inestable)",
            "10. r = 0: bifurcación saddle-node",
            "11. r > 0: no hay equilibrios"
          ]
        },
        {
          title: "Sistema de Ecuaciones",
          problem: "Analizar dx/dt = x - y, dy/dt = x + y",
          solution: [
            "1. Punto de equilibrio: x - y = 0, x + y = 0 → (0,0)",
            "2. Matriz Jacobiana: J = [[1, -1], [1, 1]]",
            "3. Valores propios: det(J - λI) = (1-λ)² + 1 = λ² - 2λ + 2 = 0",
            "4. λ = 1 ± i (complejos con parte real positiva)",
            "5. Tipo de equilibrio: foco inestable (espiral hacia afuera)",
            "6. Solución general:",
            "7. x(t) = e^t(C₁cos(t) + C₂sin(t))",
            "8. y(t) = e^t(C₁sin(t) - C₂cos(t))",
            "9. Comportamiento: soluciones espirales que crecen",
            "10. No hay ciclos límite",
            "11. Todas las soluciones tienden a infinito"
          ]
        }
      ]
    },
    {
      id: 7,
      title: "Bifurcaciones",
      description: "Cambio en la dinámica del sistema con parámetros",
      imageUrl: "/assets/examples/bifurcaciones.jpg",
      examples: [
        {
          title: "Bifurcación Pitchfork",
          problem: "Analizar dy/dx = ry - y³",
          solution: [
            "1. Puntos de equilibrio: ry - y³ = 0 → y = 0, y = ±√r",
            "2. Para r < 0: Solo y = 0 existe",
            "3. Para r = 0: Solo y = 0 existe (bifurcación)",
            "4. Para r > 0: Tres equilibrios y = 0, ±√r",
            "5. Análisis de estabilidad: f'(y) = r - 3y²",
            "6. En y = 0: f'(0) = r",
            "7. r < 0: y = 0 estable, r > 0: y = 0 inestable",
            "8. En y = ±√r: f'(±√r) = r - 3r = -2r < 0 (estables)",
            "9. Diagrama de bifurcación:",
            "10. r < 0: un equilibrio estable en y = 0",
            "11. r > 0: un equilibrio inestable en y = 0, dos estables en ±√r"
          ]
        },
        {
          title: "Bifurcación de Hopf",
          problem: "Estudiar dx/dt = μx - y - x(x² + y²), dy/dt = x + μy - y(x² + y²)",
          solution: [
            "1. Punto de equilibrio: (0,0) para todo μ",
            "2. Matriz Jacobiana en (0,0): J = [[μ, -1], [1, μ]]",
            "3. Valores propios: λ = μ ± i",
            "4. Para μ < 0: Re(λ) < 0 (foco estable)",
            "5. Para μ = 0: Re(λ) = 0 (bifurcación de Hopf)",
            "6. Para μ > 0: Re(λ) > 0 (foco inestable)",
            "7. En coordenadas polares: r' = μr - r³, θ' = 1",
            "8. Ciclo límite: r = √μ (para μ > 0)",
            "9. Estabilidad del ciclo: r' = μr - r³ = r(μ - r²)",
            "10. Para r < √μ: r' > 0 (crece hacia el ciclo)",
            "11. Para r > √μ: r' < 0 (decrece hacia el ciclo) → ciclo estable"
          ]
        },
        {
          title: "Bifurcación Transcrítica",
          problem: "Analizar dy/dx = ry - y²",
          solution: [
            "1. Puntos de equilibrio: ry - y² = 0 → y = 0, y = r",
            "2. Para todo r: y = 0 siempre existe",
            "3. Para r ≠ 0: y = r también existe",
            "4. Análisis de estabilidad: f'(y) = r - 2y",
            "5. En y = 0: f'(0) = r",
            "6. En y = r: f'(r) = r - 2r = -r",
            "7. Para r < 0: y = 0 estable, y = r inestable",
            "8. Para r > 0: y = 0 inestable, y = r estable",
            "9. En r = 0: intercambio de estabilidad",
            "10. Diagrama de bifurcación:",
            "11. Las dos ramas se cruzan en r = 0 intercambiando estabilidad"
          ]
        }
      ]
    },
    {
      id: 8,
      title: "Ecuaciones diferenciales lineales",
      description: "EDOs de primer y segundo orden",
      imageUrl: "/assets/examples/ecuaciones_lineales.jpg",
      examples: [
        {
          title: "EDO Lineal de Primer Orden",
          problem: "Resolver dy/dx + 2y = e^(-x), y(0) = 1",
          solution: [
            "1. Forma estándar: dy/dx + P(x)y = Q(x)",
            "2. P(x) = 2, Q(x) = e^(-x)",
            "3. Factor integrante: μ = e^(∫2dx) = e^(2x)",
            "4. Multiplicamos: e^(2x)dy/dx + 2e^(2x)y = e^(2x)e^(-x) = e^x",
            "5. Lado izquierdo es derivada: d/dx[e^(2x)y] = e^x",
            "6. Integramos: e^(2x)y = ∫e^x dx = e^x + C",
            "7. Despejamos y: y = e^(-x) + Ce^(-2x)",
            "8. Condición inicial y(0) = 1: 1 = e^0 + Ce^0 = 1 + C",
            "9. C = 0",
            "10. Solución particular: y = e^(-x)",
            "11. Verificación: y' = -e^(-x), y' + 2y = -e^(-x) + 2e^(-x) = e^(-x) ✓"
          ]
        },
        {
          title: "EDO Lineal de Segundo Orden Homogénea",
          problem: "Resolver y'' - 3y' + 2y = 0",
          solution: [
            "1. Ecuación característica: r² - 3r + 2 = 0",
            "2. Factorizamos: (r - 1)(r - 2) = 0",
            "3. Raíces: r₁ = 1, r₂ = 2 (reales y distintas)",
            "4. Solución general: y = C₁e^x + C₂e^(2x)",
            "5. Verificación: y' = C₁e^x + 2C₂e^(2x)",
            "6. y'' = C₁e^x + 4C₂e^(2x)",
            "7. Sustituimos: (C₁e^x + 4C₂e^(2x)) - 3(C₁e^x + 2C₂e^(2x)) + 2(C₁e^x + C₂e^(2x))",
            "8. = C₁e^x(1 - 3 + 2) + C₂e^(2x)(4 - 6 + 2) = 0 ✓",
            "9. Para condiciones iniciales y(0) = 1, y'(0) = 0:",
            "10. 1 = C₁ + C₂, 0 = C₁ + 2C₂",
            "11. Resolviendo: C₁ = 2, C₂ = -1 → y = 2e^x - e^(2x)"
          ]
        },
        {
          title: "EDO Lineal de Segundo Orden No Homogénea",
          problem: "Resolver y'' + y = sin(x)",
          solution: [
            "1. Ecuación homogénea: y'' + y = 0",
            "2. Ecuación característica: r² + 1 = 0 → r = ±i",
            "3. Solución homogénea: y_h = C₁cos(x) + C₂sin(x)",
            "4. Método de coeficientes indeterminados:",
            "5. Como sin(x) está en y_h, probamos y_p = Ax cos(x) + Bx sin(x)",
            "6. y_p' = A cos(x) - Ax sin(x) + B sin(x) + Bx cos(x)",
            "7. y_p'' = -2A sin(x) - Ax cos(x) + 2B cos(x) - Bx sin(x)",
            "8. Sustituimos: (-2A sin(x) - Ax cos(x) + 2B cos(x) - Bx sin(x)) + (Ax cos(x) + Bx sin(x)) = sin(x)",
            "9. Simplificamos: -2A sin(x) + 2B cos(x) = sin(x)",
            "10. Coeficientes: -2A = 1, 2B = 0 → A = -1/2, B = 0",
            "11. Solución particular: y_p = -(x/2)cos(x)",
            "12. Solución general: y = C₁cos(x) + C₂sin(x) - (x/2)cos(x)"
          ]
        }
      ]
    },
    {
      id: 9,
      title: "Cambios de variable",
      description: "Transformación de variables para simplificar la ecuación",
      imageUrl: "/assets/examples/cambios_de_variable.jpg",
      examples: [
        {
          title: "Ecuación de Bernoulli",
          problem: "Resolver xy' + y = x²y² usando cambio de variable",
          solution: [
            "1. Forma estándar: y' + (1/x)y = xy²",
            "2. Es de Bernoulli con n = 2",
            "3. Cambio de variable: u = y^(1-2) = y^(-1) = 1/y",
            "4. Derivamos: u' = -y^(-2)y' = -y'/y²",
            "5. Despejamos y': y' = -y²u'",
            "6. Sustituimos: x(-y²u') + y = x²y²",
            "7. Dividimos por y²: -xu' + (1/y) = x²",
            "8. Sustituimos u = 1/y: -xu' + u = x²",
            "9. Reorganizamos: u' - (1/x)u = -x",
            "10. EDO lineal: u' + P(x)u = Q(x) con P(x) = -1/x, Q(x) = -x",
            "11. Factor integrante: μ = e^(∫-1/x dx) = e^(-ln|x|) = 1/|x|",
            "12. Para x > 0: μ = 1/x",
            "13. Multiplicamos: (1/x)u' - (1/x²)u = -1",
            "14. Lado izquierdo: d/dx[u/x] = -1",
            "15. Integramos: u/x = -x + C → u = -x² + Cx",
            "16. Sustituimos u = 1/y: 1/y = -x² + Cx",
            "17. Solución: y = 1/(-x² + Cx)"
          ]
        },
        {
          title: "Ecuación Homogénea",
          problem: "Resolver (x + y)dx + (x - y)dy = 0",
          solution: [
            "1. Verificamos homogeneidad: f(tx, ty) = f(x, y)",
            "2. f(tx, ty) = (tx + ty)/(tx - ty) = t(x + y)/t(x - y) = f(x, y) ✓",
            "3. Cambio de variable: y = vx, dy = vdx + xdv",
            "4. Sustituimos: (x + vx)dx + (x - vx)(vdx + xdv) = 0",
            "5. Factorizamos: x(1 + v)dx + x(1 - v)(vdx + xdv) = 0",
            "6. Dividimos por x: (1 + v)dx + (1 - v)(vdx + xdv) = 0",
            "7. Expandimos: (1 + v)dx + v(1 - v)dx + x(1 - v)dv = 0",
            "8. Agrupamos: [1 + v + v(1 - v)]dx + x(1 - v)dv = 0",
            "9. Simplificamos: (1 + v + v - v²)dx + x(1 - v)dv = 0",
            "10. (1 + 2v - v²)dx + x(1 - v)dv = 0",
            "11. Separamos: dx/x = -(1 - v)/(1 + 2v - v²) dv",
            "12. Integramos: ln|x| = -∫(1 - v)/(1 + 2v - v²) dv + C",
            "13. Usando fracciones parciales y regresando a y = vx"
          ]
        },
        {
          title: "Ecuación de Riccati",
          problem: "Resolver y' = y² + (1/x)y - 1/x² con solución particular y₁ = 1/x",
          solution: [
            "1. Ecuación de Riccati: y' = P(x) + Q(x)y + R(x)y²",
            "2. Con P(x) = -1/x², Q(x) = 1/x, R(x) = 1",
            "3. Solución particular conocida: y₁ = 1/x",
            "4. Cambio de variable: y = y₁ + 1/u = 1/x + 1/u",
            "5. Derivamos: y' = -1/x² - u'/u²",
            "6. Sustituimos en la ecuación:",
            "7. -1/x² - u'/u² = (1/x + 1/u)² + (1/x)(1/x + 1/u) - 1/x²",
            "8. Expandimos: -1/x² - u'/u² = 1/x² + 2/(xu) + 1/u² + 1/x² + 1/(xu) - 1/x²",
            "9. Simplificamos: -1/x² - u'/u² = 1/x² + 3/(xu) + 1/u²",
            "10. Reorganizamos: -u'/u² = 2/x² + 3/(xu) + 1/u²",
            "11. Multiplicamos por u²: -u' = 2u²/x² + 3u/x + 1",
            "12. Reorganizamos: u' + (3/x)u = -2u²/x² - 1",
            "13. Es una ecuación de Bernoulli con n = 2",
            "14. Cambio: v = u^(-1), v' = -u^(-2)u'",
            "15. Resolvemos la ecuación lineal resultante"
          ]
        }
      ]
    }
  ];

  return (
    <div className="mx-auto max-w-6xl p-6 text-white">
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">?? Ejemplos</h1>

      {/* Ejemplos */}
      <div className="space-y-6">
        {examples.map((topic) => (
          <div
            key={topic.id}
            className="bg-gradient-to-r from-slate-900/70 to-slate-800/70 rounded-xl overflow-hidden border-2 border-cyan-400/40 transition duration-300 hover:shadow-xl hover:shadow-cyan-500/20 cursor-pointer backdrop-blur-sm"
            onClick={() => setOpenId((prev) => (prev === topic.id ? null : topic.id))}
          >
            <div className="flex">
              <img
                src={topic.imageUrl}
                alt={topic.title}
                className="w-32 h-32 object-cover flex-shrink-0"
              />
              <div className="p-4 flex-1">
                <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
                <p className="text-slate-400">{topic.description}</p>
                <div className="mt-2 text-sm text-sky-400">
                  {openId === topic.id ? '▼ Cerrar ejemplos' : '▶ Ver ejemplos'}
                </div>
              </div>
            </div>

            {/* Contenido expandible dentro de la tarjeta */}
            {openId === topic.id && (
              <div className="px-4 pb-4">
                <h4 className="text-xl font-bold text-sky-400 mb-4">Ejemplos Detallados</h4>

                {topic.examples && topic.examples.map((ex, index) => (
                  <div key={index} className="bg-gradient-to-r from-cyan-800/60 to-blue-800/60 rounded-lg p-4 mb-4 border border-cyan-400/30 backdrop-blur-sm">
                    <h5 className="text-lg font-semibold text-green-400 mb-2">
                      {index + 1}. {ex.title}
                    </h5>

                    <div className="bg-gradient-to-r from-yellow-800/30 to-orange-800/30 rounded p-3 mb-3 border border-yellow-400/20">
                      <span className="text-yellow-300 font-medium">Problema:</span>
                      <p className="text-yellow-100 mt-1">{ex.problem}</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-800/40 to-emerald-800/40 rounded p-3 border border-green-400/20">
                      <span className="text-yellow-400 font-medium">Solución paso a paso:</span>
                      <ol className="space-y-2 mt-2">
                        {ex.solution.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                              {stepIndex + 1}
                            </span>
                            <span className="text-green-100 leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}










