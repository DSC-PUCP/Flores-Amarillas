import { motion } from 'framer-motion';
import petalosCayendo from '../../assets/gifs/plantilla-1/petalos-cayendo.gif';

interface Slide3BackgroundProps {
  images: string[];
  count?: number;
  opacity?: number;
}

export function Slide3Background({
  images,
  count = 12,
  opacity = 0.4,
}: Slide3BackgroundProps) {
  const slots = [
    { top: '5%', left: '5%', size: '120px', rotate: 15 },
    { top: '10%', right: '8%', size: '100px', rotate: -20 },
    { top: '40%', left: '-5%', size: '140px', rotate: 45 },
    { top: '35%', right: '-3%', size: '110px', rotate: -10 },
    { bottom: '15%', left: '2%', size: '130px', rotate: 10 },
    { bottom: '10%', right: '5%', size: '120px', rotate: 30 },
    { top: '20%', left: '45%', size: '80px', rotate: 5, opacity: 0.3 },
    { bottom: '25%', left: '55%', size: '90px', rotate: -15 },
    { top: '60%', left: '10%', size: '100px', rotate: 25 },
    { bottom: '50%', right: '10%', size: '110px', rotate: -40 },
    { top: '-2%', left: '30%', size: '130px', rotate: -5 },
    { bottom: '-5%', right: '35%', size: '140px', rotate: 15 },
    { top: '75%', left: '40%', size: '90px', rotate: -20 },
    { top: '5%', left: '80%', size: '100px', rotate: 10 },
    { bottom: '35%', left: '15%', size: '110px', rotate: -30 },
  ];

  const activeSlots = slots.slice(0, count);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Petals Background */}
      <img
        src={petalosCayendo}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none mix-blend-screen"
      />

      {activeSlots.map((slot, i) => {
        const randomImage = images[i % images.length];
        return (
          <motion.img
            key={`flower-${i}`}
            initial={{ opacity: 0, scale: 0.5, rotate: slot.rotate - 20 }}
            animate={{
              opacity: slot.opacity || opacity,
              scale: 1,
              rotate: slot.rotate,
            }}
            transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' }}
            src={randomImage}
            alt=""
            className="absolute object-contain"
            style={{
              top: (slot as any).top,
              bottom: (slot as any).bottom,
              left: (slot as any).left,
              right: (slot as any).right,
              width: slot.size,
              height: 'auto',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.05))',
            }}
          />
        );
      })}
    </div>
  );
}
