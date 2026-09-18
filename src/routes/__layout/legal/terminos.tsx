import { createFileRoute } from '@tanstack/react-router';
import { Terminos } from '@/modules/legal/Terminos';

export const Route = createFileRoute('/__layout/legal/terminos')({
  head: () => ({
    meta: [{ title: 'Términos y condiciones · Primavera Digital' }],
  }),
  component: Terminos,
});
