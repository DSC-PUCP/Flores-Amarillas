import type { MockTheme } from '../art/TemplateMock';

/**
 * Plantillas que se muestran en la vitrina del landing.
 *
 * Hoy se dibujan con `TemplateMock` porque las capturas reales
 * (`previewImageUrl` de la tabla `templates`) todavía no están disponibles.
 * Cuando lo estén, basta con agregar `image` a cada entrada y la sección
 * mostrará la foto real en lugar de la maqueta.
 */
export type ShowcaseTemplate = {
  id: string;
  name: string;
  /** Para quién es: pareja, amistad, familia. */
  audience: string;
  /** Qué hace especial a esta plantilla. */
  highlight: string;
  names: string;
  days: string;
  message: string;
  theme: MockTheme;
  /** Cuando exista la captura real de la plantilla, se pone acá. */
  image?: string;
};

export const TEMPLATE_SHOWCASE: ShowcaseTemplate[] = [
  {
    id: 'campo-dorado',
    name: 'Campo Dorado',
    audience: 'Para tu pareja',
    highlight: 'Contador de días y galería de fotos',
    names: 'Ana & Mateo',
    days: '1 274 días juntos',
    message: '«Contigo hasta el último girasol del campo.»',
    theme: {
      bg: 'bg-[linear-gradient(180deg,#FDF3DC,#F6E3B8)]',
      title: 'text-[#8A5F16]',
      soft: 'stroke-[#C3A15A]/70',
      photo: 'bg-[linear-gradient(150deg,#F3DFAA,#DFC489)]',
      accent: 'fill-[#E4B948]',
      core: 'fill-[#A9741F]',
      button: 'bg-[#A9741F]',
      swatch: 'bg-[linear-gradient(140deg,#F7C325,#D4870E)]',
    },
  },
  {
    id: 'ramo-amistad',
    name: 'Ramo de Amistad',
    audience: 'Para tu mejor amigx',
    highlight: 'Un ramo que se arma con cada recuerdo',
    names: 'Para Lucía',
    days: '8 años de amistad',
    message: '«Un ramo de razones para quererte.»',
    theme: {
      bg: 'bg-[linear-gradient(180deg,#F6F4E4,#E8EED6)]',
      title: 'text-[#5E7233]',
      soft: 'stroke-[#9DB073]/70',
      photo: 'bg-[linear-gradient(150deg,#E9EED4,#D3DFB4)]',
      accent: 'fill-[#E2C55B]',
      core: 'fill-[#7C8F45]',
      button: 'bg-[#6B7C3A]',
      swatch: 'bg-[linear-gradient(140deg,#CBDD8E,#6B7C3A)]',
    },
  },
  {
    id: 'atardecer',
    name: 'Luz de Atardecer',
    audience: 'Para tu familia',
    highlight: 'Álbum de recuerdos con música de fondo',
    names: 'Para mamá',
    days: 'Desde siempre',
    message: '«Gracias por enseñarme a florecer.»',
    theme: {
      bg: 'bg-[linear-gradient(180deg,#FBEBDC,#F3D9C0)]',
      title: 'text-[#8A4F22]',
      soft: 'stroke-[#C89267]/70',
      photo: 'bg-[linear-gradient(150deg,#F5DCC0,#E4BE97)]',
      accent: 'fill-[#E9A94E]',
      core: 'fill-[#A66225]',
      button: 'bg-[#A0561F]',
      swatch: 'bg-[linear-gradient(140deg,#F5B478,#A0561F)]',
    },
  },
  {
    id: 'noche-luciernagas',
    name: 'Noche de Luciérnagas',
    audience: 'Para tu pareja',
    highlight: 'Carta con sobre que se abre y cupón sorpresa',
    names: 'Sofía & Diego',
    days: '3 años y 2 meses',
    message: '«Te elegiría en cualquier primavera.»',
    theme: {
      bg: 'bg-[linear-gradient(180deg,#2A2A33,#1B1B22)]',
      title: 'text-[#F0D492]',
      soft: 'stroke-[#8C7F5E]/70',
      photo: 'bg-[linear-gradient(150deg,#3A3A46,#26262F)]',
      accent: 'fill-[#E9C766]',
      core: 'fill-[#C09A3E]',
      button: 'bg-[#C09A3E]',
      swatch: 'bg-[linear-gradient(140deg,#5B5B6B,#22222A)]',
    },
  },
];
