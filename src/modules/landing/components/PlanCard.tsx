import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Check, Flower2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Plan } from '@/core/models';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: Plan;
  /** La ruta de revisión visual puede desactivar la navegación. */
  interactive?: boolean;
  /** Posición en la grilla: escalona la entrada de las tarjetas. */
  index?: number;
}

const priceFormatter = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function PlanCard({
  plan,
  interactive = true,
  index = 0,
}: PlanCardProps) {
  const isFree = plan.price === 0;
  const buttonClass = cn(
    'group flex min-h-12 w-full items-center justify-between gap-3 rounded-full px-6 py-3.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]',
    isFree
      ? 'border border-[#183E32]/25 bg-white text-[#183E32] hover:bg-[#E9EFE6]'
      : 'border border-[#183E32] bg-[#183E32] text-white hover:bg-[#275443]'
  );

  return (
    <article
      data-reveal="grow"
      style={{ '--reveal-i': index } as CSSProperties}
      className={cn(
        'group/plan relative flex w-full max-w-[440px] flex-col overflow-hidden rounded-[28px] border p-7 text-[#183E32] transition-[transform,box-shadow] duration-300 ease-out motion-safe:hover:-translate-y-1.5 sm:p-9',
        isFree
          ? 'border-[#183E32]/15 bg-white hover:shadow-[0_26px_44px_-28px_rgba(24,62,50,0.45)]'
          : 'border-[#E8BB12] bg-[#FFD329] hover:shadow-[0_26px_50px_-26px_rgba(190,140,10,0.75)]'
      )}
    >
      <div className="mb-9 flex items-start justify-between gap-4">
        <div>
          <span
            className={cn(
              'mb-4 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]',
              isFree ? 'bg-[#EEF3E9]' : 'bg-white/55'
            )}
          >
            {isFree ? 'Sin costo' : 'Pago único'}
          </span>
          <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
        </div>
        <Flower2
          aria-hidden="true"
          className={cn(
            'size-12 shrink-0 rotate-12 stroke-[1.25] transition-transform duration-500 ease-out motion-safe:group-hover/plan:rotate-[24deg] motion-safe:group-hover/plan:scale-110',
            isFree ? 'text-[#F17B62]' : 'text-[#183E32]'
          )}
        />
      </div>

      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        {isFree ? (
          <span className="font-display text-5xl leading-none tracking-tight">
            Gratis
          </span>
        ) : (
          <>
            <span className="text-xl font-medium">S/</span>
            <span className="text-5xl leading-none font-bold tracking-[-0.05em] tabular-nums">
              {priceFormatter.format(plan.price)}
            </span>
          </>
        )}
      </div>
      <p className="mb-6 text-xs text-[#183E32]/75">
        {isFree ? 'Una dedicatoria para compartir' : 'Por dedicatoria'}
      </p>

      <p className="mb-7 text-sm leading-6 text-[#183E32]/85">
        {plan.description}
      </p>

      <div className="mb-6 h-px bg-[#183E32]/15" />
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em]">
        Incluye
      </p>
      <ul className="mb-9 space-y-3.5">
        {plan.features.map((feature, featureIndex) => (
          <li
            key={feature}
            style={{ '--feature-i': featureIndex } as CSSProperties}
            className="bloom-plan-feature flex items-start gap-3 text-sm leading-5"
          >
            <span
              className={cn(
                'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full',
                isFree ? 'bg-[#EEF3E9]' : 'bg-white/55'
              )}
            >
              <Check aria-hidden="true" className="size-3 stroke-[2.5]" />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {interactive ? (
          <Link to="/template" className={buttonClass}>
            Ver diseños
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
            />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className={cn(buttonClass, 'cursor-default opacity-60')}
          >
            Ver diseños
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </button>
        )}
        <p className="mt-3 text-center text-[11px] leading-5 text-[#183E32]/75">
          {isFree
            ? 'Elige un diseño y hazlo tuyo.'
            : 'Activación después de validar tu pago.'}
        </p>
      </div>
    </article>
  );
}
