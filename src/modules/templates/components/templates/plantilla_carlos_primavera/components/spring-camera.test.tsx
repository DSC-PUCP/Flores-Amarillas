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

  it('requires four independent uploads, four details, and the final phrase in step three', () => {
    const fields = plantillaCarlosPrimaveraForm[2].fields;
    expect(
      fields.filter((field) => field.type === 'image' && field.required)
    ).toHaveLength(4);
    expect(
      fields.filter((field) => field.type === 'textarea' && field.required)
    ).toHaveLength(5);
  });

  it('keeps legacy photos in order and does not duplicate missing photos', () => {
    const photos = getCameraMemories({
      timelinePhotos: ['old-1.jpg', 'old-2.jpg'],
      memoryPhoto1: 'new-1.jpg',
      memoryDetail1: 'Our day',
    });
    expect(photos).toHaveLength(4);
    expect(photos[0]).toEqual({ id: 1, image: 'new-1.jpg', detail: 'Our day' });
    expect(photos[1].image).toBe('old-2.jpg');
    expect(photos[2].image).toBe('');
  });

  it('navigates to the third slide and back', () => {
    render(<SpringWelcome recipient="Ana" memories={memories} />);
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
