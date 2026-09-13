import {
  Clock,
  Flower2,
  type LucideIcon,
  Music,
  Palette,
  Share2,
  Users,
} from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
  badge?: string;
  /** Acento de color: mantiene la paleta variada (no todo amarillo). */
  tone?: 'gold' | 'leaf' | 'sky' | 'sunset';
}

export const FEATURES: Feature[] = [
  {
    icon: Clock,
    title: 'Contador en vivo',
    description:
      'Muestra cuántos días llevan juntos, o desde cuándo son amigos inseparables.',
    highlight: false,
    tone: 'sky',
  },
  {
    icon: Share2,
    title: 'Fácil de compartir',
    description:
      'Genera un link único para enviar por WhatsApp, Instagram o QR.',
    highlight: false,
    tone: 'leaf',
  },
  {
    icon: Flower2,
    title: 'Un ramo que se arma solo',
    description:
      'Cada foto y cada recuerdo que subes agrega una flor a su ramo digital.',
    highlight: true,
    badge: 'Nuevo',
    tone: 'gold',
  },
  {
    icon: Users,
    title: 'Para cualquier cariño',
    description:
      'Pareja, amistad o familia: elige el tono y las plantillas se adaptan.',
    highlight: false,
    tone: 'sunset',
  },
  {
    icon: Palette,
    title: 'Diseños de primavera',
    description:
      'Plantillas hechas para el 21 de setiembre, con flores amarillas y luz dorada.',
    highlight: true,
    badge: 'Temporada',
    tone: 'gold',
  },
  {
    icon: Music,
    title: 'Con su canción',
    description:
      'Suena de fondo la canción que les recuerda a ustedes, desde YouTube o Spotify.',
    highlight: false,
    tone: 'leaf',
  },
];
