/**
 * Escenas ilustradas para los 4 pasos de "¿Cómo florece tu regalo?".
 *
 * Reemplazan a las fotos de stock de la campaña de San Valentín, que
 * desentonaban con la temática de primavera. Usan la misma paleta apagada
 * del paisaje del hero: verdes salvia y crema, con el amarillo reservado
 * para las flores.
 *
 * OJO: las clases de Tailwind van escritas completas y literales. No se
 * pueden componer con plantillas (`fill-[${color}]`) porque Tailwind escanea
 * el código de forma estática y esas clases nunca se generarían.
 */

type SceneProps = { className?: string };

/**
 * Marco común: lienzo marfil con luz cálida, sin cielo azul ni colinas.
 * El relleno plano de color era lo que hacía ver estas escenas como
 * caricatura; ahora la profundidad la da la luz y una línea de suelo fina.
 */
function SceneFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 260"
      className="w-full h-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="step-light" cx="72%" cy="18%" r="88%">
          <stop
            offset="0%"
            className="[stop-color:#FBEFD4] dark:[stop-color:#221B10]"
          />
          <stop
            offset="60%"
            className="[stop-color:#F7F2E6] dark:[stop-color:#141210]"
          />
          <stop
            offset="100%"
            className="[stop-color:#F1EBDC] dark:[stop-color:#0E0D0B]"
          />
        </radialGradient>

        {/* Halo del sol: degradado real, no un círculo de borde duro */}
        <radialGradient id="step-halo">
          <stop
            offset="0%"
            className="[stop-color:#F6DFA6] dark:[stop-color:#8A6A28]"
            stopOpacity="0.55"
          />
          <stop
            offset="100%"
            className="[stop-color:#F6DFA6] dark:[stop-color:#8A6A28]"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      <rect width="400" height="260" fill="url(#step-light)" />

      {/* Halo de luz, apenas perceptible */}
      <circle cx="302" cy="48" r="96" fill="url(#step-halo)" />

      {/* Suelo: una línea fina y su sombra, en vez de una franja verde */}
      <path
        d="M0 214h400"
        className="stroke-[#CDBE9C]/70 dark:stroke-[#3A332A]"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M0 214c70-9 130 6 200 3s130-11 200-6v49H0z"
        className="fill-[#EFE7D4]/80 dark:fill-[#15130F]"
      />
      {children}
    </svg>
  );
}

/** Tallo con flor reutilizable dentro de las escenas. */
function Stalk({
  x,
  baseY,
  height,
  radius,
  petals = 8,
}: {
  x: number;
  baseY: number;
  height: number;
  radius: number;
  petals?: number;
}) {
  const topY = baseY - height;
  return (
    <g>
      <path
        d={`M${x} ${baseY} C ${x - 5} ${baseY - height / 2}, ${x + 5} ${topY + height / 2}, ${x} ${topY}`}
        className="stroke-[#7E9A5C] dark:stroke-[#3A4A2C]"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${x} ${baseY - height / 2} c -16 -6 -22 -14 -19 -22 10 -1 17 6 19 22z`}
        className="fill-[#8CA867] dark:fill-[#33422A]"
      />
      {/* Corona trasera, más oscura: da volumen al girasol */}
      <g className="fill-[#C98A2E] dark:fill-[#6B4F1A]">
        {Array.from({ length: petals }, (_, i) => (i * 360) / petals).map(
          (a) => (
            <ellipse
              key={`b-${a}`}
              cx={x}
              cy={topY - radius * 1.15}
              rx={radius * 0.5}
              ry={radius * 1.25}
              transform={`rotate(${a + 180 / petals} ${x} ${topY})`}
            />
          )
        )}
      </g>
      <g className="fill-[#F7C325] dark:fill-[#8A6A28]">
        {Array.from({ length: petals }, (_, i) => (i * 360) / petals).map(
          (a) => (
            <ellipse
              key={a}
              cx={x}
              cy={topY - radius * 1.1}
              rx={radius * 0.55}
              ry={radius * 1.2}
              transform={`rotate(${a} ${x} ${topY})`}
            />
          )
        )}
      </g>
      <circle
        cx={x}
        cy={topY}
        r={radius * 0.72}
        className="fill-[#A9741F] dark:fill-[#5C4418]"
      />
      <circle
        cx={x}
        cy={topY}
        r={radius * 0.52}
        className="fill-[#7E5312] dark:fill-[#3F2C0E]"
      />
      {/* Semillas del corazón */}
      <g className="fill-[#5C3B0C]/70">
        {[
          [0, -0.25],
          [0.28, 0.1],
          [-0.28, 0.12],
          [0.05, 0.32],
        ].map(([dx, dy]) => (
          <circle
            key={`${dx}-${dy}`}
            cx={x + dx * radius}
            cy={topY + dy * radius}
            r={radius * 0.09}
          />
        ))}
      </g>
    </g>
  );
}

/** Abejita: poliniza la escena, del catálogo de fauna del documento. */
function Bee({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Alas */}
      <ellipse
        cx="-2"
        cy="-6"
        rx="6"
        ry="4"
        className="fill-white/70"
        transform="rotate(-24 -2 -6)"
      />
      <ellipse
        cx="5"
        cy="-6"
        rx="6"
        ry="4"
        className="fill-white/60"
        transform="rotate(24 5 -6)"
      />
      {/* Cuerpo con franjas */}
      <ellipse cx="2" cy="0" rx="7" ry="5" className="fill-[#F2B733]" />
      <path
        d="M0 -4.4v8.8M4 -4.6v9"
        className="stroke-[#4A3212]"
        strokeWidth="1.6"
      />
      <circle cx="-5" cy="-0.5" r="2.6" className="fill-[#4A3212]" />
    </g>
  );
}

/** Motas de polen suspendidas. */
function Pollen({ dots }: { dots: [number, number, number][] }) {
  return (
    <g className="fill-[#F7C325]/70">
      {dots.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
      ))}
    </g>
  );
}

/** Paso 1 — Elegir plan: tres etapas de crecimiento, la mayor destacada. */
export function StepChoosePlan({ className }: SceneProps) {
  return (
    <div className={className}>
      <SceneFrame>
        {/* Semilla */}
        <ellipse
          cx="90"
          cy="212"
          rx="26"
          ry="8"
          className="fill-[#B9A98A]/25"
        />
        <ellipse
          cx="90"
          cy="202"
          rx="11"
          ry="15"
          className="fill-[#A9741F] dark:fill-[#5C4418]"
        />
        {/* Brote */}
        <ellipse
          cx="200"
          cy="212"
          rx="26"
          ry="8"
          className="fill-[#B9A98A]/25"
        />
        <path
          d="M200 210v-38"
          className="stroke-[#7E9A5C] dark:stroke-[#3A4A2C]"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M200 188c-16 0-22-6-23-16 11-2 21 4 23 16z"
          className="fill-[#8CA867] dark:fill-[#33422A]"
        />
        {/* Flor abierta, marcada como la opción elegida */}
        <ellipse
          cx="310"
          cy="212"
          rx="30"
          ry="9"
          className="fill-[#B9A98A]/25"
        />
        <Stalk x={310} baseY={210} height={78} radius={17} />
        <circle
          cx="310"
          cy="132"
          r="42"
          className="stroke-[#A9741F] dark:stroke-[#8A6A28]"
          strokeWidth="2.5"
          strokeDasharray="6 8"
          fill="none"
        />
        <Bee x={252} y={104} scale={1.1} />
        <Pollen
          dots={[
            [150, 78, 2.4],
            [186, 118, 1.8],
            [352, 96, 2.2],
            [96, 132, 1.6],
          ]}
        />
      </SceneFrame>
    </div>
  );
}

/** Paso 2 — Elegir diseño: tres tarjetas de plantilla, una seleccionada. */
export function StepChooseDesign({ className }: SceneProps) {
  const cards = [
    { x: 40, petals: 8, selected: false },
    { x: 152, petals: 12, selected: true },
    { x: 264, petals: 6, selected: false },
  ];
  return (
    <div className={className}>
      <SceneFrame>
        {cards.map((card) => {
          const top = card.selected ? 52 : 66;
          const flowerY = top + 48;
          return (
            <g key={card.x}>
              <rect
                x={card.x}
                y={top}
                width="94"
                height="126"
                rx="14"
                className="fill-[#FFFFFF] dark:fill-stone-800"
              />
              <rect
                x={card.x}
                y={top}
                width="94"
                height="126"
                rx="14"
                className={
                  card.selected
                    ? 'stroke-[#A9741F] dark:stroke-[#8A6A28]'
                    : 'stroke-black/10 dark:stroke-white/10'
                }
                strokeWidth={card.selected ? 3 : 2}
                fill="none"
              />
              {/* Flor de muestra dentro de la tarjeta */}
              <g className="fill-[#EDB63C] dark:fill-[#8A6A28]">
                {Array.from(
                  { length: card.petals },
                  (_, i) => (i * 360) / card.petals
                ).map((a) => (
                  <ellipse
                    key={a}
                    cx={card.x + 47}
                    cy={flowerY - 16}
                    rx="5"
                    ry="11"
                    transform={`rotate(${a} ${card.x + 47} ${flowerY})`}
                  />
                ))}
              </g>
              <circle
                cx={card.x + 47}
                cy={flowerY}
                r="8"
                className="fill-[#A9741F] dark:fill-[#5C4418]"
              />
              {/* Líneas de texto simuladas */}
              <rect
                x={card.x + 20}
                y={top + 82}
                width="54"
                height="6"
                rx="3"
                className="fill-[#B9A98A]/50"
              />
              <rect
                x={card.x + 28}
                y={top + 96}
                width="38"
                height="6"
                rx="3"
                className="fill-[#B9A98A]/30"
              />
            </g>
          );
        })}
      </SceneFrame>
    </div>
  );
}

/** Paso 3 — Personalizar: la carta escribiéndose junto a la flor. */
export function StepPersonalize({ className }: SceneProps) {
  return (
    <div className={className}>
      <SceneFrame>
        <Stalk x={322} baseY={212} height={94} radius={19} />

        <g transform="rotate(-5 150 130)">
          <rect
            x="66"
            y="56"
            width="164"
            height="152"
            rx="12"
            className="fill-[#FFFFFF] dark:fill-stone-800"
          />
          <rect
            x="66"
            y="56"
            width="164"
            height="152"
            rx="12"
            className="stroke-black/10 dark:stroke-white/10"
            strokeWidth="2"
            fill="none"
          />
          {/* Marco de foto */}
          <rect
            x="86"
            y="74"
            width="62"
            height="50"
            rx="8"
            className="fill-[#A6C085]/50 dark:fill-stone-700"
          />
          <circle
            cx="106"
            cy="92"
            r="7"
            className="fill-[#EDB63C] dark:fill-[#8A6A28]"
          />
          <path
            d="M90 120l18-16 14 12 10-8 14 12z"
            className="fill-[#7E9A5C]/70 dark:fill-[#3A4A2C]"
          />
          {/* Renglones del mensaje */}
          <rect
            x="86"
            y="138"
            width="126"
            height="7"
            rx="3.5"
            className="fill-[#B9A98A]/45"
          />
          <rect
            x="86"
            y="154"
            width="126"
            height="7"
            rx="3.5"
            className="fill-[#B9A98A]/45"
          />
          <rect
            x="86"
            y="170"
            width="126"
            height="7"
            rx="3.5"
            className="fill-[#B9A98A]/45"
          />
          <rect
            x="86"
            y="186"
            width="72"
            height="7"
            rx="3.5"
            className="fill-[#B9A98A]/30"
          />
          <Bee x={286} y={92} scale={0.95} />
          {/* Pétalo apoyado sobre la carta */}
          <ellipse
            cx="198"
            cy="88"
            rx="9"
            ry="16"
            transform="rotate(28 198 88)"
            className="fill-[#EDB63C] dark:fill-[#8A6A28]"
          />
        </g>
      </SceneFrame>
    </div>
  );
}

/** Paso 4 — Compartir: una mariposa se lleva el sobre por el aire. */
export function StepShare({ className }: SceneProps) {
  return (
    <div className={className}>
      <SceneFrame>
        <Stalk x={58} baseY={212} height={72} radius={15} />

        {/* Estela punteada del recorrido */}
        <path
          d="M88 148C136 110 186 176 242 118"
          className="stroke-[#A9741F]/45 dark:stroke-[#8A6A28]"
          strokeWidth="3"
          strokeDasharray="2 12"
          strokeLinecap="round"
          fill="none"
        />

        {/* Sobre con sello de flor */}
        <g transform="rotate(-8 296 108)">
          <rect
            x="248"
            y="74"
            width="98"
            height="72"
            rx="10"
            className="fill-[#FFFFFF] dark:fill-stone-800"
          />
          <rect
            x="248"
            y="74"
            width="98"
            height="72"
            rx="10"
            className="stroke-black/10 dark:stroke-white/10"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M248 84l49 37 49-37"
            className="stroke-[#A9741F]/60 dark:stroke-[#8A6A28]"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <g className="fill-[#EDB63C] dark:fill-[#8A6A28]">
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse
                key={a}
                cx="297"
                cy="58"
                rx="4"
                ry="9"
                transform={`rotate(${a} 297 66)`}
              />
            ))}
          </g>
          <circle
            cx="297"
            cy="66"
            r="5"
            className="fill-[#A9741F] dark:fill-[#5C4418]"
          />
        </g>

        <Pollen
          dots={[
            [120, 86, 2.2],
            [168, 62, 1.8],
            [206, 96, 2.4],
          ]}
        />

        {/* Mariposa que lo lleva */}
        <g transform="translate(190 92) scale(0.44)">
          <g className="fill-[#EDB63C]/90 dark:fill-[#8A6A28]">
            <ellipse
              cx="32"
              cy="38"
              rx="19"
              ry="15"
              transform="rotate(-24 32 38)"
            />
            <ellipse
              cx="35"
              cy="62"
              rx="14"
              ry="11"
              transform="rotate(20 35 62)"
            />
          </g>
          <g className="fill-[#A9741F]/85 dark:fill-[#5C4418]">
            <ellipse
              cx="68"
              cy="38"
              rx="19"
              ry="15"
              transform="rotate(24 68 38)"
            />
            <ellipse
              cx="65"
              cy="62"
              rx="14"
              ry="11"
              transform="rotate(-20 65 62)"
            />
          </g>
          <ellipse
            cx="50"
            cy="50"
            rx="3"
            ry="17"
            className="fill-stone-600 dark:fill-stone-300"
          />
        </g>
      </SceneFrame>
    </div>
  );
}
