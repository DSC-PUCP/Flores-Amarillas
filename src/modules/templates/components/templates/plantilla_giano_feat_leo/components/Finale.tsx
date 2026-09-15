import { Check, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import styles from '../premium.module.css';
import { Reveal } from './Reveal';

/** Cierre: la frase final, la firma y, en la página publicada, compartir. */
export function Finale({
  from,
  to,
  closingLine,
  isPreview,
}: {
  from: string;
  to: string;
  closingLine: string;
  isPreview: boolean;
}) {
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setStatus('Enlace copiado.');
    } catch {
      setStatus(
        'No se pudo copiar. Copia el enlace desde la barra del navegador.'
      );
    }
  };

  const share = async () => {
    if (!navigator.share) return copyLink();
    try {
      await navigator.share({
        title: `Flores amarillas para ${to}`,
        text: `${from} te dedicó unas flores amarillas.`,
        url: window.location.href,
      });
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        setStatus('No se pudo compartir. Prueba copiando el enlace.');
      }
    }
  };

  return (
    <footer
      className={
        'relative flex min-h-svh flex-col justify-center overflow-hidden px-5 pt-24 pb-24 text-center text-[var(--page-ink)] sm:pt-32 sm:pb-32'
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--sun)]/15 blur-3xl"
      />

      <Reveal className="relative mx-auto max-w-3xl">
        <p className={cn(styles.eyebrow, 'text-[var(--page-strong)]')}>
          Para {to}
        </p>
        <p
          className={cn(
            styles.display,
            'mt-6 text-[clamp(2.1rem,7vw,4.25rem)] leading-[1.05] italic break-words'
          )}
        >
          {closingLine}
        </p>
        <p
          className={cn(
            styles.hand,
            'mt-8 text-4xl text-[var(--page-strong)] break-words'
          )}
        >
          {from}
        </p>

        {!isPreview && (
          <>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={share}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--sun)] px-6 text-sm font-semibold text-[#10150F] hover:bg-[var(--sun-light)]"
              >
                <Share2 size={16} /> Compartir
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--mood-ink)]/20 px-6 text-sm font-semibold hover:bg-[var(--sun)]/10"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado' : 'Copiar enlace'}
              </button>
            </div>
            <output className="mt-4 block min-h-5 text-sm text-[var(--page-soft)]">
              {status}
            </output>
          </>
        )}
      </Reveal>
    </footer>
  );
}
