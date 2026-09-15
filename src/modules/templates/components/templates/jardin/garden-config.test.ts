import { describe, expect, it } from 'vitest';
import { CLASICO, PREMIUM } from './garden-config';

/**
 * El tope de flores no es un numero suelto: viene de la promocion acordada con
 * el equipo. La base regalable llega a 75, asi que las dos plantillas de pago
 * tienen que ofrecer mas, y el premium mas que el clasico.
 */
const TOPE_BASE = 75;

describe('presets del jardin', () => {
  it('el clasico ofrece mas flores que la base regalable', () => {
    expect(CLASICO.maxFlowers).toBe(100);
    expect(CLASICO.maxFlowers).toBeGreaterThan(TOPE_BASE);
  });

  it('el premium ofrece mas de todo que el clasico', () => {
    expect(PREMIUM.maxFlowers).toBeGreaterThan(CLASICO.maxFlowers);
    expect(PREMIUM.islandRadius).toBeGreaterThan(CLASICO.islandRadius);
    expect(PREMIUM.initial.sunflowers).toBeGreaterThan(
      CLASICO.initial.sunflowers
    );
    expect(PREMIUM.initial.daisies).toBeGreaterThan(CLASICO.initial.daisies);
    expect(PREMIUM.animals.cats).toBeGreaterThan(CLASICO.animals.cats);
    expect(PREMIUM.animals.bees).toBeGreaterThan(CLASICO.animals.bees);
    expect(PREMIUM.animals.butterflies).toBeGreaterThan(
      CLASICO.animals.butterflies
    );
    expect(PREMIUM.fireflies).toBeGreaterThan(CLASICO.fireflies);
  });

  it('las dos cambian de dia a noche', () => {
    for (const preset of [CLASICO, PREMIUM]) {
      expect(preset.dayNight).toBe(true);
      expect(preset.dayLengthSeconds).toBeGreaterThan(30);
    }
  });

  it('el jardin arranca con menos flores de las que caben', () => {
    for (const preset of [CLASICO, PREMIUM]) {
      const iniciales = preset.initial.sunflowers + preset.initial.daisies;
      expect(iniciales).toBeLessThan(preset.maxFlowers);
    }
  });
});
