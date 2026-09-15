/**
 * Imagenes de la plantilla, servidas desde Supabase Storage.
 *
 * No viven en el repo a proposito. En PNG sin optimizar pesaban 15,42 MB, que
 * Vite metia enteros en el bundle; en WebP y a 1200 px de lado son 1,18 MB.
 *
 * Los dos spritesheets del juego se suben SIN redimensionar: spring-game-art.ts
 * los recorta por coordenadas fijas (341/342 x 512), asi que cualquier cambio
 * de tamano corre los frames. Ahi 1024 px es parte del contrato, no una
 * preferencia.
 *
 * La base se arma con VITE_SUPABASE_URL en vez de hardcodear el dominio, para
 * que siga funcionando si el proyecto de Supabase cambia.
 */
const BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/flores-amarillas/plantilla-carlos-primavera`;

const asset = (nombre: string) => `${BASE}/${nombre}`;

export const assets = {
  /** Flor suelta: sello del sobre, adornos y separadores. */
  cardFlower: asset('card-flower.webp'),
  cardBoy: asset('card-boy.webp'),
  cardGirl: asset('card-girl.webp'),
  /** Camara de la pantalla de recuerdos. */
  memoryCamera: asset('memory-camera.webp'),
  /** Marco floral de la bienvenida; la variante movil es mas alta que ancha. */
  floralFrame: asset('floral-frame.webp'),
  floralFrameMobile: asset('floral-frame-mobile.webp'),
  /** Esquinas de la carta y del juego. */
  letterCornerFlowers: asset('letter-corner-flowers.webp'),
  /** Fondo del jardin del minijuego. */
  gameGarden: asset('game-garden.webp'),
  /** Spritesheets 1024x1024, sin redimensionar. */
  gameBoySheet: asset('game-boy-sheet.webp'),
  gameGirlSheet: asset('game-girl-sheet.webp'),
} as const;
