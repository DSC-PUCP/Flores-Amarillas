import type { CSSProperties } from 'react';
import styles from '../premium.module.css';
import { LoosePetal } from './art';

// Valores fijos: con Math.random el HTML del servidor no coincidiría con el del
// navegador.
const PETALS = [
  {
    x: 6,
    size: 16,
    duration: 17,
    delay: 0,
    drift: 40,
    tone: 'var(--sun)',
  },
  {
    x: 19,
    size: 11,
    duration: 21,
    delay: 6,
    drift: -30,
    tone: 'var(--mood-petal-mid)',
  },
  {
    x: 31,
    size: 14,
    duration: 19,
    delay: 11,
    drift: 50,
    tone: 'var(--sun-light)',
  },
  {
    x: 44,
    size: 10,
    duration: 23,
    delay: 3,
    drift: -45,
    tone: 'var(--sun)',
  },
  {
    x: 57,
    size: 17,
    duration: 18,
    delay: 14,
    drift: 35,
    tone: 'var(--mood-petal-back)',
  },
  {
    x: 69,
    size: 12,
    duration: 22,
    delay: 8,
    drift: -25,
    tone: 'var(--sun)',
  },
  {
    x: 81,
    size: 15,
    duration: 20,
    delay: 1.5,
    drift: 30,
    tone: 'var(--mood-petal-mid)',
  },
  {
    x: 92,
    size: 11,
    duration: 24,
    delay: 16,
    drift: -40,
    tone: 'var(--sun-light)',
  },
];

/** Pétalos amarillos cayendo muy despacio detrás de todo el contenido. */
export function PetalRain() {
  return (
    <div className={styles.petalLayer} aria-hidden="true">
      {PETALS.map((petal) => (
        <LoosePetal
          key={petal.x}
          className={styles.petal}
          style={
            {
              '--x': `${petal.x}%`,
              '--size': `${petal.size}px`,
              '--duration': `${petal.duration}s`,
              '--delay': `${petal.delay}s`,
              '--drift': `${petal.drift}px`,
              '--tone': petal.tone,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
