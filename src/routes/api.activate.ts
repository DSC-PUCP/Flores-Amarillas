import { createFileRoute } from '@tanstack/react-router';
import { activateLovePage } from '@/core/application/activate-lovepage';
import { env } from '@/env';

export const Route = createFileRoute('/api/activate')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { pageId?: string; secret?: string } = {};
        try {
          const text = await request.text();
          if (!text) {
            return new Response('Empty request body', { status: 400 });
          }
          body = JSON.parse(text);
        } catch (error) {
          return new Response('Invalid JSON in request body', { status: 400 });
        }

        const { pageId, secret } = body;

        if (secret !== env.API_SECRET) {
          return new Response('Unauthorized', { status: 401 });
        }

        if (!pageId) {
          return new Response('pageId is required', { status: 400 });
        }

        const result = await activateLovePage(pageId);

        if (result.isFailure()) {
          return new Response(
            result.getError()?.message || 'Error activating page',
            { status: 500 }
          );
        }

        return new Response('Página activada con éxito', { status: 200 });
      },
    },
  },
});
