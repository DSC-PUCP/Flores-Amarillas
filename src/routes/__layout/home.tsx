import { createFileRoute } from '@tanstack/react-router';
import { env } from '@/env';
import { LandingContent } from '@/modules/landing/content';

/**
 * Imagen de la vista previa al compartir el enlace.
 *
 * Tiene que ser absoluta: og:image lo pide la especificacion y los
 * rastreadores de WhatsApp y Facebook no resuelven rutas relativas de forma
 * confiable. Si falta VITE_SERVER_URL se queda relativa, que es lo que habia
 * antes y no empeora nada.
 *
 * Se usa el .webp de 443 KB y no el .png de 1.8 MB: WhatsApp descarta las
 * vistas previas que pesan de mas, y compartir el enlace por ahi es como se
 * reparte este regalo.
 */
const OG_IMAGE_PATH = '/images/sunflower-bouquet.webp';
const OG_IMAGE = env.VITE_SERVER_URL
  ? new URL(OG_IMAGE_PATH, env.VITE_SERVER_URL).href
  : OG_IMAGE_PATH;

export const Route = createFileRoute('/__layout/home')({
  head: () => ({
    meta: [
      { title: 'Flores amarillas, palabras tuyas · Dedicatorias en Flor' },
      {
        name: 'description',
        content:
          'Este 21 de septiembre, regala una dedicatoria web con tus fotos y tus palabras. Prueba el sobre interactivo, conoce los planes y crea tu sorpresa.',
      },
      {
        property: 'og:title',
        content: 'Flores amarillas. Y todo eso que sientes.',
      },
      {
        property: 'og:description',
        content:
          'Un regalo digital hecho por ti. Abre el ejemplo y descubre cómo se siente recibirlo.',
      },
      { property: 'og:image', content: OG_IMAGE },
      {
        property: 'og:image:alt',
        content: 'Ramo de girasoles amarillos de Dedicatorias en Flor',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Dedicatorias en Flor' },
      {
        name: 'twitter:title',
        content: 'Flores amarillas. Y todo eso que sientes.',
      },
      {
        name: 'twitter:description',
        content:
          'Crea un regalo digital con tus palabras y sus fotos favoritas.',
      },
      { name: 'twitter:image', content: OG_IMAGE },
    ],
  }),
  component: HomeComponent,
});

function HomeComponent() {
  return <LandingContent />;
}
