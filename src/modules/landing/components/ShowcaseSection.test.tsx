import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShowcaseSection } from './ShowcaseSection';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
    search,
  }: PropsWithChildren<{
    to: string;
    params?: { id: string };
    search?: Record<string, unknown>;
  }>) => (
    <a
      href={`${params ? to.replace('$id', params.id) : to}${search ? `?${new URLSearchParams(Object.entries(search).map(([key, value]) => [key, String(value)]))}` : ''}`}
    >
      {children}
    </a>
  ),
}));
vi.mock('@/modules/templates/hooks/useTemplate', () => ({
  useTemplates: () => ({
    data: [
      { id: 1, templateKey: 'plantilla_gratuita', isVisible: true },
      { id: 2, templateKey: 'plantilla_giano_feat_leo', isVisible: true },
    ],
  }),
}));
const FREE_TITLE = 'Prueba tu dedicatoria: abre el sobre y descubre la carta';
const PREMIUM_TITLE =
  'Prueba tu dedicatoria premium: abre el regalo y recorre las secciones';
function ready(title = FREE_TITLE) {
  const frame = screen.getByTitle<HTMLIFrameElement>(title);
  const frameWindow = frame.contentWindow;
  if (!frameWindow) throw new Error('Falta la ventana de vista previa');
  const postMessage = vi
    .spyOn(frameWindow, 'postMessage')
    .mockImplementation(() => {});
  fireEvent.load(frame);
  fireEvent(
    window,
    new MessageEvent('message', {
      data: { type: 'flower-demo:ready' },
      origin: window.location.origin,
      source: frame.contentWindow,
    })
  );
  return { frame, postMessage };
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('demostración del inicio', () => {
  it('muestra ejemplos sin repetir el formulario ni la elección del animalito', () => {
    render(<ShowcaseSection />);
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: 'Premium' }));
    expect(screen.queryByRole('radio', { name: 'Gatito' })).toBeNull();
    expect(
      screen
        .getByRole('link', { name: 'Crear este regalo' })
        .getAttribute('href')
    ).toBe('/template/2');
  });
  it('envía el ejemplo elegido sin recargar el regalo', () => {
    render(<ShowcaseSection />);
    const { frame, postMessage } = ready();
    fireEvent.click(screen.getByRole('button', { name: 'Para mi familia' }));
    expect(postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: 'flower-demo:update',
        recipient: 'Mamá',
      }),
      window.location.origin
    );
    expect(screen.getByTitle(FREE_TITLE)).toBe(frame);
    expect(screen.getByText('Para Mamá')).toBeTruthy();
  });
  it('lleva al formulario de la plantilla que se está viendo', () => {
    render(<ShowcaseSection />);
    expect(
      screen
        .getByRole('link', { name: 'Crear este regalo' })
        .getAttribute('href')
    ).toBe('/template/1');
    fireEvent.click(screen.getByRole('radio', { name: 'Premium' }));
    expect(ready(PREMIUM_TITLE).frame.getAttribute('src')).toBe(
      '/preview?template=premium&embed=true'
    );
    expect(
      screen
        .getByRole('link', { name: 'Crear este regalo' })
        .getAttribute('href')
    ).toBe('/template/2');
  });
  it('reinicia la premium conservando el ejemplo elegido', () => {
    render(<ShowcaseSection />);
    fireEvent.click(screen.getByRole('radio', { name: 'Premium' }));
    const initial = ready(PREMIUM_TITLE);
    fireEvent.click(screen.getByRole('button', { name: 'Para mi amiga' }));
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Volver a abrir el ejemplo desde el inicio',
      })
    );
    const next = ready(PREMIUM_TITLE);
    expect(next.frame).not.toBe(initial.frame);
    expect(next.postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({ recipient: 'Lucía' }),
      window.location.origin
    );
  });
  it('permite cambiar el ejemplo con las flechas del teclado', () => {
    render(<ShowcaseSection />);
    const love = screen.getByRole('button', { name: 'Para mi amor' });
    love.focus();
    fireEvent.keyDown(love, { key: 'ArrowRight' });
    const friend = screen.getByRole('button', { name: 'Para mi amiga' });
    expect(friend.getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(friend);
    expect(love.tabIndex).toBe(-1);
  });
});
