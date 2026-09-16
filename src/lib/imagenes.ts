/**
 * Imagenes del sitio que no pertenecen a ninguna plantilla, servidas desde
 * Supabase Storage.
 *
 * Antes vivian en `public/images/` y se referenciaban con rutas absolutas del
 * tipo `/images/x.webp`. En produccion el sitio cuelga de un subpath
 * (`/flores-amarillas/`), asi que esas rutas apuntaban al raiz del dominio y
 * nginx devolvia su propia pagina con un 200: el navegador recibia HTML donde
 * esperaba una imagen y el <img> quedaba vacio, sin error visible en consola.
 *
 * Una URL de Storage es absoluta y con dominio propio, de modo que no depende
 * ni del `base` de Vite ni de que el deploy copie `public/`. Eso importa para
 * la de OG sobre todo: og:image tiene que ser absoluta o WhatsApp y Facebook
 * no muestran la vista previa.
 */
const BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/flores-amarillas/publicas`;

const asset = (nombre: string) => `${BASE}/${nombre}`;

export const imagenes = {
  /** Ramo de girasoles: hero, thumbnail de la plantilla gratuita y og:image. */
  ramoGirasoles: asset('sunflower-bouquet.webp'),
  /** Fotos de ejemplo de los recuerdos. */
  recuerdoDia: asset('memory-day.webp'),
  recuerdoJuntos: asset('memory-together.webp'),
} as const;
