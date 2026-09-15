import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { LyricLine } from '@/core/models';
import { cn } from '@/lib/utils';

type Props = {
  lines: LyricLine[];
  activeIndex: number;
  className?: string;
  /** Clases de la línea que suena (tipografía, color). */
  currentClassName?: string;
  /** Clases de la línea anterior y la siguiente. */
  sideClassName?: string;
};

/** Letra estilo karaoke: línea anterior, la que suena y la siguiente. */
export function SyncedLyrics({
  lines,
  activeIndex,
  className,
  currentClassName,
  sideClassName = 'opacity-40',
}: Props) {
  const reduceMotion = useReducedMotion();
  if (lines.length === 0) return null;

  const current = lines[activeIndex]?.text;
  const previous = lines[activeIndex - 1]?.text;
  const next = lines[activeIndex + 1]?.text;

  return (
    <div
      className={cn('flex flex-col items-center gap-3 text-center', className)}
    >
      <p className={cn('min-h-[1.5em] text-base', sideClassName)}>{previous}</p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={activeIndex}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'min-h-[1.5em] text-2xl font-semibold md:text-4xl',
            currentClassName
          )}
        >
          {current || '♪'}
        </motion.p>
      </AnimatePresence>
      <p className={cn('min-h-[1.5em] text-base', sideClassName)}>{next}</p>
    </div>
  );
}
