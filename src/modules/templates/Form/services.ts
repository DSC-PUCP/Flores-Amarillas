import type { FileUploadRef, TemplateData } from '@/core/models';
import { PlanService } from '@/modules/plan/services';
import { TemplateService } from '@/modules/templates/services';
import { lovepageRepository } from '@/repository/lovepage';
import { storageRepository } from '@/repository/storage';

// Tiempo que vive el preview de un plan pagado antes de expirar.
// El usuario necesita abrir WhatsApp, escribir, yapear y mandar el comprobante:
// 5 minutos (valor del proyecto de San Valentin) resulto muy justo.
const PREVIEW_EXPIRATION_MINUTES = 45;

/*
  Ejemplo de cambio json
  const config = {};

// Con path "image"
setValueByPath(config, "image", "https://url.com/foto.jpg");
// Resultado: { image: "https://url.com/foto.jpg" }

// Con path "timelinePhotos.0"
setValueByPath(config, "timelinePhotos.0", "https://url.com/foto1.jpg");
// Resultado: { timelinePhotos: ["https://url.com/foto1.jpg"] }

// Con path "header.background.url"
setValueByPath(config, "header.background.url", "https://url.com/bg.jpg");
// Resultado: { header: { background: { url: "https://url.com/bg.jpg" } } }
 */
const setValueByPath = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void => {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      //Dependiendo de la siguiente key se crea un array o struct
      const nextKey = keys[i + 1];
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }

  const finalKey = keys[keys.length - 1];
  current[finalKey] = value;
};

export namespace LovepageService {
  export const createLovepage = async (
    templateId: number,
    configJson: TemplateData,
    files: FileUploadRef[] = []
  ) => {
    // Obtener el template para acceder al planId
    const template = await TemplateService.getTemplateById(templateId);
    if (!template) throw new Error('Template no encontrado');

    // Obtener el plan para verificar el precio
    const plan = await PlanService.getPlanById(template.planId);
    if (!plan) throw new Error('Plan no encontrado');

    //Proceso de subida de ARchivos
    // Page ID para storage path
    const pageId = crypto.randomUUID();
    // Clone configJson
    const updatedConfig = { ...configJson } as Record<string, unknown>;
    // Subir files y reemplzar URLs
    for (const { key, file } of files) {
      const filesToProcess = Array.isArray(file) ? file : [file];
      const uploadedUrls: string[] = [];

      for (const singleFile of filesToProcess) {
        const fileId = crypto.randomUUID();
        //Subidaaaa
        const uploadResult = await storageRepository.uploadImage({
          file: singleFile,
          pageId,
          fileId,
        });

        if (uploadResult.isFailure())
          throw new Error(
            `Failed to upload file for key "${key}": ${uploadResult.getError()?.message}`
          );
        //Reemplazo en el config
        const publicUrl = uploadResult.getValue();
        if (publicUrl) uploadedUrls.push(publicUrl);
      }

      // Si es un array de archivos, guardar array de URLs, si no, guardar URL única
      if (Array.isArray(file)) {
        setValueByPath(updatedConfig, key, uploadedUrls);
      } else {
        setValueByPath(updatedConfig, key, uploadedUrls[0]);
      }
    }
    //Proceso de creacion de Pagina
    // Si el precio es 0, no hay expiración. Si es mayor a 0, la página expira en PREVIEW_EXPIRATION_MINUTES
    const expiresAt =
      plan.price === 0
        ? null
        : new Date(Date.now() + PREVIEW_EXPIRATION_MINUTES * 60 * 1000);

    const result = await lovepageRepository.createLovepage({
      id: pageId,
      templateId,
      configJson: updatedConfig as TemplateData,
      expiresAt,
    });

    if (result.isFailure()) throw new Error(result.getError()?.message);
    return result.getValue();
  };
}
