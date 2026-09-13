import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useId,
} from 'react';
import stylesForArt from '../premium.module.css';

/**
 * Ilustraciones de la plantilla. Colores fijos (no dependen del modo oscuro
 * del sitio): la dedicatoria siempre se ve igual para quien la recibe.
 */

type ArtProps = { className?: string; style?: CSSProperties };

const angles = (count: number, offset = 0) =>
  Array.from({ length: count }, (_, i) => (360 / count) * i + offset);

// Semillas en espiral con el ángulo áureo, como en un girasol real.
const SEEDS = Array.from({ length: 34 }, (_, i) => {
  const angle = i * 137.508 * (Math.PI / 180);
  const radius = 1.95 * Math.sqrt(i + 0.6);
  return {
    cx: +(50 + radius * Math.cos(angle)).toFixed(2),
    cy: +(50 + radius * Math.sin(angle)).toFixed(2),
    r: +(0.75 + i * 0.018).toFixed(2),
  };
});

type Placement = { x?: number; y?: number; size?: number };

export function Sunflower({
  className,
  style,
  petals = 14,
  x,
  y,
  size,
  lite = false,
}: ArtProps &
  Placement & {
    petals?: number;
    /** Menos detalle para flores pequeñas o repetidas (praderas). */
    lite?: boolean;
  }) {
  const gradientId = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 100 100"
      x={x}
      y={y}
      width={size}
      height={size}
      overflow="visible"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${gradientId}-petal`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFE78A" />
          <stop offset="0.5" stopColor="#F7C325" />
          <stop offset="1" stopColor="#E0A11F" />
        </linearGradient>
        <radialGradient id={`${gradientId}-seed`} cx="35%" cy="30%" r="70%">
          <stop stopColor="#9A672D" />
          <stop offset="1" stopColor="#52371E" />
        </radialGradient>
      </defs>
      <g style={{ fill: 'var(--mood-petal-back)' }}>
        {angles(petals, 180 / petals).map((a) => (
          <path
            key={`b${a}`}
            d="M50 47C40 39 38 19 46 8c3-4 7-2 9 2 8 15 4 30-5 37Z"
            transform={`rotate(${a} 50 50)`}
          />
        ))}
      </g>
      <g fill={`url(#${gradientId}-petal)`}>
        {angles(petals).map((a) => (
          <path
            key={`f${a}`}
            d="M50 43C42 36 40 22 45 13c2-5 7-6 10-2 7 9 5 24-5 32Z"
            transform={`rotate(${a} 50 50)`}
          />
        ))}
      </g>
      {!lite && (
        <g style={{ fill: 'var(--sun-light)' }} opacity="0.55">
          {angles(petals).map((a) => (
            <path
              key={`l${a}`}
              d="M50 36c-1.6-5-1.8-12 0-18 1.8 6 1.6 13 0 18Z"
              transform={`rotate(${a} 50 50)`}
            />
          ))}
        </g>
      )}
      <circle
        cx="50"
        cy="50"
        r="15.5"
        style={{ fill: 'var(--mood-seed-ring)' }}
      />
      <circle cx="50" cy="50" r="13" fill={`url(#${gradientId}-seed)`} />
      <g style={{ fill: 'var(--mood-seed-dot)' }}>
        {(lite ? SEEDS.slice(0, 14) : SEEDS).map(({ cx, cy, r }) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <path
        d="M41 44a11 11 0 0 1 8-5.5"
        style={{ stroke: 'var(--sun-light)' }}
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Ramo envuelto en papel kraft con lazo: el regalo cerrado de la portada. */
export function WrappedBouquet({ className, style }: ArtProps) {
  return (
    <svg
      viewBox="0 0 240 280"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {/* Tallos */}
      <g
        style={{ stroke: 'var(--mood-stem)' }}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M120 250 82 110" />
        <path d="M120 250 120 86" />
        <path d="M120 250 160 112" />
        <path d="M120 250 58 150" />
        <path d="M120 250 186 150" />
      </g>
      {/* Follaje */}
      <path
        d="M72 150c-30-6-44-30-40-52 26 6 42 26 40 52Z"
        style={{ fill: 'var(--mood-leaf)' }}
      />
      <path
        d="M170 146c30-8 42-32 36-54-25 8-40 29-36 54Z"
        style={{ fill: 'var(--mood-leaf-dark)' }}
      />
      <path
        d="M96 126c-18-22-14-48 4-62 12 22 12 44-4 62Z"
        style={{ fill: 'var(--mood-leaf-pale)' }}
      />
      <path
        d="M146 124c18-20 16-46-2-60-12 20-14 42 2 60Z"
        style={{ fill: 'var(--mood-leaf)' }}
      />
      {/* Florecitas de acompañamiento */}
      <g style={{ fill: 'var(--mood-card)' }}>
        <circle cx="46" cy="126" r="6" />
        <circle cx="58" cy="116" r="5" />
        <circle cx="196" cy="122" r="6" />
        <circle cx="186" cy="110" r="4.5" />
      </g>
      <g style={{ fill: 'var(--mood-sky)' }}>
        <circle cx="206" cy="136" r="4.5" />
        <circle cx="38" cy="140" r="4" />
      </g>
      {/* Girasoles */}
      <Flower x={58} y={96} size={58} rotate={-14} />
      <Flower x={138} y={98} size={60} rotate={12} />
      <Flower x={92} y={42} size={66} rotate={0} />
      {/* Papel */}
      <path
        d="M40 160 120 272 200 160 170 176 120 150 70 176Z"
        style={{ fill: 'var(--mood-kraft)' }}
      />
      <path
        d="M40 160 120 272 96 170Z"
        style={{ fill: 'var(--mood-kraft-light)' }}
      />
      <path
        d="M200 160 120 272 144 170Z"
        style={{ fill: 'var(--mood-kraft-dark)' }}
      />
      <path
        d="M96 170 120 272 144 170"
        style={{ stroke: 'var(--mood-kraft-dark)' }}
        strokeWidth="1"
        fill="none"
      />
      {/* Lazo */}
      <path
        d="M120 214c-22-16-40-14-42-2s20 14 42 2Z"
        style={{ fill: 'var(--mood-ribbon)' }}
      />
      <path
        d="M120 214c22-16 40-14 42-2s-20 14-42 2Z"
        style={{ fill: 'var(--amancay-tone)' }}
      />
      <path
        d="M116 216 100 250M124 216 142 248"
        style={{ stroke: 'var(--mood-ribbon)' }}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle
        cx="120"
        cy="214"
        r="7"
        style={{ fill: 'var(--mood-ribbon-dark)' }}
      />
    </svg>
  );
}

function Flower({
  x,
  y,
  size,
  rotate,
}: {
  x: number;
  y: number;
  size: number;
  rotate: number;
}) {
  return (
    <g transform={`rotate(${rotate} ${x + size / 2} ${y + size / 2})`}>
      <Sunflower x={x} y={y} size={size} />
    </g>
  );
}

/** Pétalo suelto. Toma el color de `currentColor`. */
export function LoosePetal({ className, style }: ArtProps) {
  return (
    <svg
      viewBox="0 0 40 60"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M20 2C31 14 36 30 30 44c-4 9-16 12-22 4C1 39 5 16 20 2Z"
        fill="currentColor"
      />
      <path
        d="M20 7c3 12 4 25 1 36"
        style={{ stroke: 'var(--mood-ink-soft)' }}
        strokeOpacity="0.15"
        strokeWidth="1.4"
        fill="none"
      />
    </svg>
  );
}

/** Ramita prensada, para esquinas de la carta y del cupón. */
export function PressedSprig({ className, style }: ArtProps) {
  return (
    <svg
      viewBox="-6 -18 92 146"
      overflow="visible"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M40 118C38 90 40 50 52 8"
        style={{ stroke: 'var(--mood-leaf-dark)' }}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <g style={{ fill: 'var(--mood-leaf)' }}>
        <path d="M39 96c-14-2-22-10-23-20 12 0 21 8 23 20Z" />
        <path d="M41 72c13-3 20-12 20-22-12 1-19 10-20 22Z" />
        <path d="M43 52c-12-3-18-11-18-20 11 1 17 9 18 20Z" />
      </g>
      <Sunflower x={38} y={-8} size={30} />
    </svg>
  );
}

const GardenArtContext = createContext<string | null>(null);

/** Una sola ilustración compartida evita repetir miles de pétalos en la página. */
export function GardenArtProvider({ children }: { children: ReactNode }) {
  const id = `garden-${useId().replace(/:/g, '')}`;
  return (
    <GardenArtContext.Provider value={id}>
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <g id={id}>
            <GardenBouquetArtwork />
          </g>
        </defs>
      </svg>
      {children}
    </GardenArtContext.Provider>
  );
}

export function GardenBouquet({ className, style }: ArtProps) {
  const id = useContext(GardenArtContext);
  if (!id) return <GardenBouquetArtwork className={className} style={style} />;
  return (
    <svg
      viewBox="0 0 360 430"
      className={`${stylesForArt.sway} ${className ?? ''}`}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <use href={`#${id}`} />
    </svg>
  );
}

/** Ramo botánico ilustrado: girasoles, margaritas, retama y hojas curvas. */
function GardenBouquetArtwork({ className, style }: ArtProps) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      viewBox="0 0 360 430"
      width="360"
      height="430"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#315E43" />
          <stop offset="0.55" stopColor="#70964B" />
          <stop offset="1" stopColor="#A7BC6A" />
        </linearGradient>
        <linearGradient id={`${id}-ribbon`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F4AB71" />
          <stop offset="1" stopColor="#D97848" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="#5B7E43" strokeWidth="4" strokeLinecap="round">
        <path d="M173 413Q169 300 97 128" />
        <path d="M185 416Q210 282 273 139" />
        <path d="M179 421Q190 242 178 86" />
        <path d="M173 412Q144 290 56 224" />
        <path d="M187 414Q232 291 306 231" />
        <path d="M181 414Q163 322 139 245" />
      </g>
      <g fill={`url(#${id}-leaf)`}>
        <path d="M149 329C89 324 56 287 57 257c41-5 84 26 92 72Z" />
        <path d="M203 338c58-13 87-45 87-78-44 5-77 36-87 78Z" />
        <path d="M119 244c-55-17-82-48-75-81 44 6 74 39 75 81Z" />
        <path d="M232 239c50-7 83-41 83-72-44-3-78 32-83 72Z" />
        <path d="M161 198c-40-32-41-77-21-111 26 21 38 63 21 111Z" />
        <path d="M209 187c-11-46 2-75 26-89 17 33 7 70-26 89Z" />
      </g>
      <g fill="none" stroke="#C7D8AE" strokeWidth="1.1" opacity="0.6">
        <path d="M64 264q31 21 80 60M211 331q40-36 72-63M51 171q38 37 63 66M238 233q29-35 69-59M146 101l15 88" />
      </g>
      <g stroke="#8BA84C" strokeWidth="2" fill="none">
        <path d="M91 280Q21 176 47 80M270 286Q335 181 313 92" />
      </g>
      <g fill="#F1C843">
        {[
          [38, 94],
          [51, 109],
          [33, 127],
          [44, 144],
          [37, 163],
          [51, 179],
          [316, 107],
          [326, 126],
          [310, 146],
          [326, 163],
          [312, 185],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${x})`}>
            <ellipse rx="5" ry="9" />
            <ellipse
              cx="7"
              cy="-3"
              rx="4"
              ry="7"
              transform="rotate(40)"
              fill="#FFE78A"
            />
          </g>
        ))}
      </g>
      <g>
        <Sunflower x={66} y={77} size={110} petals={17} />
        <Sunflower x={181} y={91} size={121} petals={16} />
        <Sunflower x={127} y={23} size={107} petals={18} />
        <Sunflower x={104} y={170} size={134} petals={17} />
      </g>
      <g>
        <Daisy x={35} y={202} size={68} />
        <Daisy x={264} y={213} size={72} />
        <Daisy x={89} y={276} size={51} />
        <Daisy x={218} y={283} size={47} />
        <Daisy x={276} y={60} size={45} />
        <Daisy x={49} y={51} size={40} />
      </g>
      <g fill={`url(#${id}-ribbon)`} stroke="#C36E3E" strokeWidth="0.8">
        <path d="M181 357c-55-46-88-22-63 0 15 12 38 12 63 0Z" />
        <path d="M181 357c50-43 85-23 63 0-17 15-42 12-63 0Z" />
        <path d="M175 360q-8 28-37 53l-3-20-16 2q29-19 47-42Z" />
        <path d="M185 360q11 25 37 43l-1-18 18-4q-23-8-41-30Z" />
        <ellipse cx="181" cy="357" rx="10" ry="8" />
      </g>
      <g fill="#FFE9A8" opacity="0.8">
        <path d="m24 191 2-7 2 7 7 2-7 2-2 7-2-7-7-2Z" />
        <path d="m321 251 2-7 2 7 7 2-7 2-2 7-2-7-7-2Z" />
      </g>
    </svg>
  );
}

function Daisy({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="#FFE38A" stroke="#E5B33F" strokeWidth="0.7">
        {angles(11).map((angle) => (
          <ellipse
            key={angle}
            cx="50"
            cy="29"
            rx="7"
            ry="20"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="13" fill="#CC9026" />
      <circle cx="46" cy="46" r="8" fill="#F7C325" />
      <path
        d="M45 44h1m5 2h1m-6 7h1"
        stroke="#FFF3BF"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
