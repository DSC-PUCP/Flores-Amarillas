// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TemplateData } from '@/core/models/template';
import { plantillaLuisArceForm, PlantillaLuisArce } from './App';

/**
 * El relevo del piano por la cancion del regalo 2.
 *
 * Se prueba aqui y no en el navegador porque lo que importa no es que suene
 * —eso lo pone YouTube— sino CUANDO: que arranque al abrir el regalo 2, que el
 * piano se calle, y sobre todo que no vuelva al salir de esa pantalla. Ese
 * ultimo detalle es el que un `currentSlide === 5` haria mal y nadie notaria
 * hasta oir las dos cosas a la vez.
 */

const { reproductor } = vi.hoisted(() => ({
  reproductor: {
    play: vi.fn(),
    toggle: vi.fn(),
    playing: true,
    count: 1,
    song: { title: 'Nuestra canción' } as { title: string } | null,
    hostRef: () => undefined,
  },
}));

vi.mock('@/modules/music/hooks/useSongClips', () => ({
  useSongClips: () => reproductor,
}));

const CONTRASENA = '210926';

/*
 * `as TemplateData` porque el fragmento va incompleto: el reproductor esta
 * simulado, asi que lo unico que importa de `songs` es que exista. Escribir un
 * SongClip entero solo anadiria ruido.
 */
const datos = {
  personA: 'Luis',
  personB: 'Ana',
  password: CONTRASENA,
  message: 'Un mensaje',
  verse: 'Un verso',
  songs: [{ videoId: 'abcdefghijk', title: 'Nuestra canción' }],
} as unknown as TemplateData;

/**
 * Deja el recorrido en el regalo 2, que es donde entra la cancion.
 *
 * Cada paso espera a que aparezca el siguiente: las pantallas se relevan con
 * `AnimatePresence mode="wait"`, asi que la nueva no existe hasta que la
 * anterior termina de salir.
 */
async function abrirRegalo2() {
  fireEvent.click(await screen.findByRole('button', { name: '¡Abrir!' }));
  fireEvent.click(await screen.findByRole('button', { name: /Sí/ }));

  await waitFor(() => {
    const casillas = screen
      .getAllByRole('textbox')
      .filter((input) => (input as HTMLInputElement).maxLength === 1);
    expect(casillas).toHaveLength(CONTRASENA.length);
  });
  const casillas = screen
    .getAllByRole('textbox')
    .filter((input) => (input as HTMLInputElement).maxLength === 1);
  CONTRASENA.split('').forEach((letra, i) => {
    fireEvent.change(casillas[i], { target: { value: letra } });
  });

  fireEvent.click(screen.getByText('Entrar'));
  fireEvent.click(await screen.findByAltText('Regalo 2'));
  // La pantalla del regalo 2 ya montada: su titulo lo confirma.
  await screen.findByText('Nuestra canción favorita');
}

const botonPiano = () =>
  screen.queryByRole('button', { name: /el piano/i });
const botonCancion = () =>
  screen.queryByRole('button', { name: /Nuestra canción/i });

afterEach(() => {
  cleanup();
  reproductor.play.mockClear();
});

describe('la canción del regalo 2', () => {
  it('se pide en el formulario, sin letra y de una sola canción', () => {
    const campo = plantillaLuisArceForm
      .flatMap((paso) => paso.fields)
      .find((field) => field.type === 'music');
    expect(campo).toMatchObject({
      name: 'songs',
      max_songs: 1,
      lyrics: false,
      // Opcional: las dedicatorias ya publicadas no tienen cancion.
      required: false,
    });
  });

  it('suena al abrir el regalo 2 y apaga el piano', async () => {
    render(<PlantillaLuisArce templateData={datos} />);
    // Antes del regalo 2 el piano acompaña el recorrido.
    fireEvent.click(screen.getByRole('button', { name: '¡Abrir!' }));
    await waitFor(() => expect(botonPiano()).not.toBeNull());

    cleanup();
    render(<PlantillaLuisArce templateData={datos} />);
    await abrirRegalo2();

    expect(reproductor.play).toHaveBeenCalled();
    expect(botonPiano()).toBeNull();
    expect(botonCancion()).not.toBeNull();
  });

  it('el piano no vuelve al salir del regalo 2', async () => {
    render(<PlantillaLuisArce templateData={datos} />);
    await abrirRegalo2();
    // "Volver" desde el regalo 2 lleva al menú de regalos.
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));

    expect(await screen.findByText('Escoge tu regalo')).toBeTruthy();
    expect(botonPiano()).toBeNull();
    expect(botonCancion()).not.toBeNull();
  });

  it('sin canción elegida el piano se queda, como antes', async () => {
    reproductor.count = 0;
    render(<PlantillaLuisArce templateData={{ ...datos, songs: [] }} />);
    await abrirRegalo2();

    expect(reproductor.play).not.toHaveBeenCalled();
    expect(botonPiano()).not.toBeNull();
    expect(botonCancion()).toBeNull();
    reproductor.count = 1;
  });

  it('en el editor no suena nada: la vista previa vive junto al formulario', async () => {
    render(
      <PlantillaLuisArce templateData={{ ...datos, editorPreview: true }} />
    );
    await abrirRegalo2();

    expect(reproductor.play).not.toHaveBeenCalled();
    expect(botonPiano()).toBeNull();
    expect(botonCancion()).toBeNull();
  });
});
