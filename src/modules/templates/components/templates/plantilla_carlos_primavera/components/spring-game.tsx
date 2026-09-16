// biome-ignore-all lint/a11y/noNoninteractiveTabindex: The canvas game needs a focusable surface for its documented keyboard controls.
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { assets } from '../assets';
import styles from './spring-game.module.css';
import { type GardenArt, loadGardenArt } from './spring-game-art';
import {
  jumpGarden,
  newGardenGame,
  setDir,
  stepGarden,
} from './spring-game-engine';
import { createDirInput, isJumpKey, sideForKey } from './spring-game-input';
import {
  crearSonidoDelJuego,
  VICTORIA_MS,
} from './spring-game-sound';
import { drawGarden } from './spring-game-renderer';

type GameStatus = 'ready' | 'playing' | 'paused' | 'won';

export function SpringGame({ recipient }: { recipient: string }) {
  const [art, setArt] = useState<GardenArt | null>(null);
  const [assetError, setAssetError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [status, setStatus] = useState<GameStatus>('ready');
  const gameRef = useRef(newGardenGame());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  // YOU WIN no sale con la victoria: sale cuando la fanfarria termina.
  const [youWin, setYouWin] = useState(false);
  const sonido = useRef<ReturnType<typeof crearSonidoDelJuego> | null>(null);
  if (sonido.current === null) sonido.current = crearSonidoDelJuego();

  useEffect(() => {
    const audio = sonido.current;
    return () => audio?.cerrar();
  }, []);

  const startOrJump = useCallback(() => {
    if (!art) return;
    consoleRef.current?.focus({ preventScroll: true });
    if (status === 'ready' || status === 'won') {
      gameRef.current = newGardenGame();
      setStatus('playing');
    } else if (status === 'paused') {
      setStatus('playing');
    } else {
      // `jumpGarden` ignora la orden en el aire: el sonido tiene que ignorarla
      // tambien, o suena un salto que no ocurre.
      const puedeSaltar = gameRef.current.y === 0 && !gameRef.current.won;
      jumpGarden(gameRef.current);
      if (puedeSaltar) sonido.current?.salto();
    }
  }, [art, status]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Retry deliberately starts a fresh asset request after a loading failure.
  useEffect(() => {
    let cancelled = false;
    setAssetError(false);
    loadGardenArt()
      .then((assets) => {
        if (!cancelled) setArt(assets);
      })
      .catch(() => {
        if (!cancelled) setAssetError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [retry]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !art) return;
    let frame = 0;
    let previous = 0;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const draw = (now: number) => {
      const delta = previous ? (now - previous) / 1000 : 0;
      previous = now;
      if (status === 'playing') {
        let remaining = Math.min(delta, 0.25);
        while (remaining > 0) {
          const step = Math.min(remaining, 0.05);
          stepGarden(gameRef.current, step);
          remaining -= step;
        }
        if (gameRef.current.won) setStatus('won');
      }
      // Pasos solo con los pies en el suelo: en el aire no se camina.
      const juego = gameRef.current;
      sonido.current?.pasos(
        status === 'playing' && juego.dir !== 0 && juego.y === 0 && !juego.won
      );
      drawGarden(
        ctx,
        gameRef.current,
        status === 'paused' ? 0 : now / 1000,
        reduced,
        art,
        status === 'playing'
      );
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    const pause = () => {
      if (status === 'playing') setStatus('paused');
    };
    window.addEventListener('blur', pause);
    const visibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelAnimationFrame(frame);
      sonido.current?.pasos(false);
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [status, art]);

  // Victoria: suena la fanfarria y, cuando se apaga, aparece YOU WIN.
  useEffect(() => {
    if (status !== 'won') {
      setYouWin(false);
      return;
    }
    sonido.current?.pasos(false);
    sonido.current?.victoria();
    const timer = window.setTimeout(() => setYouWin(true), VICTORIA_MS + 400);
    return () => window.clearTimeout(timer);
  }, [status]);

  const input = useRef(createDirInput());

  const applyDir = useCallback(() => {
    setDir(gameRef.current, input.current.dir());
  }, []);

  const press = useCallback(
    (side: 'left' | 'right', id: string | number) => {
      input.current.press(side, id);
      applyDir();
    },
    [applyDir]
  );

  const release = useCallback(
    (side: 'left' | 'right', id: string | number) => {
      input.current.release(side, id);
      applyDir();
    },
    [applyDir]
  );

  // Al pausar, ganar o volver al inicio no puede quedar un lado apretado.
  useEffect(() => {
    if (status === 'playing') return;
    input.current.releaseAll();
    applyDir();
  }, [status, applyDir]);

  return (
    <section
      className={styles.slide}
      aria-label="Una aventura para ti"
      style={
        {
          '--corner-flowers': `url("${assets.letterCornerFlowers}")`,
        } as CSSProperties
      }
    >
      <header className={styles.heading}>
        <p>EL ÚLTIMO PASITO ES HASTA TI</p>
        <h2>Una flor, una pequeña aventura</h2>
        <span>Hay caminos que valen cada salto.</span>
      </header>
      <div
        ref={consoleRef}
        className={styles.console}
        onKeyDown={(e) => {
          if (e.target !== consoleRef.current) return;
          if (isJumpKey(e.key) && !e.repeat) {
            e.preventDefault();
            startOrJump();
          }
          const side = sideForKey(e.key);
          if (side) {
            e.preventDefault();
            press(side, e.key.toLowerCase());
          }
          if (e.key === 'Escape' && status === 'playing') setStatus('paused');
        }}
        onKeyUp={(e) => {
          const side = sideForKey(e.key);
          if (side) release(side, e.key.toLowerCase());
        }}
        tabIndex={0}
        role="application"
        aria-label="Consola. Manten ◀ o ▶ para caminar y toca A para saltar; con teclado, ← → para moverse, Espacio o ↑ para saltar y Escape para pausar"
      >
        {/* ── Top label bar ── */}
        <div className={styles.topLine}>
          <span>✿ SPRING POCKET</span>
          <span>01 / 01</span>
        </div>

        {/* ── Screen bezel ── */}
        <div className={styles.bezel}>
          <div className={styles.displayLabel}>
            <span className={styles.labelLine} />
            <span className={styles.labelText}>
              DOT MATRIX WITH STEREO SOUND
            </span>
            <span className={styles.labelLine} />
          </div>
          <div className={styles.screen} data-color={status === 'won'}>
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              aria-label="Un chico recorre un jardín con una flor amarilla para entregársela a una chica"
            />
            {youWin && (
              <div className={styles.youWin}>
                <span className={styles.youWinText}>YOU WIN</span>
                <p className={styles.youWinSub}>✿ UNA FLOR ENTREGADA ✿</p>
              </div>
            )}
            {(status === 'ready' || status === 'paused') && (
              <div className={styles.overlay}>
                <span>✿</span>
                <strong>
                  {status === 'ready' ? 'UNA FLOR PARA TI' : 'UN RESPIRO…'}
                </strong>
                <p>
                  {status === 'ready'
                    ? 'Cinco tronquitos. Un jardín. Y tú al final.'
                    : 'Tu flor te espera.'}
                </p>
                <button
                  type="button"
                  disabled={!art && !assetError}
                  onClick={() => {
                    if (assetError) {
                      setRetry((value) => value + 1);
                      return;
                    }
                    startOrJump();
                    consoleRef.current?.focus({ preventScroll: true });
                  }}
                >
                  {assetError
                    ? 'REINTENTAR CARGA'
                    : !art
                      ? 'PREPARANDO EL JARDÍN…'
                      : status === 'ready'
                        ? 'EMPEZAR'
                        : 'CONTINUAR'}
                </button>
              </div>
            )}
          </div>
          <p className={styles.battery}>
            <i /> BATTERY <span>♥ CON CARIÑO</span>
          </p>
        </div>

        {/* ── Brand ── */}
        <div className={styles.brand}>
          Flores <em>Amarillas</em>
          <span>®</span>
        </div>

        {/* ── Controls ── */}
        <div className={styles.controls}>
          {/* D-pad */}
          <div className={styles.dpad}>
            <div className={styles.dpadRow}>
              <div className={styles.dpadEmpty} />
              <button
                type="button"
                className={styles.dpadBtn}
                aria-label="Saltar"
                onPointerDown={(e) => {
                  e.preventDefault();
                  startOrJump();
                  consoleRef.current?.focus({ preventScroll: true });
                }}
              >
                ▲
              </button>
              <div className={styles.dpadEmpty} />
            </div>
            <div className={styles.dpadRow}>
              <button
                type="button"
                className={styles.dpadBtn}
                aria-label="Mover izquierda"
                onPointerDown={(e) => {
                  e.preventDefault();
                  // Capturar el puntero deja que el dedo se deslice fuera del
                  // boton sin soltar la direccion, como un pad de verdad. Es
                  // una mejora, no un requisito: si el navegador la rechaza el
                  // pad sigue andando con pointerup.
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {}
                  press('left', e.pointerId);
                  consoleRef.current?.focus({ preventScroll: true });
                }}
                onPointerUp={(e) => release('left', e.pointerId)}
                onPointerCancel={(e) => release('left', e.pointerId)}
                onLostPointerCapture={(e) => release('left', e.pointerId)}
              >
                ◀
              </button>
              <div className={styles.dpadCenter} />
              <button
                type="button"
                className={styles.dpadBtn}
                aria-label="Mover derecha"
                onPointerDown={(e) => {
                  e.preventDefault();
                  // Capturar el puntero deja que el dedo se deslice fuera del
                  // boton sin soltar la direccion, como un pad de verdad. Es
                  // una mejora, no un requisito: si el navegador la rechaza el
                  // pad sigue andando con pointerup.
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {}
                  press('right', e.pointerId);
                  consoleRef.current?.focus({ preventScroll: true });
                }}
                onPointerUp={(e) => release('right', e.pointerId)}
                onPointerCancel={(e) => release('right', e.pointerId)}
                onLostPointerCapture={(e) => release('right', e.pointerId)}
              >
                ▶
              </button>
            </div>
            <div className={styles.dpadRow}>
              <div className={styles.dpadEmpty} />
              <button
                type="button"
                className={styles.dpadBtn}
                aria-label="Abajo"
                onPointerDown={(e) => {
                  e.preventDefault();
                  consoleRef.current?.focus({ preventScroll: true });
                }}
              >
                ▼
              </button>
              <div className={styles.dpadEmpty} />
            </div>
          </div>

          <span className={styles.controlHint}>
            MANTÉN ◀ ▶
            <br />A SALTA
          </span>

          {/* A / B buttons */}
          <div className={styles.actionButtons}>
            <button
              type="button"
              aria-label="Pausar o continuar"
              onClick={() => {
                if (status === 'playing') setStatus('paused');
                else if (status === 'paused') setStatus('playing');
              }}
            >
              B
            </button>
            <button
              type="button"
              aria-label="Saltar"
              onPointerDown={(e) => {
                e.preventDefault();
                startOrJump();
                consoleRef.current?.focus({ preventScroll: true });
              }}
              onClick={(e) => {
                if (e.detail === 0) startOrJump();
              }}
            >
              A
            </button>
          </div>
        </div>

        {/* ── Bottom select/start ── */}
        <div className={styles.bottomControls}>
          <button
            type="button"
            onClick={() => {
              gameRef.current = newGardenGame();
              setStatus('ready');
            }}
          >
            SELECT
          </button>
          <button
            type="button"
            onClick={() => {
              if (status === 'playing') setStatus('paused');
              else if (status === 'paused') setStatus('playing');
            }}
          >
            START
          </button>
          <span aria-hidden="true" className={styles.speaker}>
            ▥ ▥ ▥ ▥
          </span>
        </div>
      </div>

      <div className={styles.caption} aria-live="polite">
        {status === 'won' ? (
          <>
            <h3>Todo florece cuando llego a ti ♡</h3>
            <p>
              {recipient === 'Para ti'
                ? 'Esta flor es para ti.'
                : `${recipient}, esta flor es para ti.`}
            </p>
            <button type="button" onClick={startOrJump}>
              Volver a jugar ↻
            </button>
          </>
        ) : (
          <>
            <p>Ayúdalo a llegar — salta los tronquitos.</p>
            <span>Mantén ◀ ▶ para caminar · A salta · B pausa · ~45 s</span>
          </>
        )}
      </div>
    </section>
  );
}
