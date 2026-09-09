import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, ChevronDown, Camera, Music as MusicIcon, Star } from 'lucide-react';

import HeartBackground from './components/HeartBackground';
import MusicPlayer from './components/MusicPlayer';
//import Timeline from './components/Timeline';
import Envelope from './components/Envelope';
import DragReveal from './components/DragReveal';

import { TemplateSlideProps } from '@/modules/templates/types';
import { TemplateData } from './types';
import type { TemplateConfig, TemplateForm } from '@/core/models/template';

export const plantillaGianoFeatLeoForm = [
  {
    title: 'Protagonistas',
    fields: [
      {
        name: 'personA',
        label: 'Tu nombre',
        type: 'string',
        max_length: 25,
        required: true,
      },
      {
        name: 'personB',
        label: 'Su nombre',
        type: 'string',
        max_length: 25,
        required: true,
      },
      {
        name: 'startDate',
        label: '¿Cuándo comenzó su historia?',
        type: 'date',
        required: true,
      }
    ],
  },
  {
    title: 'El Mensaje',
    fields: [
      {
        name: 'message',
        label: 'Escribe tu carta.',
        type: 'textarea',
        max_length: 250,
        required: true,
      }
    ],
  },
  {
    title: 'Razones para amar',
    fields: [
      {
        name: 'reasonsToLove',
        label: 'Razón para amarlx',
        type: 'array',
        item_type: 'string',
        max_items: 6,
        item_max_length: 100,
        required: false,
      }
    ],
  },
  {
    title: 'Cupón sorpresa',
    fields: [
      {
        name: 'couponText',
        label: 'Regalale un cupón (ej. "Te regalo un cupón para una cena romántica")',
        type: 'string',
        max_length: 50,
        required: false,
      },
      {
        name: 'couponImage',
        label: 'Sube una imagen para adornar el cupón',
        type: 'image',
        required: false,
      }
    ],
  },

  {
    title: 'Media',
    fields: [
      {
        name: 'image',
        label: 'Imagen principal',
        type: 'image',
        required: false,
      },
      {
        name: 'timelinePhotos',
        label: 'Sube en orden las fotos de su historia',
        item_max_length: 200,
        max_items: 6,
        type: 'array',
        item_type: 'image',
        required: false,
      }
    ],
  }
] satisfies TemplateForm;


export function PlantillaGianoFeatLeo({ templateData }: TemplateSlideProps) {
  const data = templateData as TemplateData;

  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStart = () => {
    setHasStarted(true);
    setIsPlaying(true);
  };

  // ✅ CONTADOR DE DÍAS (parseamos manualmente para evitar bugs de timezone)
  const daysTogether = React.useMemo(() => {
    // Parsear YYYY-MM-DD manualmente para evitar que JS interprete como UTC
    const [year, month, day] = data.startDate.split('-').map(Number);
    const start = new Date(year, month - 1, day); // mes es 0-indexed
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [data.startDate]);

  // Helper para formatear fecha sin problemas de timezone
  const formattedStartDate = React.useMemo(() => {
    const [year, month, day] = data.startDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [data.startDate]);

  // ✅ NUEVO: Normalizamos las fotos (LA PARTE CLAVE DEL FIX)
  const photosArray = Array.isArray(data.timelinePhotos)
    ? data.timelinePhotos
    : [];
  // 🔥 NUEVO: convertir razones del formulario en lista
  const reasonsArray = Array.isArray(data.reasonsToLove)
  ? data.reasonsToLove
      .map(r => r.trim())
      .filter(r => r.length > 0)
  : [];


  const formattedMessage =
    typeof data.message === "string"
      ? data.message.replace(/\/\//g, "\n")
      : data.message;


  return (
    <div className="min-h-screen bg-rose-50 font-sans text-gray-800 overflow-x-hidden">

      {/* 🎬 FUENTES Y TIPOGRAFÍA — TODO DENTRO DEL ARCHIVO */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&display=swap');

        body {
          font-family: 'Montserrat', sans-serif;
        }

        .font-script {
          font-family: 'Great Vibes', cursive !important;
        }
      `}
      </style>


      {/* INTRO */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            className="fixed inset-0 z-[100] bg-rose-100 flex flex-col items-center justify-center px-4 text-center"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl w-auto min-w-[20rem] max-w-[90vw] border-t-[12px] border-rose-500 relative"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full shadow-md">
                <Heart className="w-8 h-8 text-rose-500 animate-pulse" fill="currentColor" />
              </div>

              <h1 
                className="font-script font-bold text-gray-800 mb-2 mt-4 text-center"
                style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)' }}
              >
                Para {data.personB}
              </h1>
              <p 
                className="text-gray-500 mb-8 italic text-center"
                style={{ fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}
              >
                Un detalle especial de {data.personA}
              </p>

              <button
                onClick={handleStart}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-5 px-6 rounded-2xl transition-all shadow-xl shadow-rose-200 flex items-center justify-center gap-3 active:scale-95"
              >
                <Play size={22} fill="currentColor" />
                <span>DESCUBRIR</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasStarted && (
        <>
          <HeartBackground />

          {data.musicUrl && (
            <MusicPlayer
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              customUrl={data.musicUrl}
            />
          )}

          <main className="relative z-10">

            {/* HERO */}
            <section className="min-h-screen flex flex-col items-center justify-center px-4 relative">

              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop"
                  alt="Cover"
                  className="w-full h-full object-cover opacity-20 filter blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-rose-50/20 via-rose-50/60 to-rose-50" />
              </div>


              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="text-center z-10 w-full px-4 flex flex-col items-center"
              >
                <div className="inline-block p-2 bg-white/50 backdrop-blur-sm rounded-full mb-6 border border-white px-6">
                  <span className="text-rose-600 font-bold tracking-widest text-xs uppercase">
                    Nuestra Historia
                  </span>
                </div>

                <h1 
                  className="font-script text-rose-600 mb-6 drop-shadow-sm leading-tight w-full max-w-[90vw] text-center"
                  style={{
                    fontSize: 'clamp(2rem, 6vw, 7rem)',
                  }}
                >
                  {data.personA} & {data.personB}
                </h1>

                <div className="flex items-center justify-center gap-6 mb-8">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-rose-300" />
                  <div className="text-center">
                    <p className="text-3xl md:text-5xl font-script font-bold text-rose-800 leading-none">
                      {daysTogether}
                    </p>
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1">
                      Días de Amor
                    </p>
                  </div>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-rose-300" />
                </div>

                <p className="text-xl md:text-2xl text-rose-700 font-light italic max-w-2xl mx-auto px-4">
                  "Desde el {formattedStartDate}, cada segundo ha valido la pena."
                </p>
              </motion.div>

              <motion.div
                className="absolute bottom-10 z-10"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ChevronDown className="text-rose-300 w-8 h-8" />
              </motion.div>
            </section>

            {/* FOTO PRINCIPAL */}
            {data.image && (
              <section className="py-16 flex justify-center">
                <img
                  src={data.image}
                  alt="Pareja"
                  className="w-72 h-72 object-cover rounded-full border-4 border-rose-300 shadow-xl"
                />
              </section>
            )}

            {/* ✅ GALERÍA CORREGIDA (PARTE IMPORTANTE) */}
            {photosArray.length > 0 && (
              <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-12">
                    <Camera className="text-rose-500" />
                    <h2 className="text-4xl font-script text-rose-800">
                      Nuestros momentos
                    </h2>
                  </div>

                  <div className="columns-2 md:columns-3 gap-4 space-y-4">
                    {photosArray.map((src, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="break-inside-avoid rounded-xl overflow-hidden shadow-lg group relative"
                      >
                        <img
                          src={src}
                          alt={`Recuerdo ${i + 1}`}
                          className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                        <Heart
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12"
                          fill="currentColor"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* RAZONES PARA AMARTE (DINÁMICAS DEL FORM) */}
            {reasonsArray.length > 0 && (
              <section className="py-20 px-4 max-w-6xl mx-auto">
                <h2 className="text-4xl font-script text-center text-rose-800 mb-12">
                  ¿Por qué eres especial?
                </h2>

                <div className="flex flex-wrap justify-center gap-6">
                  {reasonsArray.map((reason, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="bg-white p-6 rounded-2xl shadow-lg border border-rose-100 flex items-start gap-4 hover:shadow-rose-100 transition-shadow w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                    >
                      <div className="shrink-0 p-3 bg-rose-100 rounded-full text-rose-500">
                        <Heart size={20} fill={idx % 2 === 0 ? "currentColor" : "none"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 font-medium pt-1 break-words">
                          {reason}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}



            {/* INTERACCIONES */}
            <section className="bg-rose-100/50 py-20 px-2 sm:px-4">
              <div className="flex flex-col md:flex-row max-w-5xl mx-auto gap-10 items-center md:items-start">
                <div className="w-full md:w-1/2 flex justify-center">
                  <Envelope message={formattedMessage} />
                </div>
                <div className="w-full md:w-1/2 flex items-center justify-center h-full min-h-[400px]">
                  <DragReveal
                    text={data.couponText}
                    image={data.couponImage}
                  />

                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="text-center py-24 bg-white border-t border-rose-50">
              <div className="flex justify-center gap-2 mb-6">
                <Heart size={16} className="text-rose-200" fill="currentColor" />
                <Heart size={20} className="text-rose-400" fill="currentColor" />
                <Heart size={16} className="text-rose-200" fill="currentColor" />
              </div>
              <p className="font-script text-3xl text-rose-700 mb-2">
                {data.personA} ❤️ {data.personB}
              </p>
              <p className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase">
                Por siempre y para siempre
              </p>
              <p className="text-xs text-rose-200 mt-8 font-medium">
                Con mucho amor
              </p>
            </footer>

          </main>
        </>
      )}
    </div>
  );
}


export const plantillaGianoFeatLeoConfig = {
  templateForm: plantillaGianoFeatLeoForm,
  component: PlantillaGianoFeatLeo
} satisfies TemplateConfig;

