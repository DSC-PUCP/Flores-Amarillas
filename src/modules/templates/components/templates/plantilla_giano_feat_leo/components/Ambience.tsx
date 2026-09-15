import type { CSSProperties } from 'react';
import styles from '../premium.module.css';

/**
 * Vida alrededor de las flores, sacada de la guía de Flores Amarillas:
 * mariposas amarillas, polen dorado flotando (brilla más con la música),
 * luciérnagas y estrellas para la noche de primavera.
 * Valores fijos para que servidor y navegador coincidan.
 */

const vars = (values: Record<string, string | number>) =>
  Object.fromEntries(
    Object.entries(values).map(([key, value]) => [`--${key}`, value])
  ) as CSSProperties;

const BUTTERFLIES = [
  { top: '18%', duration: 34, delay: -4, size: 34, bob: 3.2 },
  { top: '46%', duration: 42, delay: -22, size: 26, bob: 2.6 },
  { top: '71%', duration: 29, delay: -13, size: 22, bob: 2.2 },
];

function ButterflySvg() {
  return (
    <svg viewBox="0 0 60 48" aria-hidden="true" focusable="false">
      <g className={styles.wingLeft}>
        <path
          d="M29 22C22 6 8 2 3 8c-4 6 2 16 14 17-9 3-12 12-6 16 6 3 14-4 18-15Z"
          fill="#F9DA4F"
          stroke="#D89A1F"
          strokeWidth="1.4"
        />
        <circle cx="12" cy="12" r="2.2" fill="#E8863A" opacity="0.7" />
      </g>
      <g className={styles.wingRight}>
        <path
          d="M31 22C38 6 52 2 57 8c4 6-2 16-14 17 9 3 12 12 6 16-6 3-14-4-18-15Z"
          fill="#F9DA4F"
          stroke="#D89A1F"
          strokeWidth="1.4"
        />
        <circle cx="48" cy="12" r="2.2" fill="#E8863A" opacity="0.7" />
      </g>
      <ellipse cx="30" cy="25" rx="2.2" ry="11" fill="#5C4425" />
      <path
        d="M29 15c-2-5-5-8-9-9M31 15c2-5 5-8 9-9"
        stroke="#5C4425"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Butterflies() {
  return (
    <div className={styles.fauna} aria-hidden="true">
      {BUTTERFLIES.map((butterfly) => (
        <div
          key={butterfly.top}
          className={styles.butterflyPath}
          style={{
            top: butterfly.top,
            ...vars({
              duration: `${butterfly.duration}s`,
              delay: `${butterfly.delay}s`,
            }),
          }}
        >
          <div
            className={styles.butterflyBob}
            style={{
              width: butterfly.size,
              ...vars({ bob: `${butterfly.bob}s` }),
            }}
          >
            <ButterflySvg />
          </div>
        </div>
      ))}
    </div>
  );
}

const POLLEN = [
  [4, 88, 14, 0, 18, 4],
  [11, 62, 18, -6, -24, 3],
  [17, 95, 16, -11, 30, 5],
  [24, 74, 21, -3, -14, 3],
  [31, 90, 15, -8, 22, 4],
  [38, 58, 19, -14, -30, 3],
  [45, 84, 17, -2, 12, 5],
  [52, 97, 22, -9, -20, 3],
  [59, 66, 16, -5, 26, 4],
  [66, 92, 20, -12, -16, 3],
  [73, 70, 18, -1, 20, 5],
  [80, 86, 15, -7, -26, 3],
  [87, 60, 21, -13, 14, 4],
  [94, 94, 17, -4, -18, 3],
  [8, 40, 24, -16, 16, 3],
  [63, 36, 23, -19, -12, 4],
  [42, 30, 26, -8, 20, 3],
  [90, 44, 22, -15, -22, 4],
];

/** Polen dorado que sube despacio. Con la música brilla más. */
export function Pollen() {
  return (
    <div data-mood-energy className={styles.pollenLayer} aria-hidden="true">
      {POLLEN.map(([left, top, duration, delay, drift, size]) => (
        <span
          key={`${left}-${top}`}
          className={styles.pollen}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            ...vars({
              duration: `${duration}s`,
              delay: `${delay}s`,
              drift: `${drift}px`,
            }),
          }}
        />
      ))}
    </div>
  );
}

const FIREFLIES = [
  [8, 58, 7, 0],
  [18, 34, 9, -2],
  [27, 66, 6, -4],
  [36, 44, 8, -1],
  [47, 70, 10, -5],
  [55, 38, 7, -3],
  [64, 62, 9, -6],
  [72, 30, 6, -2],
  [81, 54, 8, -4],
  [90, 40, 10, -1],
  [95, 68, 7, -3],
  [13, 76, 9, -5],
];

/** Luciérnagas doradas sobre la pradera de noche. */
export function Fireflies() {
  return (
    <div className={styles.fireflies} aria-hidden="true">
      {FIREFLIES.map(([left, top, duration, delay]) => (
        <span
          key={`${left}-${top}`}
          className={styles.firefly}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            ...vars({ duration: `${duration}s`, delay: `${delay}s` }),
          }}
        />
      ))}
    </div>
  );
}

// Estrellas de la noche de primavera: [izquierda %, arriba %, tamaño px, ritmo s]
const STARS = [
  [6, 8, 2, 3.1],
  [14, 22, 1.5, 4.2],
  [22, 5, 2.5, 2.7],
  [29, 17, 1.5, 3.8],
  [37, 10, 2, 4.6],
  [44, 26, 1.5, 3.3],
  [51, 6, 3, 2.9],
  [58, 19, 1.5, 4.1],
  [65, 11, 2, 3.5],
  [72, 24, 1.5, 2.6],
  [79, 7, 2.5, 4.4],
  [86, 18, 1.5, 3.2],
  [93, 9, 2, 3.9],
  [10, 34, 1.5, 4.8],
  [33, 38, 2, 3.6],
  [61, 36, 1.5, 4.3],
  [84, 33, 2, 2.8],
  [47, 44, 1.5, 5.1],
];

/** Estrellas que titilan sobre la pradera. */
export function Stars() {
  return (
    <div className={styles.stars} aria-hidden="true">
      {STARS.map(([left, top, size, duration], index) => (
        <span
          key={`${left}-${top}`}
          className={styles.star}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            ...vars({ duration: `${duration}s`, delay: `-${index * 0.37}s` }),
          }}
        />
      ))}
    </div>
  );
}
