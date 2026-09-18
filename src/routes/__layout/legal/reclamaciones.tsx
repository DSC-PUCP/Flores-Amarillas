import { createFileRoute } from '@tanstack/react-router';
import { LibroDeReclamaciones } from '@/modules/legal/LibroDeReclamaciones';

export const Route = createFileRoute('/__layout/legal/reclamaciones')({
  head: () => ({
    meta: [{ title: 'Libro de Reclamaciones · Primavera Digital' }],
  }),
  component: LibroDeReclamaciones,
});
