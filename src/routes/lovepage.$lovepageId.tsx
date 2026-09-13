import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LovepageService } from '@/modules/lovepage/services';
import { PlanService } from '@/modules/plan/services';
import { TemplateRenderer } from '@/modules/templates/components/TemplateRenderer';
import { TemplateService } from '@/modules/templates/services';

export const Route = createFileRoute('/lovepage/$lovepageId')({
  loader: async ({ params }) => {
    const lovepage = await LovepageService.getLovepage(params.lovepageId);
    if (!lovepage) throw new Error('Pagina no encontrada');
    const template = await TemplateService.getTemplateById(lovepage.templateId);
    if (!template) throw new Error('Plantilla no encontrada');
    const plan = await PlanService.getPlanById(template.planId);
    if (!plan) throw new Error('Plan no encontrado');
    return {
      ...lovepage,
      templateKey: template.templateKey,
      price: lovepage.flowAmount ?? plan.price,
    };
  },
  component: RouteComponent,
});

const ctaClassName =
  'rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-yellow-400';

function RouteComponent() {
  const lovepage = Route.useLoaderData();
  const router = useRouter();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [email, setEmail] = useState('');

  const checkout = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: lovepage.id, email }),
      });
      const data: { url?: string; error?: string } = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? 'No se pudo iniciar el pago');
      }
      return data.url;
    },
    onSuccess: (url) => window.location.assign(url),
  });

  useEffect(() => {
    if (lovepage.price <= 0 || lovepage.isPaid) return;
    const interval = window.setInterval(() => void router.invalidate(), 10_000);
    return () => window.clearInterval(interval);
  }, [lovepage.price, lovepage.isPaid, router]);

  const needsPayment = lovepage.price > 0 && !lovepage.isPaid;
  const openCheckout = () => {
    if (lovepage.flowCheckoutUrl) {
      window.location.assign(lovepage.flowCheckoutUrl);
    } else {
      setCheckoutOpen(true);
    }
  };

  return (
    <>
      {needsPayment && lovepage.configJson && (
        <div className="fixed inset-x-0 top-0 z-50 flex flex-col gap-3 border-b border-amber-200 bg-white p-4 shadow-xl dark:border-amber-900 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
              <Sparkles className="h-4 w-4 text-amber-500" /> Vista previa
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Activa tu enlace permanente por S/ {lovepage.price.toFixed(2)}.
              Después del pago, se activará automáticamente.
            </p>
          </div>
          <Button onClick={openCheckout} className={ctaClassName}>
            {lovepage.flowCheckoutUrl ? 'Continuar pago' : 'Comprar plan'}
          </Button>
        </div>
      )}

      {lovepage.configJson ? (
        <TemplateRenderer
          templateKey={lovepage.templateKey}
          templateData={lovepage.configJson}
          isPreview={needsPayment}
        />
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-100 to-lime-100 p-8">
          <div className="max-w-md space-y-5 rounded-3xl bg-white/90 p-10 text-center shadow-2xl">
            <h1 className="text-2xl font-bold text-amber-700">
              Tu vista previa terminó
            </h1>
            <p className="text-slate-700">
              Tu página se conservará y se activará al confirmar el pago.
            </p>
            {needsPayment && (
              <Button onClick={openCheckout} className={ctaClassName}>
                {lovepage.flowCheckoutUrl
                  ? 'Continuar pago'
                  : `Comprar plan por S/ ${lovepage.price.toFixed(2)}`}
              </Button>
            )}
          </div>
        </div>
      )}

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comprar plan</DialogTitle>
            <DialogDescription>
              Ingresa tu correo para recibir el comprobante. El pago se realizará en la página segura de Flow.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              checkout.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="payer-email">Correo electrónico</Label>
              <Input
                id="payer-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@correo.com"
              />
            </div>
            {checkout.isError && (
              <p className="text-sm text-red-600" role="alert">
                {checkout.error.message}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={checkout.isPending} className={ctaClassName}>
                {checkout.isPending ? 'Preparando pago...' : 'Continuar a Flow'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
