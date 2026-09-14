import bouquetImg from '../../../assets/images/plantilla_luis_arce/slide_5/bouquet-small.png';
import FloatingSticker from './FloatingSticker';

const bouquetData = [
  { top: '15%', left: '10%', size: 'w-8 md:w-12', rotate: 15, delay: 0.2 },
  { top: '8%', right: '18%', size: 'w-10 md:w-16', rotate: -10, delay: 0.4 },
  { bottom: '30%', right: '10%', size: 'w-8 md:w-12', rotate: -15, delay: 0.6 },
  { bottom: '10%', right: '35%', size: 'w-10 md:w-14', rotate: -25, delay: 0.8 },
  { bottom: '8%', left: '25%', size: 'w-8 md:w-12', rotate: 10, delay: 0.5 },
  { top: '45%', left: '5%', size: 'w-9 md:w-14', rotate: 20, delay: 0.3 },
];

export default function Bouquets() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[60]">
      {bouquetData.map((bq, i) => (
        <FloatingSticker
          key={i}
          src={bouquetImg}
          className={`${bq.size} opacity-90`}
          style={{ top: bq.top, bottom: bq.bottom, left: bq.left, right: bq.right }}
          index={i}
          delay={bq.delay}
          baseRotate={bq.rotate}
          floatY={[0, -6, 6, 0]}
          floatXBase={5}
          durationY={4 + i * 0.6}
          durationX={5 + i * 0.6}
        />
      ))}
    </div>
  );
}
