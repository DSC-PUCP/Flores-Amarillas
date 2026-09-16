import { Heart } from 'lucide-react';
import { useState } from 'react';
import { imagenes } from '@/lib/imagenes';
import { cn } from '@/lib/utils';
import styles from '../premium.module.css';
import { AnimalGift } from './animal-gift';
import { FlowerGarland } from './spring-art';
import { Vinyl } from './Vinyl';

/** Miniatura propia del catálogo, con las ilustraciones de la premium real. */
export function PremiumThumbnail() {
  const [photoFailed, setPhotoFailed] = useState(false);
  return (
    <div
      role="img"
      aria-label="Vista previa de la plantilla premium: animalito con flores amarillas, carta, fotos y música"
      className="relative h-64 overflow-hidden bg-[#FFF9E6]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_80%,#D6E5C6_0%,transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="absolute top-16 -right-4 size-44 rounded-full bg-[#FFE7A0]/45"
      />
      <FlowerGarland className="pointer-events-none absolute -top-9 -right-10 w-64 opacity-40" />
      <span className="absolute top-5 left-5 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-semibold text-[#183E32]">
        Flores, música y recuerdos
      </span>
      <div
        aria-hidden="true"
        className="relative grid h-full grid-cols-2 items-center gap-3 px-6 pt-14 pb-3"
      >
        <div className="min-w-0">
          <p
            className={cn(
              styles.display,
              'text-[clamp(1.35rem,2.5vw,1.8rem)] leading-[1.08] text-[#183E32]'
            )}
          >
            Un regalo
            <br />
            <span className="italic">que florece.</span>
          </p>
          <div className="mt-5 flex items-center gap-2">
            <svg
              viewBox="0 0 48 38"
              className="w-10 shrink-0 -rotate-6"
              aria-hidden="true"
              focusable="false"
            >
              <rect
                x="2"
                y="6"
                width="44"
                height="30"
                rx="4"
                fill="#F5D792"
                stroke="#C09D5C"
              />
              <path d="m3 8 21 15L45 8v25H3Z" fill="#FFF0C4" />
              <path d="M3 34 24 18 45 34" fill="#FFE7AC" />
              <path d="M24 22c-9-7-13 3 0 9 13-6 9-16 0-9Z" fill="#EEA1A6" />
            </svg>
            <div className="grid h-12 w-9 shrink-0 rotate-6 place-items-center rounded-sm border border-[#183E32]/10 bg-white p-1 pb-2 shadow-sm">
              {photoFailed ? (
                <Heart
                  size={18}
                  className="text-[#DF999F]"
                  fill="currentColor"
                />
              ) : (
                <img
                  src={imagenes.recuerdoJuntos}
                  alt=""
                  loading="lazy"
                  onError={() => setPhotoFailed(true)}
                  className="h-full w-full rounded-[1px] object-cover"
                />
              )}
            </div>
            <Vinyl cover={null} spinning className="w-11 shrink-0" />
          </div>
        </div>
        <div className="relative -mr-3 w-full min-w-0">
          <AnimalGift mascot="rabbit" />
        </div>
      </div>
    </div>
  );
}
