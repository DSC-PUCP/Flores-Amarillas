import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import styles from '../premium.module.css';
import { PressedSprig, Sunflower } from './art';
import { Reveal } from './Reveal';

/** Sobre con sello de cera. Al abrirlo, la carta sale y se despliega debajo. */
export function Letter({
  message,
  from,
  to,
  previewOpen = false,
}: {
  message: string;
  from: string;
  to: string;
  previewOpen?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [opened, setOpen] = useState(false);
  const open = previewOpen || opened;
  const letterRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open || previewOpen) return;
    const timer = window.setTimeout(
      () => {
        const letter = letterRef.current;
        if (!letter || letter.closest('[inert]')) return;
        letter.focus({ preventScroll: true });
        const scroll = letter.closest<HTMLElement>('[data-scene-scroll]');
        if (scroll)
          scroll.scrollTo?.({
            top:
              scroll.scrollTop +
              letter.getBoundingClientRect().top -
              scroll.getBoundingClientRect().top -
              24,
            behavior: reduceMotion ? 'auto' : 'smooth',
          });
      },
      reduceMotion ? 0 : 900
    );
    return () => window.clearTimeout(timer);
  }, [open, previewOpen, reduceMotion]);

  return (
    <section
      aria-labelledby="premium-letter"
      className="relative px-4 py-20 sm:py-28"
    >
      {!previewOpen && (
        <>
          <Reveal className="mb-20 text-center">
            <h2
              id="premium-letter"
              className={cn(styles.display, 'mt-3 text-5xl sm:text-6xl')}
            >
              Una carta <span className="italic">para ti</span>
            </h2>
          </Reveal>

          <Reveal className="mx-auto w-full max-w-md">
            <div
              className={cn(styles.envelope, 'relative aspect-[3/2] w-full')}
            >
              {/* Fondo del sobre */}
              <div className="absolute inset-0 rounded-2xl bg-[var(--mood-kraft)]" />

              {/* Carta asomando */}
              <motion.div
                aria-hidden="true"
                className={cn(
                  styles.paper,
                  'absolute inset-x-[7%] top-[8%] bottom-[6%] rounded-lg'
                )}
                animate={{ y: open ? '-30%' : '0%' }}
                transition={{ duration: 0.7, delay: open ? 0.45 : 0 }}
              >
                <div className="flex h-full flex-col gap-2.5 px-[9%] pt-[9%]">
                  <span className="h-2 w-2/5 rounded-full bg-[var(--mood-ink)]/15" />
                  <span className="h-1.5 w-4/5 rounded-full bg-[var(--mood-ink)]/10" />
                  <span className="h-1.5 w-3/5 rounded-full bg-[var(--mood-ink)]/10" />
                </div>
              </motion.div>

              {/* Bolsillo delantero */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl bg-[var(--mood-kraft-light)] [clip-path:polygon(0_0,50%_52%,100%_0,100%_100%,0_100%)]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-b-2xl bg-[var(--mood-band)] [clip-path:polygon(0_100%,50%_46%,100%_100%)]"
              />
              <PressedSprig className="pointer-events-none absolute right-[5%] bottom-[6%] w-[13%] rotate-12 opacity-90" />

              {/* Solapa */}
              <div
                aria-hidden="true"
                className={cn(
                  styles.flap,
                  open && styles.flapOpen,
                  'absolute inset-x-0 top-0 h-[58%] rounded-t-2xl bg-[var(--mood-kraft-dark)] [clip-path:polygon(0_0,100%_0,50%_100%)]',
                  open ? 'z-0' : 'z-10'
                )}
              />

              {/* Sello */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={open}
                aria-expanded={open}
                aria-controls="premium-letter-body"
                className={cn(
                  styles.seal,
                  open && styles.sealGone,
                  'absolute top-[58%] left-1/2 z-20 grid size-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--mood-petal-back)] shadow-[0_6px_0_var(--mood-seed-ring),0_14px_24px_-10px_var(--mood-ink-soft)] transition-transform hover:scale-105'
                )}
              >
                <span className="sr-only">Romper el sello y leer la carta</span>
                <span className="absolute inset-[9%] rounded-full border-2 border-dashed border-[var(--sun-light)]/50" />
                <Sunflower className="w-[62%]" />
              </button>
            </div>

            <AnimatePresence>
              {!open && (
                <motion.p
                  exit={{ opacity: 0 }}
                  className="mt-8 text-center text-sm font-semibold text-[var(--page-soft)]"
                >
                  Toca el sello para abrirla
                </motion.p>
              )}
            </AnimatePresence>
          </Reveal>
        </>
      )}
      <AnimatePresence>
        {open && (
          <motion.article
            id="premium-letter-body"
            ref={letterRef}
            tabIndex={-1}
            aria-label={`Carta de ${from} para ${to}`}
            initial={
              reduceMotion || previewOpen
                ? false
                : { opacity: 0, y: -40, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: reduceMotion || previewOpen ? 0 : 0.7,
            }}
            className={cn(
              styles.letterSheet,
              'relative mx-auto mt-10 w-full max-w-2xl text-[var(--mood-ink)] scroll-mt-24 rounded-[4px_4px_28px_28px] px-6 pt-10 pb-12 outline-none sm:px-14 sm:pt-14'
            )}
          >
            <PressedSprig className="pointer-events-none absolute top-4 right-3 w-12 rotate-[12deg] sm:right-5 sm:w-16" />
            <p
              className={cn(
                styles.display,
                'pr-16 text-3xl italic sm:pr-20 sm:text-4xl'
              )}
            >
              Para {to},
            </p>
            <p className="mt-6 text-[1.0625rem] leading-[1.95] whitespace-pre-wrap break-words text-[var(--mood-ink)] sm:text-lg">
              {message ||
                (previewOpen
                  ? 'Tu carta aparecerá aquí mientras la escribes.'
                  : '')}
            </p>
            <div className="mt-10 text-right">
              <p className="text-sm text-[var(--mood-ink-soft)]">
                Con todo mi cariño,
              </p>
              <p
                className={cn(
                  styles.hand,
                  'mt-1 text-4xl break-words text-[var(--mood-ink)] sm:text-5xl'
                )}
              >
                {from}
              </p>
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </section>
  );
}
