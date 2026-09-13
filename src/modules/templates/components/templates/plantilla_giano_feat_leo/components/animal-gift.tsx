import type { CSSProperties } from 'react';
import type { GiftMascot } from '../mascots';
import styles from '../premium.module.css';
import { GiftBouquet } from './gift-bouquet';

const PET_COLORS: Record<
  GiftMascot,
  { fur: string; soft: string; inner: string; speed: string }
> = {
  rabbit: { fur: '#B7DCE7', soft: '#EAF5F6', inner: '#EFB7CF', speed: '5s' },
  bear: { fur: '#D3AD7C', soft: '#F1D8B5', inner: '#EEBCD0', speed: '6s' },
  cat: { fur: '#BFC2C8', soft: '#E6E7EB', inner: '#EDB3CB', speed: '5.5s' },
  puppy: { fur: '#F2E9DA', soft: '#FFFAF1', inner: '#C69D77', speed: '4.5s' },
  panda: { fur: '#F9F7EF', soft: '#FFFFFF', inner: '#454347', speed: '6.5s' },
  fox: { fur: '#F2B66E', soft: '#FFF5DD', inner: '#FFD4AF', speed: '4.8s' },
  chick: { fur: '#F6E38B', soft: '#FFF0B6', inner: '#EAB566', speed: '4.2s' },
};
const OUTLINE = '#484044';

/** Colección kawaii: cabezas grandes, cuerpos diminutos y contornos de dibujo. */
export function AnimalGift({ mascot }: { mascot: GiftMascot }) {
  const colors = PET_COLORS[mascot];
  const cat = mascot === 'cat';
  const fox = mascot === 'fox';
  const panda = mascot === 'panda';
  const chick = mascot === 'chick';
  return (
    <svg
      viewBox="0 0 320 350"
      className={styles.cuteAnimal}
      data-character={mascot}
      aria-hidden="true"
      focusable="false"
      style={{ '--pet-speed': colors.speed } as CSSProperties}
    >
      <ellipse cx="160" cy="326" rx="69" ry="7" fill="#DDE3CC" />
      <g
        className={styles.cuteTail}
        fill={colors.fur}
        stroke={OUTLINE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      >
        {fox && (
          <>
            <path d="M190 280c42 7 65-21 58-65-10 10-19 14-31 15 0 21-7 30-31 32Z" />
            <path
              d="M230 228q8-4 18-13 5 20 0 36l-19-4Z"
              fill={colors.soft}
              stroke="none"
            />
          </>
        )}
        {cat && (
          <path d="M190 282c54 13 56-36 36-44-12-5-18 7-8 14 9 9-3 21-29 14Z" />
        )}
        {mascot === 'puppy' && <path d="M192 283q46-3 43-35-17 19-44 17Z" />}
        {mascot === 'rabbit' && (
          <ellipse cx="198" cy="278" rx="17" ry="16" fill={colors.soft} />
        )}
      </g>
      <g
        className={styles.cuteBody}
        fill={colors.fur}
        stroke={OUTLINE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      >
        <path
          d="M137 206c-17 14-23 45-16 68l9 30q-17 17-4 22c12 4 24-4 26-17h17c3 13 16 21 27 16 11-6-6-17-7-22l10-31c7-25-3-53-17-66Z"
          fill={panda ? '#49464B' : colors.fur}
        />
        <ellipse
          cx="160"
          cy="260"
          rx="24"
          ry="36"
          fill={colors.soft}
          stroke="none"
        />
        {chick && (
          <g fill="#EAB567">
            <path d="m134 305-13 14q-4 7 5 8l24-6-6-16Z" />
            <path d="m185 305 14 14q4 7-5 8l-24-6 6-16Z" />
          </g>
        )}
      </g>
      <g className={styles.cuteHead}>
        <PetEars mascot={mascot} />
        <path
          d={
            cat || fox
              ? 'M77 152c0-41 35-71 82-71 50 0 84 29 85 70l7 23-12 5c-9 31-42 49-80 48-40 1-71-18-82-48l-10-5Z'
              : 'M75 153c0-42 34-75 85-75 52 0 86 33 86 76 0 48-32 76-86 76-53 0-85-29-85-77Z'
          }
          fill={colors.fur}
          stroke={OUTLINE}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {fox && (
          <path
            d="M89 171q21-7 47 14l24-9 24 9q24-21 47-14c-8 33-29 47-71 48-40-1-63-14-71-48Z"
            fill={colors.soft}
          />
        )}
        {cat && (
          <>
            <path
              d="m142 86 5 18q4 4 7-1l2-20m12 0 3 19q3 4 6 0l6-15"
              fill="#9D9FA8"
            />
            <path d="m79 161 17 5-14 9m157-14-17 5 14 9" fill="#9D9FA8" />
          </>
        )}
        {mascot === 'puppy' && (
          <path
            d="M182 130c21-20 43-5 45 19 2 23-11 36-30 26-15-8-24-35-15-45Z"
            fill={colors.inner}
          />
        )}
        {panda && (
          <g fill="#454347">
            <ellipse
              cx="127"
              cy="167"
              rx="22"
              ry="26"
              transform="rotate(15 127 167)"
            />
            <ellipse
              cx="193"
              cy="167"
              rx="22"
              ry="26"
              transform="rotate(-15 193 167)"
            />
          </g>
        )}
        {(mascot === 'bear' || mascot === 'rabbit' || mascot === 'puppy') && (
          <ellipse cx="160" cy="191" rx="23" ry="17" fill={colors.soft} />
        )}
        <ellipse
          cx="104"
          cy="185"
          rx="12"
          ry="8"
          fill="#EDA9C1"
          opacity="0.8"
        />
        <ellipse
          cx="216"
          cy="185"
          rx="12"
          ry="8"
          fill="#EDA9C1"
          opacity="0.8"
        />
        <g className={styles.cuteEyes}>
          <ellipse cx="126" cy="166" rx="13" ry="17" fill="#252329" />
          <ellipse cx="194" cy="166" rx="13" ry="17" fill="#252329" />
          <g className={styles.cuteGaze}>
            <ellipse cx="123" cy="158" rx="4" ry="5" fill="#FFFFFF" />
            <ellipse cx="191" cy="158" rx="4" ry="5" fill="#FFFFFF" />
            <circle cx="130" cy="174" r="2" fill="#FAF5E8" />
            <circle cx="198" cy="174" r="2" fill="#FAF5E8" />
          </g>
        </g>
        {chick ? (
          <path
            d="M150 186q10-7 20 0-1 9-10 10-9-1-10-10Z"
            fill="#EDAC58"
            stroke={OUTLINE}
            strokeWidth="2"
          />
        ) : (
          <>
            <path
              d="M155 184q5-3 10 0-1 5-5 6-4-1-5-6Z"
              fill={cat || mascot === 'rabbit' ? '#DA9FB6' : '#645043'}
              stroke={OUTLINE}
              strokeWidth="1.3"
            />
            <path
              d="M160 190v4m0-1q-5 8-10 1m10-1q5 8 10 1"
              fill="none"
              stroke={OUTLINE}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </>
        )}
        {mascot === 'rabbit' && (
          <path
            d="M155 197v7h5v-6m0 0v6h5v-7"
            fill="#FFFFFF"
            stroke={OUTLINE}
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        )}
        {cat && (
          <path
            d="m103 192-15-2m16 8-15 4m128-10 15-2m-16 8 15 4"
            fill="none"
            stroke={OUTLINE}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        )}
        <path
          d="M108 103q13-9 26-9"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.45"
        />
      </g>
      <GiftBouquet />
      <g
        fill={panda ? '#49464B' : colors.fur}
        stroke={OUTLINE}
        strokeWidth="2.4"
        strokeLinejoin="round"
      >
        <g className={styles.cutePawLeft}>
          <path
            d={
              chick
                ? 'M118 243q-18 3-10 25 5 11 18 5l10-12Z'
                : 'M113 246c-15-5-18 15-6 23 10 7 25-2 25-10 0-7-12-11-19-13Z'
            }
          />
          <path
            d="m116 255 4 4"
            fill="none"
            stroke={panda ? '#7F7A83' : OUTLINE}
            strokeWidth="1.3"
            opacity="0.6"
          />
        </g>
        <g className={styles.cutePawRight}>
          <path
            d={
              chick
                ? 'M202 243q18 3 10 25-5 11-18 5l-10-12Z'
                : 'M207 246c15-5 18 15 6 23-10 7-25-2-25-10 0-7 12-11 19-13Z'
            }
          />
          <path
            d="m204 255-4 4"
            fill="none"
            stroke={panda ? '#7F7A83' : OUTLINE}
            strokeWidth="1.3"
            opacity="0.6"
          />
        </g>
      </g>
      <g
        className={styles.cuteHearts}
        fill="#EAB3C6"
        stroke="#BD8A9D"
        strokeWidth="1"
      >
        <path d="M65 230c-10-8-13 4 0 10 13-6 10-18 0-10Z" />
        <path d="M258 279c-8-7-11 3 0 8 11-5 8-15 0-8Z" />
      </g>
    </svg>
  );
}

function PetEars({ mascot }: { mascot: GiftMascot }) {
  const colors = PET_COLORS[mascot];
  const round = mascot === 'bear' || mascot === 'panda';
  return (
    <g
      fill={colors.fur}
      stroke={OUTLINE}
      strokeWidth="2.6"
      strokeLinejoin="round"
    >
      {mascot === 'rabbit' && (
        <>
          <g className={styles.cuteEarLeft}>
            <path d="M102 114c-11-24-15-62-1-76 17-17 36 22 34 58Z" />
            <path
              d="M110 96c-8-25-12-46-5-48 8-3 16 20 18 41Z"
              fill={colors.inner}
              stroke="none"
            />
          </g>
          <g className={styles.cuteEarRight}>
            <path d="M185 96c-2-36 17-75 34-58 14 14 10 52-1 76Z" />
            <path
              d="M197 89c2-21 10-44 18-41 7 2 3 23-5 48Z"
              fill={colors.inner}
              stroke="none"
            />
          </g>
        </>
      )}
      {round && (
        <>
          <g className={styles.cuteEarLeft}>
            <circle
              cx="99"
              cy="88"
              r="24"
              fill={mascot === 'panda' ? colors.inner : colors.fur}
            />
            <circle
              cx="99"
              cy="88"
              r="12"
              fill={mascot === 'panda' ? '#69656D' : colors.inner}
              stroke="none"
            />
          </g>
          <g className={styles.cuteEarRight}>
            <circle
              cx="221"
              cy="88"
              r="24"
              fill={mascot === 'panda' ? colors.inner : colors.fur}
            />
            <circle
              cx="221"
              cy="88"
              r="12"
              fill={mascot === 'panda' ? '#69656D' : colors.inner}
              stroke="none"
            />
          </g>
        </>
      )}
      {(mascot === 'cat' || mascot === 'fox') && (
        <>
          <g className={styles.cuteEarLeft}>
            <path d="M79 130 77 63q0-9 9-4l49 39Z" />
            <path d="m90 101-2-29 29 24Z" fill={colors.inner} stroke="none" />
          </g>
          <g className={styles.cuteEarRight}>
            <path d="m185 98 49-39q9-5 9 4l-2 67Z" />
            <path d="m203 96 29-24-2 29Z" fill={colors.inner} stroke="none" />
          </g>
        </>
      )}
      {mascot === 'puppy' && (
        <>
          <g className={styles.cuteEarLeft}>
            <path
              d="M103 107C75 81 53 121 67 159q7 25 26 12l15-42Z"
              fill={colors.inner}
            />
          </g>
          <g className={styles.cuteEarRight}>
            <path
              d="M217 107c28-26 50 14 36 52q-7 25-26 12l-15-42Z"
              fill={colors.inner}
            />
          </g>
        </>
      )}
      {mascot === 'chick' && (
        <g className={styles.cuteEarLeft}>
          <path d="M156 85q-22-20-10-25 12-3 15 22 2-25 14-20 10 7-19 23Z" />
        </g>
      )}
    </g>
  );
}
