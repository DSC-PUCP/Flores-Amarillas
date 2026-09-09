import { motion } from 'framer-motion';
import petalosCayendo from '../../assets/gifs/plantilla-1/petalos-cayendo.gif';
import enmarcoRosa from '../../assets/images/plantilla-1/enmarco-rosa.png';
import floresMasFlores from '../../assets/images/plantilla-1/flores-mas-flores.png';

export function Slide4Background() {
  const petals = [
    // Top (0-33%)
    { top: '5%', left: '10%', rotate: 0, scale: 1 },
    { top: '12%', left: '25%', rotate: 45, scale: 0.8 },
    { top: '8%', left: '45%', rotate: -20, scale: 1.1 },
    { top: '15%', left: '60%', rotate: 15, scale: 0.9 },
    { top: '5%', left: '80%', rotate: -10, scale: 1 },
    { top: '22%', left: '15%', rotate: 30, scale: 0.85 },
    { top: '18%', left: '35%', rotate: -35, scale: 1.05 },
    { top: '25%', left: '55%', rotate: 10, scale: 0.95 },
    { top: '20%', left: '75%', rotate: -5, scale: 1.1 },
    { top: '10%', left: '90%', rotate: 40, scale: 0.8 },

    // Middle (33-66%)
    { top: '38%', left: '5%', rotate: 20, scale: 1.2 },
    { top: '45%', left: '22%', rotate: -15, scale: 0.9 },
    { top: '40%', left: '40%', rotate: 50, scale: 1 },
    { top: '48%', left: '58%', rotate: -30, scale: 1.1 },
    { top: '35%', left: '72%', rotate: 10, scale: 0.85 },
    { top: '55%', left: '12%', rotate: -45, scale: 1.05 },
    { top: '60%', left: '30%', rotate: 25, scale: 0.95 },
    { top: '52%', left: '50%', rotate: -10, scale: 1.15 },
    { top: '58%', left: '68%', rotate: 35, scale: 0.8 },
    { top: '42%', left: '85%', rotate: -25, scale: 1 },

    // Bottom (66-95%)
    { top: '70%', left: '8%', rotate: 15, scale: 0.9 },
    { top: '78%', left: '25%', rotate: -30, scale: 1.1 },
    { top: '72%', left: '42%', rotate: 45, scale: 0.85 },
    { top: '80%', left: '58%', rotate: -10, scale: 1.05 },
    { top: '75%', left: '75%', rotate: 30, scale: 1 },
    { top: '88%', left: '15%', rotate: -20, scale: 0.95 },
    { top: '85%', left: '35%', rotate: 10, scale: 1.1 },
    { top: '92%', left: '52%', rotate: -50, scale: 0.8 },
    { top: '82%', left: '68%', rotate: 25, scale: 1.05 },
    { top: '78%', left: '88%', rotate: -15, scale: 0.9 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Scattered Petals */}
      {petals.map((petal, i) => (
        <motion.img
          key={`petal-${i}`}
          src={petalosCayendo}
          alt=""
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: petal.scale, rotate: petal.rotate }}
          transition={{ duration: 1, delay: i * 0.05 }}
          className="absolute w-[180px] h-[180px] object-cover mix-blend-multiply scale-x-[-1]"
          style={{
            top: petal.top,
            left: petal.left,
          }}
        />
      ))}

      {/* Decorative Frame - Left */}
      <img
        src={enmarcoRosa}
        alt=""
        className="absolute right-0 top-0 h-[500px] w-auto object-contain pointer-events-none opacity-80"
      />

      {/* Decorative Frame - Right */}
      <img
        src={enmarcoRosa}
        alt=""
        className="absolute left-0 top-0 h-[500px] w-auto object-contain pointer-events-none scale-x-[-1] opacity-80"
      />

      {/* Bottom Flower Meadow */}
      <div className="absolute flex flex-row -bottom-10 w-full h-32 sm:h-40 pointer-events-none z-20 justify-center -space-x-24 sm:-space-x-32">
        <img
          src={floresMasFlores}
          alt=""
          className="w-[35%] h-full object-cover object-top"
        />
        <img
          src={floresMasFlores}
          alt=""
          className="w-[35%] h-full object-cover object-top"
        />
        <img
          src={floresMasFlores}
          alt=""
          className="w-[35%] h-full object-cover object-top"
        />
        <img
          src={floresMasFlores}
          alt=""
          className="w-[35%] h-full object-cover object-top"
        />
        <img
          src={floresMasFlores}
          alt=""
          className="w-[35%] h-full object-cover object-top"
        />
      </div>
    </div>
  );
}
