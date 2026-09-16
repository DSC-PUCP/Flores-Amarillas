import type { TemplateConfig, TemplateForm } from '@/core/models/template';
import type { TemplateSlideProps } from '../../types';
import { FlowerDedication } from './flower-dedication';

export type TemplateData = {
  personA: string;
  personB: string;
  image: string | null;
  timelinePhotos?: string[];
  message: string;
  startDate?: string | Date | null;
};

export const plantillaGratuitaForm = [
  {
    title: 'La portada',
    description: 'Los nombres que aparecen al recibir el sobre.',
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
    ],
  },
  {
    title: 'La carta',
    description: 'Lo primero que leerá al abrir el regalo.',
    previewScene: 'letter',
    fields: [
      {
        name: 'message',
        label: 'Escribe tu dedicatoria',
        max_length: 250,
        type: 'textarea',
        required: true,
        default: 'Gracias por estar. Contigo hasta un martes cualquiera parece primavera. (texto de prueba)',
      },
    ],
  },
  {
    title: 'Su foto',
    description:
      'Un solo recuerdo junto a la carta. El carrusel pertenece a la premium.',
    previewScene: 'photos',
    fields: [
      {
        name: 'image',
        label: 'Una foto para acompañar la carta (opcional)',
        type: 'image',
        required: false,
      },
    ],
  },
  {
    title: 'El contador',
    description:
      'Aparece después de la foto. Si no quieres un contador, deja la fecha vacía.',
    previewScene: 'intro',
    fields: [
      {
        name: 'startDate',
        label: '¿Cuándo fue su primera primavera? (opcional)',
        type: 'date',
        required: false,
        default: '2024-09-21',
      },
    ],
  },
] satisfies TemplateForm;

export function PlantillaGratuita(props: TemplateSlideProps) {
  return <FlowerDedication {...props} />;
}

export const plantillaGratuitaConfig = {
  templateForm: plantillaGratuitaForm,
  component: PlantillaGratuita,
} satisfies TemplateConfig;
