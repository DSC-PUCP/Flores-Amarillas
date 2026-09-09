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
}


export type TemplateField =
  | StringTemplateField
  | ArrayTemplateField
  | NumberTemplateField
  | ImageTemplateField
  | BooleanTemplateField
  | DateTemplateField
  | TextAreaTemplateField;

export type TemplateFormStep = {
  title: string;
  fields: TemplateField[];
};

export type TemplateForm = TemplateFormStep[];

export type TemplateData = Record<
  string,
  string | number | boolean | (string | number | boolean)[] | null | undefined
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
