import type { CSSProperties } from 'react';

/**
 * Capa de ambiente del hero: pétalos que caen, polen que sube y alguna
 * mariposa que cruza.
 *
 * Viene de `creatividad/conceptos/elementos-flores-amarillas.md`, que pide
 * reemplazar los corazones flotantes de San Valentín por fauna y flora de la
 * fecha (mariposas amarillas, pétalos al viento, polen dorado) y evitar el
 * amarillo plano acompañándolo de verde hoja y coral.
 *
 * Las posiciones y tiempos están escritos a mano, no sorteados: con
 * `Math.random()` el marcado del servidor y el del cliente no coincidirían y
 * React avisaría de un error de hidratación en cada carga.
 *
 * Es decorativa: `aria-hidden`, sin eventos de puntero y detrás del contenido.
 * El CSS la oculta por completo cuando el sistema pide movimiento reducido.
 */

interface Mote {
  kind: 'petal' | 'pollen' | 'butterfly';
  /** Posición horizontal de salida. */
  x: string;
  /** Duración del recorrido completo. */
  dur: string;
  delay: string;
  /** Desvío lateral acumulado: simula el viento. */
  drift: string;
  spin?: string;
  size?: string;
  peak: string;
  tone: string;
}

const MOTES: Mote[] = [
  // Pétalos: caen desde arriba girando. Grandes a propósito — a 12px se
  // perdían contra el papel crema y el efecto no se leía.
  {
    kind: 'petal',
    x: '5%',
    dur: '19s',
    delay: '0s',
    drift: '110px',
    spin: '420deg',
    size: '34px',
    peak: '0.62',
    tone: '#F2C230',
  },
  {
    kind: 'petal',
    x: '17%',
    dur: '25s',
    delay: '3s',
    drift: '-80px',
    spin: '-380deg',
    size: '24px',
    peak: '0.5',
    tone: '#E8A93C',
  },
  {
    kind: 'petal',
    x: '31%',
    dur: '17s',
    delay: '7s',
    drift: '130px',
    spin: '500deg',
    size: '40px',
    peak: '0.55',
    tone: '#FFD329',
  },
  {
    kind: 'petal',
    x: '44%',
    dur: '28s',
    delay: '11s',
    drift: '-95px',
    spin: '-460deg',
    size: '22px',
    peak: '0.45',
    tone: '#D9A21F',
  },
  {
    kind: 'petal',
    x: '58%',
    dur: '22s',
    delay: '2s',
    drift: '90px',
    spin: '360deg',
    size: '36px',
    peak: '0.58',
    tone: '#F2C230',
  },
  {
    kind: 'petal',
    x: '70%',
    dur: '30s',
    delay: '8s',
    drift: '-120px',
    spin: '-520deg',
    size: '26px',
    peak: '0.48',
    tone: '#C8912A',
  },
  {
    kind: 'petal',
    x: '83%',
    dur: '21s',
    delay: '14s',
    drift: '100px',
    spin: '440deg',
    size: '32px',
    peak: '0.55',
    tone: '#E8A93C',
  },
  {
    kind: 'petal',
    x: '94%',
    dur: '26s',
    delay: '5s',
    drift: '-70px',
    spin: '-400deg',
    size: '28px',
    peak: '0.5',
    tone: '#F2C230',
  },
  // Polen: sube en diagonal, tenue pero visible.
  {
    kind: 'pollen',
    x: '12%',
    dur: '15s',
    delay: '2s',
    drift: '60px',
    size: '9px',
    peak: '0.55',
    tone: '#E9B93A',
  },
  {
    kind: 'pollen',
    x: '28%',
    dur: '19s',
    delay: '6s',
    drift: '-45px',
    size: '7px',
    peak: '0.48',
    tone: '#F0CB55',
  },
  {
    kind: 'pollen',
    x: '46%',
    dur: '13s',
    delay: '0.5s',
    drift: '75px',
    size: '10px',
    peak: '0.52',
    tone: '#E9B93A',
  },
  {
    kind: 'pollen',
    x: '64%',
    dur: '17s',
    delay: '4s',
    drift: '-65px',
    size: '8px',
    peak: '0.45',
    tone: '#DCA82E',
  },
  {
    kind: 'pollen',
    x: '80%',
    dur: '21s',
    delay: '8s',
    drift: '50px',
    size: '9px',
    peak: '0.5',
    tone: '#F0CB55',
  },
  {
    kind: 'pollen',
    x: '92%',
    dur: '16s',
    delay: '12s',
    drift: '-55px',
    size: '7px',
    peak: '0.46',
    tone: '#E9B93A',
  },
  // Mariposas: son el detalle que la gente mira, asi que van grandes.
  {
    kind: 'butterfly',
    x: '-8%',
    dur: '26s',
    delay: '2s',
    drift: '0px',
    size: '54px',
    peak: '0.85',
    tone: '#E8A93C',
  },
  {
    kind: 'butterfly',
    x: '-14%',
    dur: '34s',
    delay: '13s',
    drift: '0px',
    size: '38px',
    peak: '0.7',
    tone: '#C9A52C',
  },
  {
    kind: 'butterfly',
    x: '-10%',
    dur: '40s',
    delay: '24s',
    drift: '0px',
    size: '46px',
    peak: '0.75',
    tone: '#F2C230',
  },
];

/** Pétalo de girasol: una gota alargada con una nervadura al centro. */
function Petal({ size }: { size: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 1c5 4.5 8 9 8 13a8 8 0 0 1-16 0c0-4 3-8.5 8-13Z"
        fill="currentColor"
      />
      <path
        d="M12 4.5v14"
        stroke="#8A6A16"
        strokeOpacity="0.25"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Mariposa vista desde arriba, en dos pares de alas. */
function Butterfly({ size }: { size: string }) {
  return (
    <svg
      // Sin `height`: con el viewBox el alto sale de la proporción real (4:3)
      // y las alas no quedan aplastadas.
      width={size}
      viewBox="0 0 32 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16 12C13 4 8 1 4 3S1 12 5 15s9 1 11-3Z"
        fill="currentColor"
        fillOpacity="0.92"
      />
      <path
        d="M16 12c3-8 8-11 12-9s3 9-1 12-9 1-11-3Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M16 11.5c-2 4-5 6-8 5.5s-3-3 0-4"
        fill="currentColor"
        fillOpacity="0.6"
      />
      <path
        d="M16 11.5c2 4 5 6 8 5.5s3-3 0-4"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M16 8v9"
        stroke="#4A3C12"
        strokeOpacity="0.45"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Ambient() {
  return (
    <div className="bloom-ambient" aria-hidden="true">
      {MOTES.map((mote, index) => (
        <span
          // La lista es fija y decorativa: tipo + posición la identifican.
          key={`${mote.kind}-${index}`}
          data-kind={mote.kind}
          style={
            {
              '--x': mote.x,
              '--dur': mote.dur,
              '--delay': mote.delay,
              '--drift': mote.drift,
              '--spin': mote.spin,
              '--size': mote.size,
              '--peak': mote.peak,
              '--tone': mote.tone,
            } as CSSProperties
          }
        >
          {mote.kind === 'petal' && <Petal size={mote.size ?? '12px'} />}
          {mote.kind === 'butterfly' && (
            <Butterfly size={mote.size ?? '20px'} />
          )}
        </span>
      ))}
    </div>
  );
}
