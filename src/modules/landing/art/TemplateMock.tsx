/**
 * Maquetas de las plantillas, para la vitrina del landing.
 *
 * Son representaciones de cómo se ve una dedicatoria real: portada con los
 * nombres, foto, mensaje y contador. Existen porque hoy los
 * `previewImageUrl` de Supabase no están disponibles; cuando lo estén, esta
 * pieza se reemplaza por la imagen real sin tocar la sección (ver
 * `TEMPLATE_SHOWCASE` en showcase.ts).
 */

export type MockTheme = {
  /** Fondo de la pantalla. */
  bg: string;
  /** Color del título manuscrito. */
  title: string;
  /** Color de apoyo (líneas, textos secundarios). */
  soft: string;
  /** Bloque de la foto. */
  photo: string;
  /** Acento de los adornos florales. */
  accent: string;
  core: string;
  /** Fondo del botón simulado. */
  button: string;
  /** Círculo de color para el selector de plantillas. */
  swatch: string;
};

type Props = {
  theme: MockTheme;
  names: string;
  message: string;
  days: string;
  className?: string;
};

export function TemplateMock({
  theme,
  names,
  message,
  days,
  className = '',
}: Props) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${theme.bg} ${className}`}
    >
      {/* Halo cálido superior */}
      <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-white/25 blur-2xl" />

      {/* Guirnalda superior de flores, trazo fino */}
      <svg
        viewBox="0 0 300 70"
        className="absolute top-7 left-0 w-full"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M-10 18C40 44 90 8 150 30s110-6 160 14"
          className={theme.soft}
          strokeWidth="1.2"
          fill="none"
        />
        {[36, 104, 172, 240].map((cx, i) => (
          <g key={cx} transform={`translate(0 ${i % 2 ? 6 : 0})`}>
            <g className={theme.accent}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <ellipse
                  key={a}
                  cx={cx}
                  cy={22}
                  rx="2.6"
                  ry="6.5"
                  transform={`rotate(${a} ${cx} 28)`}
                />
              ))}
            </g>
            <circle cx={cx} cy={28} r="3.2" className={theme.core} />
          </g>
        ))}
      </svg>

      <div className="relative h-full flex flex-col items-center px-4 pt-[74px] pb-6 text-center">
        {/* Nombres */}
        <p
          className={`font-display italic text-[21px] leading-tight ${theme.title}`}
        >
          {names}
        </p>

        {/* Contador de días */}
        {days && (
          <p
            className={`mt-1.5 text-[9px] font-bold tracking-[0.22em] uppercase ${theme.title} opacity-60`}
          >
            {days}
          </p>
        )}

        {/* Foto */}
        <div
          className={`mt-3 w-full h-[92px] rounded-xl overflow-hidden relative ${theme.photo}`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.4),transparent_45%)]" />
          <svg
            viewBox="0 0 200 120"
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
            focusable="false"
          >
            <g
              className={theme.soft}
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            >
              <path d="M44 120c0-30-4-52-16-70" />
              <path d="M104 120c3-34 0-58-9-78" />
              <path d="M160 120c-1-26 1-46 9-63" />
            </g>
            <g className={theme.accent}>
              {[
                [28, 44],
                [95, 36],
                [169, 51],
              ].map(([cx, cy]) => (
                <g key={cx}>
                  {[0, 51, 102, 153, 204, 255, 306].map((a) => (
                    <ellipse
                      key={a}
                      cx={cx}
                      cy={cy - 8}
                      rx="3"
                      ry="7"
                      transform={`rotate(${a} ${cx} ${cy})`}
                    />
                  ))}
                  <circle cx={cx} cy={cy} r="3.4" className={theme.core} />
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Mensaje */}
        {message && (
          <p
            className={`mt-3 font-display italic text-[11.5px] leading-relaxed ${theme.title} opacity-90`}
          >
            {message}
          </p>
        )}

        {/* Razones: pequeñas fichas, como en una dedicatoria real */}
        <div className="mt-4 w-full space-y-1.5">
          {['Por cómo te ríes', 'Por los martes contigo'].map((reason) => (
            <div
              key={reason}
              className={`rounded-lg py-1 px-2 text-[8.5px] ${theme.title} bg-white/45 dark:bg-white/10`}
            >
              {reason}
            </div>
          ))}
        </div>

        {/* Botón simulado de la propia dedicatoria */}
        <div
          className={`mt-auto w-full rounded-full py-2 text-[10px] font-semibold tracking-wide ${theme.button} text-white`}
        >
          Abrir la carta
        </div>
      </div>
    </div>
  );
}

/** Variante ancha, para la vista de escritorio dentro del navegador. */
export function TemplateMockWide({
  theme,
  names,
  message,
  days,
}: Omit<Props, 'className'>) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${theme.bg}`}>
      <div className="absolute -top-20 right-[18%] w-56 h-56 rounded-full bg-white/25 blur-3xl" />

      <div className="relative h-full grid grid-cols-[1.15fr_0.85fr] gap-4 items-center pl-6 pr-[17%] py-5">
        {/* Columna de texto */}
        <div className="text-left">
          <p
            className={`text-[8px] font-bold tracking-[0.22em] uppercase ${theme.title} opacity-60`}
          >
            {days}
          </p>
          <p
            className={`font-display italic text-[27px] leading-[1.1] mt-1.5 ${theme.title}`}
          >
            {names}
          </p>
          <p
            className={`mt-2.5 font-display italic text-[11px] leading-snug ${theme.title} opacity-90`}
          >
            {message}
          </p>
          <div
            className={`mt-4 inline-block rounded-full px-4 py-1.5 text-[9px] font-semibold ${theme.button} text-white`}
          >
            Abrir la carta
          </div>
        </div>

        {/* Columna de fotos, en mosaico */}
        <div className="grid grid-cols-2 gap-2 h-[78%]">
          <div
            className={`rounded-lg row-span-2 relative overflow-hidden ${theme.photo}`}
          >
            <svg
              viewBox="0 0 100 200"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
              focusable="false"
            >
              <g
                className={theme.soft}
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
              >
                <path d="M30 200c0-52-4-88-14-118" />
                <path d="M70 200c2-42 0-72-7-96" />
              </g>
              <g className={theme.accent}>
                {[
                  [16, 76],
                  [63, 98],
                ].map(([cx, cy]) => (
                  <g key={cx}>
                    {[0, 51, 102, 153, 204, 255, 306].map((a) => (
                      <ellipse
                        key={a}
                        cx={cx}
                        cy={cy - 9}
                        rx="3.2"
                        ry="7.5"
                        transform={`rotate(${a} ${cx} ${cy})`}
                      />
                    ))}
                    <circle cx={cx} cy={cy} r="3.6" className={theme.core} />
                  </g>
                ))}
              </g>
            </svg>
          </div>
          <div className={`rounded-lg ${theme.photo} opacity-90`} />
          <div className={`rounded-lg ${theme.photo} opacity-75`} />
        </div>
      </div>
    </div>
  );
}
