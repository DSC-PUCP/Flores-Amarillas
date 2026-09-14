/**
 * Marco de teléfono con proporciones oficiales (iPhone 15/16 Pro).
 *
 * Medidas de referencia:
 *   · Cuerpo: 146,6 × 70,6 mm → relación 2,077
 *   · Pantalla: 2556 × 1179 px → relación 2,168
 *   · Bisel uniforme: ~1,6 mm → 2,27 % del ancho del cuerpo
 *   · Radio de la pantalla: 55 pt sobre 393 pt de ancho → 14 % del ancho
 *
 * Dos decisiones que vienen de haberlo visto fallar:
 *   1. Los radios van en píxeles calculados desde `width`, no en porcentaje:
 *      `border-radius: 14%` se lee como 14 % del ancho Y del alto, y en un
 *      cuerpo alargado deforma las esquinas en elipses.
 *   2. El cuerpo es aluminio casi negro liso (#1D1D1F). Un degradado
 *      metálico de varias paradas se veía blanquecino e irreal; el brillo
 *      real es solo una línea fina en el canto.
 */

type Props = {
  children: React.ReactNode;
  /** Ancho del cuerpo en píxeles; de aquí salen biseles y radios. */
  width: number;
  frameSrc?: string;
  className?: string;
};

export function PhoneFrame({
  children,
  width,
  frameSrc,
  className = '',
}: Props) {
  const bezel = width * 0.0227;
  const railWidth = Math.max(2, width * 0.011);
  const screenWidth = width - bezel * 2;
  const screenRadius = screenWidth * 0.14;
  const bodyRadius = screenRadius + bezel;
  const screenHeight = screenWidth * 2.1679;

  // La maqueta interior está diseñada a este ancho y se escala al tamaño
  // real del marco. Sin esto, sus tamaños fijos en píxeles se salen de la
  // pantalla cuando el teléfono se muestra pequeño.
  const designWidth = 300;
  const scale = screenWidth / designWidth;

  if (frameSrc) {
    return (
      <div className={`relative ${className}`} style={{ width }}>
        <div
          className="absolute overflow-hidden"
          style={{ inset: bezel, borderRadius: screenRadius }}
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
      {/* Sombra de contacto */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[72%] h-7 rounded-[50%] bg-black/50 blur-2xl" />

      {/* Botones laterales */}
      {[
        { top: '15.5%', height: '3.4%', side: 'left' as const },
        { top: '22%', height: '6.4%', side: 'left' as const },
        { top: '30%', height: '6.4%', side: 'left' as const },
        { top: '25%', height: '9.4%', side: 'right' as const },
      ].map((btn) => (
        <div
          key={`${btn.side}-${btn.top}`}
          className="absolute bg-[#2A2A2C]"
          style={{
            top: btn.top,
            height: btn.height,
            width: railWidth,
            [btn.side]: -railWidth + 1,
            borderRadius:
              btn.side === 'left'
                ? `${railWidth}px 0 0 ${railWidth}px`
                : `0 ${railWidth}px ${railWidth}px 0`,
          }}
        />
      ))}

      {/* Cuerpo: aluminio casi negro, con una línea fina de luz en el canto */}
      <div
        className="relative bg-[#1D1D1F] shadow-[0_0_0_0.5px_rgba(255,255,255,0.18),0_46px_74px_-32px_rgba(0,0,0,0.8),0_10px_22px_-12px_rgba(0,0,0,0.5)]"
        style={{ borderRadius: bodyRadius, padding: bezel }}
      >
        {/* Pantalla */}
        <div
          className="relative overflow-hidden bg-black"
          style={{
            borderRadius: screenRadius,
            width: screenWidth,
            height: screenHeight,
          }}
        >
          <div
            style={{
              width: designWidth,
              height: screenHeight / scale,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {children}
          </div>

          {/* Isla dinámica */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bg-black z-30 flex items-center justify-end"
            style={{
              top: screenHeight * 0.014,
              height: screenWidth * 0.093,
              width: screenWidth * 0.3,
              borderRadius: 9999,
              paddingRight: screenWidth * 0.028,
            }}
          >
            <span
              className="relative block rounded-full bg-[#0B0D12]"
              style={{ width: screenWidth * 0.05, height: screenWidth * 0.05 }}
            >
              <span className="absolute inset-[26%] rounded-full bg-[#182031]" />
            </span>
          </div>

          {/* Bisel interior: separa la pantalla del marco, sin lavar el color */}
          <div
            className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.1)]"
            style={{ borderRadius: screenRadius }}
          />

          {/* Barra de gestos */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black/35 z-30"
            style={{
              bottom: screenHeight * 0.009,
              width: screenWidth * 0.33,
              height: Math.max(2, screenWidth * 0.012),
            }}
          />
        </div>
      </div>
    </div>
  );
}
