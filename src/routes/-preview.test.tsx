import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TemplateData } from '@/core/models/template';
import { PreviewPage } from './preview';

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => () => ({
    useSearch: () => ({
      embed: true,
      editorTemplate: 'plantilla_giano_feat_leo',
    }),
  }),
}));
vi.mock('@/modules/templates/components/config/template-components', () => ({
  TEMPLATE_COMPONENTS: { plantilla_giano_feat_leo: () => null },
}));
vi.mock('@/modules/templates/components/TemplateRenderer', () => ({
  TemplateRenderer: ({ templateData }: { templateData: TemplateData }) => (
    <output
      data-testid="rendered-gift"
      data-scene={String(templateData.editorScene)}
    >
      {typeof templateData.message === 'string' ? templateData.message : ''}
    </output>
  ),
}));
const update = {
  type: 'flower-editor:update',
  templateKey: 'plantilla_giano_feat_leo',
  data: { personB: 'Lucía', message: 'Nuestra primavera.' },
  scene: 'letter',
  revision: 0,
};
function send(
  data: unknown,
  origin = window.location.origin,
  source: Window = window.parent
) {
  fireEvent(window, new MessageEvent('message', { data, origin, source }));
}
afterEach(cleanup);
describe('vista previa del editor', () => {
  it('espera el borrador y actualiza el regalo sin sustituir su componente', () => {
    render(<PreviewPage />);
    expect(screen.getByText('Preparando tu regalo…')).toBeTruthy();
    send(update);
    const gift = screen.getByTestId('rendered-gift');
    expect(gift.textContent).toBe('Nuestra primavera.');
    expect(gift.getAttribute('data-scene')).toBe('letter');
    send({ ...update, data: { ...update.data, message: 'Una carta nueva.' } });
    expect(screen.getByTestId('rendered-gift')).toBe(gift);
    expect(gift.textContent).toBe('Una carta nueva.');
  });
  it('ignora mensajes de otro origen y borradores de una plantilla distinta', () => {
    render(<PreviewPage />);
    send(update, 'https://otro.example');
    send({ ...update, templateKey: 'plantilla_gratuita' });
    send({ ...update, data: { message: { invalid: true } } });
    expect(screen.queryByTestId('rendered-gift')).toBeNull();
    send(update);
    expect(screen.getByTestId('rendered-gift').textContent).toBe(
      'Nuestra primavera.'
    );
  });
});
