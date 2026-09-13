/**
 * Elementos característicos de la fecha, tomados del documento de conceptos
 * (creatividad/conceptos/elementos-flores-amarillas.md).
 *
 * Hasta ahora la página solo usaba girasoles genéricos. Estos son los que
 * de verdad la anclan al 21 de setiembre: el colibrí (símbolo andino de
 * buena suerte), la retama en cascada —la "lluvia dorada"—, y la cinta
 * amarilla, que es el objeto ritual de la fecha.
 */

type ArtProps = {
  className?: string;
  style?: React.CSSProperties;
};

/** Colibrí de perfil, alas abiertas. Buena suerte y persistencia. */
export function Hummingbird({ className = '', style }: ArtProps) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {/* Ala trasera */}
      <path
        d="M58 42c-14-18-32-24-46-16 8 16 26 26 46 16z"
        className="fill-[#E8863A]/60"
      />
      {/* Cuerpo */}
      <path
        d="M56 46c10-6 22-6 32 2 6 5 8 12 5 18-4 8-15 11-25 7-9-4-14-13-12-27z"
        className="fill-[#5F8F6A]"
      />
      {/* Pecho */}
      <path
        d="M62 52c7-4 15-3 20 2 3 3 4 7 2 10-3 5-10 6-16 3-5-2-8-8-6-15z"
        className="fill-[#F2B733]"
      />
      {/* Pico largo */}
      <path
        d="M56 46L26 34"
        className="stroke-[#5C4425]"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Ojo */}
      <circle cx="66" cy="46" r="2.2" className="fill-[#3A2A16]" />
      {/* Ala delantera, en movimiento */}
      <path
        d="M74 50c-6-20-2-38 12-46 8 16 6 38-12 46z"
        className="fill-[#7FBF9A]/85"
      />
      {/* Cola */}
      <path
        d="M91 68c10 4 18 12 20 22-12 1-22-6-26-16z"
        className="fill-[#5F8F6A]"
      />
    </svg>
  );
}

/**
 * Retama en cascada: racimos de flores amarillas colgando, la "lluvia
 * dorada" del documento de conceptos. Va como guirnalda superior.
 */
export function RetamaGarland({ className = '', style }: ArtProps) {
  const strands = [
    { x: 46, len: 104 },
    { x: 128, len: 62 },
    { x: 212, len: 142 },
    { x: 296, len: 78 },
    { x: 388, len: 118 },
    { x: 472, len: 52 },
    { x: 556, len: 94 },
    { x: 648, len: 132 },
    { x: 730, len: 68 },
    { x: 818, len: 108 },
    { x: 902, len: 56 },
    { x: 986, len: 124 },
    { x: 1072, len: 82 },
    { x: 1158, len: 100 },
  ];

  return (
    <svg
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {strands.map((strand) => {
        // Racimos densos: la retama cuelga apretada, no como cuentas sueltas
        const buds = Math.max(6, Math.round(strand.len / 7));
        return (
          <g key={strand.x}>
            <path
              d={`M${strand.x} -10 q 7 ${strand.len / 2} 1 ${strand.len + 10}`}
              className="stroke-[#86A83A]"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Hojitas alternas a lo largo del tallo */}
            {[0.25, 0.55, 0.8].map((t) => {
              const y = strand.len * t;
              const dir = t > 0.5 ? 1 : -1;
              return (
                <path
                  key={`leaf-${strand.x}-${t}`}
                  d={`M${strand.x + 3} ${y} c ${dir * 9} -3 ${dir * 13} -8 ${dir * 12} -14 -7 0 -11 5 -${dir * -12} 14z`}
                  className="fill-[#86A83A]/75"
                />
              );
            })}
            {Array.from({ length: buds }, (_, i) => {
              const t = (i + 1) / (buds + 1);
              const y = strand.len * t;
              const sway = 7 * Math.sin(Math.PI * t);
              const side = i % 2 ? 5.5 : -5.5;
              const r = 3.4 + (1 - t) * 1.6;
              return (
                <g key={`${strand.x}-${i}`}>
                  <ellipse
                    cx={strand.x + sway + side}
                    cy={y}
                    rx={r}
                    ry={r * 1.25}
                    className={
                      i % 4 === 0 ? 'fill-[#E8863A]' : 'fill-[#F7C325]'
                    }
                    transform={`rotate(${side > 0 ? 22 : -22} ${strand.x + sway + side} ${y})`}
                  />
                  <ellipse
                    cx={strand.x + sway + side * 0.5}
                    cy={y - 1}
                    rx={r * 0.45}
                    ry={r * 0.55}
                    className="fill-[#FBE39A]/70"
                  />
                </g>
              );
            })}
            {/* Punta: un capullo cerrado */}
            <ellipse
              cx={strand.x + 2}
              cy={strand.len + 6}
              rx="4"
              ry="6"
              className="fill-[#E89B1B]"
            />
          </g>
        );
      })}
    </svg>
  );
}

/** Cinta amarilla: el objeto ritual de la fecha (llevar algo amarillo). */
export function Ribbon({ className = '', style }: ArtProps) {
  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {/* Lazadas */}
      <path
        d="M60 34C46 12 20 10 14 26c-5 14 16 22 46 12z"
        className="fill-[#F7C325]"
      />
      <path
        d="M60 34c14-22 40-24 46-8 5 14-16 22-46 12z"
        className="fill-[#F2B733]"
      />
      {/* Colas */}
      <path
        d="M56 40c-6 14-14 24-26 32 12 2 22-4 30-18z"
        className="fill-[#E89B1B]"
      />
      <path
        d="M64 40c6 14 14 24 26 32-12 2-22-4-30-18z"
        className="fill-[#E8863A]"
      />
      {/* Nudo */}
      <ellipse cx="60" cy="37" rx="9" ry="8" className="fill-[#C98A2E]" />
      <ellipse cx="60" cy="35" rx="5" ry="4" className="fill-[#F2B733]/70" />
    </svg>
  );
}
