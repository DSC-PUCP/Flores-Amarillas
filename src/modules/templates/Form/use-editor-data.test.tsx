import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { TemplateForm } from '@/core/models/template';
import { useEditorData } from './use-editor-data';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it('muestra fotos locales en orden y mantiene sus URLs al escribir y cambiar de sección', () => {
  let count = 0;
  const create = vi.fn(() => `blob:foto-${++count}`);
  const revoke = vi.fn();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = create;
      static revokeObjectURL = revoke;
    }
  );
  const first = new File(['a'], 'primera.jpg', { type: 'image/jpeg' });
  const second = new File(['b'], 'segunda.jpg', { type: 'image/jpeg' });
  const steps: TemplateForm = [
    {
      title: 'Fotos',
      fields: [
        {
          name: 'timelinePhotos',
          label: 'Fotos',
          type: 'array',
          item_type: 'image',
          required: false,
        },
      ],
    },
  ];
  const { result, rerender, unmount } = renderHook(
    ({ values }) => useEditorData(values, steps),
    {
      initialProps: {
        values: { timelinePhotos: [first, second], message: '' },
      },
    }
  );
  expect(result.current.timelinePhotos).toEqual(['blob:foto-1', 'blob:foto-2']);
  rerender({
    values: { timelinePhotos: [second, first], message: 'Flores para ti.' },
  });
  expect(result.current.timelinePhotos).toEqual(['blob:foto-2', 'blob:foto-1']);
  expect(result.current.message).toBe('Flores para ti.');
  expect(create).toHaveBeenCalledTimes(2);
  expect(revoke).not.toHaveBeenCalled();
  rerender({
    values: { timelinePhotos: [second], message: 'Flores para ti.' },
  });
  expect(revoke).toHaveBeenCalledWith('blob:foto-1');
  expect(result.current.timelinePhotos).toEqual(['blob:foto-2']);
  unmount();
  expect(revoke).toHaveBeenCalledWith('blob:foto-2');
});
