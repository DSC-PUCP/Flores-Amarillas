import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlantillaGianoFeatLeo, plantillaGianoFeatLeoForm } from './App';

describe('spring template', () => {
  it('uses the recipient from existing saved pages without requiring new fields', () => {
    const html = renderToStaticMarkup(
      <PlantillaGianoFeatLeo templateData={{ personB: 'María' }} />
    );
    expect(html).toContain('María');
    expect(html).toContain('21 de septiembre');
    expect(html).toContain('florece contigo');
    expect(html).not.toContain('DESCUBRIR');
  });

  it('handles a missing recipient', () => {
    expect(
      renderToStaticMarkup(<PlantillaGianoFeatLeo templateData={{}} />)
    ).toContain('Para ti');
  });

  it('organizes existing data into six steps without duplicated fields', () => {
    expect(plantillaGianoFeatLeoForm).toHaveLength(6);
    const fields = plantillaGianoFeatLeoForm.flatMap((step) =>
      step.fields.map((field) => field.name)
    );
    expect(new Set(fields).size).toBe(fields.length);
    expect(
      plantillaGianoFeatLeoForm[0].fields.some(
        (field) => field.name === 'personB' && field.required
      )
    ).toBe(true);
  });
});
