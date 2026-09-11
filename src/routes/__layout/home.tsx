import { createFileRoute } from '@tanstack/react-router';
import { LandingContent } from '@/modules/landing/content';

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
      { property: 'og:image', content: '/images/sunflower-bouquet.png' },
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
      { name: 'twitter:image', content: '/images/sunflower-bouquet.png' },
    ],
  }),
  component: HomeComponent,
});

function HomeComponent() {
  return <LandingContent />;
}
