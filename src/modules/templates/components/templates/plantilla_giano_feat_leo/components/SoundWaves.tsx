import { type RefObject, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { MoodPalette } from '../mood';
import type { MoodLevels } from '../useMood';

type Props = {
  levels: RefObject<MoodLevels>;
  palette: MoodPalette;
  /** "waves": ondas superpuestas. "bars": ecualizador. */
  variant?: 'waves' | 'bars';
  className?: string;
};

const hexToRgba = (hex: string, alpha: number) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

// Ruido suave y determinista para que las barras no salten al azar.
const wobble = (x: number, t: number) =>
  0.5 +
  0.28 * Math.sin(x * 1.7 + t * 3.1) +
  0.22 * Math.sin(x * 0.63 - t * 4.7 + Math.sin(x * 0.21 + t));

/**
 * Ondas que se mueven con la música. Solo dibuja mientras hay algo que
 * mostrar; en pausa se aplanan y el ciclo se detiene.
 */
export function SoundWaves({
  levels,
  palette,
  variant = 'waves',
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef(palette);
  paletteRef.current = palette;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (
      !canvas ||
      !context ||
      typeof window.requestAnimationFrame !== 'function'
    )
      return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let visible = true;
    let idleDrawn = false;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Cambiar el tamaño borra el canvas: hay que volver a dibujar.
      idleDrawn = false;
    };
    resize();
    const resizeObserver =
      typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(canvas);

    // No dibuja cuando el canvas está fuera de pantalla.
    const intersection =
      typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
          })
        : null;
    intersection?.observe(canvas);

    const drawWaves = (t: number, energy: number, playing: number) => {
      const { accent, second, light } = paletteRef.current;
      const mid = height / 2;
      const layers = [
        { color: hexToRgba(second, 0.35), amp: 0.9, freq: 1.4, speed: 0.8 },
        { color: hexToRgba(accent, 0.55), amp: 0.7, freq: 2.2, speed: -1.1 },
        { color: hexToRgba(light, 0.9), amp: 0.45, freq: 3.1, speed: 1.6 },
      ];
      for (const layer of layers) {
        const amplitude =
          (height * 0.16 + height * 0.42 * energy) * layer.amp * playing + 1.5;
        context.beginPath();
        for (let x = 0; x <= width; x += 4) {
          const u = x / width;
          // Se afina en los bordes para que la onda "nazca" del centro.
          const envelope = Math.sin(Math.PI * u) ** 1.4;
          const y =
            mid +
            Math.sin(u * Math.PI * 2 * layer.freq + t * layer.speed * 2.4) *
              amplitude *
              envelope *
              (0.75 + 0.25 * Math.sin(u * 9 + t * 1.3));
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = layer.color;
        context.lineWidth = 2;
        context.stroke();
      }
    };

    const drawBars = (t: number, energy: number, playing: number) => {
      const { accent, light } = paletteRef.current;
      const count = Math.max(8, Math.floor(width / 7));
      const gap = 2;
      const barWidth = (width - gap * (count - 1)) / count;
      const gradient = context.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, accent);
      gradient.addColorStop(1, light);
      context.fillStyle = gradient;
      for (let i = 0; i < count; i++) {
        const level = 0.08 + playing * (0.25 + 0.75 * energy) * wobble(i, t);
        const barHeight = Math.max(2, Math.min(1, level) * height);
        const x = i * (barWidth + gap);
        context.beginPath();
        context.roundRect(
          x,
          height - barHeight,
          barWidth,
          barHeight,
          barWidth / 2
        );
        context.fill();
      }
    };

    const tick = () => {
      const { energy, playing, phase } = levels.current;
      const idle = playing < 0.002 && energy < 0.002;
      // En silencio basta con dibujar la línea quieta una vez.
      if (visible && !(idle && idleDrawn)) {
        idleDrawn = idle;
        context.clearRect(0, 0, width, height);
        if (variant === 'bars') drawBars(phase, energy, playing);
        else drawWaves(phase, energy, playing);
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      intersection?.disconnect();
    };
  }, [levels, variant]);

  return (
    <canvas ref={canvasRef} className={cn('block h-full w-full', className)} />
  );
}
