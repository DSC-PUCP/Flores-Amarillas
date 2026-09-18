import type { FileUploadRef, TemplateData } from '@/core/models';
import { uuid } from '@/lib/uuid';
import { PlanService } from '@/modules/plan/services';
import { TemplateService } from '@/modules/templates/services';
import { lovepageRepository } from '@/repository/lovepage';
import { promoRepository } from '@/repository/promos';
import { storageRepository } from '@/repository/storage';

// Tiempo que vive el preview de un plan pagado antes de expirar.
// La vista previa puede vencer mientras se verifica el Yape;
// al aprobar el pago se limpia expires_at y se reactiva la pagina.
//
// OJO: cambiar este numero NO cambia nada. El valor que se guarda lo fija el
// trigger set_page_insert_defaults (definido historicamente en 0003 y
// actualizado en 0007), que sobrescribe expires_at en cada INSERT sin mirar
// lo que manda el cliente.
// Para ajustar el plazo real hay que tocar esa migracion.
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
    const pageId = uuid();
    // Clone configJson
    const updatedConfig = { ...configJson } as Record<string, unknown>;
    // Subir files y reemplzar URLs
    for (const { key, file } of files) {
      const filesToProcess = Array.isArray(file) ? file : [file];
      const uploadedUrls: string[] = [];

      for (const singleFile of filesToProcess) {
        const fileId = uuid();
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
      if (Array.isArray(file) || Array.isArray(configJson[key])) {
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

  /**
   * En que termina usar un codigo.
   *
   * `agotado` e `inexistente` no son errores: el regalo esta intacto, lo unico
   * que pasa es que ese codigo no sirve. Por eso vuelven como respuesta y no
   * como excepcion —quien llama tiene que poder avisar con palabras distintas
   * de las de un fallo de red.
   */
  export type CanjeRegalo =
    | { estado: 'agotado' }
    | { estado: 'inexistente' }
    /** Codigo de regalo: la pagina ya quedo activa. */
    | { estado: 'gratis'; pageId: string }
    /** Codigo de descuento: falta pagar `precio` por Yape. */
    | { estado: 'pagar'; pageId: string; precio: number };

  /**
   * Crea la pagina gastando un cupo de la promocion.
   *
   * El codigo se revisa ANTES de crear nada: si esta mal escrito o ya se
   * agoto, no tiene sentido subir las fotos al storage para despues fallar.
   * Esa revision es solo para no gastar la subida —no decide nada—; quien
   * reparte los cupos de verdad es `canjear_promo`, que vuelve a mirar el
   * codigo con la fila bloqueada y es quien dice el precio final.
   *
   * Entre las dos llamadas hay una rendija: si el ultimo cupo se lo lleva
   * alguien mientras se suben las fotos, el canje falla y la pagina queda como
   * una vista previa normal, pendiente de pago. Es el unico final malo posible
   * y deja el regalo intacto, asi que se avisa y se sigue.
   */
  export const createLovepageConPromo = async (
    templateId: number,
    configJson: TemplateData,
    files: FileUploadRef[] = [],
    codigo: string
  ): Promise<CanjeRegalo> => {
    const codigoLimpio = codigo.trim();
    if (!codigoLimpio) return { estado: 'inexistente' };

    const revision = await promoRepository.revisar(codigoLimpio);
    if (revision.isFailure())
      throw new Error(
        revision.getError()?.message ?? 'No se pudo revisar tu código'
      );

    const info = revision.getValue();
    if (!info) return { estado: 'inexistente' };
    if (info.estado !== 'valido') return { estado: info.estado };

    const pageId = await createLovepage(templateId, configJson, files);
    if (!pageId) throw new Error('No se pudo crear tu regalo');

    const canje = await promoRepository.canjear({
      codigo: codigoLimpio,
      pageId,
    });
    if (canje.isFailure())
      throw new Error(
        canje.getError()?.message ?? 'No se pudo canjear tu código'
      );

    const precio = canje.getValue() ?? 0;
    return precio > 0
      ? { estado: 'pagar', pageId, precio }
      : { estado: 'gratis', pageId };
  };
}
