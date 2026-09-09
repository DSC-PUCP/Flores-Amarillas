import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel  } from '@tanstack/react-router-devtools';
import type { PropsWithChildren } from 'react';
import { ThemeProvider } from '@/components/context/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import  ReactQueryDevtoolsPanel  from '@/integrations/tanstack-query/devtools';
import appCss from '../styles.css?url';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Regalo Especial' },
      {
        name: 'description',
        content: '¡Sorpresa! Tenemos un regalo para ti. Descubre tu regalo personalizado y lleno de amor en nuestra plataforma. ¡Haz clic para ver tu sorpresa especial!',
      },
      { property: 'og:title', content: 'Con todo mi cariño' },
      { property: 'og:description', content: 'Te dedico esta página especial con todo mi amor 💝' },
      { property: 'og:image', content: 'https://kxsoembxjnuvxddqmkes.supabase.co/storage/v1/object/public/Valentines/assets/previewImage.jpg'},
      { property: 'og:image:alt', content: 'Regalo especial de amor' },
      { property: 'og:type', content: 'article' },
      { property: 'og:site_name', content: 'Regalo Especial' },
      { property: 'og:locale', content: 'es_ES' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Con todo mi cariño' },
      { name: 'twitter:description', content: 'Te dedico esta página especial con todo mi amor 💝' },
      { name: 'twitter:image', content: 'https://kxsoembxjnuvxddqmkes.supabase.co/storage/v1/object/public/Valentines/assets/previewImage.jpg' },
    ],
    links: [
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'stylesheet', href: appCss },
    ],
    scripts: [
      {
        defer: true,
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        'data-cf-beacon': '{"token": "7eb6f607c751474a94102bf0cbd91e1b"}',
      },
    ],
  }),
  component: () => <Outlet />,
  shellComponent: RootDocument,
  errorComponent: () => (
    <div className="p-4 text-red-500">Error en la aplicación</div>
  ),
  notFoundComponent: () => <div className="p-4">Página no encontrada</div>,
});

function RootDocument({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <TanStackDevtools 
          plugins={[
            ReactQueryDevtoolsPanel,
            {
              name: 'Tanstack router devtools',
              render: <TanStackRouterDevtoolsPanel />,
            }
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
