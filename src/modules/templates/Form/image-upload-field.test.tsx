import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageUploadField } from './image-upload-field';
import { TemplateForm } from './TemplateForm';

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '1' }),
}));
vi.mock('../hooks/useTemplate', () => ({
  useTemplateById: () => ({
    data: {
      name: 'Premium',
      templateKey: 'plantilla_giano_feat_leo',
      schemaJson: [
        {
          title: 'Fotos',
          fields: [
            {
              name: 'timelinePhotos',
              label: 'Álbum',
              type: 'array',
              item_type: 'image',
              max_items: 12,
            },
            {
              name: 'couponPhotos',
              label: 'Vale',
              type: 'array',
              item_type: 'image',
              max_items: 6,
            },
          ],
        },
      ],
    },
  }),
}));
vi.mock('./hooks/useLovePage', () => ({
  useCreateLovepage: () => ({ mutate }),
}));
vi.mock('@/modules/music/components/SongPicker', () => ({
  SongPicker: () => null,
}));
// jsdom no dibuja imagenes: se simula la reduccion, no el canvas.
vi.mock('./compress-image', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./compress-image')>()),
  compressImage: vi.fn(async (file: File) =>
    sized(file.name, Math.round(file.size / 4))
  ),
}));

const photo = (name: string) =>
  new File(['image'], name, { type: 'image/jpeg', lastModified: 1 });

/** Una foto con el peso que haga falta, sin reservar esos bytes de verdad. */
function sized(name: string, bytes: number) {
  const file = photo(name);
  Object.defineProperty(file, 'size', { value: bytes });
  return file;
}
function Uploader({ limit = 3 }: { limit?: number }) {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <ImageUploadField
      label="Mis fotos"
      required={false}
      multiple
      maxItems={limit}
      value={files}
      onFiles={setFiles}
    />
  );
}
const select = (files: File[]) =>
  fireEvent.change(screen.getByLabelText(/Mis fotos/), { target: { files } });

describe('fotos del formulario', () => {
  beforeEach(() => {
    mutate.mockClear();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL = vi.fn(() => 'blob:preview');
        static revokeObjectURL = vi.fn();
      }
    );
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('añade selecciones sucesivas sin duplicar ni perder las fotos previas', () => {
    render(<Uploader />);
    const first = photo('uno.jpg');
    select([first]);
    select([first, photo('dos.jpg')]);
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByText('1. uno.jpg')).toBeTruthy();
    expect(screen.getByText('2. dos.jpg')).toBeTruthy();
  });

  it('conserva la selección cuando se cancela el selector de archivos', () => {
    render(<Uploader />);
    select([photo('uno.jpg')]);
    select([]);
    expect(screen.getByText('1. uno.jpg')).toBeTruthy();
  });

  it('aplica el límite, permite reordenar y quitar todas las fotos', () => {
    render(<Uploader limit={2} />);
    select([photo('uno.jpg'), photo('dos.jpg'), photo('tres.jpg')]);
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByText(/Se conservaron las primeras 2/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Mover foto 2 antes' }));
    expect(screen.getByText('1. dos.jpg')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar foto 1' }));
    expect(screen.getByText('1. uno.jpg')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar foto 1' }));
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('envía una sola foto del álbum y del vale como listas de archivos', () => {
    render(<TemplateForm />);
    const first = photo('album.jpg');
    const coupon = photo('vale.jpg');
    fireEvent.change(screen.getByLabelText('Álbum'), {
      target: { files: [first] },
    });
    fireEvent.change(screen.getByLabelText('Vale'), {
      target: { files: [coupon] },
    });
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    expect(mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Generar mi regalo' }));
    const input = mutate.mock.calls[0][0];
    expect(input.files).toEqual([
      { key: 'timelinePhotos', file: [first] },
      { key: 'couponPhotos', file: [coupon] },
    ]);
  });

  it('reduce las fotos pesadas antes de subirlas', async () => {
    render(<Uploader />);
    select([sized('pesada.jpg', 6 * 1024 * 1024)]);
    expect(screen.getByText(/Preparando tus fotos/)).toBeTruthy();
    await waitFor(() => expect(screen.getByText('1. pesada.jpg')).toBeTruthy());
    expect(screen.queryByText(/Preparando tus fotos/)).toBeNull();
  });

  it('rechaza la foto que pasa del máximo y conserva las anteriores', async () => {
    render(<Uploader />);
    select([photo('liviana.jpg')]);
    select([sized('enorme.jpg', 60 * 1024 * 1024)]);
    await waitFor(() =>
      expect(screen.getByText(/enorme.jpg pesa 15.0 MB/)).toBeTruthy()
    );
    expect(screen.getByText('1. liviana.jpg')).toBeTruthy();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('no envía archivos eliminados de un campo vacío', () => {
    render(<TemplateForm />);
    fireEvent.change(screen.getByLabelText('Álbum'), {
      target: { files: [photo('album.jpg')] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Quitar foto 1' }));
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    expect(mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Generar mi regalo' }));
    expect(mutate.mock.calls[0][0].files).toEqual([]);
    expect(mutate.mock.calls[0][0].configJson.timelinePhotos).toEqual([]);
  });
});
