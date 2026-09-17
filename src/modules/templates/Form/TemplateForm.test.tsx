import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TemplateForm as FormSchema } from '@/core/models/template';
import { plantillaGratuitaForm } from '../components/templates/PlantillaGratuita';
import { plantillaGianoFeatLeoForm } from '../components/templates/plantilla_giano_feat_leo/App';
import { TemplateForm } from './TemplateForm';

const { mutate, mutatePromo, navigate } = vi.hoisted(() => ({
  mutate: vi.fn(),
  mutatePromo: vi.fn(),
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
  useCreateLovepageConPromo: () => ({ mutate: mutatePromo, isPending: false }),
}));
vi.mock('@/modules/music/components/SongPicker', () => ({
  SongPicker: () => null,
}));
// El precio del plan decide si se pregunta por el código: en la gratuita no se
// pregunta.
vi.mock('@/modules/plan/hooks/usePlan', () => ({
  usePlanById: () => ({ data: { price: precioDelPlan } }),
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
let precioDelPlan = 12;

beforeEach(() => {
  steps = demoSteps;
  templateKey = 'plantilla_giano_feat_leo';
  precioDelPlan = 12;
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
  it('canjea el código de promoción con los mismos datos del formulario', () => {
    render(<TemplateForm />);
    fireEvent.click(screen.getByRole('radio', { name: 'Gatito' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.change(screen.getByLabelText('Mensaje'), {
      target: { value: 'Son para ti.' },
    });
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    const boton = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Generar mi regalo con código',
    });
    // Sin código el botón no hace nada: así nadie cree que pulsándolo vacío
    // el regalo sale gratis.
    expect(boton.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Código de promoción'), {
      target: { value: 'Guardian219' },
    });
    fireEvent.click(boton);
    expect(mutate).not.toHaveBeenCalled();
    expect(mutatePromo).toHaveBeenCalledWith(
      {
        templateId: 2,
        configJson: { mascot: 'cat', message: 'Son para ti.' },
        files: [],
        codigo: 'Guardian219',
      },
      expect.any(Object)
    );
  });
  it('no ofrece el código en la plantilla gratuita', () => {
    precioDelPlan = 0;
    render(<TemplateForm />);
    fireEvent.click(screen.getByRole('radio', { name: 'Gatito' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    expect(screen.queryByLabelText('Código de promoción')).toBeNull();
    // El camino de siempre sigue donde estaba.
    expect(
      screen.getByRole('button', { name: 'Generar mi regalo' })
    ).toBeTruthy();
  });

  it('avisa de que se agotaron los cupos sin perder el regalo', () => {
    render(<TemplateForm />);
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    fireEvent.change(screen.getByLabelText('Código de promoción'), {
      target: { value: 'Guardian219' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Generar mi regalo con código' })
    );
    const [, opciones] = mutatePromo.mock.calls[0];
    act(() => opciones.onSuccess({ estado: 'agotado' }));
    expect(screen.getByRole('alert').textContent).toContain(
      'Se agotaron los cupos'
    );
    expect(navigate).not.toHaveBeenCalled();
    // Escribir otro código borra el aviso del anterior.
    fireEvent.change(screen.getByLabelText('Código de promoción'), {
      target: { value: 'Letras219' },
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('cobra el precio de la promoción cuando el código es de descuento', () => {
    // El único test que necesita un QueryClient de verdad: aquí se abre el
    // diálogo de Yape, que es el de siempre y trae su propia mutación.
    render(
      <QueryClientProvider client={new QueryClient()}>
        <TemplateForm />
      </QueryClientProvider>
    );
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revisar regalo completo' })[0]
    );
    fireEvent.change(screen.getByLabelText('Código de promoción'), {
      target: { value: 'Guardian219' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Generar mi regalo con código' })
    );
    const [, opciones] = mutatePromo.mock.calls[0];
    act(() =>
      opciones.onSuccess({ estado: 'pagar', pageId: 'pagina-1', precio: 3 })
    );
    // El monto es el de la promoción, no el del plan.
    expect(screen.getByText('Activa tu enlace por S/ 3.00')).toBeTruthy();
    expect(screen.getByText('Monto exacto: S/ 3.00')).toBeTruthy();
    // Todavía no se va a ningún lado: primero paga.
    expect(navigate).not.toHaveBeenCalled();
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
    expect(
      screen.getByLabelText<HTMLInputElement>(
        /¿Cuándo fue su primera primavera?/
      ).value
    ).toBe('');
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
