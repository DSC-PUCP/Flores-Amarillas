import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'node_modules/@tanstack/react-router/dist/esm/link';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import caritasPeluches from '../../assets/images/plantilla-1/caritas-peluches.png';
import cerradura from '../../assets/images/plantilla-1/cerradura.png';
import conejoRosa from '../../assets/images/plantilla-1/conejo-rosa.png';
import corazonMensaje from '../../assets/images/plantilla-1/corazon-mensaje.png';
import corazonRojo from '../../assets/images/plantilla-1/corazon-rojo.png';
import corazonesDecorativos from '../../assets/images/plantilla-1/corazones-decorativos-foto.png';
import discoVinilo from '../../assets/images/plantilla-1/disco-vinilo.png';
import duoFloresAmarillas from '../../assets/images/plantilla-1/duo-flores-amarillas.png';
import duoRosas from '../../assets/images/plantilla-1/duo-rosas.png';
import floresAbajoImg from '../../assets/images/plantilla-1/flores-abajo.png';
import oso1 from '../../assets/images/plantilla-1/oso-1.png';
import pelucheSobre from '../../assets/images/plantilla-1/peluche-de-sobre.png';
import perro1 from '../../assets/images/plantilla-1/perro-1.png';
import perro2 from '../../assets/images/plantilla-1/perro-2.png';
import perroFlor from '../../assets/images/plantilla-1/perro-flor.png';
import perroCorazon from '../../assets/images/plantilla-1/perro-sosteniendo-corazon.png';
import pollitoSorprendido from '../../assets/images/plantilla-1/pollito-sorprendido.png';
import ramoFlores from '../../assets/images/plantilla-1/ramo-flores.png';
import reproductor from '../../assets/images/plantilla-1/reproductor.png';
import sobreDeCarta from '../../assets/images/plantilla-1/sobre-de-carta.png';
import sobreAbierto from '../../assets/images/plantilla-1/sobre-de-carta-abierto.png';
import sobreRegalo from '../../assets/images/plantilla-1/sobre-regalo.png';
import type { TemplateSlideProps } from '../../types';
import { Slide0Background } from './Slide0Background';
import { Slide1Background } from './Slide1Background';
import { Slide2Background } from './Slide2Background';
import { Slide3Background } from './Slide3Background';
import { Slide4Background } from './Slide4Background';
import { Slide5Background } from './Slide5Background';
import { Slide6Background } from './Slide6Background';

type Plantilla1Data = {
  personA: string;
  personB: string;
  message: string;
  startDate: string;
  themeId: string;
  musicUrl?: string | null;
  verse?: string | null;
  image?: string | null;
  timelinePhotos?: string[] | null;
};

const Player = ReactPlayer as any;

export function Plantilla1({ templateData }: TemplateSlideProps) {
  const data = templateData as Plantilla1Data;
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 7;
  const inputRef = useRef<HTMLInputElement>(null);

  // Audio control
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Date lock state for Slide 3
  const [dateInput, setDateInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Format the target date from data.startDate (expected format: YYYY-MM-DD)
  // Parse directly from string to avoid timezone issues with Date constructor
  const getFormattedTargetDate = () => {
    if (!data.startDate) return '';
    // Expected format: "YYYY-MM-DD" (e.g., "2026-02-06")
    const parts = data.startDate.split('-');
    if (parts.length !== 3) return '';
    const year = parts[0].slice(-2); // Last 2 digits of year
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${day}${month}${year}`; // DDMMYY format (e.g., "060226")
  };

  const handleDateKeyPress = (key: string) => {
    if (key === 'back') {
      setDateInput((prev) => prev.slice(0, -1));
    } else if (key === 'next' && dateInput.length === 6) {
      // Check if input matches target date
      if (dateInput === getFormattedTargetDate()) {
        setIsUnlocked(true);
        setTimeout(() => nextSlide(), 500);
      } else {
        // Wrong date - shake animation could be added here
        setDateInput('');
      }
    } else if (dateInput.length < 6 && !isNaN(Number(key))) {
      setDateInput((prev) => prev + key);
    }
  };

  const formatDateDisplay = () => {
    const chars = dateInput.padEnd(6, '_').split('');
    return `${chars[0]}${chars[1]} / ${chars[2]}${chars[3]} / ${chars[4]}${chars[5]}`;
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide((curr) => curr + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide((curr) => curr - 1);
  };

  useEffect(() => {
    if (currentSlide === 3) {
      inputRef.current?.focus();
    }
  }, [currentSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentSlide !== 3 || isUnlocked) return;
      if (e.target instanceof HTMLInputElement) return;

      if (e.key >= '0' && e.key <= '9') {
        handleDateKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDateKeyPress('back');
      } else if (e.key === 'Enter') {
        handleDateKeyPress('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isUnlocked, dateInput]);

  return (
    <div className="bg-slate-100 dark:bg-slate-950 flex items-center justify-center font-sans transition-all">
      {/* 16:9 Aspect Ratio Container (The Slide) - Increased to max-w-7xl */}
      <div className="relative w-full ax-w-7xl aspect-video bg-white overflow-hidden shadow-2xl ">
        {/* Content Container with AnimatePresence for both Content and Background */}
        <AnimatePresence mode="wait">
          {currentSlide === 0 && (
            <motion.div
              key="slide-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 sm:p-20"
            >
              {/* Background specific to Slide 0 */}
              <Slide0Background />

              {/* Slide 0 Content */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-8">
                {/* Text at the top */}
                <h1 className="absolute top-2 left-0 text-lg sm:text-4xl font-black text-slate-900 font-railey text-center px-4">
                  Tienes una sorpresa esperando por ti...
                </h1>

                {/* Envelope image centered with "Abrir" text */}
                <motion.div
                  className="relative cursor-pointer"
                  onClick={nextSlide}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <img
                    src={sobreDeCarta}
                    alt="Sobre de carta"
                    className="w-lg h-auto"
                  />

                  {/* Perro Flor Decoration */}
                  <img
                    src={perroFlor}
                    alt="Decoración"
                    className="absolute top-0 -right-10 w-28 h-28 object-contain pointer-events-none"
                    style={{ transform: 'rotate(5deg)' }}
                  />

                  {/* Center "Abrir" text */}
                  <div className="absolute top-[55%] left-[55.5%] -translate-x-1/2 translate-y-[10%] bg-amber-100/10 backdrop-blur-[1px] px-4 py-2 rounded-full">
                    <span className="text-lg sm:text-md font-bold font-railey text-slate-800 pointer-events-none select-none">
                      Abrir
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {currentSlide === 1 && (
            <motion.div
              key="slide-1"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden"
            >
              {/* Background specific to Slide 1 */}
              <Slide1Background />

              {/* Slide 1 Content */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl mt-12 sm:mt-0">
                {/* Envelope Composition */}
                <div className="relative w-full aspect-square max-w-[850px] flex items-center justify-center">
                  {/* Bunny Peeking */}
                  <motion.img
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
                    src={pelucheSobre}
                    alt="Cute bunny"
                    className="absolute top-[20%] z-40 w-44 sm:w-64 object-contain"
                  />

                  {/* Letter Card (Simulated) */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
                    className="absolute top-[27%] left-[25%] w-[47%] h-[40%] flex items-center justify-center z-10 rounded-t-lg p-4"
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                      <div className="bg-rose-300 px-8 py-2 rounded-2xl shadow-sm">
                        <h2 className="text-4xl sm:text-5xl text-slate-900 font-black font-railey text-center leading-tight">
                          ¿Quieres ser mi
                        </h2>
                      </div>
                      <div className="bg-rose-300 px-8 py-2 rounded-2xl shadow-sm">
                        <h2 className="text-4xl sm:text-5xl text-slate-900 font-black font-railey text-center leading-tight">
                          San Valentín?
                        </h2>
                      </div>
                    </div>
                  </motion.div>

                  {/* Open Envelope Image */}
                  <img
                    src={sobreAbierto}
                    alt="Sobre abierto"
                    className="relative z-20 w-full object-contain drop-shadow-xl"
                  />

                  {/* Buttons Layered on Envelope */}
                  <div className="absolute bottom-[15%] z-40 flex flex-col gap-3 w-full items-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={nextSlide}
                      className="bg-[#FFFDD0] text-slate-800 px-8 py-3 rounded-full font-railey font-black text-xl sm:text-2xl shadow-md border border-rose-200 hover:bg-rose-50 transition-colors pointer-events-auto"
                    >
                      Sí acepto
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#FFFDD0] text-slate-800 px-8 py-3 rounded-full font-railey font-black text-xl sm:text-2xl shadow-md border border-rose-200 hover:bg-rose-50 transition-colors pointer-events-auto opacity-80"
                    >
                      No acepto
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div className="absolute bottom-6 left-6 z-50">
                <Button
                  onClick={prevSlide}
                  className="bg-[#FFFDD0] hover:bg-white text-slate-800 rounded-full px-6 py-2 font-railey text-lg shadow-md border border-rose-200 transition-all"
                >
                  Atrás
                </Button>
              </div>
            </motion.div>
          )}

          {currentSlide === 2 && (
            <motion.div
              key="slide-2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-pink-50"
            >
              {/* Background specific to Slide 2 */}
              <Slide2Background />

              {/* Content Container */}
              <div className="relative z-10 flex flex-col items-center justify-start w-full h-full py-8 sm:py-10 px-4">
                {/* Top: Puppy */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="flex flex-col items-center relative mt-2 sm:mt-6 mb-4"
                >
                  <div className="relative">
                    {/* Flipped Puppy */}
                    <img
                      src={perroCorazon}
                      alt="Puppy"
                      className="w-20 sm:w-28 object-contain scale-x-[-1]"
                    />
                    {/* Straight text */}
                    <span className="absolute top-1/2 -right-32 -translate-y-1/2 font-railey text-2xl text-slate-800">
                      Yeyyyyy!
                    </span>
                  </div>
                </motion.div>

                {/* Center: Message */}
                <div className="text-center space-y-6 max-w-3xl px-4 relative z-20">
                  <p className="font-railey text-2xl sm:text-3xl leading-relaxed text-slate-800">
                    Te doy la bienvenida a nuestro pequeño espacio. este lugar
                    guarda recuerdos bonitos y momentos especiales.
                  </p>
                  <div className="flex items-center justify-center gap-4 font-railey text-3xl sm:text-5xl text-slate-800 pt-4">
                    <span>¿Me acompañas?</span>
                    <img
                      src={corazonRojo}
                      alt="Heart"
                      className="w-10 h-10 sm:w-12 sm:h-12 inline-block animate-pulse"
                    />
                  </div>
                </div>

                {/* Main Action Button */}
                <div className="relative z-30 mt-8 sm:mt-12">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextSlide}
                    className="bg-[#E5989B] hover:bg-[#d4878a] text-black font-railey text-xl sm:text-2xl px-12 py-4 rounded-full shadow-lg transition-colors border border-black/5"
                  >
                    Claro que sí!
                  </motion.button>
                </div>

                {/* Bottom Decoration - Fixed containment */}
                <div className="absolute -bottom-16 left-0 right-0 w-full pointer-events-none z-20 flex items-end justify-center">
                  <img
                    src={floresAbajoImg}
                    alt=""
                    className="w-[33%] max-h-[300px] object-contain sm:object-cover object-bottom"
                  />
                  <img
                    src={floresAbajoImg}
                    alt=""
                    className="w-[33%] max-h-[300px] object-contain sm:object-cover object-bottom"
                  />
                  <img
                    src={floresAbajoImg}
                    alt=""
                    className="w-[33%] max-h-[300px] object-contain sm:object-cover object-bottom"
                  />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 z-50">
                <Button
                  onClick={prevSlide}
                  className="bg-[#FFFDD0] hover:bg-white text-slate-800 rounded-full px-6 py-2 font-railey text-lg shadow-md border border-rose-200 transition-all"
                >
                  Atrás
                </Button>
              </div>
            </motion.div>
          )}

          {currentSlide === 3 && (
            <motion.div
              key="slide-3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-pink-50 overflow-hidden"
            >
              {/* Background specific to Slide 3 */}
              <Slide3Background
                images={[
                  ramoFlores,
                  duoFloresAmarillas,
                  duoRosas,
                  floresAbajoImg,
                ]}
                count={15}
                opacity={0.4}
              />

              {/* Content Container */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl max-h-full px-4">
                {/* Title */}
                <h2 className="font-railey text-2xl sm:text-4xl text-center mb-4">
                  Antes de continuar, cuidemos nuestro pequeño secreto...
                </h2>

                {/* Hint */}
                <div className="flex items-center gap-2 mb-6">
                  <img src={corazonRojo} alt="" className="w-5 h-5" />
                  <span className="font-railey text-xl text-slate-600">
                    Pista: Una fecha muy especial
                  </span>
                </div>

                {/* Lock Section */}
                <div className="relative flex items-center justify-center mb-6">
                  {/* Left Plushies */}
                  <img
                    src={caritasPeluches}
                    alt=""
                    className="w-20 sm:w-24 object-contain"
                  />

                  {/* Heart with Lock */}
                  <div className="relative mx-4">
                    <svg
                      viewBox="0 0 100 90"
                      className="w-28 sm:w-32 h-auto fill-[#ffa197]"
                    >
                      <path d="M50 88 C25 65, 0 50, 0 30 A25 25 0 0 1 50 30 A25 25 0 0 1 100 30 C100 50, 75 65, 50 88Z" />
                    </svg>
                    <img
                      src={cerradura}
                      alt="Lock"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 sm:w-12 object-contain"
                    />
                  </div>

                  {/* Right Plushies (mirrored) */}
                  <img
                    src={caritasPeluches}
                    alt=""
                    className="w-20 sm:w-24 object-contain scale-x-[-1]"
                  />
                </div>

                {/* Hidden Input for Mobile Keyboard */}
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="absolute opacity-0 pointer-events-none"
                  onChange={(e) => {
                    const lastChar = e.target.value.slice(-1);
                    if (/[0-9]/.test(lastChar)) {
                      handleDateKeyPress(lastChar);
                    }
                    e.target.value = '';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      handleDateKeyPress('back');
                    }
                  }}
                />

                {/* Date Input Display */}
                <div
                  className="bg-white/80 backdrop-blur-sm rounded-full px-8 py-3 border-8 border-[#ffa197] shadow-md mb-6 cursor-pointer"
                  onClick={() => inputRef.current?.focus()}
                >
                  <span className="font-mono text-2xl sm:text-3xl text-slate-700 tracking-widest">
                    {formatDateDisplay()}
                  </span>
                </div>

                {/* Numeric Keypad */}
                <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <motion.button
                      key={num}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDateKeyPress(num)}
                      className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center group"
                    >
                      <svg
                        viewBox="0 0 100 90"
                        className="absolute inset-0 w-full h-full fill-[#ffa197] drop-shadow-sm transition-colors group-hover:fill-[#ffb5ad]"
                      >
                        <path d="M50 88 C25 65, 0 50, 0 30 A25 25 0 0 1 50 30 A25 25 0 0 1 100 30 C100 50, 75 65, 50 88Z" />
                      </svg>
                      <span className="relative z-10 font-railey font-black text-lg sm:text-2xl text-slate-800 mt-[-3px]">
                        {num}
                      </span>
                    </motion.button>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDateKeyPress('back')}
                    className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center group"
                  >
                    <svg
                      viewBox="0 0 100 90"
                      className="absolute inset-0 w-full h-full fill-pink-100 drop-shadow-sm transition-colors group-hover:fill-pink-200"
                    >
                      <path d="M50 88 C25 65, 0 50, 0 30 A25 25 0 0 1 50 30 A25 25 0 0 1 100 30 C100 50, 75 65, 50 88Z" />
                    </svg>
                    <span className="relative z-10 text-slate-600 text-lg sm:text-2xl mt-[-3px]">
                      ←
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDateKeyPress('0')}
                    className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center group"
                  >
                    <svg
                      viewBox="0 0 100 90"
                      className="absolute inset-0 w-full h-full fill-[#ffa197] drop-shadow-sm transition-colors group-hover:fill-[#ffb5ad]"
                    >
                      <path d="M50 88 C25 65, 0 50, 0 30 A25 25 0 0 1 50 30 A25 25 0 0 1 100 30 C100 50, 75 65, 50 88Z" />
                    </svg>
                    <span className="relative z-10 font-railey font-black text-lg sm:text-2xl text-slate-800 mt-[-3px]">
                      0
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDateKeyPress('next')}
                    disabled={dateInput.length !== 6}
                    className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center group"
                  >
                    <svg
                      viewBox="0 0 100 90"
                      className={`absolute inset-0 w-full h-full drop-shadow-sm transition-colors ${dateInput.length === 6 ? 'fill-rose-400 group-hover:fill-rose-500' : 'fill-pink-50 opacity-50'}`}
                    >
                      <path d="M50 88 C25 65, 0 50, 0 30 A25 25 0 0 1 50 30 A25 25 0 0 1 100 30 C100 50, 75 65, 50 88Z" />
                    </svg>
                    <span
                      className={`relative z-10 text-lg sm:text-2xl mt-[-3px] ${dateInput.length === 6 ? 'text-white' : 'text-slate-300'}`}
                    >
                      →
                    </span>
                  </motion.button>
                </div>
              </div>

              {/* Nav Button */}
              <div className="absolute bottom-6 left-6 z-50">
                <Button
                  onClick={prevSlide}
                  className="bg-[#FFFDD0] hover:bg-white text-slate-800 rounded-full px-6 py-2 font-railey text-lg shadow-md border border-rose-200 transition-all"
                >
                  Atrás
                </Button>
              </div>
            </motion.div>
          )}

          {currentSlide === 4 && (
            <motion.div
              key="slide-4"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-pink-50 overflow-hidden"
            >
              {/* Background specific to Slide 4 */}
              <Slide4Background />

              {/* Content Container */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl px-8">
                {/* Title */}
                <h2 className="font-railey text-2xl sm:text-5xl text-slate-800 text-center mb-20 leading-relaxed">
                  Preparé esto con mucho cariño para ti! Cada una guarda algo
                  especial. tú decides cual abrir primero
                  <img
                    src={corazonRojo}
                    alt=""
                    className="w-8 h-8 inline-block ml-2"
                  />
                </h2>

                {/* Gift Folders Container */}
                <div className="flex items-end justify-center gap-16 sm:gap-32">
                  {/* Regalo 1 */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentSlide(5)}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className="relative">
                      {/* Perro on top */}
                      <img
                        src={perro1}
                        alt="Perrito"
                        className="absolute -top-16 left-1/2 -translate-x-1/2 w-24 sm:w-32 object-contain z-10"
                      />
                      {/* Folder/Gift */}
                      <img
                        src={sobreRegalo}
                        alt="Regalo 1"
                        className="w-48 sm:w-56 object-contain"
                      />
                    </div>
                    <span className="font-railey text-2xl sm:text-3xl text-slate-700 mt-4">
                      Regalo 1
                    </span>
                  </motion.div>

                  {/* Regalo 2 */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentSlide(6)}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className="relative">
                      {/* Oso peeking from side */}
                      <img
                        src={oso1}
                        alt="Osito"
                        className="absolute -bottom-4 -right-12 w-20 sm:w-24 object-contain z-10"
                      />
                      {/* Folder/Gift */}
                      <img
                        src={sobreRegalo}
                        alt="Regalo 2"
                        className="w-48 sm:w-56 object-contain"
                      />
                    </div>
                    <span className="font-railey text-2xl sm:text-3xl text-slate-700 mt-4">
                      Regalo 2
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Nav Button */}
              <div className="absolute bottom-4 left-6 z-40">
                <button
                  onClick={prevSlide}
                  className="bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full font-railey text-lg sm:text-xl text-slate-700 hover:bg-white transition-colors shadow-md"
                >
                  Atrás
                </button>
              </div>
            </motion.div>
          )}

          {currentSlide === 5 && (
            <motion.div
              key="slide-5"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-pink-100 via-pink-50 to-pink-100 overflow-hidden"
            >
              {/* Background specific to Slide 5 */}
              <Slide5Background />

              {/* Content Container */}
              <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-8">
                {/* Title */}
                <h2 className="font-railey text-3xl sm:text-5xl text-slate-800 text-center mb-6">
                  Para mi persona especial:
                </h2>

                {/* Heart Message Frame */}
                <div className="relative w-full max-w-xl">
                  {/* Heart Background Image */}
                  <img
                    src={corazonMensaje}
                    alt=""
                    className="w-full h-auto object-contain"
                  />

                  {/* Perro 1 - Top Left */}
                  <img
                    src={perro1}
                    alt=""
                    className="absolute -top-6 left-[10%] w-16 sm:w-20 object-contain z-20"
                  />

                  {/* Conejo Rosa - Top Right */}
                  <img
                    src={conejoRosa}
                    alt=""
                    className="absolute -top-4 right-[10%] w-16 sm:w-20 object-contain z-20"
                  />

                  {/* Perro Corazon - Bottom Right */}
                  <img
                    src={perroCorazon}
                    alt=""
                    className="absolute bottom-[10%] -right-8 w-20 sm:w-24 object-contain z-20"
                  />

                  {/* Message Text Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center px-16 sm:px-20 pt-10 pb-16">
                    <p className="font-railey text-lg sm:text-2xl text-slate-700 text-center leading-relaxed max-h-[70%] overflow-y-auto">
                      {data.message || 'Tu mensaje especial aparecerá aquí...'}
                    </p>
                  </div>
                </div>

                {/* Te amo footer */}
                <div className="flex items-center gap-4 mt-6">
                  <span className="font-railey text-3xl sm:text-4xl text-slate-800">
                    Te amo
                  </span>
                  <img
                    src={corazonRojo}
                    alt=""
                    className="w-8 h-8 animate-pulse"
                  />
                </div>
              </div>

              {/* Nav Buttons */}
              <div className="absolute bottom-4 left-6 z-40">
                <button
                  onClick={prevSlide}
                  className="bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full font-railey text-lg sm:text-xl text-slate-700 hover:bg-white transition-colors shadow-md"
                >
                  Atrás
                </button>
              </div>
            </motion.div>
          )}

          {currentSlide === 6 && (
            <motion.div
              key="slide-6"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-pink-100 overflow-hidden"
            >
              {/* Background specific to Slide 6 */}
              <Slide6Background />

              {/* Main Content Layout */}
              <div className="relative w-full h-full flex flex-row items-center p-8 sm:p-16  gap-16 sm:gap-32">
                {/* Left Side: Photo Frame */}
                <div className="relative  w-[40%] h-[80%] sm:h-[110%] mb-16 max-w-lg">
                  {/* Frame Decoration (Image with hearts) */}
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[150px] h-[150px] object-fill"
                    />
                  </div>
                  <div className="absolute top-[20%] -left-[10%] z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[150px] h-[150px] object-fill"
                    />
                  </div>
                  <div className="absolute -top-[2%] left-[30%] z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[100px] h-[100px] object-fill"
                    />
                  </div>
                  <div className="absolute -top-[2%] left-[60%] z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[100px] h-[100px] object-fill"
                    />
                  </div>
                  <div className="absolute top-[50%] -left-[10%] z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[150px] h-[150px] object-fill"
                    />
                  </div>
                  <div className="absolute top-[80%] -left-[10%] z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[150px] h-[150px] object-fill"
                    />
                  </div>
                  <div className="absolute top-[80%] -right-[10%] z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[150px] h-[150px] object-fill"
                    />
                  </div>
                  <div className="absolute top-[50%] -right-[10%] z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[150px] h-[150px] object-fill"
                    />
                  </div>
                  <div className="absolute -top-[2%] -right-[10%] z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[150px] h-[150px] object-fill"
                    />
                  </div>
                  <div className="absolute top-[20%] -right-[10%] z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[150px] h-[150px] object-fill"
                    />
                  </div>
                  <div className="absolute -bottom-[10%] left-[30%] z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[100px] h-[100px] object-fill"
                    />
                  </div>
                  <div className="absolute -bottom-[10%] left-[60%] z-20 pointer-events-none">
                    <img
                      src={corazonesDecorativos}
                      alt=""
                      className="w-[100px] h-[100px] object-fill"
                    />
                  </div>
                  {/* User Photo */}
                  <div className="absolute inset-4 h-full sm:inset-6 z-10 bg-white overflow-hidden rounded-lg flex items-center justify-center">
                    {data.image ? (
                      <img
                        src={data.image}
                        alt="Nosotros"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-railey text-xl">
                        Tu foto aquí
                      </div>
                    )}
                  </div>

                  {/* Plushie Decoration (Perro 2) */}
                  <img
                    src={perro2}
                    alt=""
                    className="absolute -bottom-12 -left-10 w-24 sm:w-32 z-30 object-contain"
                  />
                </div>

                {/* Right Side: Music Player & Title */}
                <div className="flex flex-col items-center justify-center w-[50%] h-full max-w-md">
                  {/* Top Title with Plushie */}
                  <div className="relative w-full text-center mb-10">
                    <h2 className="font-railey text-5xl sm:text-7xl text-rose-500 transform -rotate-2">
                      Feliz día de San Valentín
                    </h2>
                    <img
                      src={oso1}
                      alt=""
                      className="absolute -left-42 z-50 -top-8 w-24 sm:w-28 object-contain"
                    />
                  </div>

                  {/* Music Player Card */}
                  <div
                    className="relative w-full aspect-[4/3] bg-rose-300 rounded-3xl p-4 shadow-xl flex items-center justify-center mb-6 cursor-pointer"
                    onClick={() =>
                      data.musicUrl
                        ? window.open(data.musicUrl, '_blank')
                        : togglePlay()
                    }
                  >
                    {/* Player Image Overlay (now z-30 to be on top, assuming transparent window) 
                          BUT if user says vinyl is missing, maybe opacity or layering is wrong.
                          Let's try putting vinyl ON TOP of the base, but UNDER the controls if possible.
                          Actually, let's just center the vinyl and ensure it's visible. 
                      */}
                    <img
                      src={reproductor}
                      alt="Player UI"
                      className="absolute w-full h-full object-contain pointer-events-none"
                    />

                    {/* Spinning Vinyl - Adjusted position to be centered in the "screen" area */}
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      style={{
                        animationPlayState: isPlaying ? 'running' : 'paused',
                      }}
                      className="absolute w-[45%] aspect-square rounded-full shadow-lg overflow-hidden border-4 border-black/80 left-[5%] top-[20%]"
                    >
                      <img
                        src={discoVinilo}
                        alt="Vinyl"
                        className="w-full h-full object-cover z-40"
                      />
                      {/* Center Hole */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full border-2 border-gray-300" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Lyrics / Verse Section */}
                  <div className="w-full text-center relative">
                    <p className="font-railey text-2xl text-rose-700 mb-4">
                      Este verso siempre me recuerda a ti:
                    </p>
                    {data.verse ? (
                      <p className="font-railey text-3xl text-rose-600 italic px-6 leading-relaxed">
                        "{data.verse}"
                      </p>
                    ) : (
                      <>
                        <div className="border-b-2 border-dashed border-rose-300 w-full h-8 mb-2" />
                        <div className="border-b-2 border-dashed border-rose-300 w-full h-8" />
                      </>
                    )}
                    <img
                      src={pollitoSorprendido}
                      alt=""
                      className="absolute -bottom-16 -right-24 w-16 sm:w-24 object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Nav Buttons */}
              <div className="absolute bottom-6 left-6 z-50">
                <Button
                  onClick={() => setCurrentSlide(4)}
                  className="bg-[#FFFDD0] hover:bg-white text-slate-800 rounded-full px-6 py-2 font-railey text-lg shadow-md border border-rose-200 transition-all"
                >
                  Atrás
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Dots (Outside the AnimatePresence so they don't slide) */}
      </div>
    </div>
  );
}
