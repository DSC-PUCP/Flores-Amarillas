-- Retira de bases existentes los campos de la antigua pasarela Flow.
-- Las migraciones historicas se conservan intactas; por eso una instalacion
-- nueva crea estos campos en 0003 y los elimina aqui.

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
  new.expires_at := case
    when plan_price > 0 then now() + interval '45 minutes'
    else null
  end;
  return new;
end;
$$;

drop policy if exists "pages insercion" on public.pages;
drop index if exists public.pages_flow_order_idx;

alter table public.pages
  drop column if exists flow_checkout_url,
  drop column if exists flow_order,
  drop column if exists flow_amount;

create policy "pages insercion" on public.pages
  for insert to anon, authenticated
  with check (is_paid = false);
