import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { TemplateContent } from '../../../modules/templates/content';

/**
 * El filtro de planes vive en la URL.
 *
 * Asi las tarjetas del home pueden enlazar directo a "solo este plan", el
 * enlace se puede compartir, y al volver desde un diseno se recupera el filtro
 * con el que se estaba mirando. Cambiar de chip reemplaza la entrada del
 * historial en vez de anadir una: probar cuatro filtros no deberia costar
 * cuatro pulsaciones de "atras" para salir de la pantalla.
 *
 * `catch` en vez de un error: el nombre del plan viene de la base de datos y
 * puede cambiar. Si llega uno que ya no existe, se cae a "Todos" y la pantalla
 * se ve entera; peor seria una pagina en blanco por un parametro viejo.
 */
const templateSearchSchema = z.object({
  plan: z.string().max(60).optional().catch(undefined),
});

export const Route = createFileRoute('/__layout/template/')({
  validateSearch: templateSearchSchema,
  component: TemplateContent,
});
