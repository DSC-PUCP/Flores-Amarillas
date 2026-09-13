-- Cada pagina de pago representa una unica orden de Flow.
alter table public.pages
  add column flow_checkout_url text,
  add column flow_order bigint,
  add column flow_amount numeric(10, 2);

create unique index pages_flow_order_idx on public.pages (flow_order)
  where flow_order is not null;

-- El navegador puede crear paginas, pero nunca decidir si estan pagadas,
-- fijar datos de Flow ni extender una vista previa.
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
  new.expires_at := case
    when plan_price > 0 then now() + interval '45 minutes'
    else null
  end;
  return new;
end;
$$;

create trigger set_page_insert_defaults
before insert on public.pages
for each row execute function public.set_page_insert_defaults();

drop policy if exists "pages insercion" on public.pages;
create policy "pages insercion" on public.pages
  for insert to anon, authenticated
  with check (
    is_paid = false
    and flow_checkout_url is null
    and flow_order is null
    and flow_amount is null
  );

-- La activacion manual anterior deja de ser una ruta valida.
drop function if exists public.activate_love_page(uuid);
