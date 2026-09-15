import { describe, expect, it } from 'vitest';
import type { TemplateForm } from '@/core/models/template';
import { plantillaJardinClasicoForm } from '../plantilla_jardin_clasico/App';
import {
  CHEST_TAPS,
  plantillaJardinPremiumForm,
} from '../plantilla_jardin_premium/App';

const formularios: [string, TemplateForm][] = [
  ['clasico', plantillaJardinClasicoForm],
  ['premium', plantillaJardinPremiumForm],
];

describe.each(formularios)('formulario del jardin %s', (_nombre, form) => {
  it('no repite ningun campo', () => {
    const nombres = form.flatMap((paso) => paso.fields.map((f) => f.name));
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it('pide los dos nombres y la carta, y limita lo que se escribe', () => {
    const campos = form.flatMap((paso) => paso.fields);
    for (const name of ['personA', 'personB', 'message']) {
      const campo = campos.find((f) => f.name === name);
      expect(campo, `falta ${name}`).toBeTruthy();
      expect(campo?.required).toBe(true);
      expect('max_length' in (campo ?? {})).toBe(true);
    }
  });

  it('cada paso declara su escena para el editor en vivo', () => {
    for (const paso of form) {
      expect(
        paso.previewScene,
        `"${paso.title}" sin previewScene`
      ).toBeTruthy();
    }
  });
});

describe('formulario del jardin premium', () => {
  it('suma el cofre, con su foto y su carta', () => {
    const paso = plantillaJardinPremiumForm.find((p) =>
      p.title.includes('cofre')
    );
    expect(paso).toBeTruthy();
    const nombres = paso?.fields.map((f) => f.name) ?? [];
    expect(nombres).toContain('chestPhoto');
    expect(nombres).toContain('chestLetter');
    // Lo del cofre es opcional: sin llenarlo la plantilla usa sus ejemplos.
    for (const f of paso?.fields ?? []) expect(f.required).toBe(false);
  });

  it('el texto del paso dice cuantos golpes cuesta, y coincide con el codigo', () => {
    const paso = plantillaJardinPremiumForm.find((p) =>
      p.title.includes('cofre')
    );
    expect(paso?.description).toContain(String(CHEST_TAPS));
    expect(CHEST_TAPS).toBe(15);
  });

  it('el clasico no trae cofre', () => {
    const nombres = plantillaJardinClasicoForm.flatMap((p) =>
      p.fields.map((f) => f.name)
    );
    expect(nombres.some((n) => n.startsWith('chest'))).toBe(false);
  });
});
