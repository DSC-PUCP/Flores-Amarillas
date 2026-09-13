import { useId } from 'react';

/** Vector propio: cada flor puede inclinarse y responder por separado. */
export function ForestFlower({ kind = 'girasol', className = '' }: { kind?: 'girasol' | 'margarita'; className?: string }) {
  const id = useId().replace(/:/g, '');
  const petals = kind === 'girasol' ? 17 : 12;
  return (
    <svg viewBox="0 0 140 220" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-petal`} x1="60" y1="8" x2="70" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor={kind === 'girasol' ? '#ffe895' : '#fff8dc'} />
          <stop offset=".5" stopColor={kind === 'girasol' ? '#f6c433' : '#ffe894'} />
          <stop offset="1" stopColor="#cd8916" />
        </linearGradient>
        <radialGradient id={`${id}-heart`}><stop stopColor="#886234" /><stop offset=".7" stopColor="#594324" /><stop offset="1" stopColor="#a47425" /></radialGradient>
        <linearGradient id={`${id}-leaf`}><stop stopColor="#829557" /><stop offset="1" stopColor="#294c36" /></linearGradient>
      </defs>
      <path d="M70 72C62 115 83 157 69 215" stroke="#526941" strokeWidth="4" />
      <path d="M69 149Q19 142 24 111Q65 112 69 149ZM72 170Q114 157 112 133Q78 132 72 170Z" fill={`url(#${id}-leaf)`} />
      <path d="M29 116L68 147M108 138L73 168" stroke="#a8b572" strokeWidth=".8" opacity=".6" />
      <g>
        {Array.from({ length: petals }, (_, i) => (
          <ellipse key={`petal-${i.toString()}`} cx="70" cy="34" rx={kind === 'girasol' ? 10 : 8} ry="29" transform={`rotate(${i * 360 / petals} 70 64)`} fill={`url(#${id}-petal)`} stroke="#aa741a" strokeOpacity=".16" strokeWidth=".6" />
        ))}
        <circle cx="70" cy="64" r={kind === 'girasol' ? 23 : 16} fill={`url(#${id}-heart)`} />
        {Array.from({ length: 29 }, (_, i) => {
          const r = Math.sqrt(i) * (kind === 'girasol' ? 3.7 : 2.3);
          return <circle key={`seed-${i.toString()}`} cx={70 + Math.cos(i * 2.4) * r} cy={64 + Math.sin(i * 2.4) * r} r="1.1" fill="#d7b965" opacity=".65" />;
        })}
      </g>
    </svg>
  );
}
