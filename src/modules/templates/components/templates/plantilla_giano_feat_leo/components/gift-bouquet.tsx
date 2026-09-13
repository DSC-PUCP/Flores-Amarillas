import styles from '../premium.module.css';

const DAISY_ANGLES = [0, 60, 120, 180, 240, 300];
const SUNFLOWER_ANGLES = [
  0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330,
];

function GiftFlower({
  x,
  y,
  sunflower = false,
}: {
  x: number;
  y: number;
  sunflower?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g
        className={styles.cutePetals}
        fill={sunflower ? '#F9CF59' : '#FFE78F'}
        stroke="#80643B"
        strokeWidth="1.5"
      >
        {(sunflower ? SUNFLOWER_ANGLES : DAISY_ANGLES).map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-12"
            rx={sunflower ? 5 : 7}
            ry="10"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
      <circle
        r={sunflower ? 9 : 7}
        fill={sunflower ? '#A67A51' : '#EAB858'}
        stroke="#80643B"
        strokeWidth="1.5"
      />
      {sunflower && (
        <g fill="#6E4E34">
          <circle cx="-3" cy="-2" r="1.2" />
          <circle cx="3" cy="-2" r="1.2" />
          <circle cy="3" r="1.2" />
        </g>
      )}
    </g>
  );
}

/** Ramo de dibujo: flores redondas y papel de colores planos. */
export function GiftBouquet() {
  return (
    <g
      className={styles.cuteFlowers}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path
        d="m146 292-20-52m35 58v-66m10 65 23-52"
        fill="none"
        stroke="#64714B"
        strokeWidth="3"
      />
      <path
        d="M151 270q-31-5-32-24 25 0 32 24Zm13 9q30-3 33-22-24-2-33 22Z"
        fill="#A1BE80"
        stroke="#64714B"
        strokeWidth="1.8"
      />
      <path
        d="m111 254 30 58 24 10 23-11 21-58-48 18Z"
        fill="#F5D7A7"
        stroke="#665442"
        strokeWidth="2.3"
      />
      <path d="m119 257 43 60 38-61-39 15Z" fill="#FFF0CA" />
      <path
        d="m140 311 7-30m18 35 11-36"
        fill="none"
        stroke="#D5B17F"
        strokeWidth="1.5"
      />
      <GiftFlower x={124} y={246} />
      <GiftFlower x={159} y={230} sunflower />
      <GiftFlower x={195} y={247} />
      <path
        d="M160 294q-28-23-31-7 1 15 31 7Zm0 0q27-23 31-7-1 15-31 7Z"
        fill="#EFB0AE"
        stroke="#946865"
        strokeWidth="1.8"
      />
      <path
        d="m157 298-16 21 11-3 5 6 5-22m3-2 8 23 5-7 9 2-19-18"
        fill="#F4C6B5"
        stroke="#946865"
        strokeWidth="1.3"
      />
      <circle
        cx="162"
        cy="294"
        r="5"
        fill="#DE969C"
        stroke="#946865"
        strokeWidth="1.5"
      />
    </g>
  );
}
