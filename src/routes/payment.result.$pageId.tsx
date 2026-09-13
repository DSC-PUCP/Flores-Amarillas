import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Check, CheckCircle2, Clock3, Copy, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import getSupabaseClient from '@/lib/supabase';

export const Route = createFileRoute('/payment/result/$pageId')({
  loader: async ({ params }) => {
    const { data, error } = await getSupabaseClient()
      .from('pages')
      .select('id, is_paid')
      .eq('id', params.pageId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Página no encontrada');

    return { pageId: data.id, isPaid: data.is_paid ?? false };
  },
  component: PaymentResultPage,
});

function PaymentResultPage() {
  const { pageId, isPaid } = Route.useLoaderData();
  const router = useRouter();
  const [pageUrl, setPageUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const pagePath = `/lovepage/${pageId}`;

  useEffect(() => {
    setPageUrl(new URL(pagePath, window.location.origin).toString());
  }, [pagePath]);

  useEffect(() => {
    if (isPaid) return;
    const interval = window.setInterval(() => void router.invalidate(), 5_000);
    return () => window.clearInterval(interval);
  }, [isPaid, router]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-100 to-lime-100 px-4 py-12 dark:from-slate-950 dark:via-amber-950 dark:to-slate-900">
      <div className="w-full max-w-xl rounded-3xl border border-amber-200 bg-white/95 p-7 shadow-2xl shadow-amber-900/10 dark:border-amber-900 dark:bg-slate-900 sm:p-10">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
          {isPaid ? (
            <CheckCircle2 className="h-9 w-9" />
          ) : (
            <Clock3 className="h-9 w-9" />
          )}
        </div>

        {isPaid ? (
          <>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              ¡Pago confirmado! Tu página está lista
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Este es el enlace permanente de tu página. Cópialo y compártelo
              con quien quieras.
            </p>

            <div className="mt-8 space-y-3">
              <label
                htmlFor="page-link"
                className="text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Enlace de tu página
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id="page-link"
                  readOnly
                  value={pageUrl}
                  onFocus={(event) => event.currentTarget.select()}
                  className="h-11 flex-1"
                  aria-label="Enlace de tu página"
                />
                <Button
                  type="button"
                  onClick={() => void copyLink()}
                  disabled={!pageUrl}
                  className="h-11 bg-amber-500 px-5 text-white hover:bg-amber-600"
                >
                  {copied ? <Check /> : <Copy />}
                  {copied ? 'Copiado' : 'Copiar enlace'}
                </Button>
              </div>
              {copyError && (
                <p
                  role="alert"
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  No se pudo copiar automáticamente. Selecciona el enlace y
                  cópialo manualmente.
                </p>
              )}
              {pageUrl.startsWith('http://localhost:') && (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Este enlace de prueba solo funciona en tu computadora. En
                  producción tendrá tu dominio público.
                </p>
              )}
            </div>

            <Button
              asChild
              className="mt-8 h-11 w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-400 hover:to-yellow-400"
            >
              <a href={pagePath}>
                Abrir mi página <ExternalLink />
              </a>
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Estamos verificando tu pago
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Flow todavía no confirmó el pago. Esta página se actualizará
              automáticamente. Si el pago fue rechazado, puedes volver a tu
              página e intentarlo de nuevo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => void router.invalidate()}
                className="h-11 flex-1"
              >
                Revisar de nuevo
              </Button>
              <Button
                asChild
                className="h-11 flex-1 bg-amber-500 text-white hover:bg-amber-600"
              >
                <a href={pagePath}>Volver a mi página</a>
              </Button>
            </div>
          </>
        )}
        <Button asChild variant="ghost" className="mt-3 h-11 w-full">
          <a href="/home">Volver al inicio</a>
        </Button>
      </div>
    </main>
  );
}
