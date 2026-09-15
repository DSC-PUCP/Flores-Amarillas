import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { formatLongDate } from '../data';
import styles from '../premium.module.css';
import { TimeCounter } from './TimeCounter';

export function Hero({
  from,
  to,
  startDate,
  started,
}: {
  from: string;
  to: string;
  startDate: Date | null;
  /** La entrada se anima al abrir el regalo, no detrás de la portada. */
  started: boolean;
}) {
  const reduceMotion = useReducedMotion();
  // El 21 de setiembre (inicio de la primavera) la página saluda. Se calcula
  // en el navegador para no depender de la zona horaria del servidor.
  const [springDay, setSpringDay] = useState(false);
  useEffect(() => {
    const today = new Date();
    setSpringDay(today.getMonth() === 8 && today.getDate() === 21);
  }, []);
  const enter = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: started ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
          transition: { duration: 1, delay, ease: [0.2, 0.8, 0.2, 1] as const },
        };

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[radial-gradient(120%_60%_at_50%_100%,#F7C3251f_0%,transparent_60%)] px-5 pt-24 pb-20 text-center">
      <motion.p
        {...enter(0.1)}
        className={cn(styles.eyebrow, 'relative text-[var(--page-strong)]')}
      >
        {springDay ? 'Feliz día de las flores amarillas' : 'Nuestra historia'}
      </motion.p>
      <motion.h1
        {...enter(0.25)}
        className={cn(
          styles.display,
          'relative mt-5 max-w-4xl text-[clamp(2.8rem,11vw,6.5rem)] leading-[0.98] break-words'
        )}
      >
        {from}{' '}
        <span className="text-[var(--mood-highlight)] italic">&amp;</span> {to}
      </motion.h1>

      <motion.p
        {...enter(0.4)}
        className="relative mt-5 max-w-md text-lg text-[var(--page-soft)] sm:text-xl"
      >
        {startDate ? (
          <>
            Desde el{' '}
            <span
              className={cn(styles.display, 'italic text-[var(--page-ink)]')}
            >
              {formatLongDate(startDate)}
            </span>
            , cada día florece un poco más.
          </>
        ) : (
          'Hay personas que son primavera. Tú eres la mía.'
        )}
      </motion.p>

      {startDate && (
        <motion.div
          {...enter(0.55)}
          className="relative mt-10 flex w-full justify-center"
        >
          <TimeCounter start={startDate} />
        </motion.div>
      )}

      <ChevronDown
        aria-hidden="true"
        className={cn(
          styles.floaty,
          'absolute bottom-5 left-1/2 -ml-4 size-8 text-[var(--page-strong)]'
        )}
      />
    </section>
  );
}
