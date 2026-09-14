import { motion } from 'framer-motion';
import type { TemplateSlideProps } from '@/modules/templates/types';
import izq from '../../../assets/images/plantilla_luis_arce/slide_4/izq.png';
import arribaDer from '../../../assets/images/plantilla_luis_arce/slide_4/arriba_der.png';
import abajoDer from '../../../assets/images/plantilla_luis_arce/slide_4/abajo_der.png';
import giftBox from '../../../assets/images/plantilla_luis_arce/slide_4/gift-box.png';
import regalo1 from '../../../assets/images/plantilla_luis_arce/slide_4/regalo_1.png';
import regalo2 from '../../../assets/images/plantilla_luis_arce/slide_4/regalo_2.png';
import stickerSparkle from '../../../assets/images/plantilla_luis_arce/slide_4/sticker-sparkle.png';
import BackButton from './BackButton';

interface Slide4Props extends TemplateSlideProps {
  onSelectGift: (giftNumber: number) => void;
  onPrev?: () => void;
}

export default function Slide4({
  onPrev,
  onSelectGift,
}: Slide4Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <BackButton onClick={onPrev} />

      {/* El de la izquierda que ocupe todo verticalmente en mobile, horizontalmente en PC, y se tape a la izquierda y arriba */}
      <motion.div
        className="absolute inset-0 md:inset-auto md:top-[-25%] md:-left-[5%] w-full h-full md:h-auto md:w-[110%] pointer-events-none"
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <img
          src={izq}
          alt=""
          className="w-full h-full object-cover object-[20%_center] md:object-contain md:object-left-top"
        />
      </motion.div>

      {/* El de arriba a la derecha que no esté en la misma esquina si no un poco más abajo a la izquierda */}
      <motion.div
        className="absolute top-[10%] md:top-[15%] right-[10%] md:right-[5%] lg:right-[5%] w-[25%] md:w-[16%] lg:w-[16%] pointer-events-none z-20"
        initial={{ x: '100%', y: '-100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '100%', y: '-100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
      >
        <img
          src={arribaDer}
          alt=""
          className="w-full h-auto"
        />
      </motion.div>

      {/* El de abajo a la derecha que esté un poco a la derecha */}
      <motion.div
        className="absolute bottom-0 -right-[5%] md:-right-[2%] w-[50%] md:w-[25%] lg:w-[20%] pointer-events-none z-20"
        initial={{ x: '100%', y: '100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '100%', y: '100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
      >
        <img
          src={abajoDer}
          alt=""
          className="w-full h-auto"
        />
      </motion.div>

      {/* Contenedor central (movido un poco a la izquierda) */}
      <div className="z-[60] flex flex-col items-center justify-center pointer-events-none max-w-2xl px-6 md:px-0 -translate-x-[2%] md:-translate-x-[8%] absolute inset-0 mx-auto">
        
        <motion.div 
          className="flex flex-col items-center mb-6 md:mb-12 text-center drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)] pointer-events-auto"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <img src={stickerSparkle} alt="" className="w-10 md:w-14 mb-3 drop-shadow-sm" />
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#082b60] font-league tracking-tight mb-4">
            Escoge tu regalo
          </h2>
          <p className="text-xl md:text-2xl lg:text-3xl text-[#082b60] font-cormorant leading-snug font-semibold max-w-[90%] md:max-w-full">
            He preparado dos pequeños detalles para ti. ¿Cuál te gustaría abrir primero? Recuerda que el otro te estará esperando...
          </p>
        </motion.div>

        <div className="flex justify-center gap-10 md:gap-28 w-full mt-6 md:mt-12 pointer-events-auto">
          {/* Regalo 1 */}
          <motion.div 
            className="relative cursor-pointer hover:scale-105 active:scale-95 transition-transform group flex flex-col items-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
            transition={{ type: 'spring', stiffness: 250, damping: 15, delay: 1.1 }}
            onClick={() => onSelectGift(1)}
          >
            <div className="relative w-36 h-36 md:w-56 md:h-56 flex items-center justify-center">
              <img src={regalo1} alt="" className="absolute inset-0 w-full h-full object-contain scale-[1.3] group-hover:rotate-[3deg] transition-transform pointer-events-none" />
              <img src={giftBox} alt="Regalo 1" className="relative w-[75%] z-10 drop-shadow-lg group-hover:scale-[1.05] transition-transform" />
            </div>
            <p className="text-3xl md:text-4xl text-[#082b60] font-dancing mt-6 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
              Regalo 1
            </p>
          </motion.div>

          {/* Regalo 2 */}
          <motion.div 
            className="relative cursor-pointer hover:scale-105 active:scale-95 transition-transform group flex flex-col items-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
            transition={{ type: 'spring', stiffness: 250, damping: 15, delay: 1.3 }}
            onClick={() => onSelectGift(2)}
          >
            <div className="relative w-36 h-36 md:w-56 md:h-56 flex items-center justify-center">
              <img src={regalo2} alt="" className="absolute inset-0 w-full h-full object-contain scale-[1.4] translate-y-[5%] group-hover:-rotate-[3deg] transition-transform pointer-events-none" />
              <img src={giftBox} alt="Regalo 2" className="relative w-[75%] z-10 drop-shadow-lg group-hover:scale-[1.05] transition-transform" />
            </div>
            <p className="text-3xl md:text-4xl text-[#082b60] font-dancing mt-6 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
              Regalo 2
            </p>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
