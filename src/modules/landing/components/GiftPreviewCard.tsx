/**
 * La pieza central del hero: una vista del propio regalo, flotando.
 *
 * Antes el hero mostraba un paisaje decorativo que no decía nada del
 * producto. Esto sí: se ve la dedicatoria como objeto —papel, sello de
 * lacre, una foto, la letra manuscrita— para que se entienda que, aunque
 * no sea físico, tiene la intención de algo hecho a mano.
 */

/** Sello de lacre con una flor grabada. */
function WaxSeal() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-[0_6px_12px_rgba(120,75,15,0.32)]"
      aria-hidden="true"
      focusable="false"
    >
      {/* Borde irregular, como cera derretida */}
      <path
        d="M50 4c12-3 22 6 30 12s16 14 15 26-11 20-16 30-10 22-22 24-22-8-32-14S6 70 6 58s10-19 15-29S38 7 50 4z"
        className="fill-[#C9903A] dark:fill-[#8A6428]"
      />
      <path
        d="M50 12c10-2 18 5 25 10s13 12 12 21-9 17-13 25-9 18-18 20-18-6-27-11-13-14-13-24 8-16 12-24S40 14 50 12z"
        className="fill-[#B57F2E] dark:fill-[#775420]"
      />
      {/* Flor grabada en relieve */}
      <g className="fill-[#E0AE55]/70">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse
            key={a}
            cx="50"
            cy="34"
            rx="5"
            ry="12"
            transform={`rotate(${a} 50 50)`}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="8" className="fill-[#8F6120]" />
    </svg>
  );
}

export function GiftPreviewCard() {
  return (
    <div className="relative w-[280px] sm:w-[320px] shrink-0">
      {/* Aura cálida detrás: da la sensación de que la pieza tiene luz propia */}
      <div className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(230,190,105,0.45),transparent_65%)] blur-2xl animate-aura pointer-events-none" />

      <div className="relative animate-float-card">
        <div className="relative rounded-[26px] bg-[#FFFDF9] dark:bg-stone-900 p-5 shadow-[0_40px_70px_-30px_rgba(90,65,25,0.5),0_2px_6px_rgba(90,65,25,0.08)] ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
          {/* Ventana de la foto */}
          <div className="relative h-[190px] rounded-[18px] overflow-hidden bg-[linear-gradient(150deg,#F7E6BE,#E9CE95_42%,#CFC0A0)] dark:bg-[linear-gradient(150deg,#2A2114,#1C1710)]">
            {/* Sol tenue dentro de la foto */}
            <div className="absolute top-5 right-6 w-16 h-16 rounded-full bg-[#F7DC98]/80 blur-[6px]" />
            {/* Siluetas de tallos, trazo fino */}
            <svg
              viewBox="0 0 300 200"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
              focusable="false"
            >
              <g
                className="stroke-[#A98C4E]/60"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              >
                <path d="M60 200c0-46-6-78-22-104" />
                <path d="M150 200c4-52 0-88-14-118" />
                <path d="M240 200c-2-40 2-70 14-96" />
                <path d="M52 150c-18-4-27-13-28-26 15-2 26 7 28 26z" />
                <path d="M142 132c14-6 20-16 19-30-13 4-19 15-19 30z" />
                <path d="M246 152c14-5 20-14 19-27-13 3-19 13-19 27z" />
              </g>
              <g className="fill-[#DFB75A]/85">
                {[
                  [38, 96],
                  [136, 82],
                  [254, 104],
                ].map(([cx, cy]) => (
                  <g key={cx}>
                    {[0, 51, 102, 153, 204, 255, 306].map((a) => (
                      <ellipse
                        key={a}
                        cx={cx}
                        cy={cy - 11}
                        rx="4"
                        ry="9"
                        transform={`rotate(${a} ${cx} ${cy})`}
                      />
                    ))}
                    <circle cx={cx} cy={cy} r="5" className="fill-[#9C6F22]" />
                  </g>
                ))}
              </g>
            </svg>
            {/* Brillo del papel fotográfico */}
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.45),transparent_40%)]" />
          </div>

          {/* Fecha */}
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-stone-300/70 dark:bg-stone-700" />
            <span className="text-[10px] font-bold tracking-[0.25em] text-stone-500 dark:text-stone-400">
              21 · 09
            </span>
            <span className="h-px flex-1 bg-stone-300/70 dark:bg-stone-700" />
          </div>

          {/* El mensaje, en la serif itálica */}
          <p className="mt-4 font-display italic text-[19px] leading-snug text-stone-700 dark:text-stone-200">
            «Cada girasol mira al sol. Yo te miro a ti.»
          </p>

          <p className="mt-4 text-[11px] font-semibold tracking-[0.18em] uppercase text-stone-400 dark:text-stone-500">
            Para ti
          </p>
        </div>

        {/* Sello de lacre, mordiendo el borde de la tarjeta */}
        <div className="absolute -bottom-7 -right-6 w-[86px] h-[86px] rotate-[8deg]">
          <WaxSeal />
        </div>
      </div>
    </div>
  );
}
