/**
 * Efectos de sonido del juego, sintetizados.
 *
 * No hay archivos que subir ni que descargar: son ondas cuadradas generadas en
 * el momento, que es exactamente de lo que estaban hechas las consolas que
 * imita esta pantalla. Tambien evita el problema de siempre —un mp3 que falta
 * y un juego mudo— y no pesa nada.
 *
 * El AudioContext se crea en el primer sonido y no antes: crearlo al cargar la
 * pagina lo deja en estado "suspended" por la politica de autoplay, y ademas
 * en las pruebas (jsdom) no existe la clase.
 */

/** Duracion aproximada de la fanfarria, para saber cuando mostrar YOU WIN. */
export const VICTORIA_MS = 2000;

type Ctx = AudioContext & { _cerrado?: boolean };

const PASO_MS = 165;

export interface SonidoDelJuego {
  /** Enciende o apaga los pasos. Repetir la misma orden no hace nada. */
  pasos(activo: boolean): void;
  salto(): void;
  victoria(): void;
  /** Corta todo y suelta el contexto. */
  cerrar(): void;
}

export function crearSonidoDelJuego(): SonidoDelJuego {
  let ctx: Ctx | null = null;
  let pasosTimer: number | null = null;
  let cerrado = false;

  const abrir = (): Ctx | null => {
    if (cerrado) return null;
    if (typeof window === 'undefined') return null;
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return null;
    ctx ??= new AudioCtor() as Ctx;
    // Tras un toque el navegador deja reanudarlo; si aun no lo hubo, el
    // sonido simplemente no se oye y no pasa nada mas.
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  };

  /**
   * Una nota cuadrada con caida propia.
   *
   * El envelope no es un adorno: sin la subida y la bajada, cada nota empieza
   * y termina con un chasquido, que es el ruido tipico de sintetizar a mano.
   */
  const nota = (
    frecuencia: number,
    inicio: number,
    duracion: number,
    volumen: number,
    hasta?: number
  ) => {
    const audio = abrir();
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(frecuencia, inicio);
    if (hasta !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(hasta, inicio + duracion);
    }
    gain.gain.setValueAtTime(0, inicio);
    gain.gain.linearRampToValueAtTime(volumen, inicio + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, inicio + duracion);
    osc.connect(gain).connect(audio.destination);
    osc.start(inicio);
    osc.stop(inicio + duracion + 0.02);
  };

  const paso = () => {
    const audio = abrir();
    if (!audio) return;
    // Dos alturas alternas: un solo tono repetido suena a goteo, no a pasos.
    const grave = Math.random() < 0.5;
    nota(grave ? 118 : 96, audio.currentTime, 0.055, 0.07);
  };

  return {
    pasos(activo) {
      if (activo) {
        if (pasosTimer !== null || cerrado) return;
        paso();
        pasosTimer = window.setInterval(paso, PASO_MS);
      } else if (pasosTimer !== null) {
        window.clearInterval(pasosTimer);
        pasosTimer = null;
      }
    },

    salto() {
      const audio = abrir();
      if (!audio) return;
      // Barrido hacia arriba: el salto de toda la vida.
      nota(320, audio.currentTime, 0.17, 0.09, 760);
    },

    victoria() {
      const audio = abrir();
      if (!audio) return;
      const t = audio.currentTime;
      // Do - Mi - Sol - Do agudo, y el ultimo sostenido: fanfarria de las de
      // "lo lograste", en el mismo idioma que el resto del juego.
      const arpegio = [523.25, 659.25, 783.99, 1046.5];
      arpegio.forEach((frecuencia, i) => {
        nota(frecuencia, t + i * 0.13, 0.12, 0.085);
      });
      nota(1046.5, t + 0.58, 0.55, 0.095);
      nota(1318.5, t + 1.16, 0.75, 0.085);
    },

    cerrar() {
      cerrado = true;
      if (pasosTimer !== null) {
        window.clearInterval(pasosTimer);
        pasosTimer = null;
      }
      if (ctx && !ctx._cerrado) {
        ctx._cerrado = true;
        void ctx.close().catch(() => undefined);
      }
      ctx = null;
    },
  };
}
