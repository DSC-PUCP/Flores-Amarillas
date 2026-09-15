import {
  Flower2,
  Heart,
  ImageIcon,
  MoveRight,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useRef,
  useState,
} from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { assets } from '../assets';
import styles from './spring-camera.module.css';
import type { CameraMemory } from './spring-camera-data';

function MemoryImage({
  memory,
  enlarged = false,
}: {
  memory: CameraMemory;
  enlarged?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return memory.image && !failed ? (
    <img
      src={memory.image}
      alt={`Recuerdo ${memory.id}`}
      className={enlarged ? styles.enlargedImage : styles.image}
      draggable={false}
      onError={() => setFailed(true)}
    />
  ) : (
    <span className={styles.emptyPhoto}>
      <ImageIcon size={30} aria-hidden="true" />
      <span>Recuerdo {memory.id}</span>
      <small>
        {failed ? 'No se pudo cargar esta foto' : 'Foto por completar'}
      </small>
    </span>
  );
}

export function SpringCamera({
  memories,
  message,
}: {
  memories: CameraMemory[];
  message: string;
}) {
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<CameraMemory | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; value: number; distance: number } | null>(
    null
  );
  const complete = progress === 1;
  const photos = Array.from(
    { length: 4 },
    (_, index) => memories[index] ?? { id: index + 1, image: '', detail: '' }
  );
  const finalMessage =
    message.trim() || 'Hay momentos que se quedan para siempre.';

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    const railWidth = rail.current?.getBoundingClientRect().width ?? 1;
    const handleWidth = event.currentTarget.getBoundingClientRect().width;
    drag.current = {
      x: event.clientX,
      value: progress,
      distance: Math.max(1, railWidth - handleWidth),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return;
    setProgress(
      Math.min(
        1,
        Math.max(
          0,
          drag.current.value +
            (event.clientX - drag.current.x) / drag.current.distance
        )
      )
    );
  }

  function stopDrag() {
    drag.current = null;
  }

  function keyboardDrag(event: KeyboardEvent<HTMLButtonElement>) {
    if (
      [
        'ArrowRight',
        'ArrowUp',
        'ArrowLeft',
        'ArrowDown',
        'Home',
        'End',
      ].includes(event.key)
    ) {
      event.preventDefault();
      if (event.key === 'Home') setProgress(0);
      else if (event.key === 'End') setProgress(1);
      else
        setProgress((value) =>
          Math.min(
            1,
            Math.max(
              0,
              value +
                (event.key === 'ArrowRight' || event.key === 'ArrowUp'
                  ? 0.25
                  : -0.25)
            )
          )
        );
    }
  }

  return (
    <section className={styles.slide} aria-label="Recuerditos nuestros">
      <div className={styles.flowers} aria-hidden="true">
        {['top', 'bottom'].map((corner) => (
          <div
            key={corner}
            className={styles.flowerCluster}
            data-corner={corner}
          >
            {[
              { x: -8, y: -8, size: 56, angle: -18 },
              { x: 28, y: -9, size: 48, angle: 16 },
              { x: 57, y: 3, size: 39, angle: -12 },
              { x: -12, y: 29, size: 52, angle: 25 },
              { x: 23, y: 25, size: 49, angle: -30 },
              { x: 3, y: 63, size: 41, angle: 10 },
              { x: 48, y: 49, size: 35, angle: 22 },
            ].map((flower, index) => (
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
        <p>CUATRO INSTANTES, UNA MISMA HISTORIA</p>
        <h2>Recuerditos nuestros</h2>
      </header>
      <div
        className={styles.stage}
        style={{ '--progress': progress } as CSSProperties}
      >
        <div className={styles.camera}>
          <img
            src={assets.memoryCamera}
            alt="Cámara de recuerdos decorada con flores amarillas"
            draggable={false}
          />
        </div>
        <div className={styles.printArea}>
          <section
            className={styles.photoStrip}
            aria-label="Nuestros cuatro recuerdos"
          >
            {photos.map((memory, index) => (
              <div
                key={memory.id}
                className={`${styles.photoSlot} ${complete ? styles.ready : ''}`}
                style={
                  {
                    '--visible': Math.min(1, Math.max(0, progress * 4 - index)),
                    '--angle': `${index % 2 ? 4 : -4}deg`,
                    '--delay': `${index * 0.35}s`,
                  } as CSSProperties
                }
              >
                <button
                  type="button"
                  className={styles.photoButton}
                  disabled={!complete}
                  onClick={() => setSelected(memory)}
                  aria-label={`Ver qué hace especial la foto ${memory.id}`}
                >
                  <span className={styles.tape} aria-hidden="true" />
                  <MemoryImage memory={memory} />
                  <span className={styles.photoCaption}>
                    <Heart size={15} aria-hidden="true" />
                    <span>0{memory.id}</span>
                    <Flower2 size={19} aria-hidden="true" />
                  </span>
                </button>
              </div>
            ))}
          </section>
          <div ref={rail} className={styles.rail}>
            <div className={styles.paperRibbon} aria-hidden="true" />
            <button
              type="button"
              role="slider"
              className={styles.pullHeart}
              aria-label="Jala el corazón para revelar las cuatro fotos"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-valuetext={`${Math.floor(progress * 4)} de 4 fotos reveladas`}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              onLostPointerCapture={stopDrag}
              onKeyDown={keyboardDrag}
            >
              <Heart fill="#fdd018" aria-hidden="true" />
            </button>
          </div>
          {complete && (
            <p className={styles.finalMessage} aria-live="polite">
              {finalMessage}
            </p>
          )}
        </div>
      </div>
      <div className={styles.instructions}>
        <p>
          {complete
            ? 'Cada foto guarda algo especial'
            : 'Jala el corazón y dejemos salir los recuerdos'}
          {!complete && <MoveRight size={24} aria-hidden="true" />}
        </p>
        <span>
          {complete
            ? 'Toca una foto para descubrir su historia.'
            : 'Desliza hacia la derecha · Con teclado, usa las flechas.'}
        </span>
        <button
          type="button"
          disabled={progress === 0}
          onClick={() => {
            setProgress(0);
            setSelected(null);
          }}
        >
          <RotateCcw size={14} aria-hidden="true" /> Volver a revelar
        </button>
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className={styles.detailCard} showCloseButton={false}>
          <span className={styles.detailTape} aria-hidden="true" />
          <DialogClose className={styles.close} aria-label="Cerrar recuerdo">
            <X size={20} />
          </DialogClose>
          {selected && (
            <>
              <div className={styles.detailImage}>
                <MemoryImage key={selected.id} memory={selected} enlarged />
              </div>
              <DialogTitle className={styles.detailTitle}>
                ¿Qué hace especial esta foto?
              </DialogTitle>
              <DialogDescription className={styles.detailText}>
                {selected.detail ||
                  'Este recuerdo todavía no tiene una descripción.'}
              </DialogDescription>
              <span className={styles.detailFooter}>
                <Heart size={15} aria-hidden="true" /> Recuerdo 0{selected.id}{' '}
                de 04 <Flower2 size={19} aria-hidden="true" />
              </span>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
