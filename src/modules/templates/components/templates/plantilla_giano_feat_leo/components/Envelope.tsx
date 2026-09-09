import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { SECRET_LETTER } from '../constants';

interface EnvelopeProps {
  message?: string;   // <-- NUEVO
}

const Envelope: React.FC<EnvelopeProps> = ({ message }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Si no llega mensaje, usamos el mensaje por defecto
  const finalMessage = message ?? SECRET_LETTER;

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-2 sm:px-4 perspective-1000">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-md md:max-w-lg cursor-pointer group mx-auto"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Instruction Text */}
        {!isOpen && (
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -top-16 left-0 right-0 text-center text-rose-600 font-bold z-20 pointer-events-none"
          >
            ¡Toca para abrir! 👇
          </motion.div>
        )}

        {/* Envelope Body */}
        <div className={`relative bg-rose-200 w-full h-64 rounded-b-xl shadow-xl transition-all duration-700 ${isOpen ? 'translate-y-32' : ''} z-10`}>
          
          {/* Top Flap */}
          <motion.div
            className="absolute top-0 left-0 w-full h-0 border-l-[16rem] border-r-[16rem] border-t-[8rem] border-l-transparent border-r-transparent border-t-rose-300 origin-top"
            animate={{ 
              rotateX: isOpen ? 180 : 0,
              zIndex: isOpen ? 0 : 30
            }}
            transition={{ 
              duration: 0.6,
              zIndex: { delay: isOpen ? 0 : 0.5 }
            }}
            style={{ borderLeftWidth: '50%', borderRightWidth: '50%' }}
          />
          
          {/* Heart Seal */}
          <motion.div
             className="absolute top-[-15px] left-1/2 -translate-x-1/2 z-40 text-rose-600 bg-white rounded-full p-2 shadow-md"
             animate={{ 
               opacity: isOpen ? 0 : 1,
               scale: isOpen ? 0 : 1
             }}
          >
            <Heart fill="currentColor" size={24} />
          </motion.div>

          {/* The Letter  -> AHORA USA PROPS */}
          <motion.div
            className="absolute top-2 left-4 right-4 bg-white p-6 shadow-md rounded-lg text-rose-900 font-script text-xl leading-relaxed h-auto min-h-[200px] max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            initial={{ y: 0, opacity: 0, zIndex: 0 }}
            animate={{ 
              y: isOpen ? -200 : 0, 
              opacity: isOpen ? 1 : 0,
              zIndex: isOpen ? 50 : 0
            }}
            transition={{ 
              delay: 0.3, 
              duration: 0.5,
              zIndex: { delay: isOpen ? 0.8 : 0 }
            }}
          >
            <div className="whitespace-pre-line break-words overflow-wrap-anywhere">
              {finalMessage}
            </div>
          </motion.div>

          {/* Envelope Front Pocket (Visual Only) */}
          <div 
            className="absolute bottom-0 left-0 w-full h-full border-l-[16rem] border-r-[16rem] border-b-[8rem] border-l-rose-300 border-r-rose-300 border-b-rose-400 border-t-transparent rounded-b-xl z-20 pointer-events-none opacity-90" 
            style={{ borderLeftWidth: '50%', borderRightWidth: '50%', borderBottomWidth: '16rem', height: 0, bottom: 0 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Envelope;
