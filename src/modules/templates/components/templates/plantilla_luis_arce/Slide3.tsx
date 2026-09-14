import { motion } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import type { TemplateSlideProps } from '@/modules/templates/types';
import arribaIzq from '../../../assets/images/plantilla_luis_arce/slide_3/arriza_izq.png';
import abajoIzq from '../../../assets/images/plantilla_luis_arce/slide_3/abajo_izq.png';
import der from '../../../assets/images/plantilla_luis_arce/slide_3/der.png';
import padlock from '../../../assets/images/plantilla_luis_arce/slide_3/padlock.png';
import stickerHeart from '../../../assets/images/plantilla_luis_arce/slide_3/sticker-heart.png';
import Sparkles from './Sparkles';
import BackButton from './BackButton';
import NextButton from "@/modules/templates/components/templates/plantilla_luis_arce/NextButton.tsx";

interface Slide3Props extends TemplateSlideProps {
  onNext?: () => void;
  onPrev?: () => void;
}

export default function Slide3({
  templateData,
  onNext,
  onPrev,
}: Slide3Props) {
  const data = (templateData || {});
  const correctPassword = (String(data.password) || '123456').toUpperCase();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isError, setIsError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Solo permitir alfanuméricos
    if (value && !/^[a-zA-Z0-9]+$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.toUpperCase().slice(-1); // Tomar solo el último caracter si pega varios
    setCode(newCode);
    
    if (isError) setIsError(false);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleEnter = () => {
    const enteredPassword = code.join('');
    if (enteredPassword === correctPassword) {
      sessionStorage.setItem('flores_unlocked', correctPassword);
      onNext?.();
    } else {
      setIsError(true);
    }
  };

  // Focus inicial o autocompletado
  useEffect(() => {
    const isUnlocked = sessionStorage.getItem('flores_unlocked') === correctPassword;

    if (isUnlocked) {
      // Animación de "escribirse por su cuenta"
      const chars = correctPassword.split('');
      const timeouts: ReturnType<typeof setTimeout>[] = [];
      
      chars.forEach((char, i) => {
        const t = setTimeout(() => {
          setCode(prev => {
            const next = [...prev];
            next[i] = char;
            return next;
          });
        }, 1200 + i * 150);
        timeouts.push(t);
      });

      return () => timeouts.forEach(clearTimeout);
    } else {
      // Flujo normal: dar focus al primer input
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 1500); // Esperar que termine la animación
      return () => clearTimeout(timer);
    }
  }, [correctPassword]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Animación desde la esquina superior izquierda */}
      <motion.img
        src={arribaIzq}
        alt=""
        className="absolute top-0 left-0 w-[55%] md:w-[35%] lg:w-[25%] h-auto pointer-events-none -translate-x-[10%] -translate-y-[10%]"
        initial={{ x: '-100%', y: '-100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '-100%', y: '-100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Animación desde la esquina inferior izquierda */}
      <motion.img
        src={abajoIzq}
        alt=""
        className="absolute -bottom-[15%] -left-[25%] md:-bottom-[10%] md:-left-[15%] w-[70%] md:w-[45%] lg:w-[35%] h-auto pointer-events-none"
        initial={{ x: '-100%', y: '100%', opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: '-100%', y: '100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
      />

      {/* Animación desde la derecha */}
      <motion.img
        src={der}
        alt=""
        className="absolute -top-[10%] -bottom-[10%] right-0 md:-right-[15%] h-[120%] w-auto object-cover pointer-events-none"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
      />

      <Sparkles />

      <BackButton onClick={onPrev} />

      {/* Contenedor Central interactivo */}
      <motion.div
        className="z-[60] flex flex-col items-center justify-center w-full px-6 md:px-12 pointer-events-none"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="flex flex-col items-center mb-8 md:mb-12">
          <img src={stickerHeart} alt="" className="w-12 md:w-16 mb-4 drop-shadow-sm" />
          <h2 className="text-4xl md:text-6xl font-bold text-[#082b60] font-league tracking-tight mb-4 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
            Contraseña
          </h2>
          <p className="text-2xl md:text-3xl text-[#082b60] font-cormorant text-center max-w-xl leading-snug drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
            Antes de continuar, protejamos nuestro secreto....
          </p>
        </div>

        <img src={padlock} alt="Padlock" className="w-32 md:w-48 mb-10 md:mb-12 drop-shadow-md" />

        {/* Grupo de inputs giratorio en error */}
        <motion.div 
          className="flex gap-2 md:gap-4 mb-10 md:mb-12 pointer-events-auto"
          animate={isError ? { rotate: [-5, 5, -5, 5, 0] } : { rotate: 0 }}
          transition={{ duration: 0.4 }}
        >
          {code.map((char, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              maxLength={1}
              value={char}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-16 md:w-16 md:h-20 lg:w-20 lg:h-24 text-center text-3xl md:text-4xl lg:text-5xl font-dm font-bold rounded-xl md:rounded-2xl border-[3px] focus:outline-none transition-colors ${
                isError 
                  ? 'border-red-500 text-red-600 bg-red-50' 
                  : 'border-[#082b60] text-[#082b60] focus:border-[#facc15] bg-white/40 backdrop-blur-md shadow-sm'
              }`}
            />
          ))}
        </motion.div>

        <NextButton 
          id="slide3-enter-btn"
          label="Entrar" 
          onClick={handleEnter} 
          className="!px-10 !py-3 md:!py-4 !text-xl md:!text-2xl"
        />
      </motion.div>
    </div>
  );
}
