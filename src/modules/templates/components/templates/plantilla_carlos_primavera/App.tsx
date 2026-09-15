import type { TemplateConfig, TemplateForm } from '@/core/models/template';
import type { TemplateSlideProps } from '@/modules/templates/types';
import { getCameraMemories } from './components/spring-camera-data';
import { SpringWelcome } from './components/spring-welcome';

export const plantillaCarlosPrimaveraForm = [
  {
    title: 'Pantalla 1 · Bienvenida de primavera',
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
    // TODO(fase 3): reemplazar por un unico campo `type: 'music'` para usar el
    // catalogo de 25 canciones y el reproductor de YouTube de `@/modules/music`.
    // Hoy `spring-music` mete esta URL en un <audio>, que no reproduce YouTube.
    title: 'Pantalla 4 · Nuestra música',
    fields: [
      {
        name: 'song1',
        label: 'Canción 1 (URL)',
        type: 'string',
        required: false,
      },
      {
        name: 'song2',
        label: 'Canción 2 (URL)',
        type: 'string',
        required: false,
      },
      {
        name: 'song3',
        label: 'Canción 3 (URL)',
        type: 'string',
        required: false,
      },
      {
        name: 'song1Name',
        label: 'Nombre de la canción 1',
        type: 'string',
        max_length: 60,
        required: false,
      },
      {
        name: 'song2Name',
        label: 'Nombre de la canción 2',
        type: 'string',
        max_length: 60,
        required: false,
      },
      {
        name: 'song3Name',
        label: 'Nombre de la canción 3',
        type: 'string',
        max_length: 60,
        required: false,
      },
    ],
  },
  {
    title: 'Pantalla 5 · Una carta para ti',
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

  const songs = [1, 2, 3].map((n) => ({
    url:
      typeof templateData[`song${n}`] === 'string'
        ? (templateData[`song${n}`] as string)
        : '',
    name:
      typeof templateData[`song${n}Name`] === 'string'
        ? (templateData[`song${n}Name`] as string)
        : `Canción ${n}`,
  }));

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
      songs={songs}
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
