import type { TemplateConfig, TemplateForm } from '@/core/models/template';
import type { TemplateSlideProps } from '../../types';
import { FlowerDedication } from './flower-dedication';

export type TemplateData = {
  personA: string;
  personB: string;
  image: string | null;
  timelinePhotos?: string[];
  message: string;
  startDate: Date;
};

export const plantillaGratuitaForm = [
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
        max_length: 25,
        label: 'Su nombre',
        type: 'string',
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
    title: 'El mensaje',
    fields: [
      {
        name: 'message',
        label: 'Escribe tu carta',
        max_length: 250,
        type: 'string',
        required: true,
      },
    ],
  },
  {
    title: 'Recuerdos',
    fields: [
      {
        name: 'image',
        label: 'Imagen de foto de portada',
        type: 'image',
        required: true,
      },
      {
        name: 'timelinePhotos',
        label: 'Timeline de fotos',
        type: 'array',
        item_type: 'image',
        required: false,
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
