import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useScrollReveal } from './useScrollReveal';

/**
 * El riesgo de este hook es dejar contenido invisible para siempre, así que
 * las pruebas cubren los caminos en los que eso podría pasar: sin
 * `IntersectionObserver`, con movimiento reducido y durante la hidratación.
 */

function Sample() {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <div className="bloom-site" ref={ref} data-testid="site">
      <p data-reveal data-testid="above">
        Ya visible
      </p>
      <p data-reveal="left" data-testid="below">
        Todavía abajo
      </p>
    </div>
  );
}

/** Coloca cada bloque arriba o abajo de la línea de corte de pantalla. */
function stubLayout({
  aboveTop,
  belowTop,
}: {
  aboveTop: number;
  belowTop: number;
}) {
  const original = Element.prototype.getBoundingClientRect;
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: Element) {
      const id = this.getAttribute('data-testid');
      if (id === 'above') return { top: aboveTop } as DOMRect;
      if (id === 'below') return { top: belowTop } as DOMRect;
      return original.call(this);
    }
  );
}

function stubMatchMedia(reduced: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduced && query.includes('reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useScrollReveal', () => {
  it('reveals everything and never arms the hidden state without IntersectionObserver', () => {
    stubMatchMedia(false);
    vi.stubGlobal('IntersectionObserver', undefined);

    const { getByTestId } = render(<Sample />);

    expect(getByTestId('above').dataset.revealed).toBe('true');
    expect(getByTestId('below').dataset.revealed).toBe('true');
    // Sin `data-motion` el CSS jamás llega a ocultar nada.
    expect(getByTestId('site').dataset.motion).toBeUndefined();
  });

  it('reveals everything when the system asks for reduced motion', () => {
    stubMatchMedia(true);
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );

    const { getByTestId } = render(<Sample />);

    expect(getByTestId('above').dataset.revealed).toBe('true');
    expect(getByTestId('below').dataset.revealed).toBe('true');
    expect(getByTestId('site').dataset.motion).toBeUndefined();
  });

  it('reveals what is already on screen before arming, and the rest on scroll', () => {
    stubMatchMedia(false);
    stubLayout({ aboveTop: 120, belowTop: 4000 });

    const observed: Element[] = [];
    let notify: ((entries: IntersectionObserverEntry[]) => void) | undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
          notify = callback;
        }
        observe(node: Element) {
          observed.push(node);
        }
        unobserve() {}
        disconnect() {}
      }
    );

    const { getByTestId } = render(<Sample />);

    // Lo que ya se ve arranca revelado: al hidratar no parpadea.
    expect(getByTestId('above').dataset.revealed).toBe('true');
    expect(getByTestId('below').dataset.revealed).toBeUndefined();
    expect(getByTestId('site').dataset.motion).toBe('on');
    expect(observed).toEqual([getByTestId('below')]);

    notify?.([
      {
        isIntersecting: true,
        target: getByTestId('below'),
      } as unknown as IntersectionObserverEntry,
    ]);

    expect(getByTestId('below').dataset.revealed).toBe('true');
  });
});
