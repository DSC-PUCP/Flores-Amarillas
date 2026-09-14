/**
 * Ilustraciones SVG propias para la línea Flores Amarillas.
 *
 * Se dibujan a mano (no son iconos de librería) para que la página tenga
 * flores de verdad —con pétalos, corazón y tallo— en vez de pictogramas de
 * línea. Todas son decorativas: `aria-hidden`.
 *
 * Los colores se pintan con utilidades `fill-*` de Tailwind para que
 * respondan al modo oscuro.
 */

type ArtProps = {
  className?: string;
  style?: React.CSSProperties;
  /** Cantidad de pétalos, solo para el girasol. */
  petals?: number;
};

/** Genera los ángulos de los pétalos repartidos en la circunferencia. */
function petalAngles(count: number) {
  return Array.from({ length: count }, (_, i) => (360 / count) * i);
}

/**
 * Semillas del corazón del girasol, distribuidas con el ángulo áureo
 * (137.5°) igual que en una flor real. Se calculan una sola vez.
 */
const SEED_POSITIONS = Array.from({ length: 22 }, (_, i) => {
  const angle = i * 137.5 * (Math.PI / 180);
  const radius = 2.2 * Math.sqrt(i);
  return {
    cx: Number((50 + radius * Math.cos(angle)).toFixed(2)),
    cy: Number((50 + radius * Math.sin(angle)).toFixed(2)),
  };
});

/** Girasol: tres coronas de pétalos con sombreado + corazón texturado. */
export function Sunflower({ className = '', petals = 12, style }: ArtProps) {
  const angles = petalAngles(petals);
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {/* Corona trasera: tono más profundo, rellena los huecos y da volumen */}
      <g className="fill-[#D9A22F] dark:fill-[#7A5B1E]">
        {angles.map((angle) => (
          <ellipse
            key={`back-${angle}`}
            cx="50"
            cy="23"
            rx="6.5"
            ry="20"
            transform={`rotate(${angle + 360 / petals / 2} 50 50)`}
          />
        ))}
      </g>

      {/* Corona media */}
      <g className="fill-[#EDB63C] dark:fill-[#96702A]">
        {angles.map((angle) => (
          <ellipse
            key={`mid-${angle}`}
            cx="50"
            cy="26"
            rx="7"
            ry="18"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </g>

      {/* Corona delantera, más clara: simula la luz cayendo sobre el pétalo */}
      <g className="fill-[#F8D566] dark:fill-[#B08631]">
        {angles.map((angle) => (
          <path
            key={`front-${angle}`}
            d="M50 50 C 45 40, 44 26, 50 15 C 56 26, 55 40, 50 50 Z"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </g>

      {/* Corazón: aro exterior, disco y textura de semillas en espiral */}
      <circle
        cx="50"
        cy="50"
        r="17.5"
        className="fill-[#A9741F] dark:fill-[#523A12]"
      />
      <circle
        cx="50"
        cy="50"
        r="15"
        className="fill-[#8C5F1A] dark:fill-[#3F2C0E]"
      />
      <g className="fill-[#6E4A13] dark:fill-[#2B1E09]">
        {SEED_POSITIONS.map(({ cx, cy }) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.15} />
        ))}
      </g>
      {/* Brillo suave arriba a la izquierda */}
      <path
        d="M40 42a13 13 0 0 1 9-6"
        className="stroke-white/25"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Margarita de pétalos blancos y corazón dorado. */
export function Daisy({ className = '', petals = 10 }: ArtProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g className="fill-white dark:fill-stone-200">
        {petalAngles(petals).map((angle) => (
          <ellipse
            key={angle}
            cx="50"
            cy="27"
            rx="6.5"
            ry="20"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </g>
      <circle
        cx="50"
        cy="50"
        r="12"
        className="fill-amber-400 dark:fill-amber-500"
      />
      <circle cx="50" cy="50" r="7" className="fill-amber-500/60" />
    </svg>
  );
}

/** Etapa 1: semilla enterrada en el montículo de tierra. */
export function Seed({ className = '' }: ArtProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Tierra: montículo más bajo y ancho, para que la semilla resalte */}
      <path
        d="M6 80c0-7 20-11 44-11s44 4 44 11v8H6z"
        className="fill-stone-400/55 dark:fill-stone-700"
      />
      {/* Semilla grande, medio enterrada y con una grieta que ya se abre */}
      <ellipse
        cx="50"
        cy="56"
        rx="15"
        ry="21"
        className="fill-amber-700 dark:fill-amber-600"
        transform="rotate(-10 50 56)"
      />
      <ellipse
        cx="45"
        cy="50"
        rx="6"
        ry="10"
        className="fill-amber-500/50"
        transform="rotate(-10 45 50)"
      />
      <path
        d="M50 38c3 8 3 22 0 32"
        className="stroke-amber-900/60"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Primer brotecito asomando: deja claro que es el inicio del ciclo */}
      <path
        d="M50 36c0-8 5-13 12-14 1 8-4 13-12 14z"
        className="fill-lime-500 dark:fill-lime-400"
      />
      <path
        d="M50 36V27"
        className="stroke-lime-600 dark:stroke-lime-500"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Etapa 2: brote con dos hojas y un capullo cerrado. */
export function Sprout({ className = '' }: ArtProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 76c0-8 17-13 38-13s38 5 38 13v8H12z"
        className="fill-stone-400/60 dark:fill-stone-700"
      />
      {/* Tallo */}
      <path
        d="M50 70V34"
        className="stroke-lime-600 dark:stroke-lime-500"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hojas */}
      <path
        d="M50 56c-14 0-20-6-21-15 10-2 19 3 21 15z"
        className="fill-lime-500 dark:fill-lime-600"
      />
      <path
        d="M50 48c14 0 20-6 21-15-10-2-19 3-21 15z"
        className="fill-lime-400 dark:fill-lime-500"
      />
      {/* Capullo cerrado */}
      <ellipse
        cx="50"
        cy="28"
        rx="8"
        ry="11"
        className="fill-amber-300 dark:fill-amber-400"
      />
      <path
        d="M50 17c4 4 5 15 0 22-5-7-4-18 0-22z"
        className="fill-amber-400/70 dark:fill-amber-500/70"
      />
    </svg>
  );
}

/** Etapa 3: girasol abierto sobre su tallo. */
export function BloomingFlower({ className = '' }: ArtProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 84c0-7 17-11 38-11s38 4 38 11v4H12z"
        className="fill-stone-400/60 dark:fill-stone-700"
      />
      {/* Tallo */}
      <path
        d="M50 80V48"
        className="stroke-lime-600 dark:stroke-lime-500"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hojas */}
      <path
        d="M50 70c-13 0-18-5-19-13 9-2 17 3 19 13z"
        className="fill-lime-500 dark:fill-lime-600"
      />
      <path
        d="M50 64c13 0 18-5 19-13-9-2-17 3-19 13z"
        className="fill-lime-400 dark:fill-lime-500"
      />
      {/* Flor abierta */}
      <g transform="translate(0 -12) scale(0.78) translate(14 8)">
        <g className="fill-amber-500/70 dark:fill-amber-600/60">
          {petalAngles(12).map((angle) => (
            <ellipse
              key={`b-${angle}`}
              cx="50"
              cy="24"
              rx="7"
              ry="19"
              transform={`rotate(${angle + 15} 50 50)`}
            />
          ))}
        </g>
        <g className="fill-amber-300 dark:fill-amber-400">
          {petalAngles(12).map((angle) => (
            <ellipse
              key={`f-${angle}`}
              cx="50"
              cy="26"
              rx="7.5"
              ry="18"
              transform={`rotate(${angle} 50 50)`}
            />
          ))}
        </g>
        <circle
          cx="50"
          cy="50"
          r="16"
          className="fill-amber-700 dark:fill-amber-800"
        />
        <circle
          cx="50"
          cy="50"
          r="11"
          className="fill-amber-800/70 dark:fill-amber-900/70"
        />
      </g>
    </svg>
  );
}

/** Mariposa amarilla (lucide no tiene una). */
export function Butterfly({ className = '', style }: ArtProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {/* Alas izquierdas */}
      <g className="fill-amber-300/90 dark:fill-amber-400/80">
        <ellipse
          cx="32"
          cy="38"
          rx="19"
          ry="15"
          transform="rotate(-24 32 38)"
        />
        <ellipse cx="35" cy="62" rx="14" ry="11" transform="rotate(20 35 62)" />
      </g>
      {/* Alas derechas */}
      <g className="fill-amber-400/90 dark:fill-amber-500/80">
        <ellipse cx="68" cy="38" rx="19" ry="15" transform="rotate(24 68 38)" />
        <ellipse
          cx="65"
          cy="62"
          rx="14"
          ry="11"
          transform="rotate(-20 65 62)"
        />
      </g>
      {/* Cuerpo y antenas */}
      <ellipse
        cx="50"
        cy="50"
        rx="3"
        ry="17"
        className="fill-stone-700 dark:fill-stone-300"
      />
      <path
        d="M48 33c-3-5-7-7-11-8M52 33c3-5 7-7 11-8"
        className="stroke-stone-700 dark:stroke-stone-300"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Pétalo suelto, para la lluvia de pétalos del fondo. */
export function Petal({ className = '', style }: ArtProps) {
  return (
    <svg
      viewBox="0 0 40 60"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M20 2C31 14 36 30 30 44c-4 9-16 12-22 4C1 39 5 16 20 2z"
        fill="currentColor"
      />
      <path
        d="M20 6c4 12 5 26 1 38"
        className="stroke-black/10"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
