export interface Plan {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    title: 'Plan Gratuito',
    price: 'Gratis',
    features: [
      '1 dedicatoria',
      'Duración 24 horas',
      'Plantillas básicas',
      'Compartir por link',
    ],
    cta: 'Crear Gratis',
  },
  {
    id: 'premium',
    title: 'Plan Premium',
    price: '$9.99',
    originalPrice: '$19.99',
    features: [
      'Dedicatorias ilimitadas',
      'Todas las plantillas',
      'Música personalizada',
      'Sin anuncios',
    ],
    cta: 'Elegir Premium',
    highlight: true,
  },
];
