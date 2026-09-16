import type { Result } from '@/lib/utils';

export type UploadImageParams = {
  file: File;
  pageId: string;
  fileId: string;
};

export type UploadComprobanteParams = {
  file: File;
  pageId: string;
};

export type StorageRepository = {
  uploadImage: (params: UploadImageParams) => Promise<Result<string | null>>;
  /**
   * Captura del Yape. Va en su propia carpeta y no junto a las fotos del
   * regalo: son cosas distintas y conviene poder mirarlas —o limpiarlas—
   * por separado.
   */
  uploadComprobante: (
    params: UploadComprobanteParams
  ) => Promise<Result<string | null>>;
};
