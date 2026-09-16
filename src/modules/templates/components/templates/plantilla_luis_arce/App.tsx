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
import Slide7 from './Slide7';
import { PianoDeFondo } from './PianoDeFondo';

/**
 * Textos de prueba que salen ya escritos en el formulario.
 *
 * Todos terminan en "(texto de prueba)" para que nadie publique un regalo con
 * ellos sin darse cuenta: si el aviso llega hasta la pagina final, se ve.
 *
 * `password` es la excepcion y no lo lleva: el campo admite 6 caracteres y el
 * aviso solo no ocupa 17.
 */
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
        default: 'Luis (texto de prueba)',
      },
      {
        name: 'personB',
        label: 'Su nombre',
        type: 'string',
        max_length: 25,
        required: true,
        default: 'Ana (texto de prueba)',
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
        default: '210926',
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
        default:
          'Gracias por estar, por reirte de mis chistes malos y por hacer que los dias grises se pasen rapido. Esta primavera es tuya. (texto de prueba)',
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
        default: 'Y en cada flor amarilla vuelvo a encontrarte. (texto de prueba)',
      },
    ],
  },
];

/** Ultima pantalla del recorrido: el cierre del 21 de septiembre. */
const ULTIMA = 6;

export function PlantillaLuisArce(props: TemplateSlideProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // En el editor la vista previa vive dentro de un iframe al lado del
  // formulario: musica ahi seria ruido mientras alguien escribe.
  const enElEditor =
    (props.templateData as Record<string, unknown> | undefined)
      ?.editorPreview === true;

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(ULTIMA, prev + 1));
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

      {/*
        La marca de agua salio de aqui: ahora la pone `TemplateRenderer` para
        todas las plantillas, y solo en el regalo sin pagar. Colgada de
        `isPreview` como estaba, tambien tapaba la vista previa en vivo del
        editor mientras el cliente escribia.
      */}

      {currentSlide > 0 && !enElEditor && <PianoDeFondo />}

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
        {currentSlide === ULTIMA && (
          <Slide7 key="slide7" {...props} onPrev={prevSlide} />
        )}
      </AnimatePresence>
    </div>
  );
}

export const plantillaLuisArceConfig = {
  templateForm: plantillaLuisArceForm,
  component: PlantillaLuisArce,
} satisfies TemplateConfig;
