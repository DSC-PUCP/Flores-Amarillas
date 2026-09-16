-- Pagos por Yape con verificacion manual.
--
-- Flow quedo inutilizable: el registro del comercio pide datos de empresa que
-- no tenemos. Mientras tanto el cobro es por Yape: el cliente escanea un QR,
-- paga, sube la captura y aqui queda el registro. Quien atiende mira la
-- notificacion de Yape en el celular y activa la pagina a mano.
--
-- Por eso esta tabla NO activa nada por si sola. Es una bandeja de entrada:
-- guarda lo que dice el cliente y su comprobante. La unica forma de poner
-- is_paid = true sigue siendo una funcion con security definer que el
-- navegador no puede ejecutar (mismo candado que puso 0001 y respeto 0003).

create table if not exists public.pagos (
  id              uuid        primary key default gen_random_uuid(),
  page_id         uuid        not null references public.pages (id) on delete cascade,
  nombre          text        not null,
  correo          text        not null,
  comprobante_url text        not null,
  -- El enlace del regalo tal como lo ve el cliente. Se guarda resuelto y no
  -- armado al vuelo: si manana cambia el dominio, hay que poder reconstruir
  -- que le prometimos a cada quien.
  enlace          text        not null,
  estado          text        not null default 'pendiente',
  creado_en       timestamptz not null default now(),

  constraint pagos_estado_valido check (estado in ('pendiente', 'activado', 'rechazado')),
  constraint pagos_nombre_no_vacio check (length(trim(nombre)) between 2 and 120),
  constraint pagos_correo_valido check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create index if not exists pagos_page_id_idx on public.pagos (page_id);
-- Parcial a proposito: la consulta que se usa a diario es "que falta por
-- revisar", y esa lista siempre es corta.
create index if not exists pagos_pendientes_idx on public.pagos (creado_en desc)
  where estado = 'pendiente';

-- ---------------------------------------------------------------
-- RLS: el navegador deposita, nunca lee ni corrige.
-- ---------------------------------------------------------------

alter table public.pagos enable row level security;

-- Sin policy de SELECT: la tabla tiene nombre, correo y comprobante de gente
-- real, y cualquiera con la clave anon podria listarla. Se lee con la clave de
-- servicio, desde el panel.
create policy "pagos insercion" on public.pagos
  for insert to anon, authenticated
  with check (estado = 'pendiente');

revoke select, update, delete on public.pagos from anon, authenticated;

-- ---------------------------------------------------------------
-- Activacion manual
-- ---------------------------------------------------------------

-- Hace las dos cosas que van juntas: abre la pagina y marca el pago como
-- atendido. Separadas se olvida una y el pago queda en la lista de pendientes
-- para siempre, o peor, se cobra dos veces.
create or replace function public.activar_pago(pago_id uuid)
returns table (page_id uuid, enlace text)
language plpgsql
security definer
set search_path = public
as $$
declare
  objetivo uuid;
  liga     text;
begin
  select p.page_id, p.enlace into objetivo, liga
  from public.pagos p
  where p.id = pago_id;

  if objetivo is null then
    raise exception 'No existe el pago %', pago_id;
  end if;

  update public.pages
     set is_paid    = true,
         expires_at = null
   where id = objetivo;

  update public.pagos
     set estado = 'activado'
   where id = pago_id;

  return query select objetivo, liga;
end;
$$;

revoke execute on function public.activar_pago(uuid) from public, anon, authenticated;
grant  execute on function public.activar_pago(uuid) to service_role;

-- Vista de trabajo: lo que hay que revisar, de lo mas viejo a lo mas nuevo,
-- con el precio que le tocaba pagar para poder cuadrarlo con el Yape.
create or replace view public.pagos_pendientes as
  select
    pg.id            as pago_id,
    pg.creado_en,
    pg.nombre,
    pg.correo,
    pg.comprobante_url,
    pg.enlace,
    pl.price         as precio,
    t.name           as plantilla,
    pa.is_paid       as pagina_activa
  from public.pagos pg
  join public.pages     pa on pa.id = pg.page_id
  join public.templates t  on t.id  = pa.template_id
  join public.plans     pl on pl.id = t.plan_id
  where pg.estado = 'pendiente'
  order by pg.creado_en;

revoke all on public.pagos_pendientes from anon, authenticated;
