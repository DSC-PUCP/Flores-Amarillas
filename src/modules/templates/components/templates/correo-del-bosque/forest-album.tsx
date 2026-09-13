import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './forest-album.module.css';

interface ForestAlbumProps {
  photos: string[];
  captions: string[];
  recipient: string;
  onClose: () => void;
}

type Direction = 'next' | 'previous';
type Cover = 'closed' | 'opening' | 'open' | 'closing';
type Turn = { direction: Direction; progress: number; gripY: number };
type Memory = { photo: string; caption: string; botanical: boolean };

const SPECIMENS = [
  'Helianthus annuus',
  'Una pequeña primavera',
  'Luz de los días',
];
const STRIPS = 12;
const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

/** A reversible, two-sided book. The last leaf never closes the cover. */
export function ForestAlbum({
  photos,
  captions,
  recipient,
  onClose,
}: ForestAlbumProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const coverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const turnRef = useRef<Turn | null>(null);
  const dragRef = useRef<{
    id: number;
    startX: number;
    startTime: number;
    width: number;
  } | null>(null);
  const [cover, setCover] = useState<Cover>('closed');
  const [pageIndex, setPageIndex] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [pageWidth, setPageWidth] = useState(400);
  const [mobile, setMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const memories = useMemo<Memory[]>(() => {
    const images = photos.filter((photo) => photo.trim()).slice(0, 12);
    if (!images.length) {
      return [
        {
          photo: '/images/sunflower-bouquet.webp',
          caption: captions[0] || 'Hay personas que hacen que todo florezca.',
          botanical: true,
        },
        {
          photo: '/images/sunflower-bouquet.webp',
          caption: captions[1] || 'Y luego estás tú, que también traes el sol.',
          botanical: true,
        },
      ];
    }
    return images.map((photo, index) => ({
      photo,
      caption: captions[index] || 'Un instante que quiero guardar contigo.',
      botanical: false,
    }));
  }, [photos, captions]);

  const updateTurn = useCallback((value: Turn | null) => {
    turnRef.current = value;
    setTurn(value);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const viewport = window.matchMedia('(max-width: 720px)');
    const measure = () => {
      const width = bookRef.current?.getBoundingClientRect().width ?? 800;
      setMobile(viewport.matches);
      setPageWidth(viewport.matches ? width : width / 2);
      setReducedMotion(motion.matches);
    };
    const observer = new ResizeObserver(measure);
    if (bookRef.current) observer.observe(bookRef.current);
    motion.addEventListener('change', measure);
    viewport.addEventListener('change', measure);
    measure();
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', measure);
      viewport.removeEventListener('change', measure);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (coverTimerRef.current) clearTimeout(coverTimerRef.current);
      dialog?.close();
    };
  }, []);

  useEffect(() => {
    setPageIndex((index) => Math.min(index, memories.length));
  }, [memories.length]);

  const settleTurn = useCallback(
    (commit: boolean) => {
      const initial = turnRef.current;
      if (!initial) return;
      const target = commit ? 1 : 0;
      const duration = reducedMotion
        ? 1
        : 300 + Math.abs(target - initial.progress) * 370;
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = clamp((now - start) / duration);
        const eased = 1 - (1 - elapsed) ** 3;
        updateTurn({
          ...initial,
          progress: initial.progress + (target - initial.progress) * eased,
        });
        if (elapsed < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          frameRef.current = null;
          if (commit) {
            setPageIndex((index) =>
              clamp(
                index + (initial.direction === 'next' ? 1 : -1),
                0,
                memories.length
              )
            );
          }
          updateTurn(null);
        }
      };
      frameRef.current = requestAnimationFrame(tick);
    },
    [memories.length, reducedMotion, updateTurn]
  );

  const canTurn = (direction: Direction) =>
    cover === 'open' &&
    !turnRef.current &&
    (direction === 'next' ? pageIndex < memories.length : pageIndex > 0);

  const turnBy = (direction: Direction) => {
    if (!canTurn(direction)) return;
    updateTurn({ direction, progress: 0, gripY: 0.75 });
    settleTurn(true);
  };

  const moveCover = () => {
    if (turnRef.current || (cover !== 'closed' && cover !== 'open')) return;
    const opening = cover === 'closed';
    setCover(opening ? 'opening' : 'closing');
    coverTimerRef.current = setTimeout(
      () => setCover(opening ? 'open' : 'closed'),
      reducedMotion ? 30 : 1120
    );
  };

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary || cover !== 'open') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const direction: Direction =
      x < rect.width * (mobile ? 0.36 : 0.5) ? 'previous' : 'next';
    if (!canTurn(direction)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startTime: performance.now(),
      width: pageWidth,
    };
    updateTurn({
      direction,
      progress: 0,
      gripY: clamp((event.clientY - rect.top) / rect.height),
    });
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const active = turnRef.current;
    if (!drag || drag.id !== event.pointerId || !active) return;
    const movement =
      (event.clientX - drag.startX) * (active.direction === 'next' ? -1 : 1);
    updateTurn({ ...active, progress: clamp(movement / drag.width) });
  };

  const endDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
    cancelled = false
  ) => {
    const drag = dragRef.current;
    const active = turnRef.current;
    if (!drag || drag.id !== event.pointerId || !active) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const speed =
      (active.progress * drag.width) /
      Math.max(1, performance.now() - drag.startTime);
    settleTurn(
      !cancelled &&
        (active.progress > 0.28 || (active.progress > 0.07 && speed > 0.65))
    );
  };

  const lastPage = pageIndex === memories.length;
  const turningIndex =
    turn?.direction === 'previous' ? pageIndex - 1 : pageIndex;
  const leftIndex =
    turn?.direction === 'previous' ? pageIndex - 2 : pageIndex - 1;
  const rightIndex = turn?.direction === 'next' ? pageIndex + 1 : pageIndex;
  const activeMemory = memories[turningIndex];
  const leftMemory = memories[leftIndex];
  const rightMemory = memories[rightIndex];
  const paperProgress = turn
    ? turn.direction === 'next'
      ? turn.progress
      : 1 - turn.progress
    : 0;
  let stripX = 0;
  let stripZ = 0;

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles.room}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>EL ARCHIVO DE LAS COSAS BONITAS</p>
            <h2 id={titleId}>Aquí, el tiempo florece.</h2>
          </div>
          <button
            type="button"
            className={styles.exit}
            onClick={onClose}
            aria-label="Volver al jardín"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className={styles.stage}>
          <div
            ref={bookRef}
            className={styles.book}
            data-cover={cover}
            data-turning={Boolean(turn)}
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={(event) => endDrag(event)}
            onPointerCancel={(event) => endDrag(event, true)}
            onLostPointerCapture={(event) => {
              if (dragRef.current) endDrag(event, true);
            }}
          >
            <div className={styles.binding} aria-hidden="true" />
            <div className={styles.pageEdges} aria-hidden="true" />
            <div className={styles.stationaryLeft}>
              {leftMemory ? (
                <MemoryBack
                  memory={leftMemory}
                  index={leftIndex}
                  recipient={recipient}
                />
              ) : (
                <Endpaper recipient={recipient} />
              )}
            </div>
            <div className={styles.stationaryRight}>
              {rightMemory ? (
                <MemoryFront memory={rightMemory} index={rightIndex} />
              ) : (
                <Endpaper recipient={recipient} final />
              )}
            </div>
            <div className={styles.gutter} aria-hidden="true" />

            {turn && activeMemory && (
              <div
                className={styles.turningLeaf}
                aria-hidden="true"
                style={
                  {
                    '--grip-tilt': `${(turn.gripY - 0.5) * Math.sin(paperProgress * Math.PI) * 2}deg`,
                  } as CSSProperties
                }
              >
                {Array.from({ length: STRIPS }, (_, index) => {
                  const width = pageWidth / STRIPS;
                  const curvature =
                    Math.sin(paperProgress * Math.PI) *
                    Math.sin(((index + 0.5) / STRIPS) * Math.PI * 0.8) *
                    0.52;
                  const angle = -Math.PI * paperProgress + curvature;
                  const x = stripX;
                  const z = stripZ;
                  stripX += Math.cos(angle) * width;
                  stripZ -= Math.sin(angle) * width;
                  const stripStyle = {
                    width: `${width + 0.65}px`,
                    transform: `translate3d(${x}px, 0, ${z}px) rotateY(${angle}rad)`,
                    '--paper-shade': Math.abs(Math.sin(angle)) * 0.17,
                  } as CSSProperties;
                  return (
                    <div
                      className={styles.paperStrip}
                      key={index}
                      style={stripStyle}
                    >
                      <div className={styles.paperFront}>
                        <div
                          className={styles.stripContent}
                          style={{ width: pageWidth, left: -index * width }}
                        >
                          <MemoryFront
                            memory={activeMemory}
                            index={turningIndex}
                          />
                        </div>
                      </div>
                      <div className={styles.paperBack}>
                        <div
                          className={styles.stripContent}
                          style={{
                            width: pageWidth,
                            left: -(STRIPS - 1 - index) * width,
                          }}
                        >
                          <MemoryBack
                            memory={activeMemory}
                            index={turningIndex}
                            recipient={recipient}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              className={styles.cover}
              onClick={(event) => {
                event.stopPropagation();
                if (cover === 'closed') moveCover();
              }}
              disabled={cover !== 'closed'}
              aria-label={`Abrir el herbario de ${recipient}`}
              aria-hidden={cover !== 'closed'}
              tabIndex={cover === 'closed' ? 0 : -1}
            >
              <span className={styles.coverFront}>
                <span className={styles.coverFrame} />
                <span className={styles.coverTopline}>
                  CORREO DEL BOSQUE · VOL. I
                </span>
                <span className={styles.coverBotanic}>
                  <BotanicalMark />
                </span>
                <span className={styles.coverTitle}>
                  Donde guardo
                  <br />
                  la primavera
                </span>
                <span className={styles.coverSubtitle}>
                  UN PEQUEÑO HERBARIO PARA
                </span>
                <span className={styles.coverName}>{recipient}</span>
                <span className={styles.coverHint}>
                  Toca la tapa para abrirlo
                </span>
              </span>
              <span className={styles.coverBack}>
                <Endpaper recipient={recipient} />
              </span>
            </button>
          </div>
        </div>

        <footer className={styles.footer}>
          {cover === 'open' ? (
            <>
              <div className={styles.navigation}>
                <button
                  type="button"
                  onClick={() => turnBy('previous')}
                  disabled={pageIndex === 0 || Boolean(turn)}
                  aria-label="Volver a la hoja anterior"
                >
                  ←
                </button>
                <p aria-live="polite">
                  {lastPage
                    ? 'Cada final guarda un comienzo.'
                    : `${String(pageIndex + 1).padStart(2, '0')} / ${String(memories.length).padStart(2, '0')}`}
                </p>
                <button
                  type="button"
                  onClick={() => turnBy('next')}
                  disabled={lastPage || Boolean(turn)}
                  aria-label="Pasar a la siguiente hoja"
                >
                  →
                </button>
              </div>
              <p className={styles.gestureHint}>
                {lastPage
                  ? 'Puedes volver a hojearlo o cerrar las tapas.'
                  : 'Desliza desde el borde. Las flores saben esperar.'}
              </p>
              <button
                type="button"
                className={styles.closeCover}
                onClick={moveCover}
                disabled={Boolean(turn)}
              >
                Cerrar las tapas
              </button>
            </>
          ) : (
            <p className={styles.closedHint}>
              {cover === 'closed'
                ? 'Hay recuerdos que merecen un lugar entre las flores.'
                : 'Un momento para guardar, sin prisa.'}
            </p>
          )}
        </footer>
      </div>
    </dialog>
  );
}

function MemoryFront({ memory, index }: { memory: Memory; index: number }) {
  return (
    <div className={`${styles.page} ${styles.photoPage}`}>
      <div className={styles.pageHeader}>
        <span>COLECCIÓN DE INSTANTES</span>
        <span>✳</span>
      </div>
      <div className={styles.photoMount} data-botanical={memory.botanical}>
        <span className={styles.tape} />
        <img
          src={memory.photo}
          alt={
            memory.botanical
              ? 'Ramo de flores amarillas conservado en el herbario'
              : `Recuerdo ${index + 1}: ${memory.caption}`
          }
          draggable={false}
        />
        <span className={styles.photoDate}>un día para recordar</span>
      </div>
      <p className={styles.photoCaption}>{memory.caption}</p>
      <div className={styles.pageNumber}>
        <span>florecer contigo</span>
        <span>{String(index * 2 + 1).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

function MemoryBack({
  memory,
  index,
  recipient,
}: {
  memory: Memory;
  index: number;
  recipient: string;
}) {
  return (
    <div className={`${styles.page} ${styles.notesPage}`}>
      <div className={styles.pageHeader}>
        <span>PEQUEÑOS HALLAZGOS</span>
        <span>HERB. {String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className={styles.pressedFlower}>
        <BotanicalMark />
        <span className={styles.specimenTape} />
      </div>
      <p className={styles.latin}>{SPECIMENS[index % SPECIMENS.length]}</p>
      <p className={styles.backQuote}>“{memory.caption}”</p>
      <p className={styles.note}>
        Recogido con cariño.
        <br />
        Conservado para {recipient}.
      </p>
      <div className={styles.pageNumber}>
        <span>las cosas que se quedan</span>
        <span>{String(index * 2 + 2).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

function Endpaper({
  recipient,
  final = false,
}: {
  recipient: string;
  final?: boolean;
}) {
  return (
    <div className={`${styles.page} ${styles.endpaper}`}>
      <span className={styles.endpaperBorder} />
      <span className={styles.endpaperEmblem}>✳</span>
      <p className={styles.eyebrow}>
        {final ? 'NO ES UN FINAL' : 'ESTE PEQUEÑO MUNDO ES DE'}
      </p>
      <p className={styles.endpaperTitle}>
        {final ? 'Todavía quedan muchas primaveras.' : recipient}
      </p>
      <span className={styles.endpaperLine} />
      <p className={styles.endpaperNote}>
        {final
          ? 'Por todas las cosas bonitas que aún nos esperan.'
          : 'Flores, instantes y otras formas de decir: qué bonito que existas.'}
      </p>
      <span className={styles.endpaperBottom}>
        GUARDAR EN UN LUGAR CERCA DEL CORAZÓN
      </span>
    </div>
  );
}

function BotanicalMark() {
  return (
    <svg viewBox="0 0 160 230" fill="none" aria-hidden="true">
      <path
        d="M77 221C77 176 89 117 83 73M80 161C62 143 47 137 32 136M83 131C105 117 116 110 131 89M79 185C100 165 115 163 131 151"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M76 170C42 171 36 150 32 136C62 135 76 148 76 170ZM84 131C103 102 118 92 131 89C135 112 114 132 84 131ZM79 185C97 163 114 152 131 151C128 177 109 193 79 185Z"
        fill="currentColor"
        opacity=".38"
      />
      {Array.from({ length: 12 }, (_, index) => (
        <ellipse
          key={index}
          cx="82"
          cy="41"
          rx="7.5"
          ry="25"
          transform={`rotate(${index * 30} 82 67)`}
          fill="currentColor"
          opacity={index % 2 ? '.75' : '.95'}
        />
      ))}
      <circle cx="82" cy="67" r="15" fill="currentColor" />
      <circle
        cx="82"
        cy="67"
        r="9"
        stroke="var(--album-flower-center, #e2bd70)"
        strokeWidth=".8"
        strokeDasharray="1 3"
      />
    </svg>
  );
}
