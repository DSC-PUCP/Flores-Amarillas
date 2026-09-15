/**
 * Las dos plantillas del jardin comparten todo el motor 3D y se diferencian
 * solo en este objeto. Si algo se ve distinto entre el clasico y el premium,
 * la diferencia esta aca y no en dos copias del mismo codigo.
 */
export type GardenConfig = {
  /** Cuantas flores puede plantar quien recibe el regalo. */
  maxFlowers: number;
  /** Radio de la isla flotante, en unidades de la escena. */
  islandRadius: number;
  /** Flores ya plantadas al abrir. */
  initial: {
    /** Girasoles del anillo central, ademas del girasol grande del medio. */
    sunflowers: number;
    /** Margaritas repartidas por el borde. */
    daisies: number;
  };
  animals: {
    cats: number;
    bees: number;
    butterflies: number;
  };
  /** El cielo recorre amanecer, tarde y noche mientras se mira el jardin. */
  dayNight: boolean;
  /** Segundos que tarda una vuelta completa del cielo. */
  dayLengthSeconds: number;
  /** Luciernagas. De noche se encienden solas. */
  fireflies: number;
  /** Petalos que caen de fondo. */
  driftPetals: number;
};

/**
 * Clasico: el jardin de siempre, pero con cielo que pasa del dia a la noche,
 * abejas, mariposas y un gato mas. Cien flores, como pidio el equipo.
 */
export const CLASICO: GardenConfig = {
  maxFlowers: 100,
  islandRadius: 4.2,
  initial: { sunflowers: 13, daisies: 22 },
  animals: { cats: 3, bees: 6, butterflies: 5 },
  dayNight: true,
  dayLengthSeconds: 90,
  fireflies: 70,
  driftPetals: 34,
};

/**
 * Premium: isla mas grande, el doble de bichos, mas flores de arranque y tope
 * de 150. Ademas trae el cofre, que no vive aca sino en su plantilla.
 */
export const PREMIUM: GardenConfig = {
  maxFlowers: 150,
  islandRadius: 5.2,
  initial: { sunflowers: 19, daisies: 34 },
  animals: { cats: 4, bees: 12, butterflies: 9 },
  dayNight: true,
  dayLengthSeconds: 110,
  fireflies: 110,
  driftPetals: 52,
};
