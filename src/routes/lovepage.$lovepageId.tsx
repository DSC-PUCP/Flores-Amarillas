import { createFileRoute, useLocation } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { env } from '@/env';
import { LovepageService } from '@/modules/lovepage/services';
import { PlanService } from '@/modules/plan/services';
import { generateWhatsappUrl } from '@/modules/templates/components/config/whatsapp.config';
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
        <div className="bg-white dark:bg-slate-900 p-2 sm:p-4 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 fixed top-0 left-0 right-0 z-50 shadow-xl transition-colors">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" /> Vista
              previa
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none">
              Esta es una vista previa de tu dedicatoria.
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

              <p className="text-sm text-slate-600 dark:text-slate-400">
                El enlace de esta dedicatoria ha vencido.
              </p>
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
