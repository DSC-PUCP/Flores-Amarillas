import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { piano } from './assets';

/**
 * Piano de fondo para todo el recorrido, desde la segunda pantalla.
 *
 * Arranca ahi y no antes por una razon tecnica antes que estetica: los
 * navegadores no dejan sonar nada hasta que la persona toca algo, y el boton
 * "¡Abrir!" de la primera pantalla es justo ese toque. Montarlo antes solo
 * conseguiria que `play()` fuera rechazado.
 *
 * Si el archivo todavia no esta subido, `onError` apaga el control y no queda
 * ni un boton muerto ni un error en consola.
 */
export function PianoDeFondo() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [sonando, setSonando] = useState(false);
  const [disponible, setDisponible] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;
    // `play()` devuelve una promesa que el navegador rechaza si considera que
    // no hubo gesto. No es un error que haya que gritar: el control queda a la
    // vista y quien quiera musica la enciende.
    audio.play().then(
      () => setSonando(true),
      () => setSonando(false)
    );
  }, []);

  const alternar = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(
        () => setSonando(true),
        () => setSonando(false)
      );
    } else {
      audio.pause();
      setSonando(false);
    }
  };

  if (!disponible) return null;

  return (
    <>
      {/* biome-ignore lint/a11y/useMediaCaption: música de fondo, sin diálogo */}
      <audio
        ref={audioRef}
        src={piano}
        loop
        preload="auto"
        onError={() => setDisponible(false)}
      />
      <motion.button
        type="button"
        onClick={alternar}
        aria-label={sonando ? 'Silenciar el piano' : 'Poner el piano'}
        aria-pressed={sonando}
        /*
         * Por encima de los controles invisibles de la plantilla (z-50) y del
         * boton de volver (z-70), o el toque nunca llegaria aqui. Por debajo
         * de la capa de pago, que manda sobre todo.
         */
        className="pointer-events-auto absolute right-5 bottom-24 z-[80] grid size-11 place-items-center rounded-full bg-[#082b60]/85 text-white shadow-lg backdrop-blur-sm md:right-8 md:bottom-28"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.92 }}
      >
        {sonando ? <IconoSonando /> : <IconoSilenciado />}
      </motion.button>
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
