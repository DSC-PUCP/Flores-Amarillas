import NextButton from "./NextButton";
import { motion } from 'framer-motion';
import type { TemplateSlideProps } from '@/modules/templates/types';
import abajoIzq from '../../../assets/images/plantilla_luis_arce/slide_2/abajo_izq.png';
import derecha from '../../../assets/images/plantilla_luis_arce/slide_2/derecha.png';
import florIzq from '../../../assets/images/plantilla_luis_arce/slide_2/flor_izq.png';
import bouquetLarge from '../../../assets/images/plantilla_luis_arce/slide_2/bouquet-large.png';
import stickerFlower from '../../../assets/images/plantilla_luis_arce/slide_2/sticker-flower.png';
import BackButton from './BackButton';

interface Slide2Props extends TemplateSlideProps {
  onNext?: () => void;
  onPrev?: () => void;
}

export default function Slide2({
  onNext,
  onPrev,
}: Slide2Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Imágenes de fondo (las del paso anterior) */}
      <motion.div
        className="absolute inset-0 w-full h-full pointer-events-none"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        style={{ transform: 'translateZ(0)' }}
      >
        <img
          src={derecha}
          alt=""
          className="w-full h-full object-cover object-bottom"
        />
      </motion.div>
      <motion.img
        src={abajoIzq}
        alt=""
        className="absolute bottom-0 -left-[20%] md:-left-[10%] w-[80%] md:w-[50%] h-auto pointer-events-none"
        initial={{ x: '-100%', y: '100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '-100%', y: '100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Animación desde la esquina superior izquierda (nuevas) */}
      <motion.div
        className="absolute top-0 left-0 w-[55%] md:w-[35%] lg:w-[25%] h-auto pointer-events-none"
        initial={{ x: '-100%', y: '-100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '-100%', y: '-100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <img
          src={florIzq}
          alt=""
          className="w-full h-auto -translate-x-[15%] -translate-y-[15%]"
        />
      </motion.div>

      {/* Animación desde la derecha */}
      <motion.div
        className="absolute top-0 bottom-0 my-auto md:bottom-auto md:my-0 md:top-[15%] right-[2%] md:right-[8%] lg:right-[15%] w-[35%] md:w-[35%] lg:w-[28%] h-auto pointer-events-none"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        style={{ transform: 'translateZ(0)' }}
      >
        <img
          src={bouquetLarge}
          alt=""
          className="w-full h-auto"
        />
      </motion.div>

      <BackButton onClick={onPrev} />

      {/* Contenedor Central */}
      <motion.div
        className="z-[60] text-center flex flex-col items-center justify-center pointer-events-none w-full md:w-[60%] lg:w-[50%] pl-1 pr-10 md:px-12 md:mr-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="flex flex-col items-center mb-4 md:mb-6">
          <img src={stickerFlower} alt="" className="w-10 md:w-16 mb-2 drop-shadow-sm" />
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-[#0c2a4c] font-league tracking-tight uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
            Dedicatoria
          </h2>
        </div>

        <div className="text-lg md:text-2xl lg:text-[1.7rem] text-[#0c2a4c] font-cormorant font-semibold whitespace-pre-wrap leading-relaxed max-w-2xl mb-6 md:mb-8 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
          {'Desde el primer día, cada momento contigo\nha sido un regalo.\n\nEscribimos nuestra propia historia,\nllena de risas y sueños.\n\nTe invito a descubrir qué más he preparado\npara ti, un camino lleno de detalles\npensados solo para nosotros...'}
        </div>

        <p className="text-2xl md:text-4xl lg:text-5xl text-[#0c2a4c] font-dancing drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
          ¿Me acompañas?
        </p>

        {/* Botón ¡Sí! */}
        <div className="mt-6 md:mt-10 self-center md:self-end md:-mr-12 z-30">
          <NextButton 
            label="¡Sí!" 
            onClick={onNext} 
            className=" !px-6 md:!px-8 !py-2 md:!py-3 !text-base md:!text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
