import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Piano de fondo, compartido por las plantillas que lo quieran.
 *
 * Un solo archivo para todas: vive en `audio/` y no dentro de la carpeta de
 * una plantilla, porque no es de ninguna. Para cambiarlo, sube otro `piano.mp3`
 * a esa ruta del bucket.
 */
export const PIANO_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/flores-amarillas/audio/piano.mp3`;

interface PianoDeFondoProps {
  /** Si deberia estar sonando ahora mismo. */
  activo: boolean;
  /** Posicion del boton de silencio; cada plantilla lo coloca a su gusto. */
  className?: string;
}

/**
 * El elemento `<audio>` se queda montado aunque `activo` sea false: asi el
 * navegador conserva lo que ya descargo y pasar de una pantalla a otra no
 * vuelve a empezar la descarga.
 *
 * Los navegadores no dejan sonar nada hasta que la persona toca algo, asi que
 * esto solo suena si `activo` se enciende despues de un toque —entrar al
 * regalo, por ejemplo—. Si `play()` es rechazado no se insiste ni se grita en
 * consola: queda el boton para encenderlo a mano.
 *
 * Si el archivo todavia no esta subido, `onError` esconde el control y el
 * regalo sigue funcionando en silencio.
 */
export function PianoDeFondo({ activo, className }: PianoDeFondoProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [sonando, setSonando] = useState(false);
  const [silenciado, setSilenciado] = useState(false);
  const [disponible, setDisponible] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.32;
    if (activo && !silenciado) {
      // `play()` devuelve una promesa en los navegadores actuales, pero no en
      // todos —ni en jsdom—. Si no la hay, se asume que sono: no se puede
      // saber, y es mejor que romper el render entero por un `.then`.
      const intento = audio.play() as Promise<void> | undefined;
      if (intento?.then) {
        intento.then(
          () => setSonando(true),
          () => setSonando(false)
        );
      } else {
        setSonando(true);
      }
    } else {
      audio.pause();
      setSonando(false);
    }
  }, [activo, silenciado]);

  if (!disponible) return null;

  return (
    <>
      {/* biome-ignore lint/a11y/useMediaCaption: música de fondo, sin diálogo */}
      <audio
        ref={audioRef}
        src={PIANO_URL}
        loop
        preload="auto"
        onError={() => setDisponible(false)}
      />
      {activo && (
        <button
          type="button"
          onClick={() => setSilenciado((valor) => !valor)}
          aria-label={sonando ? 'Silenciar el piano' : 'Poner el piano'}
          aria-pressed={sonando}
          className={cn(
            'pointer-events-auto absolute z-[80] grid size-11 place-items-center rounded-full bg-[#082b60]/85 text-white shadow-lg backdrop-blur-sm',
            className
          )}
        >
          {sonando ? <IconoSonando /> : <IconoSilenciado />}
        </button>
      )}
    </>
  );
}

function IconoSonando() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 5a9 9 0 0 1 0 14" />
    </svg>
  );
}

function IconoSilenciado() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="m17 9 6 6" />
      <path d="m23 9-6 6" />
    </svg>
  );
}
