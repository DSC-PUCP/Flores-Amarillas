import { useMutation } from '@tanstack/react-query';
import type { FileUploadRef, TemplateData } from '@/core/models';
import { LovepageService } from '../services';

type CreateLovepageParams = {
  templateId: number;
  configJson: TemplateData;
  files?: FileUploadRef[];
};

export function useCreateLovepage() {
  return useMutation({
    mutationFn: (params: CreateLovepageParams) =>
      LovepageService.createLovepage(
        params.templateId,
        params.configJson,
        params.files
      ),
  });
}
