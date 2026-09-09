import { createFileRoute } from '@tanstack/react-router';
import { TemplateForm } from '../../../modules/templates/Form/TemplateForm';

export const Route = createFileRoute('/__layout/template/$id')({
  component: TemplateForm,
});
