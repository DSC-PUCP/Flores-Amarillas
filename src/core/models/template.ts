import type { SongClip } from './song';

type BaseTemplateField = {
  name: string;
  label: string;
  required: boolean;
};

export type ImageData = {
  url: string;
  alt: string;
};

export type StringTemplateField = BaseTemplateField & {
  type: 'string';
  max_length?: number;
  format?: 'hex' | 'email' | 'url' | 'date';
  default?: string;
};

export type ArrayTemplateField = BaseTemplateField & {
  type: 'array';
  item_type: 'image' | 'string' | 'number' | 'boolean';
  min_items?: number;
  max_items?: number;
  item_max_length?: number; // Para strings: longitud máxima de cada item
  /** Nombre corto de cada elemento ("razón"): botón "Agregar razón" y "Razón 1". */
  item_label?: string;
};

export type BooleanTemplateField = BaseTemplateField & {
  type: 'boolean';
  default?: boolean;
};

export type ImageTemplateField = BaseTemplateField & {
  type: 'image';
  default?: string;
};

export type NumberTemplateField = BaseTemplateField & {
  type: 'number';
  default?: number;
};

export type DateTemplateField = BaseTemplateField & {
  type: 'date';
  default?: string;
};

export type TextAreaTemplateField = BaseTemplateField & {
  type: 'textarea';
  max_length?: number;
  /** Texto de partida, como en `string`. Lo reparte `formDefaults`. */
  default?: string;
};

export type ChoiceTemplateField = BaseTemplateField & {
  type: 'choice';
  options: { value: string; label: string }[];
  default?: string;
  appearance?: 'mascot';
};

/** Canciones de YouTube con fragmento y letra sincronizada. Valor: SongClip[] */
export type MusicTemplateField = BaseTemplateField & {
  type: 'music';
  max_songs?: number;
  max_clip_seconds?: number;
  /**
   * Si la plantilla dibuja la letra sincronizada. Por defecto si, que es lo
   * que hacia antes de existir esta opcion. En `false`, el editor no pide la
   * letra ni deja ajustar su desfase: seria trabajo para algo que nadie va a
   * ver.
   */
  lyrics?: boolean;
};

export type TemplateField =
  | StringTemplateField
  | ArrayTemplateField
  | NumberTemplateField
  | ImageTemplateField
  | BooleanTemplateField
  | DateTemplateField
  | TextAreaTemplateField
  | MusicTemplateField
  | ChoiceTemplateField;

export type TemplateFormStep = {
  title: string;
  description?: string;
  previewScene?:
    | 'cover'
    | 'intro'
    | 'song'
    | 'photos'
    | 'letter'
    | 'reasons'
    | 'coupon'
    | 'finale';
  fields: TemplateField[];
};

export type TemplateForm = TemplateFormStep[];

export type TemplateData = Record<
  string,
  | string
  | number
  | boolean
  | (string | number | boolean)[]
  | SongClip[]
  | null
  | undefined
>;

export type TemplateConfig = {
  templateForm: TemplateForm;
  component: (props: {
    templateData: TemplateData;
    isPreview?: boolean;
  }) => unknown;
};

export type Template = {
  id: number;
  templateKey: string;
  name: string;
  description: string | null;
  schemaJson: TemplateForm;
  planId: number;
  previewImageUrl: string;
  tipoPlan?: string;
  isVisible: boolean;
};
