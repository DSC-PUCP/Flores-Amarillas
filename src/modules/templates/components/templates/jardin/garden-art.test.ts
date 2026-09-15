import { describe, expect, it } from 'vitest';
import { SKY_MOMENTS, skyAt, smooth } from './garden-art';

describe('ciclo de dia y noche', () => {
  it('recorre los cuatro momentos y vuelve al principio', () => {
    const vistos = new Set<string>();
    for (let i = 0; i < 40; i++) vistos.add(skyAt(i / 40).moment);
    for (const momento of SKY_MOMENTS) expect(vistos).toContain(momento.name);
  });

  it('da la vuelta: la fase 1 es la misma que la 0', () => {
    expect(skyAt(1).gradient).toBe(skyAt(0).gradient);
    // Y tampoco se rompe con fases negativas o gigantes.
    expect(skyAt(-0.25).gradient).toBe(skyAt(0.75).gradient);
    expect(skyAt(7.5).gradient).toBe(skyAt(0.5).gradient);
  });

  it('de dia no hay estrellas y de noche se ven todas', () => {
    const dia = SKY_MOMENTS.findIndex((m) => m.name === 'dia');
    const noche = SKY_MOMENTS.findIndex((m) => m.name === 'noche');
    expect(skyAt(dia / SKY_MOMENTS.length).stars).toBe(0);
    expect(skyAt(noche / SKY_MOMENTS.length).stars).toBe(1);
  });

  it('las luciernagas siguen a la noche, no al dia', () => {
    const n = SKY_MOMENTS.length;
    const dia = skyAt(SKY_MOMENTS.findIndex((m) => m.name === 'dia') / n);
    const noche = skyAt(SKY_MOMENTS.findIndex((m) => m.name === 'noche') / n);
    expect(noche.fireflies).toBeGreaterThan(dia.fireflies);
  });

  it('el degradado siempre sale armado, sin colores a medias', () => {
    for (let i = 0; i <= 20; i++) {
      const { gradient } = skyAt(i / 20);
      expect(gradient.startsWith('radial-gradient(')).toBe(true);
      expect(gradient.match(/rgb\(/g)).toHaveLength(4);
      expect(gradient).not.toContain('NaN');
    }
  });

  it('smooth se queda entre 0 y 1 aunque se pase de rango', () => {
    expect(smooth(0, 1, -5)).toBe(0);
    expect(smooth(0, 1, 5)).toBe(1);
    expect(smooth(0, 1, 0.5)).toBeCloseTo(0.5, 5);
  });
});
