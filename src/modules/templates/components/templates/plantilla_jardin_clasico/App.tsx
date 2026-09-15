import type { TemplateConfig, TemplateForm } from '@/core/models/template';
import type { TemplateSlideProps } from '@/modules/templates/types';
import { CLASICO } from '../jardin/garden-config';
import { GardenStage } from '../jardin/garden-stage';
import { readText } from '../jardin/read-data';

export const plantillaJardinClasicoForm = [
  {
    title: 'Pantalla 1 · Para quién es el jardín',
    description: 'Los dos nombres que aparecen bajo el título.',
    previewScene: 'cover',
    fields: [
      {
        name: 'personB',
        label: 'Su nombre',
        type: 'string',
        max_length: 25,
        required: true,
      },
      {
        name: 'personA',
        label: 'Tu nombre',
        type: 'string',
        max_length: 25,
        required: true,
      },
    ],
  },
  {
    title: 'Pantalla 2 · Tu carta',
    description:
      'Se escribe sola, letra a letra, cuando el jardín termina de crecer.',
    previewScene: 'letter',
    fields: [
      {
        name: 'message',
        label: 'Escribe tu carta',
        type: 'textarea',
        max_length: 400,
        required: true,
      },
    ],
  },
] satisfies TemplateForm;

const CARTA_EJEMPLO =
  'Dicen que las flores amarillas se regalan para llenar de alegría a quien las recibe. Como una sola no me alcanzaba, te hice un jardín entero… y le puse gatitos, porque todo es mejor con gatitos. Gracias por ser mi sol. 🌻';

export function PlantillaJardinClasico({ templateData }: TemplateSlideProps) {
  return (
    <GardenStage
      config={CLASICO}
      recipient={readText(templateData, 'personB', 'ti')}
      sender={readText(templateData, 'personA', 'alguien que te quiere')}
      message={readText(templateData, 'message', CARTA_EJEMPLO)}
    />
  );
}

export const plantillaJardinClasicoConfig = {
  templateForm: plantillaJardinClasicoForm,
  component: PlantillaJardinClasico,
} satisfies TemplateConfig;
