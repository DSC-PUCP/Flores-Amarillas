import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const requestSchema = z.object({
  pageId: z.uuid(),
  email: z.email(),
});

export const Route = createFileRoute('/api/payment/create')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ error: 'Pagina o correo invalido' }, { status: 400 });
        }

        try {
          const { createCheckout } = await import('@/modules/payments/server');
          const url = await createCheckout(parsed.data.pageId, parsed.data.email);
          return Response.json({ url });
        } catch (error) {
          console.error('Error al crear pago Flow:', error);
          return Response.json(
            { error: error instanceof Error ? error.message : 'No se pudo iniciar el pago' },
            { status: 502 }
          );
        }
      },
    },
  },
});
