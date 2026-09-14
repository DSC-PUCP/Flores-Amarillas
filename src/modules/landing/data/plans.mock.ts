import type { Plan } from '@/core/models';

/**
 * DATOS DE PRUEBA — no se usan en producción.
 *
 * Solo los consume la ruta de desarrollo `/plansPreview`, para poder iterar
 * en cómo se ven los planes sin tocar la tabla `plans` de Supabase.
 * Edita estos objetos y el navegador se recarga solo (hot reload).
 *
 * Cuando un set quede aprobado, se replica como filas reales en Supabase.
 */

/** Propuesta de 3 niveles (ver creatividad/conceptos/plantillas-flores-amarillas.md). */
export const MOCK_PLANS_TRES_NIVELES: Plan[] = [
  {
    id: 1,
    name: 'Semilla',
    price: 0,
    description: 'Un detalle simple para probar, gratis y al instante.',
    features: [
      '1 dedicatoria',
      'Duración de 24 horas',
      '1 foto de portada',
      'Mensaje de hasta 150 caracteres',
      'Compartir por link',
    ],
  },
  {
    id: 2,
    name: 'Brote',
    price: 12,
    description: 'Para cuando quieres que la sorpresa tenga más que contar.',
    features: [
      'Link permanente',
      'Hasta 4 fotos',
      'Mensaje de hasta 250 caracteres',
      'Ramo interactivo que se arma solo',
      'Plantillas de pareja y amistad',
    ],
  },
  {
    id: 3,
    name: 'Floración',
    price: 25,
    description: 'La experiencia completa: varias escenas, música y sorpresas.',
    features: [
      'Link permanente',
      'Hasta 10 fotos + galería',
      'Mensaje de hasta 400 caracteres',
      'Música de fondo con reproductor',
      'Cupón sorpresa y escena de cierre',
      'Todas las plantillas (pareja, amistad y familia)',
    ],
  },
];

/** Los 2 planes que existen hoy, para comparar cómo cambia el layout. */
export const MOCK_PLANS_ACTUALES: Plan[] = [
  {
    id: 1,
    name: 'Plan Gratuito',
    price: 0,
    description: 'Crea tu dedicatoria y compártela al instante.',
    features: [
      '1 dedicatoria',
      'Duración de 24 horas',
      'Plantillas básicas',
      'Compartir por link',
    ],
  },
  {
    id: 2,
    name: 'Plan Premium',
    price: 20,
    description: 'Tu dedicatoria para siempre, con todas las plantillas.',
    features: [
      'Link permanente',
      'Todas las plantillas',
      'Música personalizada',
      'Galería de fotos',
    ],
  },
];
