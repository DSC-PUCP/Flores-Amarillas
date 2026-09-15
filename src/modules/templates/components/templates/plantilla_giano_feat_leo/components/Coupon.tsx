import { Gift } from 'lucide-react';
import { type PointerEvent, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { BRAND_MOOD, ON_ACCENT } from '../mood';
import styles from '../premium.module.css';
import { Sunflower } from './art';
import { PhotoCarousel } from './Gallery';
import { Reveal } from './Reveal';

/** Porcentaje raspado a partir del cual se descubre todo el cupón. */
const REVEAL_AT = 0.45;

/** Pinta la capa dorada para raspar. Devuelve false si no hay canvas (tests). */
function paintScratchLayer(canvas: HTMLCanvasElement): boolean {
  const context = canvas.getContext('2d');
  if (!context) return false;
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return false;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.scale(ratio, ratio);

  const gradient = context.createLinearGradient(0, 0, width, height);
  // Lámina dorada de marca: no sigue a la canción.
  gradient.addColorStop(0, BRAND_MOOD.petalMid);
  gradient.addColorStop(0.5, BRAND_MOOD.petal);
  gradient.addColorStop(1, BRAND_MOOD.petalBack);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  // Motas de brillo para que parezca una lámina metálica.
  context.fillStyle = 'rgba(255, 251, 242, 0.28)';
  for (let x = 8; x < width; x += 16) {
    for (let y = 8; y < height; y += 16) {
      if ((x * 7 + y * 13) % 5 < 2) context.fillRect(x, y, 2, 2);
    }
  }

  context.fillStyle = ON_ACCENT;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '600 15px "Manrope", system-ui, sans-serif';
  context.fillText('RASPA AQUÍ CON EL DEDO', width / 2, height / 2);
  context.globalCompositeOperation = 'destination-out';
  return true;
}

export function Coupon({
  text,
  images,
  from,
}: {
  text: string;
  images: string[];
  from: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [scratchable, setScratchable] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    setScratchable(paintScratchLayer(canvas));
  }, [revealed]);

  const scratchedShare = (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) return 0;
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let sampled = 0;
    // Una muestra cada 32 píxeles basta y no traba el teléfono.
    for (let i = 3; i < data.length; i += 4 * 32) {
      sampled += 1;
      if (data[i] === 0) clear += 1;
    }
    return sampled ? clear / sampled : 0;
  };

  const scratchTo = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const context = canvas.getContext('2d');
    if (!context) return;
    const rect = canvas.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const start = last.current ?? point;
    context.lineWidth = 42;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    last.current = point;
  };

  return (
    <section
      aria-labelledby="premium-coupon"
      className="relative px-4 py-20 sm:py-28"
    >
      <Reveal className="mb-10 text-center">
        <h2
          id="premium-coupon"
          className={cn(styles.display, 'mt-3 text-5xl sm:text-6xl')}
        >
          Tienes un <span className="italic">vale</span>
        </h2>
      </Reveal>

      <Reveal className="mx-auto w-full max-w-3xl">
        <div
          className={cn(
            styles.ticket,
            'relative overflow-hidden rounded-[1.75rem] bg-[var(--sun)] p-3 shadow-[0_30px_70px_-30px_#F7C32580]'
          )}
        >
          <div className="relative overflow-hidden rounded-[1.25rem] border-2 border-dashed border-[var(--mood-petal-back)]/40 bg-[var(--mood-card)] px-6 py-8 text-center text-[var(--mood-ink)] sm:px-10">
            <Sunflower className="pointer-events-none absolute -top-8 -left-8 size-20" />
            <Sunflower className="pointer-events-none absolute -right-7 -bottom-7 size-16" />

            <p className={cn(styles.eyebrow, 'text-[var(--mood-strong)]')}>
              Vale por
            </p>
            <div className="relative mt-4 min-h-40">
              <div aria-hidden={!revealed}>
                <p
                  className={cn(
                    styles.display,
                    'text-[clamp(1.5rem,5vw,2.1rem)] leading-tight break-words'
                  )}
                >
                  {text}
                </p>
                <p className="mt-3 text-sm text-[var(--mood-ink-soft)]">
                  Cuando tú quieras, donde tú quieras.
                </p>
              </div>

              {!revealed && (
                <canvas
                  ref={canvasRef}
                  className={cn(
                    styles.scratch,
                    'absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] rounded-2xl',
                    // Sin canvas (o antes de pintarlo) el vale queda tapado igual.
                    !scratchable && 'bg-[var(--sun)]'
                  )}
                  onPointerDown={(event) => {
                    if (!scratchable) return;
                    drawing.current = true;
                    event.currentTarget.setPointerCapture?.(event.pointerId);
                    scratchTo(event);
                  }}
                  onPointerMove={(event) => {
                    if (drawing.current) scratchTo(event);
                  }}
                  onPointerUp={(event) => {
                    drawing.current = false;
                    last.current = null;
                    if (scratchedShare(event.currentTarget) >= REVEAL_AT) {
                      setRevealed(true);
                    }
                  }}
                  onPointerCancel={() => {
                    drawing.current = false;
                    last.current = null;
                  }}
                />
              )}
            </div>

            <div className="mt-6 flex items-center justify-center border-t border-dashed border-[var(--mood-ink)]/15 pt-4 text-xs text-[var(--mood-ink-soft)]">
              <span className="font-semibold">De: {from}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center" aria-live="polite">
          {revealed ? (
            <p className="text-sm font-semibold text-[var(--page-ink)]">
              Es tuyo. Úsalo cuando quieras.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold text-[var(--page-ink)] hover:bg-white/10"
            >
              <Gift size={16} /> Descubrir sin raspar
            </button>
          )}
        </div>
        {revealed && images.length > 0 && (
          <div className="mt-8">
            <p className="mb-4 text-center text-sm text-[var(--page-soft)]">
              Un adelanto de lo que nos espera
            </p>
            <PhotoCarousel photos={images} label="Fotos del vale sorpresa" />
          </div>
        )}
      </Reveal>
    </section>
  );
}
