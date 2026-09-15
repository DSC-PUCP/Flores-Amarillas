import { Heart, MoveRight, RotateCcw, Sparkles } from 'lucide-react';
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useRef,
  useState,
} from 'react';
import { assets } from '../assets';
import styles from './spring-paper-card.module.css';

const flowers = [
  { x: -8, y: -8, size: 56, angle: -18 },
  { x: 28, y: -9, size: 48, angle: 16 },
  { x: 57, y: 3, size: 39, angle: -12 },
  { x: -12, y: 29, size: 52, angle: 25 },
  { x: 23, y: 25, size: 49, angle: -30 },
  { x: 3, y: 63, size: 41, angle: 10 },
  { x: 48, y: 49, size: 35, angle: 22 },
];

export function SpringPaperCard({ message }: { message: string }) {
  const [progress, setProgress] = useState(0);
  const paper = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; progress: number; distance: number } | null>(
    null
  );
  const complete = progress >= 0.98;
  const phrase = message.trim() || 'Mi lugar favorito siempre será a tu lado.';

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const width = paper.current?.getBoundingClientRect().width ?? 1;
    drag.current = { x: event.clientX, progress, distance: width * 0.4 };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    setProgress(
      Math.min(
        1,
        Math.max(
          0,
          drag.current.progress +
            (event.clientX - drag.current.x) / drag.current.distance
        )
      )
    );
  }

  function stopDrag() {
    drag.current = null;
  }

  function keyboardSlide(event: KeyboardEvent<HTMLButtonElement>) {
    const values: Record<string, number> = {
      ArrowRight: Math.min(1, progress + 0.1),
      ArrowUp: Math.min(1, progress + 0.1),
      ArrowLeft: Math.max(0, progress - 0.1),
      ArrowDown: Math.max(0, progress - 0.1),
      Home: 0,
      End: 1,
    };
    if (values[event.key] !== undefined) {
      event.preventDefault();
      setProgress(values[event.key]);
    }
  }

  return (
    <section className={styles.slide} aria-label="Nosotros dos">
      <div className={styles.flowers} aria-hidden="true">
        {['top', 'bottom'].map((corner) => (
          <div
            key={corner}
            className={styles.flowerCluster}
            data-corner={corner}
          >
            {flowers.map((flower, index) => (
              <img
                key={`${flower.x}-${flower.y}`}
                src={assets.cardFlower}
                alt=""
                className={styles.flower}
                style={
                  {
                    left: `${flower.x}%`,
                    top: `${flower.y}%`,
                    '--flower-size': `${flower.size}%`,
                    '--angle': `${flower.angle}deg`,
                    '--delay': `${index * 0.19 + (corner === 'bottom' ? 0.12 : 0)}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        ))}
      </div>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>UN PEQUEÑO GESTO, TODO MI CARIÑO</p>
        <h2 tabIndex={-1}>Nosotros dos</h2>
      </header>
      <div className={styles.gingham}>
        <span className={styles.tape} aria-hidden="true" />
        <div
          ref={paper}
          className={styles.paper}
          style={{ '--progress': progress } as CSSProperties}
          data-complete={complete}
        >
          {/* Doodle decorations */}
          <Heart className={styles.doodleHeart} aria-hidden="true" />
          <Sparkles className={styles.doodleSpark} aria-hidden="true" />
          <span className={styles.stitch} aria-hidden="true" />

          {/* ── Layer 1 (back): text window ── */}
          <div className={styles.window}>
            <p
              className={styles.phrase}
              style={{
                fontSize:
                  phrase.length > 140
                    ? 'clamp(.85rem, 1.8vw, 1.25rem)'
                    : undefined,
              }}
              aria-hidden={!complete}
            >
              {phrase}
            </p>
            {/* Cover that slides right to reveal text */}
            <div className={styles.cover} aria-hidden="true">
              <Heart size={24} />
            </div>
          </div>

          {/* ── Layer 2 (middle): boy moves right toward girl ── */}
          <div className={styles.linkage} aria-hidden="true" />
          <img
            className={styles.boy}
            src={assets.cardBoy}
            alt="Chico con un ramo de flores amarillas"
            draggable={false}
          />

          {/* ── Handle: paper strip extending right with heart ── */}
          <button
            type="button"
            role="slider"
            aria-label="Desliza el corazón para juntarlos y descubrir la frase"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-valuetext={
              complete
                ? 'Juntos. Frase descubierta.'
                : `${Math.round(progress * 100)} por ciento descubierto`
            }
            aria-controls="spring-card-phrase"
            className={styles.handle}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            onLostPointerCapture={stopDrag}
            onKeyDown={keyboardSlide}
          >
            <Heart fill="#fdd018" strokeWidth={1.6} aria-hidden="true" />
          </button>

          {/* ── Layer 3 (front): girl fixed on the right ── */}
          <img
            className={styles.girl}
            src={assets.cardGirl}
            alt="Chica esperando con ilusión"
            draggable={false}
          />

          {/* Decorations on complete */}
          <div className={styles.joinedHearts} aria-hidden="true">
            <Heart fill="#fdd018" />
            <Heart fill="#fdd018" />
          </div>
          {/* Floating yellow heart particles */}
          <div className={styles.particles} aria-hidden="true">
            {[
              {
                id: 'p1',
                tx: '-18px',
                ty: '-12px',
                tyEnd: '-52px',
                dur: '1.7s',
                delay: '0s',
                size: 10,
              },
              {
                id: 'p2',
                tx: '14px',
                ty: '-8px',
                tyEnd: '-58px',
                dur: '2.0s',
                delay: '0.2s',
                size: 8,
              },
              {
                id: 'p3',
                tx: '-30px',
                ty: '6px',
                tyEnd: '-44px',
                dur: '1.5s',
                delay: '0.4s',
                size: 12,
              },
              {
                id: 'p4',
                tx: '26px',
                ty: '10px',
                tyEnd: '-48px',
                dur: '2.2s',
                delay: '0.1s',
                size: 9,
              },
              {
                id: 'p5',
                tx: '-8px',
                ty: '-20px',
                tyEnd: '-62px',
                dur: '1.9s',
                delay: '0.55s',
                size: 11,
              },
              {
                id: 'p6',
                tx: '38px',
                ty: '-14px',
                tyEnd: '-50px',
                dur: '1.6s',
                delay: '0.3s',
                size: 7,
              },
              {
                id: 'p7',
                tx: '-24px',
                ty: '18px',
                tyEnd: '-40px',
                dur: '2.1s',
                delay: '0.7s',
                size: 10,
              },
              {
                id: 'p8',
                tx: '10px',
                ty: '-4px',
                tyEnd: '-56px',
                dur: '1.8s',
                delay: '0.15s',
                size: 8,
              },
              {
                id: 'p9',
                tx: '-40px',
                ty: '-6px',
                tyEnd: '-46px',
                dur: '1.4s',
                delay: '0.5s',
                size: 9,
              },
              {
                id: 'p10',
                tx: '22px',
                ty: '14px',
                tyEnd: '-54px',
                dur: '2.3s',
                delay: '0.35s',
                size: 11,
              },
            ].map((p) => (
              <Heart
                key={p.id}
                className={styles.particle}
                fill="#fdd018"
                stroke="none"
                style={
                  {
                    width: p.size,
                    height: p.size,
                    '--tx': p.tx,
                    '--ty': p.ty,
                    '--ty-end': p.tyEnd,
                    '--dur': p.dur,
                    '--delay': p.delay,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>
      <div className={styles.instructions}>
        <p>
          {complete ? 'Así, cerquita de ti.' : 'Desliza el corazón'}{' '}
          {!complete && <MoveRight size={25} aria-hidden="true" />}
        </p>
        <span>
          {complete
            ? 'Hay distancias que un pequeño gesto puede borrar.'
            : 'Jálalo hacia la derecha y descubre lo que guardé para ti.'}
        </span>
        <button
          type="button"
          onClick={() => setProgress(0)}
          disabled={progress === 0}
        >
          <RotateCcw size={14} /> Volver a empezar
        </button>
      </div>
      <p id="spring-card-phrase" className={styles.srOnly} aria-live="polite">
        {complete ? phrase : ''}
      </p>
    </section>
  );
}
