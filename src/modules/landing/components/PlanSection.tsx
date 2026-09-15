import { Flower2, Loader2, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import type { Plan } from '@/core/models';
import { usePlans } from '../hooks/usePlans';
import { PlanCard, type PlanTier } from './PlanCard';

interface PlansSectionProps {
  /** Datos de revisión visual: la landing siempre usa los planes publicados. */
  plansOverride?: Plan[];
  /** La ruta de revisión visual puede desactivar la navegación. */
  interactive?: boolean;
}

export function PlansSection({
  plansOverride,
  interactive = true,
}: PlansSectionProps = {}) {
  const {
    data: fetchedPlans = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePlans();
  const isPreview = plansOverride !== undefined;
  const plans = plansOverride ?? fetchedPlans;
  const showLoading = !isPreview && isLoading;
  const showError = !isPreview && Boolean(error) && plans.length === 0;
  const showEmpty = !showLoading && !showError && plans.length === 0;

  /**
   * Nivel visual de cada plan, por precio.
   *
   * Se calcula aqui y no dentro de la tarjeta porque depende del catalogo
   * entero: cual es el mas caro solo se sabe mirando a los demas. Con dos
   * planes no hay intermedio, y el mas caro sigue siendo el tope.
   */
  const niveles = useMemo(() => {
    const porPrecio = [...plans].sort((a, b) => a.price - b.price);
    const mapa = new Map<Plan['id'], PlanTier>();
    porPrecio.forEach((plan, i) => {
      if (i === porPrecio.length - 1 && porPrecio.length > 1) {
        mapa.set(plan.id, 'tope');
      } else if (i > 0) {
        mapa.set(plan.id, 'intermedio');
      } else {
        mapa.set(plan.id, 'entrada');
      }
    });
    return mapa;
  }, [plans]);

  return (
    <section
      id="plans"
      aria-labelledby="plans-title"
      className="scroll-mt-24 bg-[#FFFBF2] px-5 py-20 text-[#1E3B2A] sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div data-reveal="left">
            <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
              <span className="size-2 rounded-full bg-[#EF7A5E]" />
              Un detalle, a tu manera
            </p>
            <h2
              id="plans-title"
              className="max-w-xl font-display text-4xl leading-[1.1] tracking-[-0.035em] sm:text-5xl"
            >
              Tú pones el cariño.
              <br />
              <span className="italic">Elige tu dedicatoria.</span>
            </h2>
          </div>
          <p
            data-reveal="right"
            className="max-w-sm text-sm leading-6 text-[#1E3B2A]/75"
          >
            Compara lo que incluye cada opción. Después, elige tu diseño y
            personalízalo con las palabras y los recuerdos que lo hacen suyo.
          </p>
        </div>

        {showLoading ? (
          <div aria-live="polite">
            <p className="mb-6 flex items-center justify-center gap-2 text-sm">
              <Loader2
                aria-hidden="true"
                className="size-4 motion-safe:animate-spin"
              />
              Buscando los planes disponibles…
            </p>
            <div
              aria-hidden="true"
              className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2"
            >
              {['first', 'second'].map((id) => (
                <div
                  key={id}
                  className="h-80 rounded-[28px] border border-[#1E3B2A]/10 bg-[#EAF0E4]/60 motion-safe:animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : showError || showEmpty ? (
          <div
            aria-live="polite"
            className="mx-auto flex max-w-xl flex-col items-center rounded-[28px] border border-[#1E3B2A]/15 bg-white px-6 py-12 text-center"
          >
            <Flower2
              aria-hidden="true"
              className="mb-5 size-10 text-[#EF7A5E]"
            />
            <h3 className="mb-3 text-xl font-semibold">
              {showError
                ? 'No pudimos cargar los precios'
                : 'Estamos preparando los próximos detalles'}
            </h3>
            <p className="max-w-sm text-sm leading-6 text-[#1E3B2A]/75">
              {showError
                ? 'Vuelve a intentarlo para consultar los planes disponibles. Mientras tanto, puedes seguir explorando la experiencia de arriba.'
                : 'Por ahora no hay planes disponibles. Puedes volver a consultar en un momento.'}
            </p>
            {!isPreview && (
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#F7C325] px-6 py-3 text-sm font-bold transition-colors hover:bg-[#F2C21A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E3B2A] disabled:cursor-wait disabled:opacity-60"
              >
                <RefreshCw
                  aria-hidden="true"
                  className={
                    isFetching ? 'size-4 motion-safe:animate-spin' : 'size-4'
                  }
                />
                {isFetching ? 'Consultando…' : 'Volver a intentar'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-stretch justify-center gap-6 [&>article]:basis-full sm:[&>article]:basis-[calc(50%-12px)] lg:[&>article]:basis-[calc(33.333%-16px)] [&>article]:grow">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                interactive={interactive}
                index={index}
                tier={niveles.get(plan.id) ?? 'entrada'}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
