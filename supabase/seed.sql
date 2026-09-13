-- Datos solo para desarrollo local. No usar --include-seed al desplegar.
update public.plans set price = 5.00 where name = 'Clasico';
update public.plans set price = 10.00 where name = 'Premium';

-- Formularios minimos para probar el flujo completo con el catalogo de ejemplo.
update public.templates
set schema_json = $schema$[
  {"title":"Protagonistas","fields":[
    {"name":"personA","label":"Tu nombre","type":"string","required":true},
    {"name":"personB","label":"Su nombre","type":"string","required":true},
    {"name":"startDate","label":"Inicio de su historia","type":"date","required":true}
  ]},
  {"title":"Mensaje","fields":[
    {"name":"message","label":"Tu mensaje","type":"textarea","required":true}
  ]}
]$schema$::jsonb
where template_key = 'plantilla_giano_feat_leo';

update public.templates
set schema_json = $schema$[
  {"title":"Protagonistas","fields":[
    {"name":"personA","label":"Tu nombre","type":"string","required":true},
    {"name":"personB","label":"Su nombre","type":"string","required":true},
    {"name":"startDate","label":"Inicio de su historia","type":"date","required":true}
  ]},
  {"title":"Recuerdos","fields":[
    {"name":"message","label":"Tu mensaje","type":"string","required":true},
    {"name":"image","label":"Foto","type":"image","required":true}
  ]}
]$schema$::jsonb
where template_key = 'plantilla_gratuita';

insert into storage.buckets (id, name, public)
values ('flores-amarillas', 'flores-amarillas', true)
on conflict (id) do nothing;
