-- Script de inicialización de datos para la base ecuationsd
-- Ejecuta este archivo en MySQL (por ejemplo: mysql -u root -p ecuationsd < backend/db/seed.sql)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS temas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  titulo VARCHAR(120) NOT NULL,
  descripcion TEXT NULL,
  orden INT NOT NULL DEFAULT 0,
  cover_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aventuras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(80) NOT NULL UNIQUE,
  titulo VARCHAR(150) NOT NULL,
  resumen TEXT NOT NULL,
  dificultad ENUM('Facil','Media','Dificil') NOT NULL DEFAULT 'Facil',
  cover_url VARCHAR(255) NULL,
  tema_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tema_id) REFERENCES temas(id)
);

CREATE TABLE IF NOT EXISTS misiones (
  id VARCHAR(50) PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  estado_default ENUM('bloqueado','en-curso','completado','jugar') NOT NULL DEFAULT 'bloqueado',
  dificultad ENUM('facil','media','dificil') NOT NULL DEFAULT 'facil',
  tema_id INT NULL,
  orden INT NOT NULL DEFAULT 0,
  descripcion TEXT NULL,
  environment_key VARCHAR(40) DEFAULT 'default',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tema_id) REFERENCES temas(id)
);

CREATE TABLE IF NOT EXISTS mision_pasos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mision_id VARCHAR(50) NOT NULL,
  paso INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  expresion VARCHAR(255) NULL,
  UNIQUE KEY unique_paso (mision_id, paso),
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mision_collectibles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mision_id VARCHAR(50) NOT NULL,
  orden INT NOT NULL,
  pos_x INT NOT NULL,
  pos_y INT NOT NULL,
  simbolo VARCHAR(50) NOT NULL,
  tipo ENUM('fruit','pearl','special','coin') NOT NULL DEFAULT 'fruit',
  valor INT NOT NULL DEFAULT 0,
  UNIQUE KEY unique_collectible (mision_id, orden),
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mision_enemigos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mision_id VARCHAR(50) NOT NULL,
  orden INT NOT NULL,
  pos_x INT NOT NULL,
  pos_y INT NOT NULL,
  tipo ENUM('spike','moving') NOT NULL DEFAULT 'spike',
  velocidad DECIMAL(5,2) NOT NULL DEFAULT 0,
  UNIQUE KEY unique_enemy (mision_id, orden),
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mision_plataformas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mision_id VARCHAR(50) NOT NULL,
  orden INT NOT NULL,
  pos_x INT NOT NULL,
  pos_y INT NOT NULL,
  ancho INT NOT NULL,
  alto INT NOT NULL,
  UNIQUE KEY unique_platform (mision_id, orden),
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ayudas_tema (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tema_id INT NOT NULL,
  orden INT NOT NULL,
  texto VARCHAR(255) NOT NULL,
  UNIQUE KEY unique_ayuda (tema_id, orden),
  FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pasos_tema (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tema_id INT NOT NULL,
  orden INT NOT NULL,
  texto VARCHAR(255) NOT NULL,
  UNIQUE KEY unique_paso_tema (tema_id, orden),
  FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  etiqueta VARCHAR(80) NOT NULL,
  ruta VARCHAR(120) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  requiere_auth TINYINT(1) NOT NULL DEFAULT 0,
  solo_invited TINYINT(1) NOT NULL DEFAULT 0,
  icono VARCHAR(20) NULL,
  UNIQUE KEY unique_ruta (ruta)
);

CREATE TABLE IF NOT EXISTS home_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(60) NOT NULL UNIQUE,
  titulo VARCHAR(150) NOT NULL,
  subtitulo VARCHAR(255) NULL,
  contenido TEXT NULL,
  cta_text VARCHAR(120) NULL,
  cta_url VARCHAR(200) NULL,
  orden INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS personajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(60) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  rol VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  imagen_url VARCHAR(255) NOT NULL,
  orden INT NOT NULL DEFAULT 0
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(120) NOT NULL UNIQUE,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progreso_misiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  mision_id VARCHAR(50) NOT NULL,
  estado ENUM('bloqueado','en-curso','completado') NOT NULL DEFAULT 'bloqueado',
  monedas INT NOT NULL DEFAULT 0,
  vidas INT NOT NULL DEFAULT 0,
  tesoros INT NOT NULL DEFAULT 0,
  ecuaciones_resueltas INT NOT NULL DEFAULT 0,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_mision (user_id, mision_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mision_id) REFERENCES misiones(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS niveles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion VARCHAR(255) NULL,
  categoria ENUM('basico','intermedio','avanzado','experto') NOT NULL DEFAULT 'basico',
  desafio VARCHAR(120) NOT NULL,
  respuesta INT NOT NULL,
  recompensa_monedas INT NOT NULL DEFAULT 0,
  recompensa_vidas INT NOT NULL DEFAULT 0,
  recompensa_armas INT NOT NULL DEFAULT 0,
  orden INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS progreso_niveles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nivel_id INT NOT NULL,
  completado TINYINT(1) NOT NULL DEFAULT 0,
  intentos INT NOT NULL DEFAULT 0,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_nivel (user_id, nivel_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (nivel_id) REFERENCES niveles(id) ON DELETE CASCADE
);

-- Tabla para restablecimiento de contraseñas
CREATE TABLE IF NOT EXISTS password_resets (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_token (token),
  UNIQUE KEY uniq_user (user_id),
  CONSTRAINT fk_password_resets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================
-- Datos semilla
-- ============================

-- Usuario inicial (password en texto plano; se encripta luego por UPDATE)
INSERT INTO users (full_name, phone, email, username, password_hash, role)
VALUES (
  'victor Manuel sarrias tique',
  '3188572770',
  'victorsarrias@udla.edu.com',
  'victorusuario',
  'victorusuario', -- Cuidado: contraseña NO encriptada
  'student'
);

INSERT INTO temas (slug, titulo, descripcion, orden, cover_url)
VALUES
  ('separacion-variables', 'Separacion de variables', 'Introduccion a las ecuaciones separables y su resolucion paso a paso.', 1, '/assets/temas/separacion.jpg'),
  ('lineales-primer-orden', 'Lineales de primer orden', 'Metodos para resolver ecuaciones diferenciales lineales de primer orden.', 2, '/assets/temas/lineales.jpg'),
  ('bifurcaciones', 'Bifurcaciones', 'Analisis cualitativo y tipos comunes de bifurcaciones.', 3, '/assets/temas/bifurcaciones.jpg'),
  ('sistemas-dinamicos', 'Sistemas dinamicos', 'Exploracion de sistemas dinamicos, estabilidad y atractores.', 4, '/assets/temas/sistemas.jpg'),
  ('modelado-ed', 'Modelado con ecuaciones diferenciales', 'Planteamiento de modelos a partir de fenomenos reales.', 0, '/assets/temas/modelado.jpg')
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  descripcion = VALUES(descripcion),
  orden = VALUES(orden),
  cover_url = VALUES(cover_url);

INSERT INTO aventuras (slug, titulo, resumen, dificultad, cover_url, tema_id)
VALUES
  ('empezando-aventura', 'Empezando una aventura', 'Tu primera incursion: identifica el metodo y separa variables con calma.', 'Facil', '/assets/aventuras/empezando.jpg', (SELECT id FROM temas WHERE slug = 'separacion-variables')),
  ('galaxia-caotica', 'La galaxia caotica', 'Rutas inestables y equilibrios: lee el campo, detecta lineas de fase.', 'Media', '/assets/aventuras/galaxia.jpg', (SELECT id FROM temas WHERE slug = 'separacion-variables')),
  ('valle-sombras', 'El valle de las sombras', 'Soluciones transitorias y permanentes; interpreta y(x) sin perderte.', 'Media', '/assets/aventuras/valle.jpg', (SELECT id FROM temas WHERE slug = 'lineales-primer-orden')),
  ('piratas-inframundo', 'Piratas del inframundo', 'Navega por aguas turbulentas: ecuaciones no lineales y bifurcaciones.', 'Dificil', '/assets/aventuras/piratas.jpg', (SELECT id FROM temas WHERE slug = 'bifurcaciones')),
  ('inframundo-matematico', 'El inframundo matematico', 'Descenso a las profundidades: sistemas dinamicos y estabilidad.', 'Dificil', '/assets/aventuras/inframundo.jpg', (SELECT id FROM temas WHERE slug = 'sistemas-dinamicos'))
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  resumen = VALUES(resumen),
  dificultad = VALUES(dificultad),
  cover_url = VALUES(cover_url),
  tema_id = VALUES(tema_id);

INSERT INTO misiones (id, titulo, estado_default, dificultad, tema_id, orden, descripcion, environment_key)
VALUES
  ('modelado', 'Modelado por medio de E.D', 'completado', 'facil', (SELECT id FROM temas WHERE slug = 'modelado-ed'), 1, 'Aprende a traducir un fenomeno real en una ecuacion diferencial.', 'default'),
  ('separables', 'Separacion de variables', 'en-curso', 'facil', (SELECT id FROM temas WHERE slug = 'separacion-variables'), 2, 'Practica el metodo clasico de separar variables.', 'cosmic'),
  ('cualitativo', 'Procedimiento cualitativo', 'jugar', 'media', (SELECT id FROM temas WHERE slug = 'separacion-variables'), 3, 'Analiza el campo de direcciones y el equilibrio de soluciones.', 'default'),
  ('euler', 'Metodo de Euler', 'bloqueado', 'media', (SELECT id FROM temas WHERE slug = 'lineales-primer-orden'), 4, 'Construye soluciones numericas por pasos con el metodo de Euler.', 'default'),
  ('existencia', 'Existencia y unicidad', 'bloqueado', 'media', (SELECT id FROM temas WHERE slug = 'lineales-primer-orden'), 5, 'Comprende cuando una solucion esta garantizada.', 'default'),
  ('fase', 'Equilibrio y linea de fase', 'bloqueado', 'media', (SELECT id FROM temas WHERE slug = 'bifurcaciones'), 6, 'Estudia lineas de fase y estabilidad.', 'default'),
  ('bifurcaciones', 'Bifurcaciones', 'bloqueado', 'dificil', (SELECT id FROM temas WHERE slug = 'bifurcaciones'), 7, 'Identifica y clasifica bifurcaciones comunes.', 'cosmic'),
  ('lineales', 'Ecuaciones diferenciales lineales', 'bloqueado', 'media', (SELECT id FROM temas WHERE slug = 'lineales-primer-orden'), 8, 'Resuelve ecuaciones lineales de primer orden.', 'default'),
  ('cambio', 'Cambios de variable', 'bloqueado', 'dificil', (SELECT id FROM temas WHERE slug = 'sistemas-dinamicos'), 9, 'Utiliza sustituciones para simplificar ecuaciones.', 'default')
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  estado_default = VALUES(estado_default),
  dificultad = VALUES(dificultad),
  tema_id = VALUES(tema_id),
  orden = VALUES(orden),
  descripcion = VALUES(descripcion),
  environment_key = VALUES(environment_key);

-- Pasos para la mision "modelado"
INSERT INTO mision_pasos (mision_id, paso, titulo, expresion) VALUES
  ('modelado', 1, 'Identificar el problema', 'Crecimiento poblacional'),
  ('modelado', 2, 'Establecer variables', 'y(t) = poblacion en tiempo t'),
  ('modelado', 3, 'Formular la ecuacion diferencial', 'dy/dt = ky'),
  ('modelado', 4, 'Separar variables', 'dy/y = k dt'),
  ('modelado', 5, 'Integrar', 'ln|y| = kt + C'),
  ('modelado', 6, 'Resolver para y', 'y = C e^(kt)'),
  ('modelado', 7, 'Aplicar condicion inicial', 'y(0) = y0'),
  ('modelado', 8, 'Solucion particular', 'y = y0 e^(kt)')
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  expresion = VALUES(expresion);

INSERT INTO mision_collectibles (mision_id, orden, pos_x, pos_y, simbolo, tipo, valor) VALUES
  ('modelado', 1, 250, 400, 'y', 'fruit', 10),
  ('modelado', 2, 450, 350, 't', 'fruit', 10),
  ('modelado', 3, 650, 450, 'k', 'pearl', 20),
  ('modelado', 4, 850, 380, 'dy', 'fruit', 10),
  ('modelado', 5, 1050, 420, 'dt', 'pearl', 30),
  ('modelado', 6, 1250, 400, 'ln', 'fruit', 10),
  ('modelado', 7, 1450, 360, 'e', 'pearl', 20),
  ('modelado', 8, 1650, 440, '∫', 'special', 50)
ON DUPLICATE KEY UPDATE
  pos_x = VALUES(pos_x),
  pos_y = VALUES(pos_y),
  simbolo = VALUES(simbolo),
  tipo = VALUES(tipo),
  valor = VALUES(valor);

INSERT INTO mision_enemigos (mision_id, orden, pos_x, pos_y, tipo, velocidad) VALUES
  ('modelado', 1, 300, 480, 'spike', 0),
  ('modelado', 2, 700, 480, 'moving', 0.5),
  ('modelado', 3, 1100, 480, 'spike', 0),
  ('modelado', 4, 1500, 480, 'moving', 0.5)
ON DUPLICATE KEY UPDATE
  pos_x = VALUES(pos_x),
  pos_y = VALUES(pos_y),
  tipo = VALUES(tipo),
  velocidad = VALUES(velocidad);

INSERT INTO mision_plataformas (mision_id, orden, pos_x, pos_y, ancho, alto) VALUES
  ('modelado', 1, 200, 400, 80, 20),
  ('modelado', 2, 500, 350, 100, 20),
  ('modelado', 3, 800, 300, 80, 20),
  ('modelado', 4, 1100, 380, 120, 20),
  ('modelado', 5, 1400, 320, 90, 20),
  ('modelado', 6, 1700, 400, 80, 20)
ON DUPLICATE KEY UPDATE
  pos_x = VALUES(pos_x),
  pos_y = VALUES(pos_y),
  ancho = VALUES(ancho),
  alto = VALUES(alto);

-- Pasos para la mision "separables"
INSERT INTO mision_pasos (mision_id, paso, titulo, expresion) VALUES
  ('separables', 1, 'Identificar tipo', 'dy/dx = f(x) g(y)'),
  ('separables', 2, 'Separar variables', 'dy/g(y) = f(x) dx'),
  ('separables', 3, 'Integrar ambos lados', '∫ dy/g(y) = ∫ f(x) dx'),
  ('separables', 4, 'Resolver integrales', 'G(y) = F(x) + C'),
  ('separables', 5, 'Despejar y', 'y = G^{-1}(F(x) + C)'),
  ('separables', 6, 'Aplicar condicion inicial', 'y(x0) = y0'),
  ('separables', 7, 'Encontrar constante', 'C = G(y0) - F(x0)'),
  ('separables', 8, 'Solucion particular', 'y = G^{-1}(F(x) + C)')
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  expresion = VALUES(expresion);

INSERT INTO mision_collectibles (mision_id, orden, pos_x, pos_y, simbolo, tipo, valor) VALUES
  ('separables', 1, 200, 400, 'dy', 'fruit', 10),
  ('separables', 2, 400, 350, 'dx', 'fruit', 10),
  ('separables', 3, 600, 450, 'f(x)', 'pearl', 20),
  ('separables', 4, 800, 380, 'g(y)', 'fruit', 10),
  ('separables', 5, 1000, 420, '∫', 'pearl', 30),
  ('separables', 6, 1200, 400, 'C', 'fruit', 10),
  ('separables', 7, 1400, 360, 'G(y)', 'pearl', 20),
  ('separables', 8, 1600, 440, 'F(x)', 'special', 50)
ON DUPLICATE KEY UPDATE
  pos_x = VALUES(pos_x),
  pos_y = VALUES(pos_y),
  simbolo = VALUES(simbolo),
  tipo = VALUES(tipo),
  valor = VALUES(valor);

INSERT INTO mision_enemigos (mision_id, orden, pos_x, pos_y, tipo, velocidad) VALUES
  ('separables', 1, 250, 480, 'spike', 0),
  ('separables', 2, 650, 480, 'moving', 0.5),
  ('separables', 3, 1050, 480, 'spike', 0),
  ('separables', 4, 1450, 480, 'moving', 0.5)
ON DUPLICATE KEY UPDATE
  pos_x = VALUES(pos_x),
  pos_y = VALUES(pos_y),
  tipo = VALUES(tipo),
  velocidad = VALUES(velocidad);

INSERT INTO mision_plataformas (mision_id, orden, pos_x, pos_y, ancho, alto) VALUES
  ('separables', 1, 150, 400, 80, 20),
  ('separables', 2, 450, 350, 100, 20),
  ('separables', 3, 750, 300, 80, 20),
  ('separables', 4, 1050, 380, 120, 20),
  ('separables', 5, 1350, 320, 90, 20),
  ('separables', 6, 1650, 400, 80, 20)
ON DUPLICATE KEY UPDATE
  pos_x = VALUES(pos_x),
  pos_y = VALUES(pos_y),
  ancho = VALUES(ancho),
  alto = VALUES(alto);

-- Ayudas y pasos por tema
INSERT INTO ayudas_tema (tema_id, orden, texto) VALUES
  ((SELECT id FROM temas WHERE slug = 'separacion-variables'), 1, '¿Puedes escribir y'' como f(x) · g(y)? Si es asi, es separable.'),
  ((SELECT id FROM temas WHERE slug = 'separacion-variables'), 2, 'Separa: dy/g(y) = f(x) dx.'),
  ((SELECT id FROM temas WHERE slug = 'separacion-variables'), 3, 'Integra ambos lados y agrega la constante C.'),
  ((SELECT id FROM temas WHERE slug = 'separacion-variables'), 4, 'Despeja y(x) si es posible.')
ON DUPLICATE KEY UPDATE
  texto = VALUES(texto);

INSERT INTO ayudas_tema (tema_id, orden, texto) VALUES
  ((SELECT id FROM temas WHERE slug = 'modelado-ed'), 1, 'Identifica las variables relevantes del fenomeno.'),
  ((SELECT id FROM temas WHERE slug = 'modelado-ed'), 2, 'Piensa en la relacion tasa de cambio vs magnitud.'),
  ((SELECT id FROM temas WHERE slug = 'modelado-ed'), 3, 'Verifica unidades y supuestos del modelo.')
ON DUPLICATE KEY UPDATE
  texto = VALUES(texto);

INSERT INTO pasos_tema (tema_id, orden, texto) VALUES
  ((SELECT id FROM temas WHERE slug = 'separacion-variables'), 1, 'Reconocer que la ecuacion es separable.'),
  ((SELECT id FROM temas WHERE slug = 'separacion-variables'), 2, 'Separar variables: dy/g(y) = f(x) dx.'),
  ((SELECT id FROM temas WHERE slug = 'separacion-variables'), 3, 'Integrar ambos lados.'),
  ((SELECT id FROM temas WHERE slug = 'separacion-variables'), 4, 'Agregar la constante C.'),
  ((SELECT id FROM temas WHERE slug = 'separacion-variables'), 5, 'Despejar la solucion.')
ON DUPLICATE KEY UPDATE
  texto = VALUES(texto);

-- Items del menu superior
INSERT INTO menu_items (etiqueta, ruta, orden, requiere_auth, solo_invited, icono) VALUES
  ('Inicio', '/', 1, 0, 0, 'home'),
  ('Misiones', '/misiones', 2, 0, 0, 'target'),
  ('Ejemplos', '/ejemplos', 3, 0, 0, 'book'),
  ('Niveles', '/niveles', 4, 0, 0, 'levels'),
  ('Jugar', '/jugar', 5, 0, 0, 'play'),
  ('Ayuda', '/ayuda', 6, 0, 0, 'help'),
  ('Aventuras', '/aventuras', 7, 0, 0, 'rocket'),
  ('Perfil', '/perfil', 8, 1, 0, 'user'),
  ('Iniciar sesion', '/auth', 9, 0, 1, 'login')
ON DUPLICATE KEY UPDATE
  etiqueta = VALUES(etiqueta),
  orden = VALUES(orden),
  requiere_auth = VALUES(requiere_auth),
  solo_invited = VALUES(solo_invited),
  icono = VALUES(icono);

-- Contenido de la pagina principal
INSERT INTO home_sections (slug, titulo, subtitulo, contenido, cta_text, cta_url, orden) VALUES
  ('hero', 'Ecuations-D', 'Un viaje interactivo por las ecuaciones diferenciales', 'Un juego educativo para aprender ecuaciones diferenciales en un entorno de aventuras. Explora mundos, reúne pistas y arma soluciones paso a paso con ayuda de tus aliados.', 'Jugar ahora', '/aventuras', 1),
  ('hero-secundario', 'Conoce a los personajes', 'Dif, Giro y Pilot', 'Cada personaje aporta habilidades especiales: el explorador Dif, el asistente Giro y el apoyo aéreo Pilot.', 'Ver personajes', '#personajes', 2)
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  subtitulo = VALUES(subtitulo),
  contenido = VALUES(contenido),
  cta_text = VALUES(cta_text),
  cta_url = VALUES(cta_url),
  orden = VALUES(orden);

INSERT INTO personajes (slug, nombre, rol, descripcion, imagen_url, orden) VALUES
  ('dif', 'Dif', 'Explorador', 'Marciano galactico que viaja entre mundos. Aprende resolviendo retos y recolectando elementos que forman la solucion.', '/assets/personajes/dif.png', 1),
  ('giro', 'Giro', 'Asistente', 'Robot consejero que ofrece pistas contextuales cuando presionas "Llamar a Giro".', '/assets/personajes/giro.png', 2),
  ('pilot', 'Pilot', 'Apoyo aereo', 'Companero en nave. Brinda apoyo y suministros durante los niveles.', '/assets/personajes/pilot.png', 3)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  rol = VALUES(rol),
  descripcion = VALUES(descripcion),
  imagen_url = VALUES(imagen_url),
  orden = VALUES(orden);

-- Niveles basicos (ejemplo deterministico)
INSERT INTO niveles (titulo, descripcion, categoria, desafio, respuesta, recompensa_monedas, recompensa_vidas, recompensa_armas, orden) VALUES
  ('Nivel 1', 'Suma basica', 'basico', '12 + 8 = ?', 20, 10, 1, 0, 1),
  ('Nivel 2', 'Resta basica', 'basico', '25 - 9 = ?', 16, 10, 1, 0, 2),
  ('Nivel 11', 'Multiplicacion', 'intermedio', '7 x 8 = ?', 56, 20, 2, 1, 11),
  ('Nivel 21', 'Ecuacion lineal', 'avanzado', '3x + 5 = 23', 6, 30, 3, 2, 21),
  ('Nivel 31', 'Ecuacion cuadratica', 'experto', 'x^2 - 9x = -20', 5, 50, 5, 3, 31)
ON DUPLICATE KEY UPDATE
  titulo = VALUES(titulo),
  descripcion = VALUES(descripcion),
  categoria = VALUES(categoria),
  desafio = VALUES(desafio),
  respuesta = VALUES(respuesta),
  recompensa_monedas = VALUES(recompensa_monedas),
  recompensa_vidas = VALUES(recompensa_vidas),
  recompensa_armas = VALUES(recompensa_armas),
  orden = VALUES(orden);

-- Progreso por defecto para el usuario de ejemplo (ajusta el ID segun corresponda)
-- UPDATE progreso_misiones SET ... donde corresponda, o elimina las filas si no las necesitas como semilla.

-- Fin del script
