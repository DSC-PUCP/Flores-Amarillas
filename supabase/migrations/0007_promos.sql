-- Codigos de regalo.
--
-- La promocion se reparte por codigo: quien lo tiene escribe "Guardian219" o
-- "Letras219" al final del formulario y su pagina queda activa sin pagar.
--
-- El candado de 0001 y 0003 sigue intacto: el navegador no puede poner
-- is_paid = true por su cuenta. La tabla de codigos NO es legible con la clave
-- anon —si lo fuera, cualquiera abriria el inspector y se copiaria los
-- codigos— y el canje pasa por una funcion security definer, igual que el pago
-- por Yape de 0006. La diferencia con Yape es que esta si la puede ejecutar el
-- navegador: el codigo mismo es la credencial.

-- ---------------------------------------------------------------
-- 1. TABLA
-- ---------------------------------------------------------------

create table if not exists public.promos (
  id       bigint  generated always as identity primary key,
  nombre   text    not null,
  codigo   text    not null,
  -- Cupos que quedan. Cada canje resta uno; en 0 el codigo deja de servir.
  cantidad integer not null default 0,

  constraint promos_codigo_unico    unique (codigo),
  constraint promos_codigo_no_vacio check (length(trim(codigo)) > 0),
  constraint promos_nombre_no_vacio check (length(trim(nombre)) > 0),
  -- Sin esto un error de calculo dejaria la cantidad en negativo: el codigo
  -- seguiria agotado, pero los reportes sumarian canjes que nunca pasaron.
  constraint promos_cantidad_no_negativa check (cantidad >= 0)
);

-- Nadie escribe su codigo con las mayusculas exactas. Se compara en
-- minusculas, y este indice impide ademas registrar "Letras219" y "letras219"
-- como dos promociones distintas.
create unique index if not exists promos_codigo_lower_idx
  on public.promos (lower(codigo));

-- ---------------------------------------------------------------
-- 2. DE QUE PROMOCION SALIO CADA PAGINA
-- ---------------------------------------------------------------

-- Sin esta columna no hay forma de distinguir una pagina regalada de una
-- pagada: las dos se ven igual (is_paid = true). Es lo que permite cuadrar
-- cuantos cupos se usaron de verdad.
alter table public.pages
  add column if not exists promo_id bigint references public.promos (id);

create index if not exists pages_promo_id_idx on public.pages (promo_id)
  where promo_id is not null;

-- El trigger de 0003 ya limpiaba todo lo que el navegador no puede decidir.
-- promo_id entra en esa lista: se pone al canjear, nunca al insertar.
create or replace function public.set_page_insert_defaults()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  plan_price numeric(10, 2);
begin
  select p.price into plan_price
  from public.templates t
  join public.plans p on p.id = t.plan_id
  where t.id = new.template_id;

  if plan_price is null then
    raise exception 'Template sin plan valido';
  end if;

  new.is_paid := false;
  new.flow_checkout_url := null;
  new.flow_order := null;
  new.flow_amount := null;
  new.promo_id := null;
  new.expires_at := case
    when plan_price > 0 then now() + interval '45 minutes'
    else null
  end;
  return new;
end;
$$;

drop policy if exists "pages insercion" on public.pages;
create policy "pages insercion" on public.pages
  for insert to anon, authenticated
  with check (
    is_paid = false
    and flow_checkout_url is null
    and flow_order is null
    and flow_amount is null
    and promo_id is null
  );

-- ---------------------------------------------------------------
-- 3. RLS: la tabla de codigos es secreta
-- ---------------------------------------------------------------

alter table public.promos enable row level security;

-- A proposito sin ninguna policy: RLS niega por defecto y el navegador no
-- tiene que leer esta tabla nunca. Se consulta con la clave de servicio desde
-- el panel, o por las funciones de aqui abajo.
revoke select, insert, update, delete on public.promos from anon, authenticated;

-- ---------------------------------------------------------------
-- 4. VALIDAR
-- ---------------------------------------------------------------

-- Se pregunta antes de subir las fotos y crear la pagina: si el codigo esta
-- mal, no tiene sentido gastar una subida al storage para despues fallar.
--
-- Responde solo si o no. Aun asi se puede averiguar a fuerza bruta si un
-- codigo existe: eso es inherente a repartir codigos cortos, y el dano tiene
-- tope en `cantidad`.
create or replace function public.validar_promo(codigo_promo text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.promos
    where lower(codigo) = lower(trim(codigo_promo))
      and cantidad > 0
  );
$$;

revoke execute on function public.validar_promo(text) from public;
grant  execute on function public.validar_promo(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------
-- 5. CANJEAR
-- ---------------------------------------------------------------

-- Devuelve los cupos que quedan despues de este canje.
--
-- Las tres cosas van juntas o no van: descontar el cupo, abrir la pagina y
-- anotar de que promocion salio. Separadas, un error a mitad de camino regala
-- paginas sin descontar cupos, o descuenta cupos sin regalar nada.
create or replace function public.canjear_promo(codigo_promo text, pagina uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  promo_encontrada bigint;
  cupos            integer;
begin
  -- `for update` es lo que impide repartir 26 cupos de 25: dos canjes
  -- simultaneos del mismo codigo hacen cola en esta fila en vez de leer los
  -- dos la misma cantidad. El lock se suelta al cerrar la transaccion.
  select id, cantidad into promo_encontrada, cupos
  from public.promos
  where lower(codigo) = lower(trim(codigo_promo))
  for update;

  if promo_encontrada is null then
    raise exception 'Ese codigo no existe';
  end if;

  if cupos <= 0 then
    raise exception 'Ese codigo ya se agoto';
  end if;

  -- `is_paid = false` en el WHERE hace el canje idempotente por pagina: quien
  -- pulse el boton dos veces no gasta dos cupos, porque el segundo update no
  -- encuentra nada que cambiar.
  update public.pages
     set is_paid    = true,
         expires_at = null,
         promo_id   = promo_encontrada
   where id = pagina
     and is_paid = false;

  if not found then
    raise exception 'Esa pagina no existe o ya estaba activa';
  end if;

  update public.promos
     set cantidad = cantidad - 1
   where id = promo_encontrada
  returning cantidad into cupos;

  return cupos;
end;
$$;

revoke execute on function public.canjear_promo(text, uuid) from public;
grant  execute on function public.canjear_promo(text, uuid) to anon, authenticated, service_role;

-- ---------------------------------------------------------------
-- 6. LOS CODIGOS DE ESTA PROMOCION
-- ---------------------------------------------------------------

-- OJO: 25 cupos cada uno es lo acordado por ahora. Para mover el tope:
--   update public.promos set cantidad = <n> where codigo = 'Guardian219';
insert into public.promos (nombre, codigo, cantidad) values
  ('Guardianes', 'Guardian219', 25),
  ('Letras',     'Letras219',   25)
on conflict (codigo) do nothing;

-- ---------------------------------------------------------------
-- 7. VISTA DE TRABAJO
-- ---------------------------------------------------------------

-- Cuanto queda y cuanto se uso de cada codigo. `canjeadas` se cuenta sobre
-- pages y no se deduce de `cantidad`: si alguien mueve el tope a mano, los
-- canjes reales siguen siendo los que se ven aqui.
create or replace view public.promos_uso as
  select
    pr.id,
    pr.nombre,
    pr.codigo,
    pr.cantidad  as restantes,
    count(pa.id) as canjeadas
  from public.promos pr
  left join public.pages pa on pa.promo_id = pr.id
  group by pr.id, pr.nombre, pr.codigo, pr.cantidad
  order by pr.id;

revoke all on public.promos_uso from anon, authenticated;
