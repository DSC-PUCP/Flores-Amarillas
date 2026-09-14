import sparkle from '../../../assets/images/plantilla_luis_arce/slide_3/sticker-sparkle.png';
import FloatingSticker from './FloatingSticker';

const sparklesData = [
  { pos: 'top-[45%] md:top-[30%] left-[15%] md:left-[25%]', size: 'w-10 md:w-16', delay: 0.2 },
  { pos: 'top-[38%] md:top-[20%] right-[15%] md:right-[30%]', size: 'w-12 md:w-20', delay: 0.5 },
  { pos: 'bottom-[35%] md:bottom-[30%] left-[20%] md:left-[20%]', size: 'w-8 md:w-14', delay: 0.3 },
  { pos: 'bottom-[30%] md:bottom-[25%] right-[20%] md:right-[25%]', size: 'w-10 md:w-16', delay: 0.6 },
];

export default function Sparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[60]">
      {sparklesData.map((s, i) => (
        <FloatingSticker
          key={i}
          src={sparkle}
          className={`${s.size} ${s.pos}`}
          index={i}
          delay={s.delay}
          hoverScale={1.5}
          hoverRotate={i % 2 === 0 ? 25 : -25}
          hoverFilter="brightness(1.5) drop-shadow(0px 0px 4px rgba(255,255,255,1))"
          floatY={[0, -3, 3, 0]}
          floatXBase={2}
          durationY={2 + i * 0.3}
          durationX={2.5 + i * 0.3}
        />
      ))}
    </div>
  );
}
