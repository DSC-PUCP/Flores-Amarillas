// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SpringMusic } from './spring-music';

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('animates only during actual playback and follows pause, buffering and song changes', () => {
  const { container } = render(
    <SpringMusic
      songs={[
        { url: '/one.mp3', name: 'Uno' },
        { url: '/two.mp3', name: 'Dos' },
      ]}
    />
  );
  const audio = container.querySelectorAll('audio');
  const status = screen.getByRole('status');
  fireEvent.click(screen.getByRole('button', { name: 'Reproducir Uno' }));
  expect(status.textContent).toContain('UN LADO A');
  fireEvent.playing(audio[0]);
  expect(status.textContent).toBe('SONANDO PARA TI');
  fireEvent.waiting(audio[0]);
  expect(status.textContent).toContain('UN LADO A');
  fireEvent.playing(audio[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Pausar Uno' }));
  expect(status.textContent).toContain('UN LADO A');
  fireEvent.click(screen.getByRole('button', { name: 'Reproducir Dos' }));
  fireEvent.playing(audio[1]);
  fireEvent.pause(audio[0]);
  expect(status.textContent).toBe('SONANDO PARA TI');
  fireEvent.ended(audio[1]);
  expect(status.textContent).toContain('UN LADO A');
});

it('returns to stopped state when playback fails and disables empty songs', async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(
    new Error('Unavailable')
  );
  render(<SpringMusic songs={[{ url: '/one.mp3', name: 'Uno' }]} />);
  expect(
    screen
      .getByRole('button', { name: 'Reproducir Canción 2' })
      .hasAttribute('disabled')
  ).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Reproducir Uno' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Reproducir Uno' })).toBeTruthy()
  );
  expect(screen.getByRole('status').textContent).toContain('UN LADO A');
});
