import { createFileRoute } from '@tanstack/react-router';
import { TemplateContent } from '../../../modules/templates/content';

export const Route = createFileRoute('/__layout/template/')({
  component: TemplateContent,
});
