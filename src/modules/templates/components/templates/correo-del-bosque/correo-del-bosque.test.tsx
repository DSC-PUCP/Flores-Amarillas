// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { CorreoDelBosque } from './correo-del-bosque';

vi.mock('./use-forest-audio', () => ({
  useForestAudio: () => ({
    playing: false,
    toggle: async () => undefined,
    error: null,
  }),
}));

vi.mock('./forest-album', () => ({
  ForestAlbum: ({ onClose }: { onClose: () => void }) => (
    <section role="dialog" aria-label="Álbum de prueba">
      <button type="button" onClick={onClose}>
        Volver al bosque
      </button>
    </section>
  ),
}));

vi.mock('framer-motion', async () => {
  const { createElement, Fragment } = await import('react');
  const animationProps = new Set([
    'initial',
    'animate',
    'exit',
    'transition',
    'drag',
    'dragConstraints',
    'dragElastic',
    'onDragEnd',
    'whileHover',
    'whileTap',
    'layout',
  ]);
  const element = (tag: string) => (props: Record<string, unknown>) => {
    const domProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !animationProps.has(key))
    );
    return createElement(tag, domProps);
  };
  return {
    useReducedMotion: () => true,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      createElement(Fragment, null, children),
    motion: {
      button: element('button'),
      img: element('img'),
      div: element('div'),
      blockquote: element('blockquote'),
      article: element('article'),
    },
  };
});

const originalShowModal = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  'showModal'
);
const originalClose = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  'close'
);

beforeAll(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.open = false;
      },
    },
  });
});

afterEach(cleanup);

afterAll(() => {
  if (originalShowModal)
    Object.defineProperty(
      HTMLDialogElement.prototype,
      'showModal',
      originalShowModal
    );
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  if (originalClose)
    Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose);
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});

const gift = {
  recipientName: 'Valeria',
  senderName: 'Ángel',
  message: 'Estas palabras son una sorpresa que se descubre dentro del sobre.',
  flowerMessages: ['Por todas tus risas.', 'Por los viajes que nos esperan.'],
};

const receiveGift = () =>
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Recibir el regalo de Miel, el canario',
    })
  );

describe('CorreoDelBosque gift interactions', () => {
  it('waits for the recipient to touch the messenger before delivering the objects', () => {
    render(<CorreoDelBosque templateData={gift} />);

    expect(
      screen.queryByRole('button', { name: 'Descubrir las flores del ramo' })
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Recoger la carta' })
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Hojear el álbum botánico' })
    ).toBeNull();
    receiveGift();

    expect(
      screen.getByRole('button', { name: 'Descubrir las flores del ramo' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Recoger la carta' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Hojear el álbum botánico' })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Saludar a Miel, el canario' })
    ).toBeTruthy();
  });

  it('lets the recipient explore flowers and return to choose a different object', () => {
    render(<CorreoDelBosque templateData={gift} />);
    receiveGift();
    fireEvent.click(
      screen.getByRole('button', { name: 'Descubrir las flores del ramo' })
    );

    const bouquet = screen.getByRole('dialog', { name: 'Un ramo de razones' });
    expect(
      within(bouquet).getByText('«Por todas tus risas.»', { exact: false })
    ).toBeTruthy();
    fireEvent.click(
      within(bouquet).getByRole('button', {
        name: 'Flor 2: descubrir su mensaje',
      })
    );
    expect(
      within(bouquet).getByText('«Por los viajes que nos esperan.»', {
        exact: false,
      })
    ).toBeTruthy();
    fireEvent.click(
      within(bouquet).getByRole('button', { name: 'Volver al bosque' })
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(
      screen.getByRole('button', { name: 'Hojear el álbum botánico' })
    );
    expect(
      screen.getByRole('dialog', { name: 'Álbum de prueba' })
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Volver al bosque' }));
    expect(
      screen.getByRole('button', { name: 'Recoger la carta' })
    ).toBeTruthy();
  });

  it('keeps the message inside its sealed envelope until the paper is extracted', () => {
    render(<CorreoDelBosque templateData={gift} />);
    receiveGift();
    fireEvent.click(screen.getByRole('button', { name: 'Recoger la carta' }));

    const paper = screen.getByRole('button', {
      name: 'Extraer el papel del sobre',
    });
    expect(paper.hasAttribute('disabled')).toBe(true);
    expect(screen.queryByText(gift.message)).toBeNull();
    fireEvent.click(paper);
    expect(screen.queryByText(gift.message)).toBeNull();

    fireEvent.click(
      screen.getByRole('button', { name: 'Romper el sello y abrir la solapa' })
    );
    expect(paper.hasAttribute('disabled')).toBe(false);
    expect(screen.queryByText(gift.message)).toBeNull();
    fireEvent.click(paper);
    expect(screen.getByText(gift.message)).toBeTruthy();
    expect(screen.getByText('Para Valeria,')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Volver al bosque' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('allows switching between twilight and night without receiving the gift first', () => {
    render(<CorreoDelBosque templateData={gift} />);
    const world = screen.getByRole('main');
    expect(world.getAttribute('data-night')).toBe('false');

    fireEvent.click(screen.getByRole('button', { name: 'Encender la noche' }));
    expect(world.getAttribute('data-night')).toBe('true');
    expect(
      screen
        .getByRole('button', { name: 'Cambiar a atardecer' })
        .getAttribute('aria-pressed')
    ).toBe('true');
    fireEvent.click(
      screen.getByRole('button', { name: 'Cambiar a atardecer' })
    );
    expect(world.getAttribute('data-night')).toBe('false');
  });
});
