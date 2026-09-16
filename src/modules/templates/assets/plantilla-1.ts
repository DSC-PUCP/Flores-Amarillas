/**
 * Imagenes de la plantilla 1, servidas desde Supabase Storage.
 *
 * No viven en el repo a proposito. En PNG pesaban 5,0 MB que Vite metia
 * enteros en el bundle; en WebP y a 1200 px de lado son 0,98 MB, y ademas
 * salen del bundle y de la historia de git.
 *
 * Los GIF se suben sin convertir: son animados y pasarlos a WebP arriesga el
 * loop por poca ganancia. Van planos junto a los WebP, sin subcarpeta `gifs/`,
 * porque la UI del dashboard no deja crear carpetas anidadas a mano.
 *
 * La base se arma con VITE_SUPABASE_URL en vez de hardcodear el dominio, para
 * que siga funcionando si el proyecto de Supabase cambia.
 */
const BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/flores-amarillas/plantilla-1`;

const asset = (nombre: string) => `${BASE}/${nombre}`;

export const assets = {
  caritasPeluches: asset('caritas-peluches.webp'),
  cerradura: asset('cerradura.webp'),
  conejoRosa: asset('conejo-rosa.webp'),
  corazonMensaje: asset('corazon-mensaje.webp'),
  corazonRojo: asset('corazon-rojo.webp'),
  corazonesDecorativos: asset('corazones-decorativos-foto.webp'),
  discoVinilo: asset('disco-vinilo.webp'),
  duoFloresAmarillas: asset('duo-flores-amarillas.webp'),
  duoRosas: asset('duo-rosas.webp'),
  enmarcoRosa: asset('enmarco-rosa.webp'),
  floresAbajo: asset('flores-abajo.webp'),
  floresMasFlores: asset('flores-mas-flores.webp'),
  oso1: asset('oso-1.webp'),
  pelucheSobre: asset('peluche-de-sobre.webp'),
  perro1: asset('perro-1.webp'),
  perro2: asset('perro-2.webp'),
  perroFlor: asset('perro-flor.webp'),
  perroCorazon: asset('perro-sosteniendo-corazon.webp'),
  pollitoSorprendido: asset('pollito-sorprendido.webp'),
  ramoFlores: asset('ramo-flores.webp'),
  reproductor: asset('reproductor.webp'),
  rosasAbajo: asset('rosas-abajo.webp'),
  rosasArriba: asset('rosas-arriba.webp'),
  sobreDeCarta: asset('sobre-de-carta.webp'),
  sobreAbierto: asset('sobre-de-carta-abierto.webp'),
  sobreRegalo: asset('sobre-regalo.webp'),

  /** Animados, sin convertir. */
  brillitos: asset('brillitos.gif'),
  corazonesTransparentes: asset('corazones-transparantes.gif'),
  fuegosArtificiales: asset('fuegos-artificiales.gif'),
  petalosCayendo: asset('petalos-cayendo.gif'),
} as const;
