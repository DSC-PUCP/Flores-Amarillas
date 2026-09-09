export interface Template {
  id: string;
  title: string;
  description: string;
  image: string;
  plan: 'free' | 'premium';
}

export const TEMPLATES: Template[] = [
  {
    id: 'amor-eterno',
    title: 'Amor Eterno',
    description:
      'Un diseño clásico y elegante para celebrar un amor que trasciende el tiempo.',
    image:
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop',
    plan: 'free',
  },
  {
    id: 'juntos-por-siempre',
    title: 'Juntos por Siempre',
    description: 'Colores cálidos que reflejan la calidez de sus abrazos.',
    image:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop',
    plan: 'free',
  },
  {
    id: 'historia-de-dos',
    title: 'Historia de Dos',
    description: 'Perfecto para contar su historia cronológicamente.',
    image:
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600&auto=format&fit=crop',
    plan: 'premium',
  },
  {
    id: 'plantilla-1',
    title: 'Plantilla 1',
    description: 'Plantilla 1',
    image:
      'https://plus.unsplash.com/premium_vector-1733816699601-beb7c8b68701?q=80&w=722&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    plan: 'free',
  },
  {
    id: 'plantilla-2',
    title: 'Plantilla 2',
    description: 'Plantilla 2',
    image:
      'https://plus.unsplash.com/premium_vector-1733816699601-beb7c8b68701?q=80&w=722&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    plan: 'free',
  },
];
