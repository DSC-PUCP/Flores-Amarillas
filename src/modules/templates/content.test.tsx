import { cleanup, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TemplateContent } from './content';

/** Lo que trae la URL en cada prueba. Sin plan, se ven todos los disenos. */
const { busqueda } = vi.hoisted(() => ({
  busqueda: { valor: {} as { plan?: string } },
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => busqueda.valor,
  Link: ({
    to,
    search,
    children,
  }: PropsWithChildren<{ to: string; search?: Record<string, unknown> }>) => (
    <a
      href={
        search
          ? `${to}?${new URLSearchParams(Object.entries(search).map(([key, value]) => [key, String(value)]))}`
          : to
      }
    >
      {children}
    </a>
  ),
}));
vi.mock('../landing/hooks/usePlans', () => ({
  usePlans: () => ({
    data: [
      { id: 1, name: 'Gratuito' },
      { id: 2, name: 'Flores Amarillas' },
      { id: 3, name: 'Girasol' },
    ],
  }),
}));
vi.mock('./hooks/useTemplate', () => ({
  useTemplates: () => ({
    data: [
      {
        id: 1,
        templateKey: 'plantilla_gratuita',
        name: 'Gratuita',
        isVisible: true,
        tipoPlan: 'Gratuito',
      },
      {
        id: 2,
        templateKey: 'plantilla_giano_feat_leo',
        name: 'Premium',
        isVisible: true,
        tipoPlan: 'Flores Amarillas',
      },
      {
        id: 3,
        templateKey: 'otra',
        name: 'Otro diseño',
        isVisible: true,
        tipoPlan: 'Girasol',
      },
    ],
  }),
}));

afterEach(() => {
  cleanup();
  busqueda.valor = {};
});

describe('probar diseños del catálogo', () => {
  it('muestra una miniatura propia de la premium aunque falte su imagen configurada', () => {
    render(<TemplateContent />);
    expect(
      screen.getByRole('img', {
        name: 'Vista previa de la plantilla premium: animalito con flores amarillas, carta, fotos y música',
      })
    ).toBeTruthy();
    // Los diseños desconocidos conservan el aviso cuando no tienen imagen.
    expect(
      screen.getAllByText('La imagen de este diseño no está disponible.')
    ).toHaveLength(1);
  });

  it('abre la demo correspondiente para la gratuita y la premium', () => {
    render(<TemplateContent />);
    const links = screen.getAllByRole('link', {
      name: 'Ver ejemplo',
    });
    expect(links).toHaveLength(2);
    const urls = links.map(
      (link) => new URL(link.getAttribute('href') ?? '', 'http://localhost')
    );
    expect(urls.map((url) => url.searchParams.get('template'))).toEqual([
      'free',
      'premium',
    ]);
    expect(
      urls.every(
        (url) =>
          url.pathname === '/preview' &&
          url.searchParams.get('embed') === 'false'
      )
    ).toBe(true);
  });

  /**
   * Las tarjetas de planes del home enlazan a /template?plan=<nombre>. Si el
   * filtro volviera a vivir en un useState, ese enlace aterrizaria en el
   * catalogo completo y esta prueba lo diria.
   */
  it('filtra por el plan que trae la URL y deja ese chip marcado', () => {
    busqueda.valor = { plan: 'Girasol' };
    render(<TemplateContent />);

    expect(screen.getByText('Otro diseño')).toBeTruthy();
    expect(screen.queryByText('Gratuita')).toBeNull();
    expect(screen.queryByText('Premium')).toBeNull();

    const marcado = screen
      .getAllByRole('button', { pressed: true })
      .map((chip) => chip.textContent);
    expect(marcado).toEqual(['Girasol']);
  });

  it('sin plan en la URL muestra todos los disenos', () => {
    render(<TemplateContent />);
    // `getAllByText`: el nombre del diseno sale tanto en su titulo como en el
    // pie de su miniatura, asi que hay mas de una coincidencia por diseno.
    expect(screen.getAllByText('Gratuita').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Premium').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Otro diseño').length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('button', { pressed: true }).map((c) => c.textContent)
    ).toEqual(['Todos']);
  });
});
