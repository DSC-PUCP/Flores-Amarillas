// biome-ignore-all lint/a11y/noNoninteractiveTabindex: The canvas game needs a focusable surface for its documented keyboard controls.
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './spring-game.module.css';
import { type GardenArt, loadGardenArt } from './spring-game-art';
import {
  jumpGarden,
  newGardenGame,
  setDir,
  stepGarden,
} from './spring-game-engine';
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

  const startOrJump = useCallback(() => {
    if (!art) return;
    consoleRef.current?.focus({ preventScroll: true });
    if (status === 'ready' || status === 'won') {
      gameRef.current = newGardenGame();
      setStatus('playing');
    } else if (status === 'paused') {
      setStatus('playing');
    } else {
      jumpGarden(gameRef.current);
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
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [status, art]);

  const heldKeys = useRef<Set<string>>(new Set());

  // Keyboard: left/right held keys update dir each frame via interval
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => {
      const keys = heldKeys.current;
      if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
        setDir(gameRef.current, 1);
      } else if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) {
        setDir(gameRef.current, -1);
      } else {
        setDir(gameRef.current, 0);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <section className={styles.slide} aria-label="Una aventura para ti">
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
          if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key) && !e.repeat) {
            e.preventDefault();
            startOrJump();
          }
          if (['ArrowRight', 'd', 'D', 'ArrowLeft', 'a', 'A'].includes(e.key)) {
            e.preventDefault();
            heldKeys.current.add(e.key);
            if (['ArrowRight', 'd', 'D'].includes(e.key)) {
              setDir(gameRef.current, 1);
            } else {
              setDir(gameRef.current, -1);
            }
          }
          if (e.key === 'Escape' && status === 'playing') setStatus('paused');
        }}
        onKeyUp={(e) => {
          heldKeys.current.delete(e.key);
          if (['ArrowRight', 'd', 'D', 'ArrowLeft', 'a', 'A'].includes(e.key)) {
            const keys = heldKeys.current;
            if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) {
              setDir(gameRef.current, 1);
            } else if (
              keys.has('ArrowLeft') ||
              keys.has('a') ||
              keys.has('A')
            ) {
              setDir(gameRef.current, -1);
            } else {
              setDir(gameRef.current, 0);
            }
          }
        }}
        tabIndex={0}
        role="application"
        aria-label="Consola. ← → para moverse; Espacio o ↑ para saltar; Escape para pausar"
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
                    consoleRef.current?.focus();
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
                  consoleRef.current?.focus();
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
                  setDir(gameRef.current, -1);
                  consoleRef.current?.focus();
                }}
                onPointerUp={() => setDir(gameRef.current, 0)}
                onPointerLeave={() => setDir(gameRef.current, 0)}
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
                  setDir(gameRef.current, 1);
                  consoleRef.current?.focus();
                }}
                onPointerUp={() => setDir(gameRef.current, 0)}
                onPointerLeave={() => setDir(gameRef.current, 0)}
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
                  consoleRef.current?.focus();
                }}
              >
                ▼
              </button>
              <div className={styles.dpadEmpty} />
            </div>
          </div>

          <span className={styles.controlHint}>
            ← → MOVER
            <br />↑ SALTAR
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
                consoleRef.current?.focus();
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
            <span>← → moverse · ESPACIO / ↑ saltar · B pausa · ~45 s</span>
          </>
        )}
      </div>
    </section>
  );
}
