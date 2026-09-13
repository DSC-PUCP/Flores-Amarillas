import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/flow/confirm')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData().catch(() => null);
        const token = form?.get('token');
        if (typeof token !== 'string' || !token) {
          return new Response('Token requerido', { status: 400 });
        }

        try {
          const { applyFlowStatus, getFlowStatus } = await import('@/modules/payments/server');
          await applyFlowStatus(await getFlowStatus(token));
          return new Response('OK', { status: 200 });
        } catch (error) {
          console.error('Error al confirmar pago Flow:', error);
          return new Response('No se pudo verificar el pago', { status: 502 });
        }
      },
    },
  },
});
