import { cleanup, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TemplateContent } from './content';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
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
  usePlans: () => ({ data: [] }),
}));
vi.mock('./hooks/useTemplate', () => ({
  useTemplates: () => ({
    data: [
      {
        id: 1,
        templateKey: 'plantilla_gratuita',
        name: 'Gratuita',
        isVisible: true,
      },
      {
        id: 2,
        templateKey: 'plantilla_giano_feat_leo',
        name: 'Premium',
        isVisible: true,
      },
      { id: 3, templateKey: 'otra', name: 'Otro diseño', isVisible: true },
    ],
  }),
}));

afterEach(cleanup);

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
});
