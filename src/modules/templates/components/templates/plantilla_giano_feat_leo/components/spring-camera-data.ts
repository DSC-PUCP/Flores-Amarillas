import type { TemplateData } from '@/core/models/template';

export interface CameraMemory {
  id: number;
  image: string;
  detail: string;
}

export function getCameraMemories(data: TemplateData): CameraMemory[] {
  const previousPhotos = Array.isArray(data.timelinePhotos)
    ? data.timelinePhotos
    : [];
  return Array.from({ length: 4 }, (_, index) => {
    const image = data[`memoryPhoto${index + 1}`] ?? previousPhotos[index];
    const detail = data[`memoryDetail${index + 1}`];
    return {
      id: index + 1,
      image: typeof image === 'string' ? image : '',
      detail: typeof detail === 'string' ? detail.trim() : '',
    };
  });
}
