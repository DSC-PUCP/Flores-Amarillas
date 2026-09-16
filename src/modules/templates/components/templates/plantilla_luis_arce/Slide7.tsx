import { motion } from 'framer-motion';
import type { TemplateSlideProps } from '@/modules/templates/types';
import { slide1 } from './assets';
import BackButton from './BackButton';
import Corazones from './Corazones';

const { abajoDer, abajoIzq, arribaIzq } = slide1;

interface Slide7Props extends TemplateSlideProps {
  onNext?: () => void;
  onPrev?: () => void;
}

/**
 * Cierre del recorrido.
 *
 * Reusa los adornos de la primera pantalla a proposito: el regalo termina
 * donde empezo, y de paso son imagenes que el navegador ya tiene en cache.
 */
export default function Slide7({ templateData, onPrev }: Slide7Props) {
  const data = (templateData || {}) as Record<string, unknown>;
  const personA = typeof data.personA === 'string' ? data.personA : '';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <motion.img
        src={arribaIzq}
        alt=""
        className="pointer-events-none absolute top-0 left-0 h-full w-full scale-[1.1] -translate-x-[4%] -translate-y-[4%] object-cover md:scale-100 md:translate-x-0 md:translate-y-0"
        initial={{ x: '-100%', y: '-100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6 } }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
      <motion.img
        src={abajoIzq}
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 h-full w-full scale-[1.2] -translate-x-[10%] translate-y-[10%] object-cover md:scale-100 md:translate-x-0 md:translate-y-0"
        initial={{ x: '-100%', y: '100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6 } }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
      />
      <motion.img
        src={abajoDer}
        alt=""
        className="pointer-events-none absolute right-0 bottom-0 h-full scale-[1.4] translate-x-[25%] translate-y-[15%] object-cover md:scale-100 md:translate-x-0 md:translate-y-0"
        initial={{ x: '100%', y: '100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6 } }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
      />

      <Corazones />

      <BackButton onClick={onPrev} />

      <motion.div
        className="pointer-events-none z-30 flex w-full flex-col items-center px-6 text-center"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.08, opacity: 0, transition: { duration: 0.5 } }}
        transition={{ duration: 0.9, delay: 0.7, type: 'spring' }}
      >
        <p className="font-dancing text-4xl leading-tight text-[#0c2a4c] drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] sm:text-5xl md:text-6xl lg:text-7xl">
          Gracias por alegrar
          <br />
          mi primavera
        </p>

        <motion.div
          className="my-7 h-px w-24 bg-[#0c2a4c]/30 md:my-9 md:w-32"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        />

        <h2 className="font-league text-xl font-bold tracking-tight text-[#082b60] uppercase drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] sm:text-2xl md:text-3xl">
          Feliz 21 de septiembre
        </h2>

        {personA && (
          <p className="font-cormorant mt-6 text-lg text-[#0c2a4c]/80 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] md:mt-8 md:text-2xl">
            — {personA}
          </p>
        )}
      </motion.div>
    </div>
  );
}
