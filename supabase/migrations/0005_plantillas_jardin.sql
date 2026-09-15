-- Las dos plantillas del jardin 3D: una isla flotante que se gira con el dedo,
-- con girasoles que crecen, gatos, abejas y mariposas, y un cielo que pasa del
-- amanecer a la noche mientras se mira.
--
-- Comparten todo el motor y se diferencian en un solo objeto de configuracion:
--   clasico  -> tope de 100 flores, 3 gatos, 6 abejas, 5 mariposas
--   premium  -> isla mas grande, tope de 150 flores, 4 gatos, 12 abejas,
--               9 mariposas y el cofre, que se abre a los 15 golpes y entonces
--               ensena la foto y la carta guardadas, con su propia cancion.
--
-- El tope de flores sale de la promocion acordada: la version regalable llega a
-- 75, asi que las dos de pago tienen que ofrecer mas.
--
-- is_visible = 0 en las dos: el codigo esta, pero no se muestran en el catalogo
-- hasta que alguien que no las programo las recorra en un celular real
-- (paso 10 de docs/crear-una-plantilla.md). Ojo con el rendimiento: son 3D.
--
-- schema_json queda por defecto: las claves estan en TEMPLATES_CATALOG, asi que
-- el codigo ignora esa columna y manda el formulario del repo.
--
-- preview_image_url en null hasta tener capturas. Aqui no se puede armar la URL
-- desde VITE_SUPABASE_URL como en el codigo, y hardcodear el dominio ataria la
-- migracion a un proyecto de Supabase concreto.
insert into public.templates
  (name, description, plan_id, template_key, is_visible, preview_image_url)
values
  ('Jardín de flores',
   'Un jardín que gira, con gatitos, abejas y un cielo que cambia',
   (select id from public.plans where name = 'Clasico'),
   'plantilla_jardin_clasico',
   0,
   null),

  ('Jardín con cofre',
   'Más grande, más animales, y un cofre que hay que insistir para abrir',
   (select id from public.plans where name = 'Premium'),
   'plantilla_jardin_premium',
   0,
   null)
on conflict (template_key) do nothing;
