/**
 * Imagenes de la plantilla, servidas desde Supabase Storage.
 *
 * No viven en el repo a proposito. En PNG sin optimizar pesaban 53 MB, que
 * Vite metia enteros en el bundle: solo el primer slide eran 12 MB para quien
 * abria la dedicatoria, casi todo en dos adornos de esquina a 3808x3808 px.
 * Redimensionadas a 1200 px y en WebP son 3.2 MB en total, y ademas salen del
 * bundle y de la historia de git.
 *
 * La base se arma con VITE_SUPABASE_URL en vez de hardcodear el dominio, para
 * que siga funcionando si el proyecto de Supabase cambia.
 *
 * Los nombres son planos (slide_1-abajo_izq.webp y no slide_1/abajo_izq.webp)
 * porque la UI del dashboard no deja crear carpetas anidadas a mano.
 */
const BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/flores-amarillas/plantilla-luis-arce`;

const asset = (nombre: string) => `${BASE}/${nombre}`;

export const slide1 = {
  abajoDer: asset('slide_1-abajo_der.webp'),
  abajoIzq: asset('slide_1-abajo_izq.webp'),
  arribaIzq: asset('slide_1-arriba_izq.webp'),
  envelope: asset('slide_1-envelope.webp'),
  stickerHeart: asset('slide_1-sticker-heart.webp'),
};

export const slide2 = {
  abajoIzq: asset('slide_2-abajo_izq.webp'),
  bouquetLarge: asset('slide_2-bouquet-large.webp'),
  derecha: asset('slide_2-derecha.webp'),
  florIzq: asset('slide_2-flor_izq.webp'),
  stickerFlower: asset('slide_2-sticker-flower.webp'),
};

export const slide3 = {
  abajoIzq: asset('slide_3-abajo_izq.webp'),
  arrizaIzq: asset('slide_3-arriza_izq.webp'),
  der: asset('slide_3-der.webp'),
  padlock: asset('slide_3-padlock.webp'),
  stickerHeart: asset('slide_3-sticker-heart.webp'),
  stickerSparkle: asset('slide_3-sticker-sparkle.webp'),
};

export const slide4 = {
  abajoDer: asset('slide_4-abajo_der.webp'),
  arribaDer: asset('slide_4-arriba_der.webp'),
  giftBox: asset('slide_4-gift-box.webp'),
  izq: asset('slide_4-izq.webp'),
  regalo1: asset('slide_4-regalo_1.webp'),
  regalo2: asset('slide_4-regalo_2.webp'),
  stickerSparkle: asset('slide_4-sticker-sparkle.webp'),
};

export const slide5 = {
  abajoIzq: asset('slide_5-abajo_izq.webp'),
  arrizaIzq: asset('slide_5-arriza_izq.webp'),
  bouquetSmall: asset('slide_5-bouquet-small.webp'),
  card: asset('slide_5-card.webp'),
  der: asset('slide_5-der.webp'),
  openEnvelope: asset('slide_5-open_envelope.webp'),
  stickerHeart: asset('slide_5-sticker-heart.webp'),
  treeHeart: asset('slide_5-tree-heart.webp'),
};

export const slide6 = {
  abajoDer: asset('slide_6-abajo_der.webp'),
  abajoIzq: asset('slide_6-abajo_izq.webp'),
  arribaDer: asset('slide_6-arriba_der.webp'),
  photoFrame: asset('slide_6-photo-frame.webp'),
  slider: asset('slide_6-slider.webp'),
  stickerHeart: asset('slide_6-sticker-heart.webp'),
  vinylDisc: asset('slide_6-vinyl-disc.webp'),
};
