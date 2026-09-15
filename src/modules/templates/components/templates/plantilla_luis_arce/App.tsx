import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { TemplateConfig, TemplateForm } from '@/core/models/template';
import type { TemplateSlideProps } from '@/modules/templates/types';

import Slide1 from './Slide1';
import Slide2 from './Slide2';
import Slide3 from './Slide3';
import Slide4 from './Slide4';

import Slide5 from './Slide5';
import Slide6 from './Slide6';

export const plantillaLuisArceForm: TemplateForm = [
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
    ],
  },
  {
    title: 'Seguridad',
    fields: [
      {
        name: 'password',
        label: 'Contraseña (6 caracteres)',
        type: 'string',
        max_length: 6,
        required: true,
      },
    ],
  },
  {
    title: 'Mensaje',
    fields: [
      {
        name: 'message',
        label: 'Mensaje',
        type: 'textarea',
        max_length: 250,
        required: true,
      },
    ],
  },
  {
    title: 'Canción',
    fields: [
      {
        name: 'image',
        label: 'Foto especial',
        type: 'image',
        required: true,
      },
      {
        name: 'verse',
        label: 'Verso de la canción',
        type: 'textarea',
        max_length: 120,
        required: true,
      },
    ],
  },
];

export function PlantillaLuisArce(props: TemplateSlideProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(5, prev + 1));
  };

  const prevSlide = () => {
    if (currentSlide === 5) {
      // Si estamos en el regalo 2 (Slide 6), volver al menú de regalos (Slide 4)
      setCurrentSlide(3);
    } else {
      setCurrentSlide((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden"
      style={{ backgroundColor: '#feffc9' }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@400..700&family=League+Spartan:wght@100..900&family=DM+Sans:opsz,wght@9..40,400..700&display=swap');
          
          .font-league { font-family: 'League Spartan', sans-serif; }
          .font-dancing { font-family: 'Dancing Script', cursive; }
          .font-cormorant { font-family: 'Cormorant Garamond', serif; }
          .font-dm { font-family: 'DM Sans', sans-serif; }
        `}
      </style>

      {/* Marca de agua si es preview */}
      {props.isPreview && (
        <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden opacity-30">
          <div className="flex flex-col gap-24 transform -rotate-45 scale-150 drop-shadow-md">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex gap-24 whitespace-nowrap">
                {Array.from({ length: 10 }).map((_, j) => (
                  <span key={j} className="text-6xl md:text-8xl font-black text-[#082b60] tracking-widest uppercase font-league">
                    Vista Previa
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controles invisibles globales de navegación estilo "Stories" */}
      {currentSlide > 0 && (
        <div
          className="absolute top-0 left-0 w-[30%] h-full z-50 cursor-pointer"
          onClick={prevSlide}
        />
      )}
      {currentSlide < 3 && (
        <div
          className="absolute top-0 right-0 w-[30%] h-full z-50 cursor-pointer"
          onClick={() => {
            if (currentSlide === 2) {
              // En la slide de contraseña, delegamos el click al botón de Entrar
              document.getElementById('slide3-enter-btn')?.click();
            } else {
              nextSlide();
            }
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {currentSlide === 0 && (
          <Slide1
            key="slide1"
            {...props}
            onNext={nextSlide}
            onPrev={prevSlide}
          />
        )}
        {currentSlide === 1 && (
          <Slide2
            key="slide2"
            {...props}
            onNext={nextSlide}
            onPrev={prevSlide}
          />
        )}
        {currentSlide === 2 && (
          <Slide3
            key="slide3"
            {...props}
            onNext={nextSlide}
            onPrev={prevSlide}
          />
        )}
        {currentSlide === 3 && (
          <Slide4
            key="slide4"
            {...props}
            onPrev={prevSlide}
            onSelectGift={(giftNumber: number) => {
              if (giftNumber === 1) setCurrentSlide(4);
              if (giftNumber === 2) setCurrentSlide(5);
            }}
          />
        )}
        {currentSlide === 4 && (
          <Slide5
            key="slide5"
            {...props}
            onNext={nextSlide}
            onPrev={prevSlide}
          />
        )}
        {currentSlide === 5 && (
          <Slide6
            key="slide6"
            {...props}
            onNext={nextSlide}
            onPrev={prevSlide}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export const plantillaLuisArceConfig = {
  templateForm: plantillaLuisArceForm,
  component: PlantillaLuisArce,
} satisfies TemplateConfig;
