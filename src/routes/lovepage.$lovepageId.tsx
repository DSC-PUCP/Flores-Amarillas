import { createFileRoute, useLocation } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { env } from '@/env';
import { LovepageService } from '@/modules/lovepage/services';
import { PlanService } from '@/modules/plan/services';
import {
  generateWhatsappUrl,
  whatsappConfig,
} from '@/modules/templates/components/config/whatsapp.config';
import { TemplateRenderer } from '@/modules/templates/components/TemplateRenderer';
import { TemplateService } from '@/modules/templates/services';

export const Route = createFileRoute('/lovepage/$lovepageId')({
  loader: async ({ params }) => {
    const { lovepageId } = params;

    const data = await LovepageService.getLovepage(lovepageId);
    if (!data) {
      throw new Error('Lovepage no encontrado');
    }

    const template = await TemplateService.getTemplateById(data.templateId);
    if (!template) {
      throw new Error('Template no encontrado');
    }

    const plan = await PlanService.getPlanById(template.planId);
    if (!plan) {
      throw new Error('Plan no encontrado');
    }

    return {
      ...data,
      templateKey: template.templateKey,
      price: plan.price,
    };
  },
  component: RouteComponent,
});

/** Pasos de pago que ve el usuario mientras su pagina esta en preview. */
function PaymentSteps({ price }: { price: number }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-start">
        <span className="text-2xl">📱</span>
        <div className="text-left">
          <h3 className="font-bold text-amber-600 dark:text-amber-400 mb-1">
            Paso 1: Envía el pago
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Escríbenos por WhatsApp con el botón de abajo y envíanos tus nombres
            y la captura del comprobante de Yape o Plin por{' '}
            <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
              S/ {price.toFixed(2)}
            </span>{' '}
            al{' '}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              +{whatsappConfig.phoneNumber}
            </span>
          </p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-amber-200 to-yellow-200 dark:from-amber-700 dark:to-yellow-700" />

      <div className="flex gap-3 items-start">
        <span className="text-2xl">⏰</span>
        <div className="text-left">
          <h3 className="font-bold text-yellow-700 dark:text-yellow-400 mb-1">
            Paso 2: Espera la validación
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Validamos tu pago y activamos tu enlace permanente en{' '}
            <span className="font-semibold">menos de 2 horas</span>. Tu regalo
            queda listo para entregar 🌻
          </p>
        </div>
      </div>
    </div>
  );
}

const ctaClassName =
  'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-base bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50';

function RouteComponent() {
  const lovepage = Route.useLoaderData();
  const location = useLocation();

  const currentUrl = `${env.VITE_SERVER_URL}${location.pathname}`;
  const whatsappUrl = generateWhatsappUrl(currentUrl, lovepage.price);

  const openWhatsapp = () => {
    window.open(whatsappUrl, '_blank');
  };

  const isPreview = !(
    lovepage.isPaid ||
    lovepage.configJson === null ||
    lovepage.expiresAt === null
  );

  return (
    <>
      {isPreview && (
        <>
          <div className="bg-white dark:bg-slate-900 p-2 sm:p-4 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 fixed top-0 left-0 right-0 z-50 shadow-xl transition-colors">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" /> Vista
                previa
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none">
                Obtén tu enlace permanente pagando{' '}
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  S/ {lovepage.price.toFixed(2)}
                </span>
                <span className="hidden sm:inline">
                  , espera la confirmación y tendrás acceso
                </span>{' '}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  permanente.
                </span>
              </p>
            </div>

            <div className="flex shrink-0">
              <Button
                onClick={openWhatsapp}
                className={`w-full sm:w-auto ${ctaClassName}`}
              >
                Generar enlace permanente
              </Button>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 z-40 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-white/10 flex flex-col items-center gap-4 max-w-xs">
            <PaymentSteps price={lovepage.price} />
            <Button onClick={openWhatsapp} className={`w-full ${ctaClassName}`}>
              Generar enlace permanente
            </Button>
          </div>
        </>
      )}

      {lovepage.configJson && (
        <TemplateRenderer
          templateKey={lovepage.templateKey}
          templateData={lovepage.configJson}
          isPreview={isPreview}
        />
      )}

      {!lovepage.configJson && (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-100 to-lime-100 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-8 bg-white/80 backdrop-blur-md rounded-3xl p-12 shadow-2xl max-w-md">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent mb-6">
                Tu página ya no está disponible
              </h2>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-200">
                <PaymentSteps price={lovepage.price} />
              </div>
            </div>

            <Button onClick={openWhatsapp} className={ctaClassName}>
              Generar enlace permanente
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
