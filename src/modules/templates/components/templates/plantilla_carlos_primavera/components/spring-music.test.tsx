// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { SongClip } from '@/core/models/song';
import type { SongClipsPlayer } from '@/modules/music/hooks/useSongClips';
import { SpringMusic } from './spring-music';

afterEach(cleanup);

const clip = (videoId: string, title: string, artist: string): SongClip => ({
  videoId,
  title,
  artist,
  start: 30,
  end: 105,
  lyrics: [],
});

/** Reproductor de mentira: aqui se prueba el tocadiscos, no YouTube. */
function fakePlayer(overrides: Partial<SongClipsPlayer> = {}): SongClipsPlayer {
  return {
    hostRef: () => {},
    songs: [],
    song: null,
    index: 0,
    count: 0,
    ready: true,
    errorCode: null,
    playing: false,
    currentTime: 0,
    progress: 0,
    lineIndex: -1,
    play: vi.fn(),
    pause: vi.fn(),
    toggle: vi.fn(),
    goTo: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    ...overrides,
  } as SongClipsPlayer;
}

it('muestra cada fragmento con su artista y duracion, y deja vacios los huecos que faltan', () => {
  const songs = [
    clip('aaaaaaaaaaa', 'Uno', 'Artista Uno'),
    clip('bbbbbbbbbbb', 'Dos', 'Artista Dos'),
  ];
  render(<SpringMusic music={fakePlayer({ songs, count: 2 })} />);

  expect(screen.getByText('Uno')).toBeTruthy();
  // 105 - 30 = 75 segundos de fragmento, no la duracion del video entero.
  expect(screen.getByText('Artista Uno · 1:15')).toBeTruthy();
  expect(
    screen
      .getByRole('button', { name: 'Reproducir Canción 3' })
      .hasAttribute('disabled')
  ).toBe(true);
});

it('salta al fragmento elegido y luego alterna sobre el mismo', () => {
  const songs = [
    clip('aaaaaaaaaaa', 'Uno', 'Artista Uno'),
    clip('bbbbbbbbbbb', 'Dos', 'Artista Dos'),
  ];
  const music = fakePlayer({ songs, count: 2 });
  const { rerender } = render(<SpringMusic music={music} />);

  fireEvent.click(screen.getByRole('button', { name: 'Reproducir Dos' }));
  expect(music.goTo).toHaveBeenCalledWith(1);
  expect(music.toggle).not.toHaveBeenCalled();

  rerender(
    <SpringMusic
      music={fakePlayer({ ...music, songs, count: 2, index: 1, playing: true })}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Pausar Dos' }));
  expect(music.toggle).toHaveBeenCalledTimes(1);
});

it('el tocadiscos solo gira cuando suena de verdad', () => {
  const songs = [clip('aaaaaaaaaaa', 'Uno', 'Artista Uno')];
  const { rerender } = render(
    <SpringMusic music={fakePlayer({ songs, count: 1 })} />
  );
  expect(screen.getByRole('status').textContent).toContain('UN LADO A');

  rerender(
    <SpringMusic music={fakePlayer({ songs, count: 1, playing: true })} />
  );
  expect(screen.getByRole('status').textContent).toBe('SONANDO PARA TI');
});

it('explica el error cuando YouTube no deja reproducir el video', () => {
  const songs = [clip('aaaaaaaaaaa', 'Uno', 'Artista Uno')];
  render(
    <SpringMusic music={fakePlayer({ songs, count: 1, errorCode: 150 })} />
  );
  expect(
    screen.getByText(/no permite reproducirse fuera de YouTube/)
  ).toBeTruthy();
});
