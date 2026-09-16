import { motion } from 'framer-motion';
import type { TemplateSlideProps } from '@/modules/templates/types';
import CorazonesSlide6 from './CorazonesSlide6';
import BackButton from './BackButton';
import NextButton from './NextButton';
import { slide6 } from './assets';

const { abajoDer, abajoIzq, arribaDer, photoFrame, slider: sliderIcon, vinylDisc } = slide6;

interface Slide6Props extends TemplateSlideProps {
  onNext?: () => void;
  onPrev?: () => void;
}

export default function Slide6({
  templateData,
  onNext,
  onPrev,
}: Slide6Props) {
  const data = (templateData || {}) as Record<string, any>;
  
  // Usamos una imagen de archivo por defecto si no hay imagen, o si la imagen no es una URL válida
  const isValidImage = typeof data.image === 'string' && data.image.length > 5;
  const userImage = isValidImage 
    ? data.image 
    : 'https://plus.unsplash.com/premium_photo-1705310531651-43a74ddb51fe?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8aGFwcHklMjBjb3VwbGV8ZW58MHx8MHx8fDA%3D';
    
  const userVerse = data.verse || 'Y si te abrazo, el tiempo se detiene...';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <CorazonesSlide6 />
      
      <BackButton onClick={onPrev} />

      {/* Cierra el recorrido: hasta aqui el regalo 2 no tenia salida adelante. */}
      <NextButton
        onClick={onNext}
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-[70]"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: 0.5 }}
      />

      {/* Arriba Derecha */}
      <motion.div
        className="absolute top-0 md:top-[-15%] -right-[5%] md:-right-[10%] w-[140%] md:w-[120%] pointer-events-none z-20"
        initial={{ x: '100%', y: '-100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '100%', y: '-100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <img
          src={arribaDer}
          alt=""
          className="w-full h-auto"
        />
      </motion.div>

      {/* Abajo Izquierda */}
      <motion.div
        className="absolute bottom-0 left-0 w-[60%] md:w-[45%] lg:w-[40%] pointer-events-none z-20"
        initial={{ x: '-100%', y: '100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '-100%', y: '100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
      >
        <img
          src={abajoIzq}
          alt=""
          className="w-full h-auto"
        />
      </motion.div>

      {/* Abajo Derecha */}
      <motion.div
        className="absolute bottom-0 right-0 w-[80%] md:w-[40%] lg:w-[35%] pointer-events-none z-10"
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

      {/* Contenido Central */}
      <motion.div 
        className="z-[30] flex flex-col items-center pointer-events-auto max-w-4xl px-4 md:px-8 mt-10 md:mt-24 lg:mt-32"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
        transition={{ duration: 0.8, delay: 0.8, type: 'spring' }}
      >
        <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold text-[#082b60] font-league tracking-tight mb-4 md:mb-6 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
          Nuestra canción favorita
        </h2>

        {/* Rectángulo Verde */}
        <div className="relative bg-[#a5be94] border-[4px] md:border-[5px] border-[#082b60] rounded-[1.5rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-12 flex flex-row items-center justify-center gap-2 sm:gap-6 md:gap-16 shadow-xl w-full max-w-[95vw] md:max-w-none">
          
          {/* Polaroid */}
          <div className="relative w-36 sm:w-48 md:w-80 lg:w-[22rem] transition-transform duration-500 cursor-pointer drop-shadow-md">
            {/* Marco polaroid  */}
            <img src={photoFrame} alt="Marco" className="relative w-full h-auto" />
            
            {/* Foto del usuario  */}
            <div className="absolute top-[14%] left-[18%] right-[15%] bottom-[26%] bg-[#021c4a] border-[#021c4a] border-5 overflow-hidden z-10 -rotate-[8deg] hover:rotate-0 transform-gpu">
              <img src={userImage} alt="" className="w-full h-full object-cover scale-[1.05]" />
            </div>
          </div>

          {/* Disco de Vinilo */}
          <div className="relative w-28 sm:w-40 md:w-72 lg:w-[20rem] flex items-center justify-center">
            <motion.img 
              src={vinylDisc} 
              alt="Disco" 
              className="w-full h-auto drop-shadow-lg origin-center"
              animate={{ rotate: [-10, 15, -10] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            />
          </div>

          {/* Icono de sliders (ecualizador) */}
          <img src={sliderIcon} alt="" className="absolute bottom-2 right-3 md:bottom-8 md:right-10 w-6 sm:w-8 md:w-16 opacity-80" />
        </div>

        {/* Textos inferiores */}
        <div className="flex flex-col items-center mt-6 md:mt-10 text-center px-4">
          <p className="text-xl md:text-3xl text-[#082b60] font-cormorant drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
            <b>Este verso siempre me recuerda a ti:</b>
          </p>

          <p className="text-2xl md:text-4xl text-[#082b60] font-dancing mt-2 md:mt-4 max-w-lg leading-relaxed drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
            "{userVerse}"
          </p>
        </div>

      </motion.div>
      
    </div>
  );
}
