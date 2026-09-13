import { motion, useReducedMotion } from 'framer-motion';
import { Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GiftMascot } from '../mascots';
import styles from '../premium.module.css';
import { AnimalGift } from './animal-gift';
import { BotanicalFrame } from './botanical-frame';
import { MascotPicker } from './mascot-picker';

/** El animalito elegido entrega las flores y abre la dedicatoria. */
export function Cover({
  from,
  to,
  hasMusic,
  mascot,
  onMascotChange,
  onOpen,
}: {
  from: string;
  to: string;
  hasMusic: boolean;
  mascot: GiftMascot;
  onMascotChange?: (mascot: GiftMascot) => void;
  onOpen: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      data-mascot-choice={Boolean(onMascotChange)}
      className={cn(
        styles.cover,
        'fixed inset-0 z-30 flex flex-col items-center justify-center overflow-y-auto px-5 py-10 text-center'
      )}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
    >
      <BotanicalFrame />
      <motion.div
        className="relative z-10 flex w-full max-w-md flex-col items-center"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p
          className={cn(styles.eyebrow, 'text-[var(--page-soft)] break-words')}
        >
          Una sorpresa de {from}
        </p>
        <h1
          className={cn(
            styles.display,
            'mt-4 text-[clamp(2.4rem,10vw,4.2rem)] leading-[1.02] break-words'
          )}
        >
          {to},
          <br />
          <span className="italic">
            te llegaron{' '}
            <span className="text-[var(--mood-highlight)]">
              flores amarillas
            </span>
          </span>
        </h1>

        <div className={styles.mascotPresentation}>
          <p className={styles.mascotGreeting}>Son para ti ♡</p>

          <button
            type="button"
            onClick={onOpen}
            className={styles.mascotButton}
            onPointerMove={(event) => {
              if (reduceMotion || event.pointerType === 'touch') return;
              const bounds = event.currentTarget.getBoundingClientRect();
              const x = (event.clientX - bounds.left) / bounds.width - 0.5;
              const y = (event.clientY - bounds.top) / bounds.height - 0.5;
              event.currentTarget.style.setProperty('--look-x', `${x * 6}px`);
              event.currentTarget.style.setProperty('--look-y', `${y * 4}px`);
            }}
            onPointerLeave={(event) => {
              event.currentTarget.style.setProperty('--look-x', '0px');
              event.currentTarget.style.setProperty('--look-y', '0px');
            }}
            aria-label={`Abrir el regalo de ${from}`}
          >
            <AnimalGift mascot={mascot} />
          </button>
        </div>

        {onMascotChange && (
          <MascotPicker
            compact
            value={mascot}
            onChange={onMascotChange}
            label="Elige tu animalito"
          />
        )}

        <button
          type="button"
          onClick={onOpen}
          className="mt-6 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--sun)] px-8 text-base font-semibold text-[#10150F] shadow-[0_18px_40px_-14px_#F7C325aa] transition-[transform,background-color] hover:bg-[var(--sun-light)] active:scale-[0.97]"
        >
          <span className="size-2.5 rounded-full bg-[#10150F]" />
          Abrir mi regalo
        </button>

        {hasMusic && (
          <p className="mt-5 inline-flex items-center gap-2 text-xs text-[var(--page-soft)]">
            <Headphones size={14} /> Con música · sube el volumen
          </p>
        )}
      </motion.div>

      <div aria-hidden="true" className="h-4 shrink-0" />
    </motion.div>
  );
}
