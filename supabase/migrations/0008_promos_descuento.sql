-- Los codigos ahora tambien pueden dar precio fijo, no solo regalar.
--
-- `precio_descuento` es lo que paga quien usa el codigo, sin importar el plan
-- de la plantilla: 0 es un regalo y 3 es "cualquier plantilla por tres soles".
--
-- Con 0 no cambia nada de lo que hacia 0007: la pagina nace activa. Con precio
-- la pagina se queda como vista previa igual que siempre y el cobro sigue el
-- camino de Yape de 0006 —captura, revision a mano, activacion—; lo unico que
-- cambia es el monto, que sale de la promo y no del plan.

-- ---------------------------------------------------------------
-- 1. EL PRECIO DE CADA CODIGO
-- ---------------------------------------------------------------

alter table public.promos
  add column if not exists precio_descuento numeric(10, 2) not null default 0;

alter table public.promos
  drop constraint if exists promos_precio_no_negativo;
alter table public.promos
  add constraint promos_precio_no_negativo check (precio_descuento >= 0);

-- OJO: estos son los precios acordados. Para moverlos:
--   update public.promos set precio_descuento = <n> where codigo = '<codigo>';
update public.promos set precio_descuento = 3 where codigo = 'Guardian219';
update public.promos set precio_descuento = 0 where codigo = 'Letras219';

-- ---------------------------------------------------------------
-- 2. REVISAR ANTES DE CREAR NADA
-- ---------------------------------------------------------------

-- Reemplaza a `validar_promo`, que solo respondia si o no. Ahora hacen falta
-- dos cosas mas antes de subir una sola foto: poder avisar de que los cupos se
-- agotaron —y no solo que "no sirve"— y saber si toca cobrar, para abrir el
-- Yape o no.
drop function if exists public.validar_promo(text);

-- Devuelve siempre una fila: 'valido', 'agotado' o 'inexistente', y el precio
-- del codigo cuando existe.
create or replace function public.revisar_promo(codigo_promo text)
returns table (estado text, precio numeric)
language sql
security definer
set search_path = public
as $$
  select
    case when p.cantidad > 0 then 'valido' else 'agotado' end,
    p.precio_descuento
  from public.promos p
  where lower(p.codigo) = lower(trim(codigo_promo))
  union all
  select 'inexistente', null::numeric
  where not exists (
    select 1
    from public.promos p2
    where lower(p2.codigo) = lower(trim(codigo_promo))
  );
$$;

revoke execute on function public.revisar_promo(text) from public;
grant  execute on function public.revisar_promo(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------
-- 3. CANJEAR
-- ---------------------------------------------------------------

-- Devuelve el precio que le toca pagar a esa pagina: 0 si el codigo la abrio
-- aqui mismo, o el monto de la promo si queda pendiente de pago.
drop function if exists public.canjear_promo(text, uuid);

create or replace function public.canjear_promo(codigo_promo text, pagina uuid)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  promo_encontrada bigint;
  cupos            integer;
  descuento        numeric(10, 2);
begin
  -- `for update` es lo que impide repartir 26 cupos de 25: dos canjes
  -- simultaneos del mismo codigo hacen cola en esta fila en vez de leer los
  -- dos la misma cantidad. El lock se suelta al cerrar la transaccion.
  select id, cantidad, precio_descuento
    into promo_encontrada, cupos, descuento
  from public.promos
  where lower(codigo) = lower(trim(codigo_promo))
  for update;

  if promo_encontrada is null then
    raise exception 'Ese codigo no existe';
  end if;

  if cupos <= 0 then
    raise exception 'Ese codigo ya se agoto';
  end if;

  -- Un solo update para los dos casos: con descuento 0 la pagina se abre y
  -- pierde la expiracion; con precio se queda exactamente como estaba —vista
  -- previa, sin pagar— y solo queda anotada de que promo salio.
  --
  -- `promo_id is null` hace el canje idempotente: quien pulse el boton dos
  -- veces no gasta dos cupos, porque el segundo update no encuentra fila.
  update public.pages
     set is_paid    = case when descuento = 0 then true else is_paid end,
         expires_at = case when descuento = 0 then null else expires_at end,
         promo_id   = promo_encontrada
   where id = pagina
     and is_paid = false
     and promo_id is null;

  if not found then
    raise exception 'Esa pagina ya tenia un codigo o ya estaba activa';
  end if;

  update public.promos
     set cantidad = cantidad - 1
   where id = promo_encontrada;

  return descuento;
end;
$$;

revoke execute on function public.canjear_promo(text, uuid) from public;
grant  execute on function public.canjear_promo(text, uuid) to anon, authenticated, service_role;

-- ---------------------------------------------------------------
-- 4. LA BANDEJA DE PAGOS TIENE QUE PEDIR EL MONTO DE LA PROMO
-- ---------------------------------------------------------------

-- `pagos` no cambia: sigue guardando lo mismo que antes. Lo que cambia es la
-- columna `precio` de esta vista, que hasta ahora salia siempre del plan de la
-- plantilla. Con un codigo de descuento ese numero es el equivocado: se veria
-- "precio 12" para alguien a quien le pedimos 3, y el pago se rechazaria por
-- no cuadrar. `promo` se agrega al final para saber por que se le pidio menos.
create or replace view public.pagos_pendientes as
  select
    pg.id            as pago_id,
    pg.creado_en,
    pg.nombre,
    pg.correo,
    pg.comprobante_url,
    pg.enlace,
    coalesce(pr.precio_descuento, pa.flow_amount, pl.price)::numeric(10, 2)
                     as precio,
    t.name           as plantilla,
    pa.is_paid       as pagina_activa,
    pr.codigo        as promo
  from public.pagos pg
  join public.pages     pa on pa.id = pg.page_id
  join public.templates t  on t.id  = pa.template_id
  join public.plans     pl on pl.id = t.plan_id
  left join public.promos pr on pr.id = pa.promo_id
  where pg.estado = 'pendiente'
  order by pg.creado_en;

revoke all on public.pagos_pendientes from anon, authenticated;

-- La vista de uso tambien dice ahora a que precio va cada codigo.
create or replace view public.promos_uso as
  select
    pr.id,
    pr.nombre,
    pr.codigo,
    pr.cantidad  as restantes,
    count(pa.id) as canjeadas,
    pr.precio_descuento
  from public.promos pr
  left join public.pages pa on pa.promo_id = pr.id
  group by pr.id, pr.nombre, pr.codigo, pr.cantidad, pr.precio_descuento
  order by pr.id;

revoke all on public.promos_uso from anon, authenticated;
