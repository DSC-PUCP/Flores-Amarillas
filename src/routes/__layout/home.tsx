import { createFileRoute } from '@tanstack/react-router';
import { imagenes } from '@/lib/imagenes';
import { LandingContent } from '@/modules/landing/content';

/**
 * Imagen de la vista previa al compartir el enlace.
 *
 * og:image tiene que ser absoluta: la especificacion lo pide y los rastreadores
 * de WhatsApp y Facebook no resuelven rutas relativas de forma confiable. Al
 * vivir en Storage ya lo es, sin depender de VITE_SERVER_URL ni del subpath del
 * que cuelga el sitio en produccion.
 *
 * Es el .webp de 267 KB: WhatsApp descarta las vistas previas que pesan de mas,
 * y compartir el enlace por ahi es como se reparte este regalo.
 */
const OG_IMAGE = imagenes.ramoGirasoles;

export const Route = createFileRoute('/__layout/home')({
  head: () => ({
    meta: [
      { title: 'Flores amarillas, palabras tuyas · Primavera Digital' },
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
        content: 'Ramo de girasoles amarillos de Primavera Digital',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Primavera Digital' },
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
