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
  // Pétalos: caen desde arriba girando.
  {
    kind: 'petal',
    x: '8%',
    dur: '19s',
    delay: '0s',
    drift: '90px',
    spin: '420deg',
    size: '13px',
    peak: '0.5',
    tone: '#F2C230',
  },
  {
    kind: 'petal',
    x: '23%',
    dur: '24s',
    delay: '3.5s',
    drift: '-70px',
    spin: '-380deg',
    size: '10px',
    peak: '0.4',
    tone: '#E8A93C',
  },
  {
    kind: 'petal',
    x: '41%',
    dur: '17s',
    delay: '7s',
    drift: '120px',
    spin: '500deg',
    size: '15px',
    peak: '0.45',
    tone: '#FFD329',
  },
  {
    kind: 'petal',
    x: '63%',
    dur: '26s',
    delay: '1.5s',
    drift: '-95px',
    spin: '-440deg',
    size: '11px',
    peak: '0.38',
    tone: '#D9A21F',
  },
  {
    kind: 'petal',
    x: '79%',
    dur: '21s',
    delay: '9.5s',
    drift: '75px',
    spin: '360deg',
    size: '14px',
    peak: '0.44',
    tone: '#F2C230',
  },
  {
    kind: 'petal',
    x: '92%',
    dur: '28s',
    delay: '5s',
    drift: '-110px',
    spin: '-520deg',
    size: '9px',
    peak: '0.34',
    tone: '#C8912A',
  },
  // Polen: sube en diagonal, muy tenue.
  {
    kind: 'pollen',
    x: '15%',
    dur: '15s',
    delay: '2s',
    drift: '55px',
    size: '5px',
    peak: '0.45',
    tone: '#E9B93A',
  },
  {
    kind: 'pollen',
    x: '34%',
    dur: '19s',
    delay: '6.5s',
    drift: '-40px',
    size: '4px',
    peak: '0.38',
    tone: '#F0CB55',
  },
  {
    kind: 'pollen',
    x: '52%',
    dur: '13s',
    delay: '0.5s',
    drift: '70px',
    size: '6px',
    peak: '0.42',
    tone: '#E9B93A',
  },
  {
    kind: 'pollen',
    x: '71%',
    dur: '17s',
    delay: '4s',
    drift: '-60px',
    size: '4px',
    peak: '0.35',
    tone: '#DCA82E',
  },
  {
    kind: 'pollen',
    x: '88%',
    dur: '21s',
    delay: '8s',
    drift: '45px',
    size: '5px',
    peak: '0.4',
    tone: '#F0CB55',
  },
  // Mariposas: cruzan de izquierda a derecha, espaciadas entre sí.
  {
    kind: 'butterfly',
    x: '-6%',
    dur: '27s',
    delay: '4s',
    drift: '0px',
    size: '22px',
    peak: '0.7',
    tone: '#E8A93C',
  },
  {
    kind: 'butterfly',
    x: '-10%',
    dur: '34s',
    delay: '18s',
    drift: '0px',
    size: '16px',
    peak: '0.55',
    tone: '#C9A52C',
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
