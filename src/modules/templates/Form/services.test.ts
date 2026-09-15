import { describe, expect, it, vi } from 'vitest';
import { LovepageService } from './services';

const { create, upload } = vi.hoisted(() => ({
  create: vi.fn(),
  upload: vi.fn(),
}));
vi.mock('@/modules/templates/services', () => ({
  TemplateService: { getTemplateById: async () => ({ planId: 1 }) },
}));
vi.mock('@/modules/plan/services', () => ({
  PlanService: { getPlanById: async () => ({ price: 0 }) },
}));
vi.mock('@/repository/lovepage', () => ({
  lovepageRepository: { createLovepage: create },
}));
vi.mock('@/repository/storage', () => ({
  storageRepository: { uploadImage: upload },
}));
vi.mock('@/lib/uuid', () => ({ uuid: () => 'test-id' }));

describe('persistencia de fotos', () => {
  it('mantiene el orden y las listas de una foto al reemplazar archivos por URLs', async () => {
    upload.mockImplementation(async ({ file }: { file: File }) => ({
      isFailure: () => false,
      getValue: () => `/uploaded/${file.name}`,
    }));
    create.mockResolvedValue({
      isFailure: () => false,
      getValue: () => 'page-id',
    });
    const first = new File(['a'], 'uno.jpg');
    const second = new File(['b'], 'dos.jpg');
    await LovepageService.createLovepage(
      1,
      { mascot: 'cat', image: '', timelinePhotos: [], couponPhotos: [] },
      [
        { key: 'image', file: first },
        { key: 'timelinePhotos', file: [second, first] },
        // Compatibilidad con referencias individuales del formulario anterior.
        { key: 'couponPhotos', file: first },
      ]
    );
    expect(create.mock.calls[0][0].configJson).toMatchObject({
      mascot: 'cat',
      image: '/uploaded/uno.jpg',
      timelinePhotos: ['/uploaded/dos.jpg', '/uploaded/uno.jpg'],
      couponPhotos: ['/uploaded/uno.jpg'],
    });
  });
});
