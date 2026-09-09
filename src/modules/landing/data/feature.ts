import {
  Camera,
  Clock,
  Heart,
  type LucideIcon,
  Music,
  Palette,
  Share2,
} from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
  badge?: string;
}

export const FEATURES: Feature[] = [
  {
    icon: Clock,
    title: 'Contador en Vivo',
    description:
      'Muestra exactamente cuántos días, horas y segundos llevan juntos.',
    highlight: false,
  },
  {
    icon: Share2,
    title: 'Fácil de Compartir',
    description:
      'Genera un link único para enviar por WhatsApp, Instagram o QR.',
    highlight: false,
  },
  {
    icon: Heart,
    title: 'Personalización Total',
    description: 'Elige fotos, música de fondo y frases románticas únicas.',
    highlight: false,
  },
  {
    icon: Palette,
    title: 'Diseños Únicos',
    description: 'Plantillas exclusivas con estética romántica y San Valentín.',
    highlight: true,
    badge: 'Nuevo',
  },
  {
    icon: Camera,
    title: 'Galería de Recuerdos',
    description: 'Crea slideshow automático con sus mejores momentos juntos.',
    highlight: true,
    badge: 'Premium',
  },
];
