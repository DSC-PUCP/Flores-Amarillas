import type { TemplateConfig, TemplateForm } from '@/core/models/template';
import type { TemplateSlideProps } from '@/modules/templates/types';
import { getCameraMemories } from './components/spring-camera-data';
import { SpringWelcome } from './components/spring-welcome';

/**
 * Textos de prueba que ya salen escritos en el formulario. Todos terminan en
 * "(texto de prueba)" para que nadie publique un regalo con ellos sin verlo.
 */
export const plantillaCarlosPrimaveraForm = [
  {
    title: 'Pantalla 1 · Bienvenida de primavera',
    previewScene: 'cover',
    fields: [
      {
        name: 'personA',
        label: 'Tu nombre',
        type: 'string',
        max_length: 25,
        required: true,
        default: 'Carlos (texto de prueba)',
      },
      {
        name: 'personB',
        label: 'Su nombre',
        type: 'string',
        max_length: 25,
        required: true,
        default: 'Ana (texto de prueba)',
      },
      {
        name: 'startDate',
        label: '¿Cuándo fue su primera primavera?',
        type: 'date',
        required: true,
        default: '2024-09-21',
      },
    ],
  },
  {
    title: 'Pantalla 2 · Nuestra música',
    previewScene: 'song',
    fields: [
      {
        name: 'songs',
        label: 'Elige sus canciones y el fragmento que más les guste',
        type: 'music',
        max_songs: 3,
        max_clip_seconds: 90,
        required: false,
        // Esta plantilla no dibuja la letra en ninguna pantalla, asi que
        // pedirla en el editor solo hace mas largo el formulario.
        lyrics: false,
      },
    ],
  },
  {
    title: 'Pantalla 3 · Nosotros dos',
    previewScene: 'intro',
    fields: [
      {
        name: 'message',
        label: 'La frase que aparecerá al deslizar el corazón',
        type: 'textarea',
        max_length: 250,
        required: true,
        default: 'Contigo hasta lo normal se vuelve bonito. (texto de prueba)',
      },
    ],
  },
  {
    title: 'Pantalla 4 · Recuerditos nuestros',
    previewScene: 'photos',
    fields: [
      /*
       * Una sola casilla para las cuatro fotos.
       *
       * Antes eran cuatro campos de imagen y cuatro de texto: ocho casillas
       * para una pantalla que muestra cuatro fotos. Los textos por foto se
       * fueron del formulario a peticion del cliente y ahora son un texto
       * fijo (ver `spring-camera-data.ts`).
       */
      {
        name: 'memoryPhotos',
        label: 'Sus cuatro recuerdos favoritos, en orden',
        type: 'array',
        item_type: 'image',
        max_items: 4,
        required: true,
      },
      {
        name: 'cameraMessage',
        label: 'Frase que aparecerá al descubrir las cuatro fotos',
        type: 'textarea',
        max_length: 240,
        required: true,
        default:
          'Cuatro momentos que me recuerdan por que te quiero. (texto de prueba)',
      },
    ],
  },
  {
    title: 'Pantalla 5 · Una carta para ti',
    previewScene: 'letter',
    fields: [
      {
        name: 'letterMessage',
        label:
          'Tu carta · Escribe todo lo que quieras decirle (conservaremos tus saltos de línea)',
        type: 'textarea',
        max_length: 10000,
        required: false,
        default:
          'Gracias por cada primavera contigo. Por las de verdad y por las que nos inventamos un martes cualquiera. (texto de prueba)',
      },
    ],
  },
] satisfies TemplateForm;

export function PlantillaCarlosPrimavera({
  templateData,
  onComplete,
}: TemplateSlideProps) {
  const recipient =
    typeof templateData.personB === 'string' ? templateData.personB.trim() : '';
  const message =
    typeof templateData.message === 'string' ? templateData.message : '';

  return (
    <SpringWelcome
      recipient={recipient || 'Para ti'}
      cardMessage={message}
      memories={getCameraMemories(templateData)}
      cameraMessage={
        typeof templateData.cameraMessage === 'string'
          ? templateData.cameraMessage
          : ''
      }
      songs={templateData.songs}
      onComplete={onComplete}
      editorScene={
        typeof templateData.editorScene === 'string'
          ? templateData.editorScene
          : undefined
      }
      letterMessage={
        typeof templateData.letterMessage === 'string'
          ? templateData.letterMessage
          : ''
      }
      sender={
        typeof templateData.personA === 'string' ? templateData.personA : ''
      }
    />
  );
}

export const plantillaCarlosPrimaveraConfig = {
  templateForm: plantillaCarlosPrimaveraForm,
  component: PlantillaCarlosPrimavera,
} satisfies TemplateConfig;
