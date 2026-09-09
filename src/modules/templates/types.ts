import type { FC } from 'react';
import type { TemplateData } from '@/core/models/template';

export interface Template {
  id: string;
  title: string;
  description: string;
  image: string;
  plan: 'free' | 'premium';
  component: FC<TemplateSlideProps>;
}

export interface TemplateSlideProps {
  templateData: TemplateData;
  isPreview?: boolean;
  onComplete?: () => void;
}

export interface SlideConfig {
  id: string;
  duration?: number;
  allowSkip?: boolean;
}
