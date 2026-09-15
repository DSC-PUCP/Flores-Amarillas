import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SongClip } from '@/core/models/song';
import { PlantillaGianoFeatLeo } from '@/modules/templates/components/templates/plantilla_giano_feat_leo/App';
import { useSongClips } from './useSongClips';

type PlayerOptions = ConstructorParameters<
  NonNullable<Window['YT']>['Player']
>[1];
const instances: Player[] = [];
class Player {
  options: PlayerOptions;
  playVideo = vi.fn();
  pauseVideo = vi.fn();
  seekTo = vi.fn();
  getCurrentTime = vi.fn(() => 28);
  getDuration = vi.fn(() => 240);
  loadVideoById = vi.fn();
  cueVideoById = vi.fn();
  destroy = vi.fn();
  constructor(_element: HTMLElement, options: PlayerOptions) {
    this.options = options;
    instances.push(this);
  }
}
const clip: SongClip = {
  videoId: 'test-video1',
  title: 'Moonlight',
  artist: 'Ariana Grande',
  start: 28,
  end: 58,
  lyrics: [],
};
function Preview({ songs }: { songs: SongClip[] }) {
  const music = useSongClips(songs);
  return (
    <div>
      {music.count > 0 && <div ref={music.hostRef} />}
      <button type="button" disabled={!music.ready} onClick={music.toggle}>
        Escuchar
      </button>
    </div>
  );
}
beforeEach(() => {
  instances.length = 0;
  window.YT = { Player };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
  );
});
afterEach(() => {
  cleanup();
  delete window.YT;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe('reproductor de la vista previa', () => {
  it('inicializa YouTube al seleccionar una canción después de empezar sin canciones', async () => {
    const draft = {
      personA: 'Mateo',
      personB: 'Lucía',
      compactPreview: true,
      editorPreview: true,
      editorScene: 'song',
      editorRevision: 0,
    };
    const { rerender } = render(
      <PlantillaGianoFeatLeo templateData={draft} isPreview />
    );
    expect(instances.length).toBe(0);
    rerender(
      <PlantillaGianoFeatLeo
        templateData={{ ...draft, songs: [clip] }}
        isPreview
      />
    );
    await waitFor(() => expect(instances.length).toBe(1));
    const player = instances[0];
    act(() => player.options.events.onReady());
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'Escuchar nuestra canción',
      }).disabled
    ).toBe(false);
    expect(player.cueVideoById).toHaveBeenCalledWith({
      videoId: 'test-video1',
      startSeconds: 28,
      endSeconds: 58,
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Escuchar nuestra canción' })
    );
    expect(player.playVideo).toHaveBeenCalledTimes(1);
    act(() => player.options.events.onStateChange({ data: 1 }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Pausar nuestra canción' })
    );
    expect(player.pauseVideo).toHaveBeenCalledTimes(1);
    const loads = player.cueVideoById.mock.calls.length;
    rerender(
      <PlantillaGianoFeatLeo
        templateData={{ ...draft, songs: [clip], message: 'Una carta nueva.' }}
        isPreview
      />
    );
    expect(instances.length).toBe(1);
    expect(player.cueVideoById).toHaveBeenCalledTimes(loads);
  });
  it('libera el reproductor al quitar la canción y vuelve a habilitarlo al elegir otra', async () => {
    const { rerender } = render(<Preview songs={[clip]} />);
    await waitFor(() => expect(instances.length).toBe(1));
    const first = instances[0];
    act(() => first.options.events.onReady());
    rerender(<Preview songs={[]} />);
    expect(first.destroy).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Escuchar' })
        .disabled
    ).toBe(true);
    // Los eventos tardíos del reproductor eliminado no habilitan el nuevo.
    act(() => first.options.events.onReady());
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Escuchar' })
        .disabled
    ).toBe(true);
    rerender(<Preview songs={[{ ...clip, videoId: 'other-video' }]} />);
    await waitFor(() => expect(instances.length).toBe(2));
    act(() => instances[1].options.events.onReady());
    fireEvent.click(screen.getByRole('button', { name: 'Escuchar' }));
    expect(instances[1].playVideo).toHaveBeenCalledTimes(1);
    expect(instances[1].cueVideoById).toHaveBeenCalledWith(
      expect.objectContaining({ videoId: 'other-video' })
    );
  });
});
