import { type CSSProperties, useId } from 'react';
import styles from '../premium.module.css';

type FlowerKind = 'sunflower' | 'daisy' | 'cosmos' | 'tulip';
type SpringArtProps = { className?: string; style?: CSSProperties };

/** Pétalos, corola y tallos son capas independientes, no imágenes. */
export function Bloom({
  x = 0,
  y = 0,
  size = 60,
  kind = 'daisy',
  className,
}: {
  x?: number;
  y?: number;
  size?: number;
  kind?: FlowerKind;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const petals = kind === 'sunflower' ? 15 : kind === 'cosmos' ? 8 : 11;
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      overflow="visible"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0.7" y2="1">
          <stop stopColor={kind === 'cosmos' ? '#FFF0B5' : '#FFF1A0'} />
          <stop
            offset="0.6"
            stopColor={kind === 'sunflower' ? '#F8CB37' : '#FFD768'}
          />
          <stop offset="1" stopColor="#EAAA32" />
        </linearGradient>
        <radialGradient id={`${id}-center`} cx="35%" cy="30%">
          <stop stopColor={kind === 'sunflower' ? '#AC743F' : '#F8C348'} />
          <stop
            offset="1"
            stopColor={kind === 'sunflower' ? '#684125' : '#C78A29'}
          />
        </radialGradient>
      </defs>
      {kind === 'tulip' ? (
        <g className={styles.flowerNod}>
          <path
            d="M22 29q15 0 28 13 10-15 28-18c4 28-4 49-28 52-22-4-30-22-28-47Z"
            fill={`url(#${id}-gold)`}
            stroke="#DDA53E"
            strokeWidth="1"
          />
          <path d="M36 30q12-19 17-20 12 15 13 28L50 69Z" fill="#FFE999" />
          <path
            d="M50 73q-9-20-11-32M53 70q12-21 14-32"
            fill="none"
            stroke="#D9A438"
            strokeWidth="1.3"
            opacity="0.5"
          />
        </g>
      ) : (
        <>
          <g
            className={styles.petalBreath}
            fill={`url(#${id}-gold)`}
            stroke="#DCA641"
            strokeWidth="0.65"
          >
            {Array.from({ length: petals }, (_, index) => (
              <g
                key={`petal-${(index * 360) / petals}`}
                transform={`rotate(${(index * 360) / petals} 50 50)`}
              >
                {kind === 'cosmos' ? (
                  <path d="M47 48C34 37 28 17 35 12q4-4 8 1 5-8 10-3 7-5 10 3 4 14-10 35Z" />
                ) : (
                  <path d="M49 49C40 41 38 23 43 13q6-9 12-1c8 14 3 29-6 37Z" />
                )}
                <path
                  d="M49 36q-3-11 0-17"
                  stroke="#FFF4C6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.6"
                  fill="none"
                />
              </g>
            ))}
          </g>
          <circle
            cx="50"
            cy="50"
            r={kind === 'sunflower' ? 17 : 12}
            fill={`url(#${id}-center)`}
            stroke="#C6973C"
            strokeWidth="1.5"
          />
          <g fill={kind === 'sunflower' ? '#4F341F' : '#FFF0AC'} opacity="0.7">
            {Array.from(
              { length: kind === 'sunflower' ? 24 : 9 },
              (_, index) => {
                const angle = index * 2.399;
                const radius =
                  Math.sqrt(index + 1) * (kind === 'sunflower' ? 2.5 : 2.1);
                return (
                  <circle
                    key={`seed-${angle}`}
                    cx={50 + Math.cos(angle) * radius}
                    cy={50 + Math.sin(angle) * radius}
                    r="1.2"
                  />
                );
              }
            )}
          </g>
          <path
            d="M42 44q3-5 8-5"
            stroke="#FFE9AB"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}

export function Butterfly({ className, style }: SpringArtProps) {
  return (
    <svg
      viewBox="0 0 90 70"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <g
        className={styles.gardenWingLeft}
        fill="#F5CD62"
        stroke="#D19D42"
        strokeWidth="1.2"
      >
        <path d="M44 34C35 9 4 0 7 24c2 14 19 16 37 10Z" />
        <path d="M43 35C16 30 13 54 28 55c10-1 15-11 15-20Z" fill="#FFE8A5" />
        <path d="M35 26 17 16M34 40l-9 7" stroke="#FFF3C9" strokeWidth="3" />
      </g>
      <g
        className={styles.gardenWingRight}
        fill="#F5CD62"
        stroke="#D19D42"
        strokeWidth="1.2"
      >
        <path d="M46 34C55 9 86 0 83 24c-2 14-19 16-37 10Z" />
        <path d="M47 35c27-5 30 19 15 20-10-1-15-11-15-20Z" fill="#FFE8A5" />
        <path d="m55 26 18-10M56 40l9 7" stroke="#FFF3C9" strokeWidth="3" />
      </g>
      <path
        d="M45 26v24m-1-23q-3-9-7-8m9 8q3-9 7-8"
        fill="none"
        stroke="#79653D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Bee({ className }: SpringArtProps) {
  return (
    <svg
      viewBox="0 0 100 80"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g
        className={styles.beeWings}
        fill="#FFFDF3"
        stroke="#BEDAD0"
        strokeWidth="1.3"
      >
        <ellipse
          cx="38"
          cy="24"
          rx="12"
          ry="17"
          transform="rotate(-30 38 24)"
        />
        <ellipse cx="56" cy="25" rx="11" ry="17" transform="rotate(25 56 25)" />
      </g>
      <ellipse
        cx="49"
        cy="45"
        rx="26"
        ry="19"
        fill="#F7CB4D"
        stroke="#BD923D"
        strokeWidth="1"
      />
      <path
        d="M36 29q-9 15 0 30m13-33q-8 18 0 37"
        stroke="#725A38"
        strokeWidth="8"
        fill="none"
      />
      <ellipse cx="69" cy="42" rx="15" ry="17" fill="#F7D778" />
      <circle cx="75" cy="39" r="3" fill="#544328" />
      <circle cx="76" cy="38" r="1" fill="#FFF" />
      <path
        d="M77 48q-4 4-7 0m-5-19q-2-8-7-8"
        stroke="#725A38"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <ellipse cx="76" cy="45" rx="4" ry="2.5" fill="#E9AB7A" />
    </svg>
  );
}

export function FlowerMeadow({ className }: SpringArtProps) {
  const plants: [number, number, number, FlowerKind][] = [
    [15, 80, 58, 'tulip'],
    [75, 42, 77, 'sunflower'],
    [150, 105, 52, 'daisy'],
    [202, 72, 66, 'cosmos'],
    [266, 128, 43, 'daisy'],
    [333, 138, 50, 'tulip'],
    [414, 160, 34, 'daisy'],
    [489, 174, 32, 'cosmos'],
    [575, 182, 34, 'daisy'],
    [654, 169, 38, 'daisy'],
    [735, 154, 46, 'tulip'],
    [807, 133, 45, 'cosmos'],
    [873, 103, 59, 'daisy'],
    [951, 63, 80, 'sunflower'],
    [1044, 109, 51, 'cosmos'],
    [1108, 47, 77, 'tulip'],
    [1160, 111, 47, 'daisy'],
  ];
  return (
    <svg
      viewBox="0 0 1240 280"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 229q170-68 350-14t420-4 470-4v73H0Z" fill="#DCE6BF" />
      <path d="M0 253q250-57 510-8t730-16v51H0Z" fill="#B9CF9C" />
      {plants.map(([x, y, size, kind], index) => (
        <g
          key={`plant-${x}`}
          className={styles.gardenPlant}
          style={
            {
              '--plant-delay': `${index * -0.7}s`,
              '--plant-angle': `${index % 2 ? 2 : -2}deg`,
            } as CSSProperties
          }
        >
          <path
            d={`M${x + size / 2} 280Q${x + size / 2 - 14} ${y + size + 24} ${x + size / 2} ${y + size / 2}`}
            fill="none"
            stroke="#78964F"
            strokeWidth="3"
          />
          <path
            d={`M${x + size / 2} ${y + size + 38}q-35-3-37-29 29-2 37 29Zm0 24q35-4 38-29-29-1-38 29Z`}
            fill={index % 2 ? '#98B568' : '#779B5A'}
          />
          <Bloom x={x} y={y} size={size} kind={kind} />
        </g>
      ))}
      <g
        fill="none"
        stroke="#8AA761"
        strokeWidth="2"
        className={styles.grassWind}
      >
        {Array.from({ length: 26 }, (_, index) => (
          <path
            key={`grass-${index * 49}`}
            d={`M${index * 49} 280q${index % 2 ? 18 : -16}-35 ${index % 2 ? 6 : -20}-59`}
          />
        ))}
      </g>
    </svg>
  );
}

export function FlowerVine({
  className,
  hanging = false,
}: SpringArtProps & { hanging?: boolean }) {
  const leaves = [
    [83, 75],
    [110, 121],
    [73, 167],
    [97, 209],
    [60, 258],
    [77, 309],
    [48, 349],
  ];
  return (
    <svg
      viewBox="0 0 210 430"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g className={styles.vineSway}>
        <path
          d={
            hanging
              ? 'M118-10C48 48 143 133 75 229s18 131-28 198'
              : 'M42 430C70 355 32 296 88 219S35 100 111 3'
          }
          fill="none"
          stroke="#719669"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {leaves.map(([x, y], index) => (
          <g
            key={`leaf-${y}`}
            transform={`translate(${x} ${y}) rotate(${index % 2 ? -32 : 30})`}
          >
            <path
              d="M0 0C-24-29-41-24-37-9c5 16 22 22 37 9Z"
              fill={index % 2 ? '#A8C28C' : '#719C72'}
            />
            <path d="M0 0c22-30 38-24 33-7C27 9 13 12 0 0Z" fill="#B9CE9A" />
            <path
              d="M-3-1-27-13m30 9 21-14"
              stroke="#E2EACE"
              fill="none"
              strokeWidth="1"
            />
          </g>
        ))}
        <Bloom x={67} y={5} size={69} kind="cosmos" />
        <Bloom x={63} y={142} size={49} />
        <Bloom x={21} y={275} size={61} kind="tulip" />
        <Bloom x={39} y={362} size={38} />
        <path
          d="M134 116q27 14 29-9m-57 137q-35 9-29 27"
          stroke="#91B083"
          strokeWidth="1.5"
          fill="none"
        />
      </g>
    </svg>
  );
}

export function FlowerPot({
  className,
  basket = false,
}: SpringArtProps & { basket?: boolean }) {
  return (
    <svg
      viewBox="0 0 280 350"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="140" cy="331" rx="86" ry="12" fill="#617B4020" />
      <g className={styles.potFlowers}>
        <path
          d="M132 260q-18-110-52-171m62 175q38-102 76-139m-78 137q-12-128 13-198"
          stroke="#769657"
          strokeWidth="4"
          fill="none"
        />
        <path
          d="M120 199q-65 5-71-53 49 9 71 53Zm29 14q62-7 62-51-51 1-62 51Z"
          fill="#94B27F"
        />
        <Bloom x={35} y={40} size={87} kind={basket ? 'sunflower' : 'tulip'} />
        <Bloom x={109} y={3} size={82} kind={basket ? 'cosmos' : 'tulip'} />
        <Bloom x={169} y={91} size={66} />
        <Bloom x={45} y={152} size={57} kind="cosmos" />
      </g>
      {basket ? (
        <>
          <path
            d="M80 236v-33q60-81 120 0v33"
            fill="none"
            stroke="#A9824F"
            strokeWidth="11"
          />
          <path
            d="M55 233h170l-16 90H72Z"
            fill="#DDBE89"
            stroke="#B48E5A"
            strokeWidth="2"
          />
          <g fill="none" stroke="#B68E58" strokeWidth="1.5">
            {[245, 262, 279, 296, 313].map((y) => (
              <path key={y} d={`M66 ${y}h147`} />
            ))}
            {[85, 105, 125, 145, 165, 185, 205].map((x) => (
              <path key={x} d={`M${x} 236v85`} />
            ))}
          </g>
          <path d="M68 233h65l-10 43-24-12-23 10Z" fill="#FFF4DD" />
          <path
            d="M82 234v34m14-34v28m14-28v33"
            stroke="#E9BB93"
            strokeWidth="4"
          />
        </>
      ) : (
        <>
          <path
            d="M83 225h114l-9 95q-50 26-99 0Z"
            fill="#B8D6C3"
            fillOpacity="0.85"
            stroke="#86B59F"
            strokeWidth="2"
          />
          <ellipse
            cx="140"
            cy="225"
            rx="57"
            ry="11"
            fill="#DCEBE0"
            stroke="#86B59F"
            strokeWidth="2"
          />
          <path
            d="M102 243v63m24-66v76m26-76v76m24-73v63"
            stroke="#F7FCF2"
            strokeWidth="4"
            opacity="0.6"
          />
          <path
            d="M140 255q-34-27-37-6 3 17 37 6Zm0 0q33-27 37-6-4 17-37 6Z"
            fill="#F0B183"
          />
          <path
            d="M136 254q-8 29-28 46m38-44q9 27 27 37"
            stroke="#E4A173"
            strokeWidth="7"
            fill="none"
          />
          <circle cx="141" cy="255" r="7" fill="#D78E62" />
        </>
      )}
    </svg>
  );
}

export function FlowerGarland({
  className,
  wreath = false,
}: SpringArtProps & { wreath?: boolean }) {
  const positions = wreath
    ? [
        [65, 135],
        [33, 253],
        [74, 387],
        [171, 469],
        [321, 471],
        [428, 374],
        [459, 227],
        [398, 92],
        [264, 43],
        [126, 53],
      ]
    : [
        [25, 101],
        [128, 135],
        [247, 155],
        [359, 142],
        [473, 99],
        [577, 55],
      ];
  return (
    <svg
      viewBox={wreath ? '0 0 580 580' : '0 0 700 230'}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={
          wreath
            ? 'M280 63C33 26-9 465 245 512S615 64 280 63Z'
            : 'M-20 107Q331 285 717 7'
        }
        fill="none"
        stroke="#7D9E69"
        strokeWidth="3"
      />
      {positions.map(([x, y], index) => (
        <g
          key={`garland-${x}-${y}`}
          className={styles.garlandSprig}
          style={{ '--plant-delay': `${index * -0.6}s` } as CSSProperties}
        >
          <path
            d={`M${x + 20} ${y + 20}q-47-22-57 9 26 12 57-9Zm12 8q41 12 45-13-31-8-45 13Z`}
            fill={index % 2 ? '#9DBA84' : '#BAD09B'}
          />
          <Bloom
            x={x}
            y={y}
            size={index % 3 === 0 ? 62 : 44}
            kind={
              index % 3 === 0 ? 'sunflower' : index % 2 ? 'cosmos' : 'daisy'
            }
          />
        </g>
      ))}
    </svg>
  );
}

export function SpringPostmark({ className }: SpringArtProps) {
  return (
    <svg
      viewBox="0 0 230 180"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="#B8935D" opacity="0.55">
        <circle cx="89" cy="84" r="55" strokeWidth="1.5" />
        <circle cx="89" cy="84" r="49" strokeDasharray="2 5" />
        <path d="M137 60q36-16 70 0m-70 16q36-16 70 0m-70 16q36-16 70 0" />
      </g>
      <Bloom x={67} y={54} size={43} kind="cosmos" />
      <path
        d="M88 94v18m0-9q-15-13-18-7 8 11 18 7Z"
        fill="#A7B38A"
        stroke="#879673"
      />
      <path d="M57 47h62m-62 73h62" stroke="#B8935D" opacity="0.4" />
    </svg>
  );
}
