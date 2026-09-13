import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlantillaGianoFeatLeo, plantillaGianoFeatLeoForm } from './App';
import {
  DEFAULT_CLOSING_LINE,
  formatLetter,
  parseStartDate,
  readPremiumData,
  timeTogether,
} from './data';
import {
  BRAND_MOOD,
  contrastRatio,
  ON_ACCENT,
  pickPalette,
  rgbToHsl,
} from './mood';

const templateData = {
  personA: 'Mateo',
  personB: 'Lucía',
  startDate: '2024-09-21',
  message: 'Gracias por llenar mis días de luz.',
  reasonsToLove: ['Tu risa', 'Cómo me cuidas', ' ', 'Tus abrazos'],
  image: '/cover.jpg',
  timelinePhotos: ['/cover.jpg', '/uno.jpg', '/dos.jpg', '/uno.jpg'],
  couponText: 'Una cena a la luz de las velas',
};

describe('datos de la plantilla premium', () => {
  it('lee la fecha del formulario a medianoche local', () => {
    const date = parseStartDate('2024-09-21');
    expect(date?.getFullYear()).toBe(2024);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(21);
    expect(date?.getHours()).toBe(0);
    expect(parseStartDate('')).toBeNull();
    expect(parseStartDate('no es fecha')).toBeNull();
    expect(parseStartDate(undefined)).toBeNull();
  });

  it('convierte los "//" antiguos en saltos sin romper links', () => {
    expect(formatLetter('Hola// amor')).toBe('Hola\namor');
    expect(formatLetter('Mira https://ejemplo.com')).toBe(
      'Mira https://ejemplo.com'
    );
  });

  it('normaliza datos incompletos o de páginas antiguas', () => {
    const data = readPremiumData({
      personB: '  ',
      reasonsToLove: 'Tu risa\n\nTu voz',
      timelinePhotos: { invalid: true },
      couponImage: '/solo-imagen.jpg',
    });
    expect(data.from).toBe('Alguien que te quiere');
    expect(data.to).toBe('ti');
    expect(data.startDate).toBeNull();
    expect(data.reasons).toEqual(['Tu risa', 'Tu voz']);
    expect(data.photos).toEqual([]);
    // Sin texto no hay vale, aunque haya imagen.
    expect(data.coupon).toBeNull();
    expect(data.closingLine).toBe(DEFAULT_CLOSING_LINE);
  });

  it('mantiene el animalito elegido y usa el conejito para datos antiguos o inválidos', () => {
    for (const mascot of [
      'rabbit',
      'bear',
      'cat',
      'puppy',
      'panda',
      'fox',
      'chick',
    ]) {
      expect(readPremiumData({ mascot }).mascot).toBe(mascot);
    }
    expect(readPremiumData({}).mascot).toBe('rabbit');
    expect(readPremiumData({ mascot: 'white-rabbit' }).mascot).toBe('rabbit');
    expect(readPremiumData({ mascot: 'desconocido' }).mascot).toBe('rabbit');
    expect(readPremiumData({ mascot: ['cat'] }).mascot).toBe('rabbit');
  });

  it('no repite la foto principal ni fotos duplicadas en la galería', () => {
    const data = readPremiumData(templateData);
    expect(data.cover).toBe('/cover.jpg');
    expect(data.photos).toEqual(['/cover.jpg', '/uno.jpg', '/dos.jpg']);
    expect(data.reasons).toEqual(['Tu risa', 'Cómo me cuidas', 'Tus abrazos']);
  });

  it('recupera la foto individual del álbum de formularios antiguos', () => {
    expect(readPremiumData({ timelinePhotos: '/antes.jpg' }).photos).toEqual([
      '/antes.jpg',
    ]);
  });

  it('combina las fotos nuevas del vale con su imagen antigua sin repetirlas', () => {
    expect(
      readPremiumData({
        couponText: 'Un picnic',
        couponImage: '/vale.jpg',
        couponPhotos: ['/vale.jpg', '/picnic.jpg'],
      }).coupon?.images
    ).toEqual(['/vale.jpg', '/picnic.jpg']);
  });

  it('cuenta el tiempo juntos, lo que falta y detecta el aniversario', () => {
    const start = new Date(2024, 8, 21);
    const later = timeTogether(start, new Date(2025, 8, 21, 3, 4, 5));
    expect(later.days).toBe(365);
    expect(later.hours).toBe(3);
    expect(later.minutes).toBe(4);
    expect(later.seconds).toBe(5);
    expect(later.upcoming).toBe(false);
    expect(later.anniversaryYears).toBe(1);

    const before = timeTogether(start, new Date(2024, 8, 19));
    expect(before.upcoming).toBe(true);
    expect(before.days).toBe(2);
    expect(before.anniversaryYears).toBeNull();
  });
});

/** Imagen de prueba: `count` píxeles de cada color RGB. */
const pixels = (...colors: [number, number, number, number][]) =>
  new Uint8ClampedArray(
    colors.flatMap(([r, g, b, count]) =>
      Array.from({ length: count }, () => [r, g, b, 255]).flat()
    )
  );

describe('colores de la portada', () => {
  it('elige el color vivo aunque la portada sea casi toda oscura', () => {
    const palette = pickPalette(
      pixels([12, 12, 14, 800], [210, 30, 40, 120], [40, 90, 200, 60])
    );
    expect(palette).not.toBeNull();
    const accent = palette?.accent ?? '#000000';
    const { h } = rgbToHsl(
      Number.parseInt(accent.slice(1, 3), 16),
      Number.parseInt(accent.slice(3, 5), 16),
      Number.parseInt(accent.slice(5, 7), 16)
    );
    // Rojo, no gris ni azul.
    expect(h < 20 || h > 340).toBe(true);
    // El fondo oscuro sigue siendo oscuro para que el texto claro se lea.
    const deep = rgbToHsl(
      Number.parseInt(palette?.deep.slice(1, 3) ?? '0', 16),
      Number.parseInt(palette?.deep.slice(3, 5) ?? '0', 16),
      Number.parseInt(palette?.deep.slice(5, 7) ?? '0', 16)
    );
    expect(deep.l).toBeLessThan(0.16);
  });

  it('arma un ambiente propio con portadas en blanco y negro', () => {
    const white = pickPalette(pixels([245, 245, 245, 900], [40, 40, 40, 30]));
    const black = pickPalette(pixels([15, 15, 15, 900], [220, 220, 220, 30]));
    expect(white).not.toBeNull();
    expect(white).not.toEqual(BRAND_MOOD);
    expect(white?.accent).not.toBe(black?.accent);
    expect(pickPalette(new Uint8ClampedArray())).toBeNull();
  });

  it('todos los textos se leen, sea cual sea la portada', () => {
    const covers = {
      roja: pixels([200, 20, 30, 500], [20, 20, 20, 500]),
      azul: pixels([30, 80, 220, 600], [230, 180, 140, 200]),
      amarilla: pixels([250, 220, 20, 700], [255, 255, 255, 300]),
      blanca: pixels([245, 245, 245, 1000]),
      negra: pixels([12, 12, 12, 1000]),
    };
    for (const [name, cover] of Object.entries(covers)) {
      const theme = pickPalette(cover);
      if (!theme) throw new Error(`sin paleta: ${name}`);
      const check = (label: string, a: string, b: string, min: number) =>
        expect(contrastRatio(a, b), `${name}: ${label}`).toBeGreaterThanOrEqual(
          min
        );
      check('tinta sobre papel', theme.ink, theme.paper, 7);
      check('párrafos sobre papel', theme.inkSoft, theme.paper, 4.5);
      check('rótulos sobre papel', theme.strong, theme.paper, 4.5);
      check('texto sobre botones', ON_ACCENT, theme.accent, 4.5);
      check('texto claro sobre fondo oscuro', theme.card, theme.deep, 7);
      check('letra blanca sobre el escenario', '#FFFFFF', theme.deep, 7);
      // La identidad no cambia: flores amarillas y papel crema con cualquier álbum.
      expect(theme.petal, name).toBe(BRAND_MOOD.petal);
      expect(theme.paper, name).toBe(BRAND_MOOD.paper);
      expect(theme.ink, name).toBe(BRAND_MOOD.ink);
    }
  });
});

describe('PlantillaGianoFeatLeo', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    // jsdom no pinta canvas: evita el aviso de "not implemented".
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    // jsdom no trae IntersectionObserver; las secciones aparecen al hacer scroll.
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
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const openGift = () => {
    render(<PlantillaGianoFeatLeo templateData={templateData} isPreview />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir mi regalo' }));
  };

  const scrollToScene = (id: string) => {
    const deck = screen.getByRole('main', { name: 'Recorrido del regalo' });
    Object.defineProperty(deck, 'clientHeight', {
      configurable: true,
      value: 1000,
    });
    const scenes = [...deck.querySelectorAll('[data-scene-id]')];
    const index = scenes.findIndex(
      (scene) => scene.getAttribute('data-scene-id') === id
    );
    if (index < 0) throw new Error(`No existe la escena ${id}`);
    fireEvent.scroll(deck, { target: { scrollTop: index * 1000 } });
    return deck;
  };

  it('pide los datos en el orden de las secciones reales del regalo', () => {
    const { container } = render(
      <PlantillaGianoFeatLeo
        templateData={{
          ...templateData,
          editorPreview: true,
          editorScene: 'intro',
          editorRevision: 0,
          compactPreview: true,
        }}
        isPreview
      />
    );
    const sections = [...container.querySelectorAll('[data-scene-id]')].map(
      (scene) => scene.getAttribute('data-scene-id')
    );
    expect(plantillaGianoFeatLeoForm.map((step) => step.previewScene)).toEqual([
      'cover',
      ...sections,
    ]);
  });

  it('edita la sección elegida en vivo y revisa el regalo desde el inicio', async () => {
    const draft = {
      ...templateData,
      compactPreview: true,
      editorPreview: true,
      editorScene: 'letter',
      editorRevision: 0,
    };
    const { rerender } = render(
      <PlantillaGianoFeatLeo templateData={draft} isPreview />
    );
    expect(
      screen.queryByRole('button', { name: 'Abrir mi regalo' }) === null
    ).toBe(true);
    expect(
      screen.getByRole('article', { name: 'Carta de Mateo para Lucía' })
        .textContent
    ).toContain(templateData.message);
    expect(
      screen.queryByRole('button', { name: 'Romper el sello y leer la carta' })
    ).toBeNull();
    rerender(
      <PlantillaGianoFeatLeo
        templateData={{ ...draft, message: 'Cada día contigo florece.' }}
        isPreview
      />
    );
    expect(
      screen.getByRole('article', { name: 'Carta de Mateo para Lucía' })
        .textContent
    ).toContain('Cada día contigo florece.');
    rerender(
      <PlantillaGianoFeatLeo
        templateData={{ ...draft, editorScene: 'photos', editorRevision: 1 }}
        isPreview
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));
    expect(
      screen.getByRole('button', { name: 'Ver recuerdo 2 de 3' })
    ).toBeTruthy();
    rerender(
      <PlantillaGianoFeatLeo
        templateData={{ ...draft, editorScene: 'letter', editorRevision: 2 }}
        isPreview
      />
    );
    rerender(
      <PlantillaGianoFeatLeo
        templateData={{ ...draft, editorScene: 'photos', editorRevision: 3 }}
        isPreview
      />
    );
    expect(
      screen.getByRole('button', { name: 'Ver recuerdo 2 de 3' })
    ).toBeTruthy();
    rerender(
      <PlantillaGianoFeatLeo
        templateData={{ ...draft, editorScene: 'review', editorRevision: 4 }}
        isPreview
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir mi regalo' }));
    expect(screen.getByRole('region', { name: 'Presentación' })).toBeTruthy();
    scrollToScene('letter');
    expect(
      screen.getByRole('button', { name: 'Romper el sello y leer la carta' })
    ).toBeTruthy();
  });

  it('empieza con la portada y no muestra el contenido hasta abrirla', () => {
    render(<PlantillaGianoFeatLeo templateData={templateData} isPreview />);
    expect(screen.getByText(/te llegaron/)).toBeTruthy();
    expect(screen.getByText('Una sorpresa de Mateo')).toBeTruthy();
    expect(screen.queryByText(templateData.message)).toBeNull();
    // Lo de atrás ya está montado, pero no se puede tocar hasta abrir.
    expect(screen.queryByRole('button', { name: /^Pétalo/ })).toBeNull();
  });

  it('abre la dedicatoria al tocar el conejito que entrega las flores', async () => {
    render(<PlantillaGianoFeatLeo templateData={templateData} isPreview />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Abrir el regalo de Mateo' })
    );
    expect(screen.getByRole('region', { name: 'Presentación' })).toBeTruthy();
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Abrir mi regalo' })
      ).toBeNull();
    });
  });

  it('permite probar distintos animalitos y abrir el regalo sin perder los textos', () => {
    render(<PlantillaGianoFeatLeo templateData={templateData} isPreview />);
    fireEvent.click(screen.getByRole('radio', { name: 'Osito' }));
    expect(
      screen.getByRole<HTMLInputElement>('radio', { name: 'Osito' }).checked
    ).toBe(true);
    expect(screen.getByText('Una sorpresa de Mateo')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: 'Perrito' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Abrir el regalo de Mateo' })
    );
    expect(screen.getByRole('region', { name: 'Presentación' })).toBeTruthy();
    scrollToScene('letter');
    fireEvent.click(
      screen.getByRole('button', { name: 'Romper el sello y leer la carta' })
    );
    expect(
      within(
        screen.getByRole('article', { name: 'Carta de Mateo para Lucía' })
      ).getByText(templateData.message)
    ).toBeTruthy();
  });

  it('permite elegir un nuevo animalito kawaii en la prueba premium', () => {
    const { container } = render(
      <PlantillaGianoFeatLeo templateData={templateData} isPreview />
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Pandita' }));
    expect(
      screen.getByRole<HTMLInputElement>('radio', { name: 'Pandita' }).checked
    ).toBe(true);
    expect(
      screen
        .getByRole('button', { name: 'Abrir el regalo de Mateo' })
        .querySelector('[data-character="panda"]')
    ).toBeTruthy();
    expect(container.querySelector('[data-character="rabbit"]')).toBeTruthy();
  });

  it('usa el animalito guardado y no ofrece cambiarlo en la dedicatoria publicada', () => {
    const { container } = render(
      <PlantillaGianoFeatLeo
        templateData={{ ...templateData, mascot: 'cat' }}
        isPreview={false}
      />
    );
    expect(container.querySelector('[data-character="cat"]')).toBeTruthy();
    expect(screen.queryByRole('radio', { name: 'Conejito' })).toBeNull();
  });

  it('abre la carta al romper el sello', () => {
    openGift();
    scrollToScene('letter');
    expect(screen.queryByText(templateData.message)).toBeNull();
    fireEvent.click(
      screen.getByRole('button', { name: 'Romper el sello y leer la carta' })
    );
    const letter = screen.getByRole('article', {
      name: 'Carta de Mateo para Lucía',
    });
    expect(within(letter).getByText(templateData.message)).toBeTruthy();
  });

  it('cualquier pétalo descubre la siguiente razón, en orden', async () => {
    openGift();
    scrollToScene('reasons');
    const petals = screen.getAllByRole('button', { name: /^Pétalo/ });
    // Toda la flor responde, no solo algunos pétalos.
    expect(petals).toHaveLength(12);

    fireEvent.click(petals[7]);
    // La tarjeta cambia con animación de salida: se espera a la nueva.
    // Con toda la suite en paralelo la animación puede tardar más de 1 s.
    expect(
      await screen.findByText('Tu risa', undefined, { timeout: 4000 })
    ).toBeTruthy();
    expect(screen.getByText('1/3')).toBeTruthy();

    // El mismo pétalo ya se desprendió: no cuenta dos veces.
    fireEvent.click(petals[7]);
    expect(screen.getByText('1/3')).toBeTruthy();

    fireEvent.keyDown(petals[0], { key: 'Enter' });
    expect(screen.getByText('2/3')).toBeTruthy();
    expect(
      await screen.findByText('Cómo me cuidas', undefined, { timeout: 4000 })
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: 'Descubrir todas de una vez' })
    );
    expect(screen.getByText('3/3')).toBeTruthy();
    expect(screen.getByText(/me faltan pétalos/)).toBeTruthy();

    // Con todas descubiertas, los pétalos restantes ya no hacen nada.
    fireEvent.click(petals[3]);
    expect(screen.getByText('3/3')).toBeTruthy();
    expect(petals[3].getAttribute('aria-disabled')).toBe('true');
  });

  it('abre la galería y pasa de foto con los botones', () => {
    openGift();
    scrollToScene('photos');
    fireEvent.click(
      screen.getByRole('button', { name: 'Ver recuerdo 1 de 3' })
    );
    const dialog = screen.getByRole('dialog', { name: 'Recuerdo 1 de 3' });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Recuerdo siguiente' })
    );
    expect(
      screen.getByRole('dialog', { name: 'Recuerdo 2 de 3' })
    ).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: /Cerrar/ }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('recorre todas las fotos en el carrusel con flechas, miniaturas y gestos', () => {
    openGift();
    scrollToScene('photos');
    const album = screen.getByRole('region', {
      name: 'Carrusel de nuestros momentos',
    });
    expect(
      within(album)
        .getByRole('img', { name: 'Recuerdo 1 de 3' })
        .getAttribute('src')
    ).toBe('/cover.jpg');
    fireEvent.click(
      within(album).getByRole('button', { name: 'Foto siguiente' })
    );
    expect(
      within(album)
        .getByRole('img', { name: 'Recuerdo 2 de 3' })
        .getAttribute('src')
    ).toBe('/uno.jpg');
    fireEvent.keyDown(album, { key: 'ArrowRight' });
    expect(
      within(album)
        .getByRole('img', { name: 'Recuerdo 3 de 3' })
        .getAttribute('src')
    ).toBe('/dos.jpg');
    fireEvent.click(
      within(album).getByRole('button', { name: 'Mostrar recuerdo 1 de 3' })
    );
    const photo = within(album).getByRole('button', {
      name: 'Ver recuerdo 1 de 3',
    });
    fireEvent.touchStart(photo, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(photo, { changedTouches: [{ clientX: 70 }] });
    expect(
      within(album).getByRole('img', { name: 'Recuerdo 2 de 3' })
    ).toBeTruthy();
  });

  it('muestra todas las fotos grandes del vale solo después de descubrirlo', () => {
    render(
      <PlantillaGianoFeatLeo
        templateData={{
          ...templateData,
          couponPhotos: ['/picnic.jpg', '/cena.jpg'],
        }}
        isPreview
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir mi regalo' }));
    scrollToScene('coupon');
    expect(
      screen.queryByRole('region', { name: 'Fotos del vale sorpresa' })
    ).toBeNull();
    fireEvent.click(
      screen.getByRole('button', { name: 'Descubrir sin raspar' })
    );
    const album = screen.getByRole('region', {
      name: 'Fotos del vale sorpresa',
    });
    expect(
      within(album)
        .getByRole('img', { name: 'Recuerdo 1 de 2' })
        .getAttribute('src')
    ).toBe('/picnic.jpg');
    fireEvent.click(
      within(album).getByRole('button', { name: 'Foto siguiente' })
    );
    expect(
      within(album)
        .getByRole('img', { name: 'Recuerdo 2 de 2' })
        .getAttribute('src')
    ).toBe('/cena.jpg');
  });

  it('descubre el vale sin raspar', () => {
    openGift();
    scrollToScene('coupon');
    fireEvent.click(
      screen.getByRole('button', { name: 'Descubrir sin raspar' })
    );
    expect(screen.getByText(/Úsalo cuando quieras/)).toBeTruthy();
  });

  it('solo ofrece compartir en la página publicada', () => {
    openGift();
    scrollToScene('finale');
    expect(screen.queryByRole('button', { name: /Compartir/ })).toBeNull();
    cleanup();

    render(
      <PlantillaGianoFeatLeo templateData={templateData} isPreview={false} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir mi regalo' }));
    scrollToScene('finale');
    expect(screen.getByRole('button', { name: /Compartir/ })).toBeTruthy();
    expect(screen.getByText(DEFAULT_CLOSING_LINE)).toBeTruthy();
  });

  it('muestra solo una sección y conserva el álbum al volver haciendo scroll', () => {
    openGift();
    expect(screen.getByRole('region', { name: 'Presentación' })).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Álbum de fotos' })).toBeNull();
    scrollToScene('photos');
    expect(screen.queryByRole('region', { name: 'Presentación' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));
    scrollToScene('letter');
    expect(screen.queryByRole('region', { name: 'Álbum de fotos' })).toBeNull();
    scrollToScene('photos');
    expect(
      screen.getByRole('img', { name: 'Recuerdo 2 de 3' }).getAttribute('src')
    ).toBe('/uno.jpg');
  });

  it('el contenido largo se desplaza dentro de la sección sin cambiar de escena', () => {
    openGift();
    const deck = scrollToScene('letter');
    const letter = screen.getByRole('region', { name: 'La carta' });
    const scroll = letter.querySelector('[data-scene-scroll]');
    if (!scroll) throw new Error('Falta el contenedor de lectura');
    fireEvent.scroll(scroll, { target: { scrollTop: 500 } });
    expect(screen.getByRole('region', { name: 'La carta' })).toBeTruthy();
    expect(deck.scrollTop).toBe(2000);
  });

  it('reserva el fondo oscuro para el disco y mantiene claros el inicio y el cierre', () => {
    render(
      <PlantillaGianoFeatLeo
        templateData={{
          ...templateData,
          songs: [
            {
              videoId: 'dQw4w9WgXcQ',
              title: 'Su canción',
              artist: '',
              start: 0,
              end: 30,
              lyrics: [],
            },
          ],
        }}
        isPreview
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir mi regalo' }));
    const deck = screen.getByRole('main', { name: 'Recorrido del regalo' });
    expect(deck.querySelectorAll('[data-tone="night"]')).toHaveLength(1);
    expect(
      deck.querySelector('[data-tone="night"]')?.getAttribute('data-scene-id')
    ).toBe('song');
    expect(
      screen
        .getByRole('region', { name: 'Presentación' })
        .getAttribute('data-tone')
    ).toBe('paper');
    scrollToScene('song');
    expect(
      screen.getByRole('heading', { name: 'Nuestra canción' })
    ).toBeTruthy();
    scrollToScene('finale');
    expect(
      screen
        .getByRole('region', { name: 'La despedida' })
        .getAttribute('data-tone')
    ).toBe('paper');
  });

  it('permite avanzar con PageDown sin interceptar las teclas del contenido', () => {
    openGift();
    const deck = scrollToScene('photos');
    const scroll = vi.fn();
    Object.defineProperty(deck, 'scrollTo', {
      configurable: true,
      value: scroll,
    });
    fireEvent.keyDown(deck, { key: 'PageDown' });
    expect(scroll).toHaveBeenCalledWith({ top: 2000, behavior: 'smooth' });
    scroll.mockClear();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Foto siguiente' }), {
      key: 'PageDown',
    });
    expect(scroll).not.toHaveBeenCalled();
  });

  it('cierra con la dedicatoria y firma, sin crédito ni botón de reinicio', () => {
    openGift();
    scrollToScene('finale');
    const closing = screen.getByRole('region', { name: 'La despedida' });
    expect(within(closing).getByText(DEFAULT_CLOSING_LINE)).toBeTruthy();
    expect(within(closing).getByText('Mateo')).toBeTruthy();
    expect(within(closing).queryByText(/Hecho con/i)).toBeNull();
    expect(
      within(closing).queryByRole('button', { name: 'Volver a empezar' })
    ).toBeNull();
  });

  it('omite las secciones que no se llenaron', () => {
    render(
      <PlantillaGianoFeatLeo
        templateData={{ personA: 'Ana', personB: 'Leo', message: 'Hola' }}
        isPreview
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir mi regalo' }));
    expect(screen.getByText(/Hay personas que son primavera/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Pétalo/ })).toBeNull();
    expect(screen.queryByText('Nuestra canción')).toBeNull();
    expect(screen.queryByText(/Tienes un/)).toBeNull();
    expect(screen.queryByText(/Nuestra historia,/)).toBeNull();
  });
});
