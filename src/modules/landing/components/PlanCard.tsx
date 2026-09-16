import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Check, Flower2, Sparkles } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Plan } from '@/core/models';
import { cn } from '@/lib/utils';

/** Nivel dentro del catálogo; lo calcula `PlansSection` ordenando por precio. */
export type PlanTier = 'entrada' | 'intermedio' | 'tope';

interface PlanCardProps {
  plan: Plan;
  /** La ruta de revisión visual puede desactivar la navegación. */
  interactive?: boolean;
  /** Posición en la grilla: escalona la entrada de las tarjetas. */
  index?: number;
  /**
   * Se recibe desde fuera en vez de deducirlo aquí del nombre o del precio:
   * los nombres cambian y un precio suelto no dice si es el plan del medio o
   * el más caro cuando hay tres o más.
   */
  tier?: PlanTier;
}

const priceFormatter = new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Precio anterior escondido en la descripción.
 *
 * En los datos actuales el campo `description` de los planes de pago trae
 * «Antes s/ 14» en lugar de una descripción. Eso es una oferta, no una
 * descripción, así que se detecta y se muestra como precio tachado, que es lo
 * que el negocio quiere decir. Si algún día la descripción vuelve a ser una
 * descripción, el patrón no coincide y el texto se muestra tal cual.
 */
function leerPrecioAnterior(description: string | null | undefined) {
  if (!description) return null;
  const m = description.match(/antes\s*s\/?\.?\s*([\d.,]+)/i);
  if (!m) return null;
  const valor = Number.parseFloat(m[1].replace(',', '.'));
  return Number.isFinite(valor) ? valor : null;
}

/**
 * Paleta por nivel.
 *
 * Antes la tarjeta solo distinguía gratis o de pago, así que Clásico y Premium
 * salían idénticas y nada decía qué separaba a una de otra. Ahora cada nivel
 * tiene su propio fondo, color de texto y acento: papel blanco el de entrada,
 * amarillo girasol el intermedio y verde profundo el tope.
 */
const ESTILOS: Record<
  PlanTier,
  {
    tarjeta: string;
    texto: string;
    etiqueta: string;
    flor: string;
    separador: string;
    marca: string;
    apagado: string;
    boton: string;
  }
> = {
  entrada: {
    tarjeta:
      'border-[#1E3B2A]/15 bg-white hover:shadow-[0_26px_44px_-28px_rgba(24,62,50,0.4)]',
    texto: 'text-[#1E3B2A]',
    etiqueta: 'bg-[#EEF3E9] text-[#1E3B2A]',
    flor: 'text-[#9FB48F]',
    separador: 'bg-[#1E3B2A]/12',
    marca: 'bg-[#EEF3E9] text-[#1E3B2A]',
    apagado: 'text-[#1E3B2A]/70',
    boton:
      'border border-[#1E3B2A]/25 bg-white text-[#1E3B2A] hover:bg-[#EEF3E9]',
  },
  intermedio: {
    tarjeta:
      'border-[#E8BB12] bg-[#F7C325] hover:shadow-[0_32px_56px_-26px_rgba(190,140,10,0.8)]',
    texto: 'text-[#1E3B2A]',
    etiqueta: 'bg-white/60 text-[#1E3B2A]',
    flor: 'text-[#1E3B2A]',
    separador: 'bg-[#1E3B2A]/20',
    marca: 'bg-white/65 text-[#1E3B2A]',
    apagado: 'text-[#1E3B2A]/75',
    boton: 'border border-[#1E3B2A] bg-[#1E3B2A] text-white hover:bg-[#27583E]',
  },
  tope: {
    // Degradado en vez de verde plano, y un halo dorado arriba a la derecha:
    // el color liso es lo que hacia que el plan mas caro se viera igual de
    // barato que los otros.
    tarjeta:
      'border-[#C9A227] bg-[#15352B] bg-[radial-gradient(ellipse_at_top_right,rgba(255,211,41,0.16),transparent_58%),linear-gradient(160deg,#1D453A_0%,#132E25_100%)] shadow-[0_20px_44px_-28px_rgba(10,30,22,0.9)] hover:shadow-[0_38px_66px_-22px_rgba(10,30,22,0.95)]',
    texto: 'text-[#FFF9E9]',
    etiqueta: 'bg-[#F7C325] text-[#1E3B2A]',
    flor: 'text-[#F7C325]',
    separador: 'bg-[#FFF9E9]/20',
    marca: 'bg-[#F7C325] text-[#1E3B2A]',
    apagado: 'text-[#D6DFCF]',
    boton:
      'border border-[#F7C325] bg-[#F7C325] text-[#1E3B2A] hover:bg-[#FFDF5C]',
  },
};

export function PlanCard({
  plan,
  interactive = true,
  index = 0,
  tier = 'entrada',
}: PlanCardProps) {
  const isFree = plan.price === 0;
  const s = ESTILOS[tier];
  const precioAnterior = leerPrecioAnterior(plan.description);
  const descripcion = precioAnterior ? null : plan.description;

  const buttonClass = cn(
    'group flex min-h-12 w-full items-center justify-between gap-3 rounded-full px-6 py-3.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4',
    tier === 'tope'
      ? 'focus-visible:outline-[#F7C325]'
      : 'focus-visible:outline-[#1E3B2A]',
    s.boton
  );

  return (
    <article
      data-reveal="grow"
      style={{ '--reveal-i': index } as CSSProperties}
      className={cn(
        'group/plan relative flex w-full max-w-[440px] flex-col overflow-hidden rounded-[28px] border p-7 transition-[transform,box-shadow] duration-300 ease-out motion-safe:hover:-translate-y-1.5 sm:p-9',
        s.tarjeta,
        s.texto,
        // El plan del medio es el que conviene mirar primero: se levanta sobre
        // los otros dos donde caben los tres en fila.
        tier === 'intermedio' &&
          'lg:-translate-y-3 lg:shadow-[0_22px_44px_-28px_rgba(190,140,10,0.7)]'
      )}
    >
      {/* Filete dorado por dentro del borde: el detalle que separa una
          tarjeta oscura de una tarjeta cara. */}
      {tier === 'tope' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[5px] rounded-[23px] border border-[#F7C325]/25"
        />
      )}

      {/* Flor grande y muy tenue al fondo: da profundidad sin competir con
          el texto. */}
      <Flower2
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -top-10 -right-8 size-44 rotate-12 stroke-[0.75] opacity-[0.14] transition-transform duration-700 ease-out motion-safe:group-hover/plan:rotate-[26deg]',
          s.flor
        )}
      />

      <div className="relative mb-8 flex items-start justify-between gap-4">
        <div>
          <span
            className={cn(
              'mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.12em] uppercase',
              s.etiqueta
            )}
          >
            {tier === 'tope' && (
              <Sparkles aria-hidden="true" className="size-3" />
            )}
            {isFree ? 'Sin costo' : 'Pago único'}
          </span>
          {/*
            El color va con `!` a proposito. `bloom.css` fija
            `.bloom-site h3 { color: var(--bloom-green) }`, que tiene mas
            especificidad que una clase de Tailwind, asi que en la tarjeta
            verde el titulo salia exactamente del color del fondo: contraste
            1.00, invisible. Heredar no alcanza aqui.
          */}
          <h3
            className={cn(
              'text-2xl font-bold tracking-tight',
              tier === 'tope' ? '!text-[#FFF9E9]' : '!text-[#1E3B2A]'
            )}
          >
            {plan.name}
          </h3>
        </div>

        {tier === 'intermedio' && (
          <span
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.1em] uppercase',
              s.marca
            )}
          >
            El más elegido
          </span>
        )}
      </div>

      <div className="relative mb-2 flex flex-wrap items-baseline gap-2">
        {isFree ? (
          <span className="font-display text-5xl leading-none tracking-tight">
            Gratis
          </span>
        ) : (
          <>
            <span
              className={cn(
                'text-xl font-medium',
                tier === 'tope' && 'text-[#F7C325]'
              )}
            >
              S/
            </span>
            <span
              className={cn(
                'text-5xl leading-none font-bold tracking-[-0.05em] tabular-nums',
                tier === 'tope' && 'text-[#F7C325]'
              )}
            >
              {priceFormatter.format(plan.price)}
            </span>
            {precioAnterior !== null && (
              <span
                className={cn(
                  'text-base font-medium line-through decoration-2 decoration-[#C0512F]',
                  tier === 'tope' ? 'text-[#E8EFE2]' : 'text-[#1E3B2A]/85'
                )}
              >
                S/ {priceFormatter.format(precioAnterior)}
              </span>
            )}
          </>
        )}
      </div>
      <p className={cn('mb-6 text-xs', s.apagado)}>
        {isFree ? 'Una dedicatoria para compartir' : 'Por dedicatoria'}
      </p>

      {descripcion && (
        <p className={cn('mb-7 text-sm leading-6', s.apagado)}>{descripcion}</p>
      )}

      <div className={cn('mb-6 h-px', s.separador)} />
      <p className="mb-4 text-[10px] font-bold tracking-[0.16em] uppercase">
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
                s.marca
              )}
            >
              <Check aria-hidden="true" className="size-3 stroke-[2.5]" />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="relative mt-auto">
        {interactive ? (
          /*
           * Lleva a los disenos de ESTE plan, no al catalogo entero. Pulsar
           * "Premium" y aterrizar en la lista completa obliga a buscar otra vez
           * lo que ya se acababa de elegir.
           *
           * El filtro va por nombre porque es lo que compara la pantalla de
           * disenos (`template.tipoPlan`), que es el nombre del plan.
           */
          <Link
            to="/template"
            search={{ plan: plan.name }}
            className={buttonClass}
          >
            Ver diseños
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
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
        <p className={cn('mt-3 text-center text-[11px] leading-5', s.apagado)}>
          Elige un diseño y hazlo tuyo.
        </p>
      </div>
    </article>
  );
}
