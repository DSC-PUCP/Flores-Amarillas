import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShowcaseSection } from './ShowcaseSection';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    className,
    target,
    rel,
  }: PropsWithChildren<{
    to: string;
    className?: string;
    target?: string;
    rel?: string;
  }>) => (
    <a href={to} className={className} target={target} rel={rel}>
      {children}
    </a>
  ),
}));

const FRAME_TITLE = 'Prueba tu dedicatoria: abre el sobre y descubre la carta';

function loadPreviewFrame() {
  const frame = screen.getByTitle<HTMLIFrameElement>(FRAME_TITLE);
  const frameWindow = frame.contentWindow;
  if (!frameWindow) throw new Error('Preview frame has no browsing context');
  const postMessage = vi
    .spyOn(frameWindow, 'postMessage')
    .mockImplementation(() => {});
  fireEvent.load(frame);
  fireEvent(
    window,
    new MessageEvent('message', {
      data: { type: 'flower-demo:ready' },
      origin: window.location.origin,
      source: frameWindow,
    })
  );
  return { frame, postMessage };
}

function flushTyping() {
  act(() => vi.advanceTimersByTime(600));
}

describe('ShowcaseSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('sends the edited recipient and message to the same origin without navigating or replacing the preview', () => {
    render(<ShowcaseSection />);
    const { frame, postMessage } = loadPreviewFrame();
    const initialSource = frame.getAttribute('src');
    postMessage.mockClear();

    fireEvent.change(screen.getByLabelText('¿Para quién son estas flores?'), {
      target: { value: ' Elena ' },
    });
    fireEvent.change(screen.getByLabelText('Algo que quieras decirle'), {
      target: { value: ' Gracias por hacerme sonreír. ' },
    });

    act(() => vi.advanceTimersByTime(599));
    expect(postMessage).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));

    expect(postMessage).toHaveBeenLastCalledWith(
      {
        type: 'flower-demo:update',
        recipient: 'Elena',
        message: 'Gracias por hacerme sonreír.',
      },
      window.location.origin
    );
    expect(screen.getByTitle(FRAME_TITLE)).toBe(frame);
    expect(frame.getAttribute('src')).toBe(initialSource);
    expect(screen.getByText('Un regalo para Elena')).toBeTruthy();
  });

  it.each([
    {
      button: 'Para mi amiga',
      recipient: 'Lucía',
      message:
        'Por las risas, por escucharme y por estar incluso en los días grises. Qué suerte tener una amiga como tú.',
    },
    {
      button: 'Para mi familia',
      recipient: 'Mamá',
      message:
        'Gracias por cuidarme, por creer en mí y por enseñarme a florecer. Hoy este poquito de sol es para ti.',
    },
  ])('updates both fields and the live gift when choosing $button', ({
    button,
    recipient,
    message,
  }) => {
    render(<ShowcaseSection />);
    const { frame, postMessage } = loadPreviewFrame();

    fireEvent.click(screen.getByRole('button', { name: button }));
    expect(
      screen.getByRole('button', { name: button }).getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      screen
        .getByRole('button', { name: 'Para mi amor' })
        .getAttribute('aria-pressed')
    ).toBe('false');
    expect(
      screen.getByLabelText<HTMLInputElement>('¿Para quién son estas flores?')
        .value
    ).toBe(recipient);
    expect(
      screen.getByLabelText<HTMLTextAreaElement>('Algo que quieras decirle')
        .value
    ).toBe(message);

    flushTyping();
    expect(postMessage).toHaveBeenLastCalledWith(
      { type: 'flower-demo:update', recipient, message },
      window.location.origin
    );
    expect(screen.getByTitle(FRAME_TITLE)).toBe(frame);
  });

  it('restarts the gift in a new iframe and sends the current edits when it is ready', () => {
    render(<ShowcaseSection />);
    const { frame } = loadPreviewFrame();
    fireEvent.change(screen.getByLabelText('¿Para quién son estas flores?'), {
      target: { value: 'Valeria' },
    });
    fireEvent.change(screen.getByLabelText('Algo que quieras decirle'), {
      target: { value: 'Estas flores son para ti.' },
    });
    flushTyping();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Volver a abrir el ejemplo desde el inicio',
      })
    );
    const restarted = loadPreviewFrame();

    expect(restarted.frame).not.toBe(frame);
    expect(frame.isConnected).toBe(false);
    expect(restarted.frame.getAttribute('src')).toBe(frame.getAttribute('src'));
    expect(restarted.postMessage).toHaveBeenLastCalledWith(
      {
        type: 'flower-demo:update',
        recipient: 'Valeria',
        message: 'Estas flores son para ti.',
      },
      window.location.origin
    );
    expect(
      screen.getByLabelText<HTMLInputElement>('¿Para quién son estas flores?')
        .value
    ).toBe('Valeria');
  });
  it('moves the idea selection with the arrow keys and keeps a single tab stop', () => {
    render(<ShowcaseSection />);
    loadPreviewFrame();

    const love = screen.getByRole('button', { name: 'Para mi amor' });
    const friend = screen.getByRole('button', { name: 'Para mi amiga' });
    const family = screen.getByRole('button', { name: 'Para mi familia' });

    // Solo la opción activa es alcanzable con el tabulador.
    expect(love.getAttribute('tabindex')).toBe('0');
    expect(friend.getAttribute('tabindex')).toBe('-1');

    love.focus();
    fireEvent.keyDown(love, { key: 'ArrowRight' });

    expect(friend.getAttribute('aria-pressed')).toBe('true');
    expect(friend.getAttribute('tabindex')).toBe('0');
    expect(love.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(friend);
    expect(
      screen.getByLabelText<HTMLInputElement>('¿Para quién son estas flores?')
        .value
    ).toBe('Lucía');

    // Se recorre en ciclo hacia atrás desde la primera opción.
    fireEvent.keyDown(friend, { key: 'ArrowLeft' });
    fireEvent.keyDown(love, { key: 'ArrowLeft' });
    expect(family.getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(family);

    fireEvent.keyDown(family, { key: 'Home' });
    expect(love.getAttribute('aria-pressed')).toBe('true');
  });

  it('says whether the edits already reached the example', () => {
    render(<ShowcaseSection />);
    loadPreviewFrame();

    expect(screen.getByText('Ejemplo actualizado')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Algo que quieras decirle'), {
      target: { value: 'Un mensaje nuevo.' },
    });
    expect(screen.getByText('Llevando tus cambios…')).toBeTruthy();

    flushTyping();
    expect(screen.getByText('Ejemplo actualizado')).toBeTruthy();
  });

  it('warns when the message is close to the character limit', () => {
    render(<ShowcaseSection />);
    loadPreviewFrame();
    const message = screen.getByLabelText('Algo que quieras decirle');

    fireEvent.change(message, { target: { value: 'a'.repeat(100) } });
    expect(screen.getByText('100/250').getAttribute('data-level')).toBe('ok');

    fireEvent.change(message, { target: { value: 'a'.repeat(215) } });
    expect(screen.getByText('215/250').getAttribute('data-level')).toBe('warn');

    fireEvent.change(message, { target: { value: 'a'.repeat(250) } });
    expect(screen.getByText('250/250').getAttribute('data-level')).toBe('full');
  });
});
