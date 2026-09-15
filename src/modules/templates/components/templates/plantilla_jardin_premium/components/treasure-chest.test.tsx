// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { GardenApi } from '../../jardin/garden-stage';
import { TreasureChest } from './treasure-chest';

afterEach(cleanup);

function fakeApi(started = true) {
  const audio = {
    unlock: vi.fn(),
    knock: vi.fn(),
    switchTo: vi.fn(),
    fanfare: vi.fn(),
  };
  const garden = { celebrate: vi.fn() };
  return {
    api: { audio, garden, started } as unknown as GardenApi,
    audio,
    garden,
  };
}

const chest = () => screen.getByRole('button', { name: /cofre/i });
const knock = (times: number) => {
  for (let i = 0; i < times; i++) {
    fireEvent.pointerDown(chest(), { pointerId: 1 });
  }
};

it('no aparece hasta que se abre el regalo', () => {
  const { api } = fakeApi(false);
  render(
    <TreasureChest api={api} letter="secreto" recipient="Sofía" sender="Leo" />
  );
  expect(screen.queryByRole('button', { name: /cofre/i })).toBeNull();
});

it('aguanta catorce golpes cerrado y se abre al quince', () => {
  const { api, audio, garden } = fakeApi();
  render(
    <TreasureChest
      api={api}
      taps={15}
      letter="Esto era para ti"
      recipient="Sofía"
      sender="Leo"
    />
  );

  knock(14);
  expect(chest().getAttribute('aria-label')).toContain('14 de 15');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(audio.switchTo).not.toHaveBeenCalled();

  knock(1);
  const dialog = screen.getByRole('dialog');
  expect(dialog.textContent).toContain('Esto era para ti');
  expect(dialog.textContent).toContain('Leo');
  // Al abrirse cambia a la segunda cancion y celebra.
  expect(audio.switchTo).toHaveBeenCalledWith('cofre');
  expect(audio.fanfare).toHaveBeenCalledTimes(1);
  expect(garden.celebrate).toHaveBeenCalledTimes(1);
});

it('cada golpe suena un poco mas alto que el anterior', () => {
  const { api, audio } = fakeApi();
  render(
    <TreasureChest api={api} taps={15} letter="x" recipient="S" sender="L" />
  );
  knock(3);
  const tonos = audio.knock.mock.calls.map(([p]) => p as number);
  expect(tonos).toHaveLength(3);
  expect(tonos[1]).toBeGreaterThan(tonos[0]);
  expect(tonos[2]).toBeGreaterThan(tonos[1]);
});

it('muestra la foto cuando la hay, y no un hueco cuando no', () => {
  const conFoto = fakeApi();
  const { unmount } = render(
    <TreasureChest
      api={conFoto.api}
      taps={2}
      photo="https://ejemplo/foto.webp"
      letter="x"
      recipient="Sofía"
      sender="Leo"
    />
  );
  knock(2);
  expect(screen.getByRole('img').getAttribute('src')).toBe(
    'https://ejemplo/foto.webp'
  );
  unmount();

  const sinFoto = fakeApi();
  render(
    <TreasureChest
      api={sinFoto.api}
      taps={2}
      letter="x"
      recipient="S"
      sender="L"
    />
  );
  knock(2);
  expect(screen.queryByRole('img')).toBeNull();
});

it('se puede cerrar y volver a abrir sin repetir los golpes', () => {
  const { api, audio } = fakeApi();
  render(
    <TreasureChest api={api} taps={3} letter="hola" recipient="S" sender="L" />
  );
  knock(3);
  expect(screen.getByRole('dialog')).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
  expect(screen.queryByRole('dialog')).toBeNull();

  // Ya abierto, un toque lo vuelve a mostrar sin sumar golpes ni recelebrar.
  knock(1);
  expect(screen.getByRole('dialog')).toBeTruthy();
  expect(audio.fanfare).toHaveBeenCalledTimes(1);
});
