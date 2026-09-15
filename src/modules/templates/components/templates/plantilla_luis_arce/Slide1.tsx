import NextButton from "./NextButton";
import { motion } from 'framer-motion';
import type { TemplateSlideProps } from '@/modules/templates/types';
import Corazones from './Corazones';
import { slide1 } from './assets';

const { abajoDer, abajoIzq, arribaIzq, envelope } = slide1;

interface Slide1Props extends TemplateSlideProps {
  onNext?: () => void;
  onPrev?: () => void;
}

export default function Slide1({
  templateData,
  onNext,
}: Slide1Props) {
  const data = (templateData || {}) as Record<string, any>;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Animación desde la esquina superior izquierda */}
      <motion.img
        src={arribaIzq}
        alt=""
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none scale-[1.1] -translate-x-[4%] -translate-y-[4%] md:scale-100 md:translate-x-0 md:translate-y-0"
        initial={{ x: '-100%', y: '-100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '-100%', y: '-100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Animación desde la esquina inferior izquierda */}
      <motion.img
        src={abajoIzq}
        alt=""
        className="absolute bottom-0 left-0 w-full h-full object-cover pointer-events-none scale-[1.2] -translate-x-[10%] translate-y-[10%] md:scale-100 md:translate-x-0 md:translate-y-0"
        initial={{ x: '-100%', y: '100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '-100%', y: '100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
      />

      {/* Animación desde la esquina inferior derecha */}
      <motion.img
        src={abajoDer}
        alt=""
        className="absolute bottom-0 right-0 h-full object-cover pointer-events-none scale-[1.4] translate-x-[25%] translate-y-[15%] md:scale-100 md:translate-x-0 md:translate-y-0"
        initial={{ x: '100%', y: '100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '100%', y: '100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
      />

      <Corazones />

      <motion.div
        className="z-20 text-center flex flex-col items-center justify-center pointer-events-none w-full px-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
        transition={{ duration: 1, delay: 1 }}
      >
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0c2a4c] mb-6 font-league tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
          <span className="capitalize">{data?.personB || '<Nombre>'}</span> tienes una sorpresa esperando por ti...
        </h1>

        <img
          src={envelope}
          alt="Sobre especial"
          className="w-56 md:w-72 lg:w-80 drop-shadow-2xl my-2"
        />

        <p className="text-3xl md:text-4xl lg:text-5xl text-[#0c2a4c] mt-6 font-dancing drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
          Un regalo especial por el
          <br />
          Día de las Flores Amarillas
        </p>

        <NextButton 
          label="¡Abrir!"
          onClick={onNext} 
          className="mt-8 !px-10 !py-3 !text-base md:!text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.8 }}
        />
      </motion.div>
    </div>
  );
}
