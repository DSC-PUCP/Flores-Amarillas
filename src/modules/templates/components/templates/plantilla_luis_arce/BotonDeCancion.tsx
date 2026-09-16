import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BotonDeCancionProps {
  sonando: boolean;
  onToggle: () => void;
  /** Titulo del fragmento, para que el boton diga que se esta silenciando. */
  titulo?: string;
  className?: string;
}

/**
 * Silenciar o volver a poner la cancion del regalo 2.
 *
 * Ocupa el mismo sitio y tiene la misma pinta que el boton del piano, porque
 * hace lo mismo: es el control del sonido del regalo. Cuando la cancion toma el
 * relevo, el piano ya no vuelve, asi que no hay dos botones a la vez.
 */
export function BotonDeCancion({
  sonando,
  onToggle,
  titulo,
  className,
}: BotonDeCancionProps) {
  const que = titulo ? `«${titulo}»` : 'la canción';

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-label={sonando ? `Silenciar ${que}` : `Poner ${que}`}
      aria-pressed={sonando}
      className={cn(
        'pointer-events-auto absolute z-[80] grid size-11 place-items-center rounded-full bg-[#082b60]/85 text-white shadow-lg backdrop-blur-sm',
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.92 }}
    >
      {/* Un disco: lo que suena aqui es su cancion, no el piano de fondo. */}
      <svg
        aria-hidden="true"
        className={cn('size-5', sonando && 'motion-safe:animate-spin')}
        style={sonando ? { animationDuration: '3s' } : undefined}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2.5" />
        {!sonando && <path d="m4 20 16-16" strokeWidth={2.4} />}
      </svg>
    </motion.button>
  );
}
