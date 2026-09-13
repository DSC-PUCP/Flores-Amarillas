import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { type TimeTogether, timeTogether } from '../data';
import styles from '../premium.module.css';

/**
 * Contador que avanza cada segundo. Empieza vacío y se llena en el navegador,
 * para que el HTML del servidor y el del cliente coincidan.
 */
export function TimeCounter({ start }: { start: Date }) {
  const [time, setTime] = useState<TimeTogether | null>(null);

  useEffect(() => {
    const update = () => setTime(timeTogether(start, new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [start]);

  const units = [
    { label: time?.days === 1 ? 'día' : 'días', value: time?.days },
    { label: time?.hours === 1 ? 'hora' : 'horas', value: time?.hours },
    { label: 'min', value: time?.minutes },
    { label: 'seg', value: time?.seconds },
  ];

  return (
    <div className="relative w-full max-w-md rounded-[1.75rem] border border-[var(--mood-petal-back)]/20 bg-[var(--mood-card)] px-5 pt-6 pb-5 text-[var(--mood-ink)] shadow-[0_20px_50px_-30px_rgb(92_68_37/0.25)] sm:px-7">
      <p
        className={cn(
          styles.eyebrow,
          'mb-4 text-center text-[var(--mood-strong)]'
        )}
      >
        {time?.upcoming ? 'Faltan para ese día' : 'Juntos desde hace'}
      </p>
      <div className="grid grid-cols-4 gap-1 sm:gap-3" aria-live="off">
        {units.map(({ label, value }, index) => (
          <div
            key={label}
            className={cn(
              'min-w-0 text-center',
              index > 0 && 'border-l border-[var(--mood-ink)]/12'
            )}
          >
            <p
              className={cn(
                styles.display,
                'text-[clamp(1.6rem,7vw,2.6rem)] leading-none tabular-nums',
                index === 0 && 'text-[var(--mood-strong)]'
              )}
            >
              {value === undefined
                ? '—'
                : index === 0
                  ? value.toLocaleString('es-PE')
                  : String(value).padStart(2, '0')}
            </p>
            <p className="mt-2 text-[0.6875rem] text-[var(--mood-ink-soft)]">
              {label}
            </p>
          </div>
        ))}
      </div>
      {time?.anniversaryYears && (
        <p className="mt-5 rounded-full bg-[var(--sun)] px-4 py-2 text-center text-sm font-semibold text-[#10150F]">
          Hoy cumplimos {time.anniversaryYears}{' '}
          {time.anniversaryYears === 1 ? 'año' : 'años'} 🌻
        </p>
      )}
    </div>
  );
}
