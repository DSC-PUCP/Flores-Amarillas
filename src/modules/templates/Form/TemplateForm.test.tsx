import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TemplateForm as FormSchema } from '@/core/models/template';
import { plantillaGratuitaForm } from '../components/templates/PlantillaGratuita';
import { plantillaGianoFeatLeoForm } from '../components/templates/plantilla_giano_feat_leo/App';
import { TemplateForm } from './TemplateForm';

const { mutate, navigate } = vi.hoisted(() => ({
  mutate: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  useParams: () => ({ id: '2' }),
}));
vi.mock('../hooks/useTemplate', () => ({
  useTemplateById: () => ({
    data: {
      name: 'Premium',
      templateKey,
      description: 'Un regalo de primavera',
      schemaJson: steps,
    },
  }),
}));
vi.mock('./hooks/useLovePage', () => ({
  useCreateLovepage: () => ({ mutate, isPending: false }),
}));
vi.mock('@/modules/music/components/SongPicker', () => ({
  SongPicker: () => null,
}));

const mascot = plantillaGianoFeatLeoForm[0].fields.find(
  (field) => field.name === 'mascot'
);
if (!mascot) throw new Error('Falta la elección del animalito en la premium');
const demoSteps: FormSchema = [
  { title: 'Tu animalito', fields: [mascot] },
  {
    title: 'Tu mensaje',
    fields: [
      { name: 'message', label: 'Mensaje', type: 'textarea', required: false },
    ],
  },
];

let steps: FormSchema = demoSteps;
let templateKey = 'plantilla_giano_feat_leo';

beforeEach(() => {
  steps = demoSteps;
  templateKey = 'plantilla_giano_feat_leo';
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('animalito de la dedicatoria premium', () => {
  it('conserva la elección al cambiar de paso y la envía al crear el regalo', () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<TemplateForm />);
    fireEvent.click(screen.getByRole('radio', { name: 'Gatito' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.change(screen.getByLabelText('Mensaje'), {
      target: { value: 'Son para ti.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(
      screen.getByRole<HTMLInputElement>('radio', { name: 'Gatito' }).checked
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    expect(mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Generar mi regalo' }));
    expect(mutate).toHaveBeenCalledWith(
      {
        templateId: 2,
        configJson: { mascot: 'cat', message: 'Son para ti.' },
        files: [],
      },
      expect.any(Object)
    );
  });

  it('guarda la elección de un animalito de la nueva colección kawaii', () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<TemplateForm />);
    fireEvent.click(screen.getByRole('radio', { name: 'Pandita' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    expect(mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Generar mi regalo' }));
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ configJson: { mascot: 'panda' } }),
      expect.any(Object)
    );
  });

  it('guarda el conejito predeterminado si no se cambia la selección', () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<TemplateForm />);
    expect(
      screen.getByRole<HTMLInputElement>('radio', { name: 'Conejito' }).checked
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    expect(mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Generar mi regalo' }));
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ configJson: { mascot: 'rabbit' } }),
      expect.any(Object)
    );
  });
  it('actualiza la carta sin sustituir el iframe y conserva los datos al cambiar de pestaña', () => {
    render(<TemplateForm />);
    const frame = screen.getByTitle<HTMLIFrameElement>(
      'Vista previa de tu regalo en vivo'
    );
    const frameWindow = frame.contentWindow;
    if (!frameWindow) throw new Error('Falta la ventana de vista previa');
    const post = vi
      .spyOn(frameWindow, 'postMessage')
      .mockImplementation(() => {});
    fireEvent.load(frame);
    fireEvent.click(screen.getByRole('radio', { name: 'Zorrito' }));
    expect(post).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ mascot: 'fox' }),
        scene: 'cover',
      }),
      window.location.origin
    );
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.change(screen.getByLabelText('Mensaje'), {
      target: { value: 'Mi primavera eres tú.' },
    });
    expect(post).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ message: 'Mi primavera eres tú.' }),
        scene: 'letter',
      }),
      window.location.origin
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Vista previa' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Editar' }));
    expect(screen.getByLabelText<HTMLTextAreaElement>('Mensaje').value).toBe(
      'Mi primavera eres tú.'
    );
    expect(screen.getByTitle('Vista previa de tu regalo en vivo')).toBe(frame);
  });
  it('permite volver de la revisión al paso elegido sin crear todavía la dedicatoria', () => {
    render(<TemplateForm />);
    fireEvent.click(screen.getByRole('radio', { name: 'Gatito' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.change(screen.getByLabelText('Mensaje'), {
      target: { value: 'Una carta para ti.' },
    });
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    expect(
      screen
        .getByRole('tab', { name: 'Vista previa' })
        .getAttribute('aria-selected')
    ).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Seguir editando' }));
    expect(screen.getByLabelText<HTMLTextAreaElement>('Mensaje').value).toBe(
      'Una carta para ti.'
    );
    expect(mutate).not.toHaveBeenCalled();
  });
  it('el básico pide una sola foto y permite terminar sin foto ni contador', () => {
    steps = plantillaGratuitaForm;
    templateKey = 'plantilla_gratuita';
    render(<TemplateForm />);
    fireEvent.change(screen.getByLabelText(/Tu nombre/), {
      target: { value: 'Mateo' },
    });
    fireEvent.change(screen.getByLabelText(/Su nombre/), {
      target: { value: 'Lucía' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.change(screen.getByLabelText(/Escribe tu dedicatoria/), {
      target: { value: 'Flores para ti.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    const files =
      document.querySelectorAll<HTMLInputElement>('input[type="file"]');
    expect(files.length).toBe(1);
    expect(files[0].multiple).toBe(false);
    expect(screen.queryByText('Timeline de fotos')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByLabelText<HTMLInputElement>(/¿Cuándo fue su primera primavera?/).value).toBe(
      ''
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    fireEvent.click(screen.getByRole('button', { name: 'Generar mi regalo' }));
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        configJson: {
          personA: 'Mateo',
          personB: 'Lucía',
          message: 'Flores para ti.',
        },
        files: [],
      }),
      expect.any(Object)
    );
  });
  it('agrupa la premium por secciones, conserva cambios y lleva a la sección que falta al revisar', () => {
    steps = plantillaGianoFeatLeoForm;
    render(<TemplateForm />);
    const frame = screen.getByTitle<HTMLIFrameElement>(
      'Vista previa de tu regalo en vivo'
    );
    const frameWindow = frame.contentWindow;
    if (!frameWindow) throw new Error('Falta la vista previa');
    const post = vi
      .spyOn(frameWindow, 'postMessage')
      .mockImplementation(() => {});
    fireEvent.load(frame);
    fireEvent.click(screen.getByRole('button', { name: /La carta/ }));
    expect(screen.queryByLabelText(/Frase de despedida/)).toBeNull();
    fireEvent.change(screen.getByLabelText(/Escribe tu carta/), {
      target: { value: 'Mi primavera eres tú.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Su canción/ }));
    expect(post).toHaveBeenLastCalledWith(
      expect.objectContaining({ scene: 'song' }),
      window.location.origin
    );
    fireEvent.click(screen.getByRole('button', { name: /La despedida/ }));
    expect(screen.getByLabelText(/Frase de despedida/)).toBeTruthy();
    expect(post).toHaveBeenLastCalledWith(
      expect.objectContaining({ scene: 'finale' }),
      window.location.origin
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    expect(screen.getByLabelText(/Tu nombre/)).toBeTruthy();
    expect(mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /La carta/ }));
    expect(
      screen.getByLabelText<HTMLTextAreaElement>(/Escribe tu carta/).value
    ).toBe('Mi primavera eres tú.');
  });
});
