import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FlowerDedication } from './flower-dedication';

const templateData = {
  personA: 'Mateo',
  personB: 'Lucía',
  message: 'Gracias por llenar mis días de luz.',
  startDate: '2024-09-21',
  image: '/cover.jpg',
  timelinePhotos: ['/memory.jpg'],
};

describe('FlowerDedication', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('opens the real gift, browses memories and returns focus to the envelope without sharing in preview', () => {
    render(<FlowerDedication templateData={templateData} isPreview />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Abrir dedicatoria para Lucía' })
    );

    expect(screen.getByText(templateData.message)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Compartir' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Copiar enlace' })).toBeNull();
    expect(
      screen
        .getByRole('img', { name: 'Nuestro recuerdo 1 de 2' })
        .getAttribute('src')
    ).toBe('/cover.jpg');

    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));
    expect(
      screen
        .getByRole('img', { name: 'Nuestro recuerdo 2 de 2' })
        .getAttribute('src')
    ).toBe('/memory.jpg');

    fireEvent.click(screen.getByRole('button', { name: 'Volver al sobre' }));
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Abrir dedicatoria para Lucía' })
    );
    expect(screen.queryByText(templateData.message)).toBeNull();
  });

  it('keeps the letter open and updates personal details when the embedded preview changes', () => {
    const { rerender } = render(
      <FlowerDedication
        templateData={{ ...templateData, compactPreview: true }}
        isPreview
      />
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Abrir dedicatoria para Lucía' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));

    const editedData = {
      ...templateData,
      compactPreview: true,
      personA: 'Alejandra María',
      personB: 'María Fernanda del Carmen',
      message: 'Estas flores llevan todo mi cariño para ti.',
      image: '/updated-cover.jpg',
      timelinePhotos: [],
    };
    rerender(<FlowerDedication templateData={editedData} isPreview />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain(
      editedData.personB
    );
    expect(screen.getByText(editedData.message)).toBeTruthy();
    expect(screen.getByText(editedData.personA)).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: /Abrir dedicatoria/ })
    ).toBeNull();
    expect(
      screen
        .getByRole('img', { name: 'Nuestro recuerdo 1 de 1' })
        .getAttribute('src')
    ).toBe('/updated-cover.jpg');
    expect(screen.queryByRole('button', { name: 'Foto siguiente' })).toBeNull();
    expect(screen.queryByText(templateData.message)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Compartir' })).toBeNull();
  });

  it('reports clipboard failure with a manual link and confirms a subsequent successful copy', async () => {
    const writeText = vi
      .fn()
      .mockRejectedValueOnce(new Error('Permission denied'))
      .mockResolvedValueOnce(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    render(<FlowerDedication templateData={templateData} isPreview={false} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Abrir dedicatoria para Lucía' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copiar enlace' }));

    await waitFor(() =>
      expect(
        screen.getByLabelText('Enlace de tu dedicatoria').getAttribute('value')
      ).toBe(window.location.href)
    );
    expect(screen.getByRole('status').textContent).toContain(
      'No se pudo copiar automáticamente'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copiar enlace' }));
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Enlace copiado')
    );
    expect(writeText).toHaveBeenLastCalledWith(window.location.href);
    expect(screen.queryByLabelText('Enlace de tu dedicatoria')).toBeNull();
  });
});
