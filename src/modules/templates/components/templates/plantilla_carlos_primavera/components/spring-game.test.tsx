// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SpringWelcome } from './spring-welcome';

vi.mock('./spring-game-art', () => ({
  loadGardenArt: vi
    .fn()
    .mockResolvedValue({ boy: [], girl: [], background: {} }),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('reaches screen six and supports start, pause, resume and restart', async () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  render(<SpringWelcome recipient="María" />);
  for (const name of [
    'Ir a Nosotros dos',
    'Ir a Recuerditos nuestros',
    'Ir a Nuestra música',
    'Ir a Una carta para ti',
    'Ir a Una aventura para ti',
  ]) {
    fireEvent.click(screen.getByRole('button', { name }));
  }
  expect(
    screen.getByRole('heading', { name: 'Una flor, una pequeña aventura' })
  ).toBeTruthy();
  fireEvent.click(await screen.findByRole('button', { name: 'EMPEZAR' }));
  expect(screen.queryByRole('button', { name: 'EMPEZAR' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Pausar o continuar' }));
  expect(screen.getByRole('button', { name: 'CONTINUAR' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'CONTINUAR' }));
  expect(screen.queryByRole('button', { name: 'CONTINUAR' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'SELECT' }));
  expect(screen.getByRole('button', { name: 'EMPEZAR' })).toBeTruthy();
  fireEvent.click(
    screen.getByRole('button', { name: 'Volver a Una carta para ti' })
  );
  expect(screen.getByRole('button', { name: 'Abrir carta' })).toBeTruthy();
});
