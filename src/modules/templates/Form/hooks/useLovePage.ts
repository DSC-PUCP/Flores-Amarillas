import { useMutation } from '@tanstack/react-query';
import type { FileUploadRef, TemplateData } from '@/core/models';
import { LovepageService } from '../services';

type CreateLovepageParams = {
  templateId: number;
  configJson: TemplateData;
  files?: FileUploadRef[];
};

type CreateLovepageConPromoParams = CreateLovepageParams & {
  codigo: string;
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

export function useCreateLovepageConPromo() {
  return useMutation({
    mutationFn: (params: CreateLovepageConPromoParams) =>
      LovepageService.createLovepageConPromo(
        params.templateId,
        params.configJson,
        params.files,
        params.codigo
      ),
  });
}
