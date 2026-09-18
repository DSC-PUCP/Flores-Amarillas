import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { TemplateConfig, TemplateForm } from '@/core/models/template';
import { useSongClips } from '@/modules/music/hooks/useSongClips';
import { PianoDeFondo } from '@/modules/music/PianoDeFondo';
import type { TemplateSlideProps } from '@/modules/templates/types';
import { BotonDeCancion } from './BotonDeCancion';
import Slide1 from './Slide1';
import Slide2 from './Slide2';
import Slide3 from './Slide3';
import Slide4 from './Slide4';
import Slide5 from './Slide5';
import Slide6 from './Slide6';
import Slide7 from './Slide7';

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
        default:
          'Y en cada flor amarilla vuelvo a encontrarte. (texto de prueba)',
      },
      {
        name: 'songs',
        label: 'Su canción · elige el fragmento que más les guste',
        type: 'music',
        // Una sola: esta plantilla habla de "nuestra canción favorita", en
        // singular, y solo tiene un tocadiscos donde ponerla.
        max_songs: 1,
        max_clip_seconds: 120,
        // Opcional a proposito: las dedicatorias que ya estan publicadas no
        // tienen cancion, y tienen que seguir funcionando igual.
        required: false,
        // El regalo 2 no dibuja la letra en ningun sitio, asi que pedirla solo
        // alargaria el formulario.
        lyrics: false,
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

  /*
   * El reproductor vive aqui y no dentro del regalo 2 a proposito: al salir de
   * esa pantalla el componente se desmonta, y con el se iria la cancion. Aqui
   * arriba sigue sonando por el resto del recorrido, que es justo lo pedido.
   */
  const music = useSongClips(
    (props.templateData as Record<string, unknown> | undefined)?.songs
  );
  const hayCancion = music.count > 0 && !enElEditor;

  /**
   * Una vez que suena la cancion, el piano no vuelve.
   *
   * Es un pestillo y no `currentSlide === 5`: si dependiera de la pantalla, al
   * salir del regalo 2 el piano se encenderia otra vez y se pisaria con la
   * cancion, que sigue sonando.
   */
  const [cancionEncendida, setCancionEncendida] = useState(false);

  // Al entrar al regalo 2 arranca la cancion. Para entonces la persona ya ha
  // tocado la pantalla varias veces, asi que el navegador deja sonar el audio.
  useEffect(() => {
    if (currentSlide !== 5 || !hayCancion) return;
    setCancionEncendida(true);
    music.play();
  }, [currentSlide, hayCancion, music.play]);

  /*
   * Al llegar al cierre se avisa una sola vez. Solo escucha esto una pagina de
   * ejemplo, para poner delante su "gracias por ver este ejemplo"; en un
   * regalo de verdad nadie pasa `onComplete` y aqui no cambia nada.
   */
  const { onComplete } = props;
  useEffect(() => {
    if (currentSlide !== ULTIMA) return;
    onComplete?.();
  }, [currentSlide, onComplete]);

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

      <PianoDeFondo
        activo={currentSlide > 0 && !enElEditor && !cancionEncendida}
        className="right-5 bottom-24 md:right-8 md:bottom-28"
      />

      {/*
        El reproductor de YouTube: solo pone el sonido, no se ve. No puede ir
        con `display: none` porque entonces el navegador no lo carga, y se
        monta siempre —tambien sin cancion— para que nada lo desmonte a mitad
        de una reproduccion.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-[113px] w-[200px] opacity-0"
      >
        <div
          ref={music.hostRef}
          className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
        />
      </div>

      {/* Relevo del piano: mismo sitio, misma pinta, otra musica. */}
      {cancionEncendida && (
        <BotonDeCancion
          sonando={music.playing}
          onToggle={music.toggle}
          titulo={music.song?.title}
          className="right-5 bottom-24 md:right-8 md:bottom-28"
        />
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
