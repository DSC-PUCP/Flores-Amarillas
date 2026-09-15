import FloatingSticker from './FloatingSticker';
import { slide5 } from './assets';

const { stickerHeart: heart } = slide5;

const heartsData = [
  // Corazón 1: Arriba centro en mobile, Izquierda en PC
  {
    classes: 'top-[8%] left-[40%] -translate-x-1/2 md:top-[30%] md:left-[15%] md:translate-x-0',
    size: 'w-10 md:w-14',
    rotate: -15,
    delay: 0.2,
  },
  // Corazón 2: Arriba centro-derecha en mobile, Abajo izquierda en PC
  {
    classes: 'top-[12%] left-[60%] -translate-x-1/2 md:top-[60%] md:left-[20%] md:translate-x-0',
    size: 'w-8 md:w-12',
    rotate: 25,
    delay: 0.5,
  },
  // Corazón 3: Arriba más a la izq en mobile, Arriba derecha en PC
  {
    classes: 'top-[6%] left-[30%] -translate-x-1/2 md:top-[25%] md:left-auto md:right-[20%] md:translate-x-0',
    size: 'w-7 md:w-10',
    rotate: -10,
    delay: 0.7,
  },
  // Corazón 4: Abajo centro en mobile, Abajo derecha en PC
  {
    classes: 'bottom-[8%] left-[50%] -translate-x-1/2 md:top-[50%] md:left-auto md:right-[15%] md:translate-x-0',
    size: 'w-12 md:w-16',
    rotate: 20,
    delay: 0.4,
  },
];

export default function CorazonesSlide6() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[60]">
      {heartsData.map((h, i) => (
        <FloatingSticker
          key={i}
          src={heart}
          className={`${h.classes} ${h.size} drop-shadow-md`}
          index={i}
          delay={h.delay}
          baseRotate={h.rotate}
        />
      ))}
    </div>
  );
}
