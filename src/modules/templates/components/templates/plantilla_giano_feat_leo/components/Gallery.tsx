import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import styles from '../premium.module.css';
import { Sunflower } from './art';
import { Reveal } from './Reveal';

/** Foto que no cargó: se muestra una flor en vez de un ícono roto. */
function Photo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={cn(
          'grid place-items-center bg-[var(--mood-band)] p-6 text-center',
          className
        )}
      >
        <Sunflower className="size-16" />
        <p className="mt-3 text-sm text-[var(--mood-ink)]">
          No pudimos cargar esta foto. Puedes pasar a la siguiente.
        </p>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('object-contain', className)}
    />
  );
}

/** Álbum manual: fotos completas, miniaturas y ampliación, sin avance automático. */
export function PhotoCarousel({
  photos,
  label = 'Carrusel de nuestros momentos',
}: {
  photos: string[];
  label?: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);
  const count = photos.length;
  const index = Math.min(active, Math.max(0, count - 1));
  const go = (step: number) => setActive((index + step + count) % count);
  if (!count) return null;

  return (
    <section
      aria-roledescription="carrusel"
      aria-label={label}
      className={styles.album}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          go(1);
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          go(-1);
        }
      }}
    >
      <div
        className={styles.albumStage}
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const end = event.changedTouches[0]?.clientX;
          touchStart.current = null;
          if (
            start !== null &&
            end !== undefined &&
            Math.abs(end - start) > 50
          ) {
            go(end < start ? 1 : -1);
          }
        }}
      >
        <button
          type="button"
          className={styles.albumPhoto}
          onClick={() => setOpen(index)}
          aria-label={`Ver recuerdo ${index + 1} de ${count}`}
        >
          <Photo
            key={photos[index]}
            src={photos[index]}
            alt={`Recuerdo ${index + 1} de ${count}`}
            className="h-full w-full"
          />
          <span className={styles.zoomHint}>Ampliar foto</span>
        </button>
      </div>
      <div className={styles.albumControls}>
        {count > 1 && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <p aria-live="polite" aria-atomic="true">
          {index + 1} / {count}
        </p>
        {count > 1 && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Foto siguiente"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
      {count > 1 && (
        <div className={styles.albumThumbs}>
          {photos.map((src, photoIndex) => (
            <button
              key={src}
              type="button"
              aria-label={`Mostrar recuerdo ${photoIndex + 1} de ${count}`}
              aria-pressed={photoIndex === index}
              onClick={() => setActive(photoIndex)}
            >
              <Photo src={src} alt="" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
      {open !== null && (
        <Lightbox
          photos={photos}
          index={Math.min(open, count - 1)}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

export function Gallery({ photos }: { photos: string[] }) {
  return (
    <section
      aria-labelledby="premium-gallery"
      className="relative px-5 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-4xl">
        <Reveal className="mb-8 text-center">
          <p className={cn(styles.eyebrow, 'mb-4 text-[var(--page-strong)]')}>
            Un álbum para volver a nosotros
          </p>
          <h2
            id="premium-gallery"
            className={cn(styles.display, 'text-4xl sm:text-6xl')}
          >
            Nuestros <span className="italic">momentos</span>
          </h2>
          <p className="mt-4 text-sm text-[var(--page-soft)]">
            Cada foto, un pedacito de nuestra historia.
          </p>
        </Reveal>
        <PhotoCarousel photos={photos} />
      </div>
    </section>
  );
}

function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: string[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const count = photos.length;
  const go = (step: number) => onIndex((index + step + count) % count);

  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
    else dialog?.setAttribute('open', '');
    return () => {
      if (dialog?.open && typeof dialog.close === 'function') dialog.close();
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={`Recuerdo ${index + 1} de ${count}`}
      className={styles.lightbox}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          event.stopPropagation();
          go(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <div
        className="flex max-h-[calc(100svh-2rem)] flex-col p-3 sm:p-4"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const end = event.changedTouches[0]?.clientX;
          touchStart.current = null;
          if (start === null || end === undefined || count < 2) return;
          if (Math.abs(end - start) > 50) go(end < start ? 1 : -1);
        }}
      >
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-[var(--mood-band)]">
          <img
            key={photos[index]}
            src={photos[index]}
            alt={`Recuerdo ${index + 1} de ${count}`}
            className="mx-auto max-h-[calc(100svh-8rem)] w-auto object-contain"
          />
        </div>
        <div className="flex items-center justify-between gap-3 px-1 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold hover:bg-[var(--sun)]/30"
          >
            <X size={18} /> Cerrar
          </button>
          <span
            className="text-sm tabular-nums text-[var(--page-soft)]"
            aria-live="polite"
          >
            {index + 1} / {count}
          </span>
          {count > 1 ? (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Recuerdo anterior"
                className="grid size-11 place-items-center rounded-full border border-[var(--mood-ink)]/15 hover:bg-[var(--sun)]/40"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Recuerdo siguiente"
                className="grid size-11 place-items-center rounded-full bg-[var(--mood-deep)] text-[var(--sun)] hover:bg-[var(--mood-ink)]"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <span className="w-11" />
          )}
        </div>
      </div>
    </dialog>
  );
}
