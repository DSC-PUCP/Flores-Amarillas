import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/flow/return')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const form = await request.formData().catch(() => null);
        const token = form?.get('token');
        if (typeof token !== 'string' || !token) {
          return new Response('Token requerido', { status: 400 });
        }

        try {
          const { applyFlowStatus, getFlowStatus } = await import(
            '@/modules/payments/server'
          );
          const pageId = await applyFlowStatus(await getFlowStatus(token));
          return Response.redirect(
            new URL(`/payment/result/${pageId}`, request.url),
            303
          );
        } catch (error) {
          console.error('Error al procesar retorno de Flow:', error);
          return new Response(
            'No se pudo verificar el pago. Vuelve a tu pagina e intenta de nuevo.',
            {
              status: 502,
            }
          );
        }
      },
    },
  },
});
