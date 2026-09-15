import type { TemplateConfig, TemplateForm } from '@/core/models/template';
import type { TemplateSlideProps } from '@/modules/templates/types';
import { getCameraMemories } from './components/spring-camera-data';
import { SpringWelcome } from './components/spring-welcome';

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
      },
    ],
  },
  {
    title: 'Pantalla 2 · Nosotros dos',
    previewScene: 'intro',
    fields: [
      {
        name: 'message',
        label: 'La frase que aparecerá al deslizar el corazón',
        type: 'textarea',
        max_length: 250,
        required: true,
      },
    ],
  },
  {
    title: 'Pantalla 3 · Recuerditos nuestros',
    previewScene: 'photos',
    fields: [
      ...Array.from({ length: 4 }, (_, index) => [
        {
          name: `memoryPhoto${index + 1}`,
          label: `Foto ${index + 1} · Elige un recuerdo`,
          type: 'image' as const,
          required: true,
        },
        {
          name: `memoryDetail${index + 1}`,
          label: `¿Qué hace especial la foto ${index + 1}?`,
          type: 'textarea' as const,
          max_length: 100,
          required: true,
        },
      ]).flat(),
      {
        name: 'cameraMessage',
        label: 'Frase que aparecerá al descubrir las cuatro fotos',
        type: 'textarea',
        max_length: 240,
        required: true,
      },
    ],
  },
  {
    title: 'Pantalla 4 · Nuestra música',
    previewScene: 'song',
    fields: [
      {
        name: 'songs',
        label: 'Elige sus canciones y el fragmento que más les guste',
        type: 'music',
        max_songs: 3,
        max_clip_seconds: 90,
        required: false,
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
      },
    ],
  },
] satisfies TemplateForm;

export function PlantillaCarlosPrimavera({ templateData }: TemplateSlideProps) {
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
