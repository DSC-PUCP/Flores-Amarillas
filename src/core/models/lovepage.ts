import type { TemplateData } from './template';

export type Lovepage = {
  id: string;
  templateId: number;
  configJson: TemplateData | null;
  isPaid: boolean;
  expiresAt: Date | null;
  flowAmount: number | null;
  flowCheckoutUrl: string | null;
};

export type FileUploadRef = {
  key: string;
  file: File | File[];
};
