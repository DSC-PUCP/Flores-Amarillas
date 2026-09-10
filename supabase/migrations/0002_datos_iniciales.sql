-- Flores Amarillas - carga inicial del catalogo
-- OJO: los precios son PLACEHOLDER. Cambialos antes de ejecutar.

-- ---------------------------------------------------------------
-- PLANES
-- ---------------------------------------------------------------

insert into public.plans (name, price, description, features) values
  ('Gratuito', 0.00,  'Para probar y compartir',        '["1 foto","Dedicatoria corta","Enlace permanente"]'::jsonb),
  ('Clasico',  0.00,  'TODO: poner precio real',        '["Varias fotos","Dedicatoria larga","Animaciones"]'::jsonb),
  ('Premium',  0.00,  'TODO: poner precio real',        '["Todo lo del Clasico","Musica","Efectos especiales"]'::jsonb)
on conflict do nothing;

-- ---------------------------------------------------------------
-- PLANTILLAS
-- is_visible = 1 solo para las que YA tienen formulario funcionando.
-- Las demas se prenden cuando su dev entregue el schema.
-- ---------------------------------------------------------------

insert into public.templates (name, description, plan_id, template_key, is_visible) values
  ('Plantilla gratuita', 'El gancho gratuito',
     (select id from public.plans where name = 'Gratuito'), 'plantilla_gratuita',       1),

  ('Premium',            'La mas elaborada, con musica',
     (select id from public.plans where name = 'Premium'),  'plantilla_giano_feat_leo', 1),

  ('Ramo amarillo',      'TODO: nombre y descripcion definitivos',
     (select id from public.plans where name = 'Clasico'),  'pamela_v1',                0),

  ('Girasoles',          'TODO: nombre y descripcion definitivos',
     (select id from public.plans where name = 'Clasico'),  'free_template',            0),

  ('Siempre tu',         'TODO: nombre y descripcion definitivos',
     (select id from public.plans where name = 'Clasico'),  'amor-eterno',              0),

  ('Juntos',             'TODO: nombre y descripcion definitivos',
     (select id from public.plans where name = 'Clasico'),  'juntos-por-siempre',       0),

  ('Nuestra historia',   'TODO: nombre y descripcion definitivos',
     (select id from public.plans where name = 'Clasico'),  'historia-de-dos',          0)
on conflict (template_key) do nothing;
