import FloatingSticker from './FloatingSticker';
import { slide1 } from './assets';

const { stickerHeart: heart } = slide1;

const heartsData = [
  { top: '20%', right: '15%', size: 'w-6 md:w-8', rotate: 15, delay: 0.2 },
  { top: '35%', right: '22%', size: 'w-8 md:w-12', rotate: -10, delay: 0.4 },
  { bottom: '30%', right: '20%', size: 'w-8 md:w-12', rotate: -15, delay: 0.6 },
  { bottom: '10%', right: '30%', size: 'w-7 md:w-10', rotate: -25, delay: 0.8 },
  { bottom: '12%', left: '32%', size: 'w-8 md:w-12', rotate: -15, delay: 0.7 },
  { bottom: '28%', left: '22%', size: 'w-7 md:w-10', rotate: 10, delay: 0.5 },
  { top: '48%', left: '12%', size: 'w-8 md:w-12', rotate: 20, delay: 0.3 },
  { top: '38%', left: '25%', size: 'w-6 md:w-8', rotate: -15, delay: 0.1 },
];

export default function Corazones() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[60]">
      {heartsData.map((h, i) => (
        <FloatingSticker
          key={i}
          src={heart}
          className={h.size}
          style={{ top: h.top, bottom: h.bottom, left: h.left, right: h.right }}
          index={i}
          delay={h.delay}
          baseRotate={h.rotate}
        />
      ))}
    </div>
  );
}
