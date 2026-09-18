import { cleanup, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EJEMPLOS } from './components/config/ejemplos';
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
    params,
    children,
  }: PropsWithChildren<{
    to: string;
    search?: Record<string, unknown>;
    params?: Record<string, string>;
  }>) => {
    // Los `$param` de la ruta se sustituyen como haria el router: sin esto,
    // el href de un ejemplo seria literalmente "/lovepage/$lovepageId".
    const ruta = Object.entries(params ?? {}).reduce(
      (camino, [clave, valor]) => camino.replace(`$${clave}`, valor),
      to
    );
    return (
      <a
        href={
          search
            ? `${ruta}?${new URLSearchParams(Object.entries(search).map(([key, value]) => [key, String(value)]))}`
            : ruta
        }
      >
        {children}
      </a>
    );
  },
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

  /**
   * El ejemplo es la accion principal de la tarjeta y lleva a una pagina real
   * ya activada, no a una demo con datos de relleno. Antes esto solo existia
   * para dos disenos y salia como un enlace pequeno debajo del boton.
   */
  it('lleva al ejemplo desplegado de cada diseno que tenga uno', () => {
    render(<TemplateContent />);
    const enlaces = screen.getAllByRole('link', {
      name: 'Ver el ejemplo completo',
    });
    // La gratuita y la premium tienen ejemplo; "otra" no esta en EJEMPLOS.
    expect(enlaces).toHaveLength(2);
    expect(enlaces.map((enlace) => enlace.getAttribute('href'))).toEqual([
      `/lovepage/${EJEMPLOS.plantilla_gratuita}`,
      `/lovepage/${EJEMPLOS.plantilla_giano_feat_leo}`,
    ]);
  });

  /**
   * Sin ejemplo la tarjeta no se queda coja: personalizar vuelve a ser el
   * boton principal, y sigue habiendo uno por diseno.
   */
  it('un diseno sin ejemplo conserva su boton de personalizar', () => {
    render(<TemplateContent />);
    expect(
      screen.getAllByRole('button', { name: /Personalizar este diseño/ })
    ).toHaveLength(3);
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
