import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlantillaCarlosPrimavera, plantillaCarlosPrimaveraForm } from './App';

describe('spring template', () => {
  it('uses the recipient from existing saved pages without requiring new fields', () => {
    const html = renderToStaticMarkup(
      <PlantillaCarlosPrimavera templateData={{ personB: 'María' }} />
    );
    expect(html).toContain('María');
    expect(html).toContain('21 de septiembre');
    expect(html).toContain('florece contigo');
    expect(html).not.toContain('DESCUBRIR');
  });

  it('handles a missing recipient', () => {
    expect(
      renderToStaticMarkup(<PlantillaCarlosPrimavera templateData={{}} />)
    ).toContain('Para ti');
  });

  it('organizes the form into five steps without duplicated fields', () => {
    expect(plantillaCarlosPrimaveraForm).toHaveLength(5);
    const fields = plantillaCarlosPrimaveraForm.flatMap((step) =>
      step.fields.map((field) => field.name)
    );
    expect(new Set(fields).size).toBe(fields.length);
    expect(
      plantillaCarlosPrimaveraForm[0].fields.some(
        (field) => field.name === 'personB' && field.required
      )
    ).toBe(true);
  });
});
