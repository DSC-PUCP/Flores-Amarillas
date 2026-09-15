import type { TemplateConfig, TemplateForm } from '@/core/models/template';
import type { TemplateSlideProps } from '@/modules/templates/types';
import { PREMIUM } from '../jardin/garden-config';
import { GardenStage } from '../jardin/garden-stage';
import { readImage, readText } from '../jardin/read-data';
import { TreasureChest } from './components/treasure-chest';

/** Cuantos golpes cuesta abrir el cofre. */
export const CHEST_TAPS = 15;

export const plantillaJardinPremiumForm = [
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
  {
    title: 'Pantalla 3 · El cofre',
    description: `Está cerrado: hay que golpearlo ${CHEST_TAPS} veces para abrirlo. Dentro aparece esta foto, esta carta y empieza a sonar la segunda canción.`,
    previewScene: 'coupon',
    fields: [
      {
        name: 'chestPhoto',
        label: 'La foto que guarda el cofre',
        type: 'image',
        required: false,
      },
      {
        name: 'chestLetter',
        label: 'Lo que dice el papel que está dentro',
        type: 'textarea',
        max_length: 600,
        required: false,
      },
    ],
  },
] satisfies TemplateForm;

const CARTA_EJEMPLO =
  'Dicen que las flores amarillas se regalan para llenar de alegría a quien las recibe. Como una sola no me alcanzaba, te hice un jardín entero… y le puse gatitos, porque todo es mejor con gatitos. Gracias por ser mi sol. 🌻';

const COFRE_EJEMPLO =
  'Si llegaste hasta aquí es porque insististe, y eso es exactamente lo que me gusta de ti. Guardé esto al final del jardín para que fuera solo tuyo. 💛';

export function PlantillaJardinPremium({ templateData }: TemplateSlideProps) {
  const recipient = readText(templateData, 'personB', 'ti');
  const sender = readText(templateData, 'personA', 'alguien que te quiere');

  return (
    <GardenStage
      config={PREMIUM}
      recipient={recipient}
      sender={sender}
      message={readText(templateData, 'message', CARTA_EJEMPLO)}
      renderExtras={(api) => (
        <TreasureChest
          api={api}
          taps={CHEST_TAPS}
          photo={readImage(templateData, 'chestPhoto')}
          letter={readText(templateData, 'chestLetter', COFRE_EJEMPLO)}
          recipient={recipient}
          sender={sender}
        />
      )}
    />
  );
}

export const plantillaJardinPremiumConfig = {
  templateForm: plantillaJardinPremiumForm,
  component: PlantillaJardinPremium,
} satisfies TemplateConfig;
