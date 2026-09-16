import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TemplateData } from '@/core/models/template';
import { TemplateRenderer } from './TemplateRenderer';

// Las plantillas reales traen 3D, audio y fuentes remotas. Aqui solo importa
// quien decide la marca de agua, asi que basta con una de mentira.
vi.mock('./config/template-components', () => ({
  TEMPLATE_COMPONENTS: {
    cualquiera: ({ isPreview }: { isPreview?: boolean }) => (
      <div>plantilla, isPreview={String(isPreview)}</div>
    ),
  },
}));

afterEach(cleanup);

const datos = {} as TemplateData;
const marca = () => document.querySelector('[data-marca-de-agua]');

describe('TemplateRenderer y la marca de agua', () => {
  it('no marca nada si no se lo piden', () => {
    render(<TemplateRenderer templateKey="cualquiera" templateData={datos} />);
    expect(marca()).toBeNull();
  });

  it('marca el regalo cuando se lo piden', () => {
    render(
      <TemplateRenderer
        templateKey="cualquiera"
        templateData={datos}
        marcaDeAgua
      />
    );
    expect(marca()).not.toBeNull();
    expect(screen.getAllByText('Vista Previa').length).toBeGreaterThan(1);
  });

  /**
   * El editor y la demo de la landing renderizan con `isPreview` en true. Si
   * alguien vuelve a atar la marca a esa prop, el cliente escribe su regalo
   * con "Vista Previa" encima y esta prueba lo dice.
   */
  it('no marca por el solo hecho de ser isPreview', () => {
    render(
      <TemplateRenderer
        templateKey="cualquiera"
        templateData={datos}
        isPreview
      />
    );
    expect(marca()).toBeNull();
  });

  it('deja pasar isPreview a la plantilla, que lo usa para otras cosas', () => {
    render(
      <TemplateRenderer
        templateKey="cualquiera"
        templateData={datos}
        isPreview={false}
        marcaDeAgua
      />
    );
    expect(screen.getByText(/isPreview=false/)).toBeTruthy();
    expect(marca()).not.toBeNull();
  });

  it('no se cae con una plantilla que no existe', () => {
    render(
      <TemplateRenderer
        templateKey="no-existe"
        templateData={datos}
        marcaDeAgua
      />
    );
    expect(screen.getByText('No se encontró la plantilla')).toBeTruthy();
    expect(marca()).not.toBeNull();
  });
});
