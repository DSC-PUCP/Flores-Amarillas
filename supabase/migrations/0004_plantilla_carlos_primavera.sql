-- Plantilla de primavera de Carlos: tarjeta de papel, camara de recuerdos,
-- tocadiscos, carta y un minijuego pixel art.
--
-- is_visible = 0 a proposito: el codigo ya esta, pero la plantilla no se
-- muestra en el catalogo hasta que alguien que no la programo la recorra de
-- punta a punta en un celular real (paso 10 de docs/crear-una-plantilla.md).
--
-- schema_json queda por defecto: la clave esta en TEMPLATES_CATALOG, asi que
-- el codigo ignora esa columna y manda el formulario del repo.
--
-- preview_image_url queda en null porque todavia no hay una captura de la
-- plantilla. Aqui no se puede armar desde VITE_SUPABASE_URL como en el codigo,
-- y hardcodear el dominio ataria esta migracion a un proyecto de Supabase
-- concreto. Al prender is_visible hay que subir la captura y poner su URL, o
-- el catalogo pinta "La imagen de este diseno no esta disponible".
insert into public.templates
  (name, description, plan_id, template_key, is_visible, preview_image_url)
values
  ('Primavera',
   'Cinco pantallas, una carta y un jardin para recorrer',
   (select id from public.plans where name = 'Premium'),
   'plantilla_carlos_primavera',
   0,
   null)
on conflict (template_key) do nothing;
