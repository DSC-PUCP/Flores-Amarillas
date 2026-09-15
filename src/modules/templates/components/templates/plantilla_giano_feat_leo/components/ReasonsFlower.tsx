import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import styles from '../premium.module.css';

const RING = 12;
const PETAL = 'M200 200C181 160 177 92 200 46c23 46 19 114 0 154Z';
const BACK_PETAL = 'M200 200C184 165 181 104 200 62c19 42 16 103 0 138Z';

const SLOTS = Array.from({ length: RING }, (_, slot) => ({
  slot,
  angle: (360 / RING) * slot,
}));

const SEEDS = Array.from({ length: 70 }, (_, i) => {
  const angle = i * 137.508 * (Math.PI / 180);
  const radius = 6.4 * Math.sqrt(i + 0.5);
  return {
    cx: +(200 + radius * Math.cos(angle)).toFixed(1),
    cy: +(200 + radius * Math.sin(angle)).toFixed(1),
  };
});

/**
 * "Deshoja la flor": cualquier pétalo que toques se desprende y descubre la
 * siguiente razón. Antes solo respondían algunos pétalos y, con una o dos
 * razones, casi toda la flor parecía no funcionar.
 */
export function ReasonsFlower({
  reasons,
  from,
}: {
  reasons: string[];
  from: string;
}) {
  const reduceMotion = useReducedMotion();
  const [plucked, setPlucked] = useState<number[]>([]);
  const total = Math.min(reasons.length, RING);
  // En el editor las razones cambian mientras se escriben: nunca se cuentan
  // más razones descubiertas que las que existen.
  const revealed = Math.min(plucked.length, total);
  const done = total > 0 && revealed === total;
  const latest = revealed - 1;

  const pluck = (slot: number) => {
    setPlucked((current) =>
      current.includes(slot) || current.length >= total
        ? current
        : [...current, slot]
    );
  };

  const revealAll = () => {
    setPlucked((current) => {
      const kept = current.slice(0, total);
      const free = SLOTS.map(({ slot }) => slot).filter(
        (slot) => !kept.includes(slot)
      );
      return [...kept, ...free.slice(0, total - kept.length)];
    });
  };

  return (
    <section
      aria-labelledby="premium-reasons"
      className="relative flex min-h-full flex-col justify-center px-4 py-10 sm:py-14"
    >
      <div className="mx-auto w-full max-w-5xl">
        <header className="text-center">
          <p className={cn(styles.eyebrow, 'text-[var(--page-strong)]')}>
            Deshoja la flor
          </p>
          <h2
            id="premium-reasons"
            className={cn(styles.display, 'mt-2 text-4xl sm:text-5xl')}
          >
            Por qué <span className="italic">te quiero</span>
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--page-soft)] sm:text-base">
            Toca un pétalo para descubrir cada razón.
          </p>
        </header>

        <div className="mt-6 grid items-center gap-6 sm:mt-8 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-10">
          <div className="relative mx-auto w-full max-w-[min(20rem,40svh)]">
            {/* biome-ignore lint/a11y/useSemanticElements: agrupa los pétalos dentro del SVG */}
            <svg
              viewBox="0 0 400 400"
              className="w-full overflow-visible"
              role="group"
              aria-label={`Flor con ${total} ${total === 1 ? 'razón' : 'razones'}`}
            >
              <g style={{ fill: 'var(--mood-petal-back)' }}>
                {SLOTS.map(({ angle }) => (
                  <path
                    key={angle}
                    d={BACK_PETAL}
                    transform={`rotate(${angle + 15} 200 200)`}
                  />
                ))}
              </g>

              {SLOTS.map(({ slot, angle }) => {
                const gone = plucked.includes(slot);
                const available = !gone && !done;
                return (
                  <g key={angle} transform={`rotate(${angle} 200 200)`}>
                    {/* biome-ignore lint/a11y/useSemanticElements: un <button> no puede ir dentro de un SVG */}
                    <g
                      role="button"
                      tabIndex={available ? 0 : -1}
                      aria-label={`Pétalo ${slot + 1}: descubrir una razón`}
                      aria-hidden={gone}
                      aria-disabled={!available}
                      className={cn(
                        styles.petalButton,
                        gone && styles.petalGone,
                        !available && !gone && styles.petalRest
                      )}
                      onClick={() => {
                        if (available) pluck(slot);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          if (available) pluck(slot);
                        }
                      }}
                    >
                      <g
                        className={cn(
                          available && !reduceMotion && styles.petalHint
                        )}
                        style={{ animationDelay: `${slot * 0.22}s` }}
                      >
                        <path d={PETAL} className={styles.petalShape} />
                        <path
                          d="M200 180c-3-30-3-72 0-110"
                          style={{ stroke: 'var(--mood-card)' }}
                          strokeOpacity="0.5"
                          strokeWidth="3"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </g>
                    </g>
                  </g>
                );
              })}

              <circle
                cx="200"
                cy="200"
                r="66"
                style={{ fill: 'var(--mood-seed-ring)' }}
              />
              <circle
                cx="200"
                cy="200"
                r="58"
                style={{ fill: 'var(--mood-seed)' }}
              />
              <g style={{ fill: 'var(--mood-seed-dot)' }}>
                {SEEDS.map(({ cx, cy }) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" />
                ))}
              </g>
            </svg>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <p
                className={cn(
                  styles.display,
                  'text-[clamp(1.4rem,6vw,1.9rem)] leading-none text-[var(--sun-light)] [text-shadow:0_1px_6px_var(--mood-seed-dot)]'
                )}
                aria-live="polite"
              >
                {revealed}/{total}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={latest}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-[1.5rem] bg-[var(--mood-card)] p-5 text-[var(--mood-ink)] shadow-[0_24px_50px_-34px_color-mix(in_srgb,var(--mood-ink)_60%,transparent)] sm:p-7"
                aria-live="polite"
              >
                {latest < 0 ? (
                  <p
                    className={cn(
                      styles.display,
                      'text-2xl text-[var(--mood-ink-soft)] italic'
                    )}
                  >
                    Te quiero porque…
                  </p>
                ) : (
                  <>
                    <p
                      className={cn(
                        styles.eyebrow,
                        'text-[var(--mood-strong)]'
                      )}
                    >
                      Razón {latest + 1}
                    </p>
                    <p
                      className={cn(
                        styles.display,
                        'mt-2 text-[clamp(1.35rem,3.6vw,1.9rem)] leading-snug [overflow-wrap:anywhere]'
                      )}
                    >
                      {reasons[latest]}
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {revealed > 1 && (
              <ol className="mt-4 max-h-[24svh] space-y-2 overflow-y-auto pr-1">
                {reasons.slice(0, revealed - 1).map((reason, index) => (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: las razones pueden repetirse; su posición es su identidad
                    key={index}
                    className="flex gap-3 rounded-2xl border border-[var(--mood-ink)]/10 bg-[var(--mood-card)]/70 px-4 py-2.5 text-sm text-[var(--mood-ink-soft)]"
                  >
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--sun)]" />
                    <span className="min-w-0 [overflow-wrap:anywhere]">
                      {reason}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {done ? (
              <p
                className={cn(
                  styles.hand,
                  'mt-4 text-2xl text-[var(--page-ink)] sm:text-3xl'
                )}
              >
                …y me faltan pétalos para todas las demás. — {from}
              </p>
            ) : (
              <button
                type="button"
                onClick={revealAll}
                className="mt-4 min-h-11 text-sm font-semibold text-[var(--page-soft)] underline decoration-[var(--sun)] decoration-2 underline-offset-4 hover:text-[var(--page-ink)]"
              >
                Descubrir todas de una vez
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
