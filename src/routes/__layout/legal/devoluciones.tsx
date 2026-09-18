import { createFileRoute } from '@tanstack/react-router';
import { Devoluciones } from '@/modules/legal/Devoluciones';

export const Route = createFileRoute('/__layout/legal/devoluciones')({
  head: () => ({
    meta: [{ title: 'Política de cambios o devoluciones · Primavera Digital' }],
  }),
  component: Devoluciones,
});
