import { motion } from 'framer-motion';
import React from 'react';
import type { TemplateSlideProps } from '@/modules/templates/types';
import Bouquets from './Bouquets';
import BackButton from './BackButton';
import { slide5 } from './assets';

const { abajoIzq, arrizaIzq: arribaIzq, card, der, openEnvelope, stickerHeart, treeHeart } = slide5;

interface Slide5Props extends TemplateSlideProps {
  onNext?: () => void;
  onPrev?: () => void;
}

export default function Slide5({
  templateData,
  onPrev,
}: Slide5Props) {
  const data = (templateData || {}) as Record<string, any>;
  const userMessage = data.message || 'Este es un mensaje de prueba para ver cómo queda el texto dentro de la carta. ¡Feliz día!';

  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLParagraphElement>(null);
  const [textScale, setTextScale] = React.useState(1);

  React.useEffect(() => {
    const adjustTextSize = () => {
      if (containerRef.current && textRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        // scrollHeight is the unscaled layout height of the text
        const textHeight = textRef.current.scrollHeight;
        
        if (textHeight > containerHeight && containerHeight > 0) {
          setTextScale((containerHeight / textHeight) * 0.95);
        } else {
          setTextScale(1);
        }
      }
    };

    adjustTextSize();
    // Re-adjust if images load late or window resizes
    window.addEventListener('resize', adjustTextSize);
    const timeout = setTimeout(adjustTextSize, 100);
    return () => {
      window.removeEventListener('resize', adjustTextSize);
      clearTimeout(timeout);
    };
  }, [userMessage]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Fondo estático de la diapositiva 1 para continuidad */}
      <motion.img
        src={arribaIzq}
        alt=""
        className="absolute top-0 left-0 w-[55%] md:w-[35%] lg:w-[25%] h-auto pointer-events-none -translate-x-[10%] -translate-y-[10%] opacity-30"
      />
      <motion.img
        src={abajoIzq}
        alt=""
        className="absolute -bottom-[15%] -left-[25%] md:-bottom-[10%] md:-left-[15%] w-[70%] md:w-[45%] lg:w-[35%] h-auto pointer-events-none opacity-30"
      />

      <Bouquets />

      <BackButton onClick={onPrev} />

      {/* arriba_izq un poco más arriba y más grande */}
      <motion.div
        className="absolute top-[-2%] md:top-[-5%] left-0 w-[55%] md:w-[35%] lg:w-[30%] pointer-events-none z-20"
        initial={{ x: '-100%', y: '-100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '-100%', y: '-100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <img
          src={arribaIzq}
          alt=""
          className="w-full h-auto"
        />
      </motion.div>

      {/* Decoración inferior izquierda */}
      <motion.div
        className="absolute bottom-[-5%] md:bottom-0 -left-[5%] md:-left-[2%] w-[45%] md:w-[30%] lg:w-[25%] pointer-events-none z-20"
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

      {/* der un poco más a la derecha */}
      <motion.div
        className="absolute top-[-5%] md:top-[-10%] -right-[5%] md:-right-[2%] h-[110%] md:h-[120%] w-auto max-w-none pointer-events-none z-10"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
      >
        <img
          src={der}
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Contenido Central */}
      {/*
        En movil es una sola columna centrada. Antes apilaba carta y arbol, y
        entre los dos pasaban del alto de la pantalla: el contenido se salia y
        no habia forma de leer el mensaje, que es justo lo unico que importa
        aqui. El arbol se esconde por debajo de `md` (ver mas abajo) y la
        carta se queda con toda la pantalla para ella.
      */}
      <div className="z-[30] relative w-full h-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 lg:gap-24 px-6 md:px-12 pointer-events-none">
        
        {/* Columna Izquierda: Carta */}
        <motion.div 
          className="flex flex-col items-center relative"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.5 } }}
          transition={{ duration: 0.8, delay: 0.8, type: 'spring' }}
        >
          <img src={stickerHeart} alt="" className="w-10 md:w-12 mb-2 md:mb-4 drop-shadow-sm" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#082b60] font-league tracking-tight mb-4 md:mb-6 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
            Para mi persona especial:
          </h2>
          
          <div className="relative flex items-center justify-center">
            {/* Fondo de la carta */}
            <img src={card} alt="" className="w-72 md:w-[350px] lg:w-[420px] drop-shadow-xl" />
            
            {/* Texto del usuario */}
            <div 
              ref={containerRef}
              className="absolute inset-0 flex items-center justify-center p-12 md:p-14 lg:p-16 overflow-hidden"
            >
              <p 
                ref={textRef}
                className="text-xl md:text-2xl lg:text-3xl text-[#082b60] font-dancing leading-relaxed text-center whitespace-pre-wrap break-words"
                style={{ transform: `scale(${textScale})`, transformOrigin: 'center' }}
              >
                {userMessage}
              </p>
            </div>

            {/* Sobre flotante */}
            <motion.img 
              src={openEnvelope} 
              alt="" 
              className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-12 w-20 md:w-28 lg:w-32 drop-shadow-lg"
              animate={{ y: [-5, 5, -5], rotate: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        {/* Columna Derecha: Árbol (desde tablet; en movil no cabe) */}
        <motion.div
          className="relative hidden md:flex items-center justify-center mt-4 md:mt-16"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.5 } }}
          transition={{ duration: 0.8, delay: 1.2, type: 'spring', bounce: 0.4 }}
        >
          <img src={treeHeart} alt="Tree" className="w-64 md:w-80 lg:w-[450px] drop-shadow-2xl" />
        </motion.div>

      </div>

    </div>
  );
}
