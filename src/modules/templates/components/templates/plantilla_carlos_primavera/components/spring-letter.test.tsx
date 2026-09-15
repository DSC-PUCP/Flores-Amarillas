// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { PlantillaCarlosPrimavera, plantillaCarlosPrimaveraForm } from '../App';
import { SpringLetter } from './spring-letter';

afterEach(cleanup);

it('keeps the letter private until opened, preserves long text and can be closed and reopened', () => {
  const message = `Hola,\n\n${'Una historia que florece. '.repeat(350)}\n\nCon cariño.`;
  render(<SpringLetter recipient="María" sender="Carlos" message={message} />);
  expect(screen.queryByRole('article')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Abrir carta' }));
  expect(screen.getByRole('article').textContent).toContain(message);
  expect(screen.getByRole('article').textContent).toContain('Carlos');
  fireEvent.click(screen.getByRole('button', { name: 'Volver a guardar' }));
  expect(screen.queryByRole('article')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Abrir carta' }));
  expect(screen.getByRole('article').textContent).toContain(message);
});

it('connects the fifth screen to its own saved field, independently of the short card', () => {
  render(
    <PlantillaCarlosPrimavera
      templateData={{
        personB: 'María',
        personA: 'Carlos',
        message: 'Frase corta',
        letterMessage: 'Mi carta larga',
      }}
    />
  );
  for (const name of [
    'Ir a Nosotros dos',
    'Ir a Recuerditos nuestros',
    'Ir a Nuestra música',
    'Ir a Una carta para ti',
  ]) {
    fireEvent.click(screen.getByRole('button', { name }));
  }
  fireEvent.click(screen.getByRole('button', { name: 'Abrir carta' }));
  expect(screen.getByRole('article').textContent).toContain('Mi carta larga');
  expect(screen.getByRole('article').textContent).not.toContain('Frase corta');
  const field = plantillaCarlosPrimaveraForm
    .find((step) => step.title === 'Pantalla 5 · Una carta para ti')
    ?.fields.find((field) => field.name === 'letterMessage');
  expect(field).toMatchObject({ type: 'textarea', max_length: 10000 });
});
