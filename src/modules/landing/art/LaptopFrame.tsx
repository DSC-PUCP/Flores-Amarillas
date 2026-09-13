/**
 * Marco de laptop con proporciones oficiales (MacBook Pro 14", M3).
 *
 * Medidas de referencia:
 *   · Tapa cerrada: 312,6 × 221,2 mm → relación 1,413
 *   · Pantalla: 3024 × 1964 px → relación 1,540
 *   · Muesca: ~170 pt de ancho sobre 1512 pt → 11,2 % del ancho de pantalla;
 *     ~33 pt de alto sobre 982 pt → 3,4 % del alto
 *   · Barra de menú: 37 pt. macOS la agranda justo para que la muesca de
 *     33 pt quepa dentro: en un MacBook real la muesca NUNCA invade la
 *     ventana de abajo.
 *
 * Igual que en `PhoneFrame`: radios en píxeles (no en porcentaje) y cuerpo
 * de aluminio casi negro liso. La base es un rectángulo redondeado, no un
 * trapecio recortado, que se leía como un pentágono.
 *
 * La pantalla lleva las esquinas superiores redondeadas y las inferiores
 * rectas: abajo la pantalla encuentra la barbilla en ángulo, no en curva.
 */

type Props = {
  children: React.ReactNode;
  /** Ancho de la tapa en píxeles. */
  width: number;
  /** Dirección que se ve en la barra del navegador. */
  url?: string;
  frameSrc?: string;
  className?: string;
};

export function LaptopFrame({
  children,
  width,
  url = 'dedicatoriasenflor.pe/para-mama',
  frameSrc,
  className = '',
}: Props) {
  const sideBezel = width * 0.011;
  const chin = width * 0.026;
  const screenWidth = width - sideBezel * 2;
  const screenHeight = screenWidth / 1.54;
  const lidRadius = width * 0.028;

  const menuBar = Math.max(15, screenHeight * 0.0377);
  const notchWidth = screenWidth * 0.112;
  const notchHeight = menuBar * 0.89;

  const baseHeight = width * 0.026;
  const baseWidth = width * 1.1;

  if (frameSrc) {
    return (
      <div className={`relative ${className}`} style={{ width }}>
        <div
          className="absolute overflow-hidden"
          style={{
            left: sideBezel,
            right: sideBezel,
            top: sideBezel,
            height: screenHeight,
          }}
        >
          {children}
        </div>
        <img
          src={frameSrc}
          alt=""
          aria-hidden="true"
          className="relative w-full pointer-events-none select-none"
        />
      </div>
    );
  }

  return (
    <div className={`relative isolate ${className}`} style={{ width }}>
      {/* Tapa: aluminio casi negro, sin degradados metálicos */}
      <div
        className="relative bg-[#1D1D1F] shadow-[0_0_0_0.5px_rgba(255,255,255,0.16),0_40px_66px_-30px_rgba(0,0,0,0.75)]"
        style={{
          borderRadius: `${lidRadius}px ${lidRadius}px ${lidRadius * 0.25}px ${lidRadius * 0.25}px`,
          padding: sideBezel,
          paddingBottom: chin,
        }}
      >
        <div
          className="relative overflow-hidden bg-black"
          style={{
            borderRadius: `${lidRadius * 0.5}px ${lidRadius * 0.5}px 0 0`,
            width: screenWidth,
            height: screenHeight,
          }}
        >
          {/* Barra de menú: solo la franja oscura donde vive la muesca. Los
              iconos abstractos que había antes (un círculo y una barra) se
              veían inventados, así que se quitaron. */}
          <div
            className="absolute top-0 inset-x-0 z-40 bg-[#0B0B0B]"
            style={{ height: menuBar }}
          />

          {/* Muesca: recorte negro embebido en la barra de menú */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bg-black z-50"
            style={{
              width: notchWidth,
              height: notchHeight,
              borderRadius: `0 0 ${notchHeight * 0.3}px ${notchHeight * 0.3}px`,
            }}
          >
            {/* Cámara, dentro de la muesca */}
            <span
              className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#0B0D12]"
              style={{
                top: notchHeight * 0.2,
                width: notchHeight * 0.22,
                height: notchHeight * 0.22,
              }}
            />
          </div>

          {/* Ventana del navegador */}
          <div
            className="absolute inset-x-0 bottom-0 bg-white overflow-hidden"
            style={{ top: menuBar }}
          >
            <div
              className="absolute top-0 inset-x-0 z-30 bg-[#EFEAE0] dark:bg-[#26221C] flex items-center gap-1.5 px-2.5 border-b border-black/[0.08]"
              style={{ height: menuBar * 1.2 }}
            >
              <span className="w-[6px] h-[6px] rounded-full bg-[#F0605B]" />
              <span className="w-[6px] h-[6px] rounded-full bg-[#F5BE4F]" />
              <span className="w-[6px] h-[6px] rounded-full bg-[#61C554]" />
              <div className="ml-1.5 flex-1 h-[13px] rounded-full bg-white/90 dark:bg-black/40 flex items-center px-2 ring-[0.5px] ring-black/5">
                <span className="text-[7px] text-stone-500 dark:text-stone-400 truncate">
                  {url}
                </span>
              </div>
            </div>

            <div className="absolute inset-0" style={{ top: menuBar * 1.2 }}>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Base: rectángulo redondeado, un poco más ancho que la tapa */}
      <div
        className="relative mx-auto bg-[#242426] shadow-[0_0_0_0.5px_rgba(255,255,255,0.14)]"
        style={{
          width: baseWidth,
          marginLeft: -((baseWidth - width) / 2),
          height: baseHeight,
          borderRadius: `0 0 ${baseHeight * 0.85}px ${baseHeight * 0.85}px`,
        }}
      >
        {/* Muesca redondeada para abrir la tapa */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 bg-black/45"
          style={{
            width: width * 0.13,
            height: baseHeight * 0.5,
            borderRadius: `0 0 ${baseHeight}px ${baseHeight}px`,
          }}
        />
        {/* Filo superior iluminado */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/25" />
      </div>

      {/* Sombra de contacto */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[76%] h-6 rounded-[50%] bg-black/45 blur-2xl" />
    </div>
  );
}
