// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { plantillaCarlosPrimaveraForm } from '../App';
import { SpringCamera } from './spring-camera';
import { getCameraMemories } from './spring-camera-data';
import { SpringWelcome } from './spring-welcome';

const memories = [1, 2, 3, 4].map((id) => ({
  id,
  image: `/photo-${id}.jpg`,
  detail: `La historia de la foto ${id}.`,
}));
afterEach(cleanup);

describe('spring camera', () => {
  it('waits for all four photos before showing the phrase and enabling details', () => {
    render(
      <SpringCamera memories={memories} message="Siempre volvería a ese día." />
    );
    const slider = screen.getByRole('slider');
    const photo = screen.getByRole('button', {
      name: 'Ver qué hace especial la foto 1',
    });
    expect(photo.hasAttribute('disabled')).toBe(true);
    for (let index = 0; index < 3; index++)
      fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider.getAttribute('aria-valuenow')).toBe('75');
    expect(screen.queryByText('Siempre volvería a ese día.')).toBeNull();
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider.getAttribute('aria-valuenow')).toBe('100');
    expect(photo.hasAttribute('disabled')).toBe(false);
    expect(screen.getByText('Siempre volvería a ese día.')).toBeTruthy();
  });

  it('opens the matching read-only detail and closes it without edit actions', () => {
    render(<SpringCamera memories={memories} message="Nuestra historia" />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' });
    fireEvent.click(
      screen.getByRole('button', { name: 'Ver qué hace especial la foto 3' })
    );
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('La historia de la foto 3.')).toBeTruthy();
    expect(within(dialog).getByAltText('Recuerdo 3').getAttribute('src')).toBe(
      '/photo-3.jpg'
    );
    expect(within(dialog).queryByRole('textbox')).toBeNull();
    expect(
      within(dialog).queryByRole('button', { name: /Guardar|Cancelar/ })
    ).toBeNull();
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Cerrar recuerdo' })
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('clamps pointer dragging, stops on release, and resets the reveal', () => {
    render(<SpringCamera memories={memories} message="Nuestra historia" />);
    const slider = screen.getByRole('slider');
    const rail = slider.parentElement;
    if (!rail) throw new Error('Missing rail');
    vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue({
      width: 452,
    } as DOMRect);
    vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
      width: 52,
    } as DOMRect);
    slider.setPointerCapture = vi.fn();
    fireEvent.pointerDown(slider, { button: 0, pointerId: 1, clientX: 100 });
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 300 });
    expect(slider.getAttribute('aria-valuenow')).toBe('50');
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 1000 });
    expect(slider.getAttribute('aria-valuenow')).toBe('100');
    fireEvent.pointerUp(slider, { pointerId: 1 });
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 100 });
    expect(slider.getAttribute('aria-valuenow')).toBe('100');
    fireEvent.click(screen.getByRole('button', { name: 'Volver a revelar' }));
    expect(slider.getAttribute('aria-valuenow')).toBe('0');
  });

  it('pide las cuatro fotos en una sola casilla y ya no pide un texto por foto', () => {
    const paso = plantillaCarlosPrimaveraForm.find((step) =>
      step.title.includes('Recuerditos')
    );
    if (!paso) throw new Error('Falta la pantalla de recuerdos');
    const fields = paso.fields;
    const lista = fields.find((field) => field.type === 'array');
    expect(lista).toMatchObject({
      name: 'memoryPhotos',
      item_type: 'image',
      max_items: 4,
      required: true,
    });
    // Ni una casilla de imagen suelta ni las cuatro frases por foto: solo
    // queda la frase final de la pantalla. Se compara sobre los tipos ya
    // ensanchados: si no, TypeScript avisa de que 'image' ya no existe en esta
    // pantalla, que es justamente lo que se quiere comprobar.
    const tipos: string[] = fields.map((field) => field.type);
    expect(tipos).not.toContain('image');
    expect(tipos.filter((tipo) => tipo === 'textarea')).toHaveLength(1);
  });

  it('lee la lista nueva y sigue entendiendo las paginas ya publicadas', () => {
    // Lo que guarda el formulario de hoy.
    const nuevas = getCameraMemories({
      memoryPhotos: ['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg'],
    });
    expect(nuevas.map((photo) => photo.image)).toEqual([
      'a.jpg',
      'b.jpg',
      'c.jpg',
      'd.jpg',
    ]);

    // Una pagina creada con el formulario anterior: campos sueltos y la lista
    // heredada de la plantilla de la que salio esta.
    const viejas = getCameraMemories({
      timelinePhotos: ['old-1.jpg', 'old-2.jpg'],
      memoryPhoto1: 'new-1.jpg',
    });
    expect(viejas).toHaveLength(4);
    expect(viejas[0].image).toBe('new-1.jpg');
    expect(viejas[1].image).toBe('old-2.jpg');
    expect(viejas[2].image).toBe('');
  });

  it('todas las fotos llevan el mismo texto fijo, que ya no se pide', () => {
    const photos = getCameraMemories({ memoryPhotos: ['a.jpg'] });
    expect(photos[0].detail).toBeTruthy();
    expect(new Set(photos.map((photo) => photo.detail)).size).toBe(1);
  });

  it('navigates to the third slide and back', () => {
    render(<SpringWelcome recipient="Ana" memories={memories} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Ir a Nuestra música' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ir a Nosotros dos' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Ir a Recuerditos nuestros' })
    );
    expect(
      screen.getByRole('heading', { name: 'Recuerditos nuestros' })
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', { name: 'Volver a Nosotros dos' })
    );
    expect(screen.getByRole('heading', { name: 'Nosotros dos' })).toBeTruthy();
  });
});
