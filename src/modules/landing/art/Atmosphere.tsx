import { useMemo } from 'react';

/**
 * Atmósfera del hero. Reemplaza al paisaje de colinas, que leía como
 * ilustración infantil y saturaba la pantalla.
 *
 * La idea es lo contrario: casi nada de relleno. Luz cálida, aire, y dos
 * ramas botánicas de línea fina en las esquinas. La "magia" la da el
 * movimiento (polen dorado subiendo), no la cantidad de color.
 */

/** Rama botánica de trazo fino, estilo grabado. */
function Sprig({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 300"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g
        className="stroke-[#A9863F] dark:stroke-[#7C6636]"
        strokeWidth="1.1"
        strokeLinecap="round"
      >
        {/* Tallo principal */}
        <path d="M104 300C104 232 96 168 66 108" />
        {/* Hojas alternas */}
        <path d="M98 258c-26 2-40-8-46-28 22-4 39 6 46 28z" />
        <path d="M94 236c22-6 32-19 32-40-20 3-32 16-32 40z" />
        <path d="M88 206c-24 1-37-9-42-27 20-3 36 6 42 27z" />
        <path d="M82 182c20-6 29-18 29-37-18 3-29 15-29 37z" />
        <path d="M74 152c-21 0-32-8-37-24 18-3 32 5 37 24z" />
        {/* Capullos */}
        <path d="M66 108c-7-9-7-20 0-30 7 10 7 21 0 30z" />
        <path d="M78 132c9-6 13-15 11-26-9 6-13 15-11 26z" />
      </g>
      {/* Flor apenas insinuada */}
      <g className="fill-[#E6C46A]/45 dark:fill-[#8A6A28]/40">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse
            key={a}
            cx="66"
            cy="66"
            rx="4.5"
            ry="12"
            transform={`rotate(${a} 66 78)`}
          />
        ))}
      </g>
      <circle cx="66" cy="78" r="5" className="fill-[#C29A3E]/60" />
    </svg>
  );
}

export function Atmosphere() {
  // Polen dorado: pocas partículas, tamaños y desenfoques distintos para
  // que se lea profundidad en vez de confeti.
  const motes = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 55 + Math.random() * 45,
        size: Math.random() * 5 + 2,
        duration: Math.random() * 10 + 13,
        delay: Math.random() * 14,
        driftX: Math.round((Math.random() - 0.5) * 160),
        driftY: -(Math.random() * 320 + 220),
        opacity: Math.random() * 0.35 + 0.25,
        blur: Math.random() > 0.6 ? 'blur-[1.5px]' : '',
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Lienzo marfil, sin bloques de color */}
      <div className="absolute inset-0 bg-[#FFF8E9] dark:bg-[#0B0A09]" />

      {/* Luz cálida cayendo desde arriba a la derecha */}
      <div className="absolute -top-[22%] right-[-8%] w-[70vw] max-w-[900px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(247,195,37,0.55),rgba(233,196,110,0)_62%)] dark:bg-[radial-gradient(circle,rgba(180,140,60,0.16),transparent_62%)] blur-[10px]" />
      {/* Rebote frío, para que la luz no sea plana */}
      <div className="absolute bottom-[-18%] left-[-10%] w-[55vw] max-w-[720px] aspect-square rounded-full bg-[radial-gradient(circle,rgba(143,211,244,0.45),transparent_65%)] dark:bg-[radial-gradient(circle,rgba(90,120,140,0.12),transparent_65%)] blur-[10px]" />

      {/* Botánica de línea fina en las esquinas */}
      <Sprig className="absolute -left-6 bottom-0 h-[62%] max-h-[460px] opacity-45 dark:opacity-30 animate-sway [--sway-duration:11s]" />
      <Sprig className="absolute -right-8 bottom-0 h-[48%] max-h-[380px] opacity-35 dark:opacity-25 scale-x-[-1] animate-sway [--sway-duration:13s]" />

      {/* Polen dorado subiendo */}
      {motes.map((mote) => (
        <span
          key={mote.id}
          className={`absolute rounded-full bg-[#F7C325] dark:bg-[#8A6A28] animate-pollen ${mote.blur}`}
          style={
            {
              left: `${mote.left}%`,
              top: `${mote.top}%`,
              width: mote.size,
              height: mote.size,
              '--duration': `${mote.duration}s`,
              '--delay': `${mote.delay}s`,
              '--pollen-x': `${mote.driftX}px`,
              '--pollen-y': `${mote.driftY}px`,
              '--pollen-opacity': mote.opacity,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Viñeta muy suave para cerrar los bordes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(120,100,70,0.07))] dark:bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.35))]" />
    </div>
  );
}
