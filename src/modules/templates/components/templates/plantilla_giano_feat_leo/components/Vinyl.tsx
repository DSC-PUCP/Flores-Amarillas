import { useState } from 'react';
import { cn } from '@/lib/utils';
import styles from '../premium.module.css';
import { Sunflower } from './art';

/**
 * Disco de vinilo con la portada como etiqueta. En los videos "Topic" la
 * miniatura es la carátula del álbum: recortada al centro queda perfecta.
 */
export function Vinyl({
  cover,
  spinning,
  className,
  arm = false,
}: {
  cover: string | null;
  spinning: boolean;
  className?: string;
  /** Brazo del tocadiscos, que baja al disco mientras suena. */
  arm?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const showCover = cover && !failed;

  return (
    <div className={cn('relative aspect-square', className)}>
      <div
        className={cn(
          styles.vinyl,
          spinning ? styles.vinylOn : styles.vinylOff
        )}
      >
        <div className={styles.vinylLabel}>
          {showCover ? (
            <img
              src={cover}
              alt=""
              draggable={false}
              onError={() => setFailed(true)}
              className="h-full w-full scale-[1.02] object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-[var(--mood-accent)]">
              <Sunflower className="w-[80%]" />
            </div>
          )}
        </div>
        <span className={styles.vinylHole} />
      </div>
      {/* Reflejo fijo: el disco gira debajo de la luz, como uno real */}
      <div className={styles.vinylSheen} aria-hidden="true" />
      {arm && (
        <svg
          viewBox="0 0 60 160"
          aria-hidden="true"
          className={cn(styles.tonearm, spinning && styles.tonearmOn)}
        >
          <circle cx="42" cy="16" r="13" fill="#2A2A2A" />
          <circle cx="42" cy="16" r="7" fill="#9A9A9A" />
          <circle cx="42" cy="16" r="3" fill="#E6E6E6" />
          <path
            d="M42 18 L40 118 Q39 132 26 140"
            stroke="#D9D9D9"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <rect
            x="12"
            y="134"
            width="22"
            height="14"
            rx="3"
            transform="rotate(-38 23 141)"
            fill="#3A3A3A"
          />
        </svg>
      )}
    </div>
  );
}
