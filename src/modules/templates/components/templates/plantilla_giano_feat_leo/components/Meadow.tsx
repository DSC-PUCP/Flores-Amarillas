import { type CSSProperties, useId } from 'react';
import { cn } from '@/lib/utils';
import styles from '../premium.module.css';
import { Sunflower } from './art';

/**
 * Pradera de primavera (21 de setiembre): una sola escena con profundidad,
 * no flores sueltas. Atrás un campo de mostaza, al medio retama y margaritas,
 * adelante girasoles de distintas alturas, amancays y pasto.
 *
 * Todo se genera con una semilla fija para que el servidor y el navegador
 * dibujen exactamente lo mismo.
 */

// Doble de ancho que alto visible: en pantallas anchas la escena se ajusta por
// alto y recorta los costados, nunca las cabezas de los girasoles.
const W = 2880;
const H = 360;
/** Lo más alto de la escena (cabeza del girasol más alto). */
const TOP = 70;

function seeded(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = seeded(21092026);
const between = (min: number, max: number) => min + rand() * (max - min);
const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)];
const swayStyle = (base = 6) =>
  ({
    '--sway': `${(base + rand() * 3).toFixed(2)}s`,
    '--sway-delay': `-${(rand() * 6).toFixed(2)}s`,
    '--sway-angle': `${(1.4 + rand() * 2.2).toFixed(2)}deg`,
  }) as CSSProperties;

// Altura aproximada de cada loma, para sembrar flores encima.
const farY = (x: number) => 232 + 14 * Math.sin(x / 190) + 8 * Math.sin(x / 70);
const midY = (x: number) => 282 + 10 * Math.sin(x / 230 + 1.2);

const MUSTARD = Array.from({ length: 260 }, () => {
  const x = between(0, W);
  return {
    x: +x.toFixed(1),
    y: +(farY(x) + between(4, 70)).toFixed(1),
    r: +between(1.4, 3.2).toFixed(2),
    fill: pick(['#F7C325', '#FFE9A8', '#E8B84B', '#F7C325']),
  };
});

const RETAMA = [
  110, 300, 470, 610, 870, 1010, 1160, 1320, 1560, 1740, 1930, 2090, 2270, 2450,
  2620, 2790,
].map((base) => {
  const x = base + between(-30, 30);
  const height = between(55, 95);
  const lean = between(-26, 26);
  const buds = Array.from({ length: 13 }, (_, i) => {
    const t = 0.35 + (i / 13) * 0.65;
    return {
      cx: +(x + lean * t * t + between(-7, 7)).toFixed(1),
      cy: +(midY(x) + 8 - height * t + between(-4, 4)).toFixed(1),
      rx: +between(2.6, 4).toFixed(1),
      fill: pick(['#F5C518', '#F7C325', '#E8B84B']),
    };
  });
  return {
    x,
    top: midY(x) + 8 - height,
    lean,
    base: midY(x) + 8,
    buds,
    style: swayStyle(5),
  };
});

const MID_DAISIES = Array.from({ length: 26 }, () => {
  const x = between(20, W - 20);
  return {
    x,
    y: midY(x) + between(8, 34),
    r: between(6, 9),
    style: swayStyle(5),
  };
});

const GRASS = (count: number, minH: number, maxH: number) =>
  Array.from({ length: count }, () => {
    const x = between(-10, W + 10);
    const h = between(minH, maxH);
    const lean = between(-14, 14);
    return {
      d: `M${x.toFixed(1)} ${H} Q${(x + lean * 0.4).toFixed(1)} ${(H - h * 0.6).toFixed(1)} ${(x + lean).toFixed(1)} ${(H - h).toFixed(1)}`,
      stroke: pick(['#6E9140', '#8BA84C', '#7E9E43', '#5E8236']),
      width: +between(2.2, 4).toFixed(1),
    };
  });

const GRASS_BACK = GRASS(200, 22, 58);
const GRASS_FRONT = GRASS(90, 14, 34);

// Girasoles puestos a mano: grupos con alturas distintas. En celular se ve la
// franja central (alrededor de x = 1440), así que ahí también hay un grupo.
const SUNFLOWERS: [x: number, top: number, size: number, tilt: number][] = [
  [60, 170, 70, -8],
  [165, 212, 52, 6],
  [248, 148, 86, -4],
  [350, 226, 46, 10],
  [548, 236, 44, -6],
  [640, 196, 60, 4],
  [724, 250, 40, -10],
  [812, 222, 52, 8],
  [900, 186, 64, -5],
  [1086, 158, 82, 5],
  [1184, 214, 52, -8],
  [1276, 138, 92, 3],
  [1384, 198, 62, -6],
  [1490, 176, 74, 6],
  [1590, 228, 48, -8],
  [1690, 160, 84, 4],
  [1800, 214, 54, 9],
  [1960, 240, 42, -5],
  [2060, 190, 66, 6],
  [2170, 146, 90, -3],
  [2280, 226, 46, 8],
  [2400, 172, 76, -6],
  [2510, 218, 52, 5],
  [2620, 150, 86, -4],
  [2740, 206, 58, 7],
  [2840, 180, 70, -6],
];

const SUNFLOWER_PARTS = SUNFLOWERS.map(([x, top, size, tilt]) => {
  const headX = x + tilt * 2.2;
  const stemWidth = Math.max(3, size / 15);
  const leafAt = (t: number) => ({
    x: x + (headX - x) * t,
    y: H - (H - top) * t,
  });
  const leaves = [0.42, 0.66].map((t, i) => ({
    ...leafAt(t),
    side: (i % 2 === 0 ? -1 : 1) * (tilt > 0 ? -1 : 1),
    scale: size / 70,
  }));
  return {
    stem: `M${x} ${H} Q${(x + tilt * 0.6).toFixed(1)} ${((H + top) / 2).toFixed(1)} ${headX.toFixed(1)} ${top}`,
    stemWidth,
    head: {
      x: headX - size / 2,
      y: top - size / 2,
      size,
      tilt,
      cx: headX,
      cy: top,
    },
    leaves,
    style: swayStyle(6),
  };
});

const AMANCAYS = [
  [430, 262, 1],
  [985, 256, 0.9],
  [1336, 272, 0.8],
  [1880, 258, 1],
  [2340, 266, 0.85],
  [2700, 254, 0.95],
].map(([x, top, scale]) => ({ x, top, scale, style: swayStyle(5) }));

const FRONT_DAISIES = [
  [30, 342],
  [205, 346],
  [395, 340],
  [505, 348],
  [770, 344],
  [955, 346],
  [1130, 341],
  [1240, 348],
  [1420, 344],
  [1545, 346],
  [1745, 340],
  [1905, 348],
  [2120, 343],
  [2330, 347],
  [2560, 341],
  [2790, 346],
].map(([x, y]) => ({ x, y, r: between(8, 12), style: swayStyle(4) }));

/**
 * De día, el color tal cual. De noche se mezcla con el tono oscuro de la
 * canción, para que la pradera pertenezca a la misma escena que las luces.
 */
const tone = (night: boolean, day: string, dark: string, songShare: number) =>
  night
    ? {
        style: {
          stopColor: `color-mix(in srgb, var(--mood-deep) ${songShare}%, ${dark})`,
        },
      }
    : { stopColor: day };

const DAISY_PETALS = Array.from({ length: 10 }, (_, i) => i * 36);
const AMANCAY_TEPALS = [-70, -35, 0, 35, 70, 180];

function Daisy({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <path
        d={`M${x} ${H} Q${x - 2} ${(y + H) / 2} ${x} ${y}`}
        stroke="#6E9140"
        strokeWidth="1.8"
        fill="none"
      />
      {DAISY_PETALS.map((angle) => (
        <ellipse
          key={angle}
          cx={x}
          cy={y - r * 0.55}
          rx={r * 0.26}
          ry={r * 0.6}
          fill="#FFFDF7"
          transform={`rotate(${angle} ${x} ${y})`}
        />
      ))}
      <circle cx={x} cy={y} r={r * 0.34} fill="#F7C325" />
      <circle cx={x} cy={y} r={r * 0.18} fill="#D89A1F" />
    </g>
  );
}

export function Meadow({
  night = false,
  className,
}: {
  /** Versión de noche para el cierre: lomas oscuras, flores igual de amarillas. */
  night?: boolean;
  className?: string;
}) {
  // Cada pradera con sus propios degradados: puede haber dos en pantalla.
  const id = `meadow-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg
      viewBox={`0 ${TOP} ${W} ${H - TOP}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={cn('block h-full w-full', className)}
    >
      <defs>
        <linearGradient id={`${id}-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" {...tone(night, '#F4DC8E', '#4A5A2E', 50)} />
          <stop offset="1" {...tone(night, '#DCC263', '#30401F', 45)} />
        </linearGradient>
        <linearGradient id={`${id}-mid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" {...tone(night, '#BACD74', '#35522F', 40)} />
          <stop offset="1" {...tone(night, '#93AD52', '#1F3520', 35)} />
        </linearGradient>
        <radialGradient id={`${id}-amancay`} cx="0.5" cy="0.9" r="0.9">
          <stop offset="0" stopColor="#F7C325" />
          <stop offset="1" stopColor="#E8863A" />
        </radialGradient>
      </defs>

      {/* Campo de mostaza al fondo */}
      <path
        d={`M0 ${farY(0)} ${Array.from({ length: 49 }, (_, i) => {
          const x = (W / 48) * i;
          return `L${x.toFixed(0)} ${farY(x).toFixed(1)}`;
        }).join(' ')} L${W} ${H} L0 ${H}Z`}
        fill={`url(#${id}-far)`}
      />
      <g opacity={night ? 0.75 : 0.95}>
        {MUSTARD.map((dot) => (
          <circle
            key={`${dot.x}-${dot.y}`}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill={dot.fill}
          />
        ))}
      </g>

      {/* Loma media con retama y margaritas */}
      <path
        d={`M0 ${midY(0)} ${Array.from({ length: 49 }, (_, i) => {
          const x = (W / 48) * i;
          return `L${x.toFixed(0)} ${midY(x).toFixed(1)}`;
        }).join(' ')} L${W} ${H} L0 ${H}Z`}
        fill={`url(#${id}-mid)`}
      />
      {RETAMA.map((branch) => (
        <g key={branch.x} className={styles.meadowSway} style={branch.style}>
          <path
            d={`M${branch.x} ${branch.base} Q${branch.x + branch.lean * 0.2} ${(branch.base + branch.top) / 2} ${branch.x + branch.lean} ${branch.top}`}
            stroke="#6E9140"
            strokeWidth="2"
            fill="none"
          />
          {branch.buds.map((bud) => (
            <ellipse
              key={`${bud.cx}-${bud.cy}`}
              cx={bud.cx}
              cy={bud.cy}
              rx={bud.rx}
              ry={bud.rx * 0.72}
              fill={bud.fill}
            />
          ))}
        </g>
      ))}
      {MID_DAISIES.map((daisy) => (
        <g key={daisy.x} className={styles.meadowSway} style={daisy.style}>
          <Daisy x={daisy.x} y={daisy.y} r={daisy.r} />
        </g>
      ))}

      {/* Pasto de atrás */}
      <g className={styles.grassWind}>
        {GRASS_BACK.map((blade) => (
          <path
            key={blade.d}
            d={blade.d}
            stroke={night ? '#2E4A2A' : blade.stroke}
            strokeWidth={blade.width}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </g>

      {/* Amancays: el toque andino */}
      {AMANCAYS.map((flower) => (
        <g key={flower.x} className={styles.meadowSway} style={flower.style}>
          <path
            d={`M${flower.x} ${H} Q${flower.x + 6} ${(flower.top + H) / 2} ${flower.x} ${flower.top}`}
            stroke="#5E8236"
            strokeWidth="3"
            fill="none"
          />
          <g
            transform={`translate(${flower.x} ${flower.top}) scale(${flower.scale})`}
          >
            {AMANCAY_TEPALS.map((angle) => (
              <path
                key={angle}
                d="M0 0C-7 -10 -8 -26 0 -38C8 -26 7 -10 0 0Z"
                fill={`url(#${id}-amancay)`}
                transform={`rotate(${angle})`}
              />
            ))}
            <circle r="4" fill="#C8641F" />
            {[-16, 0, 16].map((angle) => (
              <line
                key={angle}
                x1="0"
                y1="0"
                x2="0"
                y2="-20"
                stroke="#8A5A1B"
                strokeWidth="1.2"
                transform={`rotate(${angle})`}
              />
            ))}
          </g>
        </g>
      ))}

      {/* Girasoles */}
      {SUNFLOWER_PARTS.map((flower) => (
        <g key={flower.stem} className={styles.meadowSway} style={flower.style}>
          <path
            d={flower.stem}
            stroke="#4F7A3A"
            strokeWidth={flower.stemWidth}
            strokeLinecap="round"
            fill="none"
          />
          {flower.leaves.map((leaf) => (
            <path
              key={`${leaf.x}-${leaf.y}`}
              d="M0 0C-14 -4 -30 -2 -40 10C-26 16 -10 12 0 0Z"
              fill={leaf.side < 0 ? '#8BA84C' : '#6E9140'}
              transform={`translate(${leaf.x.toFixed(1)} ${leaf.y.toFixed(1)}) scale(${(leaf.side * leaf.scale).toFixed(2)} ${leaf.scale.toFixed(2)})`}
            />
          ))}
          <g
            transform={`rotate(${flower.head.tilt} ${flower.head.cx} ${flower.head.cy})`}
          >
            <Sunflower
              lite
              x={flower.head.x}
              y={flower.head.y}
              size={flower.head.size}
            />
          </g>
        </g>
      ))}

      {/* Primer plano */}
      {FRONT_DAISIES.map((daisy) => (
        <g key={daisy.x} className={styles.meadowSway} style={daisy.style}>
          <Daisy x={daisy.x} y={daisy.y} r={daisy.r} />
        </g>
      ))}
      <g className={styles.grassWind} style={{ animationDelay: '-2s' }}>
        {GRASS_FRONT.map((blade) => (
          <path
            key={blade.d}
            d={blade.d}
            stroke={night ? '#243E22' : blade.stroke}
            strokeWidth={blade.width}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </g>
    </svg>
  );
}
