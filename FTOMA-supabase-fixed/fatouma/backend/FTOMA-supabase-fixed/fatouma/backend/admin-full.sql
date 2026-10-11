-- FATOUMA — full admin (products with images, site settings, delivery fees).
-- Run ONCE in Supabase Dashboard > SQL Editor. Safe to run again.

-- helper used by policies
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 1) Site settings (WhatsApp, contact, social, hours, delivery) edited from admin.html
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "Admins write settings" on public.site_settings;
create policy "Admins write settings" on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 2) Product images bucket (public read, admin-only write)
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do update set public = true;
drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- 3) create_order now reads delivery fees from site_settings (falls back to 25 / 40 / 0, free city delivery from 300)
create or replace function public.create_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c jsonb := payload->'customer';
  v_name text := btrim(coalesce(c->>'name',''));
  v_phone text := regexp_replace(coalesce(c->>'phone',''), '[\s.-]', '', 'g');
  v_city text := btrim(coalesce(c->>'city',''));
  v_addr text := btrim(coalesce(c->>'address',''));
  v_notes text := nullif(btrim(coalesce(c->>'notes','')), '');
  v_cart_notes text := nullif(btrim(coalesce(payload->>'cart_notes','')), '');
  v_delivery text := coalesce(payload->>'delivery','city');
  v_cfg jsonb;
  v_free numeric;
  it jsonb;
  p public.products%rowtype;
  b public.products%rowtype;
  v_qty int;
  v_unit numeric;
  v_comp jsonb;
  v_base numeric;
  v_cur numeric;
  k text;
  v_sub numeric := 0;
  v_fee numeric;
  v_order public.orders%rowtype;
  v_lines jsonb := '[]'::jsonb;
begin
  if length(v_name) < 3 or length(v_name) > 100 then raise exception 'invalid name'; end if;
  if v_phone !~ '^(\+212|0)[5-7][0-9]{8}$' then raise exception 'invalid phone'; end if;
  if length(v_city) < 2 or length(v_city) > 80 then raise exception 'invalid city'; end if;
  if length(v_addr) < 5 or length(v_addr) > 250 then raise exception 'invalid address'; end if;
  if v_delivery not in ('city','nation','pickup') then raise exception 'invalid delivery'; end if;
  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') = 0
     or jsonb_array_length(payload->'items') > 40 then raise exception 'invalid items'; end if;

  for it in select * from jsonb_array_elements(payload->'items') loop
    select * into p from public.products where slug = it->>'id' and is_active;
    if not found then raise exception 'unknown product %', it->>'id'; end if;
    v_qty := least(greatest(coalesce((it->>'qty')::int, 1), 1), 99);
    if p.stock_quantity is not null and p.stock_quantity < v_qty then
      raise exception 'out of stock %', p.slug;
    end if;
    v_unit := p.price;
    v_comp := null;

    if p.composition is not null and jsonb_typeof(it->'comp') = 'object' and it->'comp' <> p.composition then
      v_comp := '{}'::jsonb;
      v_cur := 0;
      for k in select key from jsonb_each(it->'comp') loop
        select * into b from public.products where slug = k and is_active;
        if not found then raise exception 'unknown component %', k; end if;
        if (it->'comp'->>k)::int > 0 then
          v_comp := v_comp || jsonb_build_object(k, least((it->'comp'->>k)::int, 99));
          v_cur := v_cur + b.price * least((it->'comp'->>k)::int, 99);
        end if;
      end loop;
      if v_comp = '{}'::jsonb then raise exception 'empty pack'; end if;
      v_base := 0;
      for k in select key from jsonb_each(p.composition) loop
        select price into v_unit from public.products where slug = k;
        v_base := v_base + v_unit * (p.composition->>k)::int;
      end loop;
      v_unit := round(v_cur * (p.price / v_base));
    end if;

    v_sub := v_sub + v_unit * v_qty;
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'product_id', p.id, 'name', p.name_ar, 'qty', v_qty, 'unit', v_unit,
      'options', jsonb_strip_nulls(jsonb_build_object(
        'filling', nullif(it->>'option',''), 'comp', v_comp, 'slug', p.slug))));
  end loop;

  v_cfg := coalesce((select value from public.site_settings where key = 'config'), '{}'::jsonb);
  v_fee := coalesce((v_cfg->'delivery'->v_delivery->>'fee')::numeric,
                    case v_delivery when 'pickup' then 0 when 'city' then 25 else 40 end);
  if v_cfg->'delivery'->v_delivery ? 'freeFrom' then
    v_free := nullif(v_cfg->'delivery'->v_delivery->>'freeFrom', '')::numeric;
  else
    v_free := case v_delivery when 'city' then 300 else null end;
  end if;
  if v_free is not null and v_free > 0 and v_sub >= v_free then v_fee := 0; end if;

  insert into public.orders (customer_name, customer_phone, customer_city, customer_address,
    customer_notes, delivery_method, subtotal, delivery_fee, total)
  values (v_name, v_phone, v_city, v_addr,
    nullif(concat_ws(E'\n', v_notes, case when v_cart_notes is not null then 'ملاحظات السلة: ' || v_cart_notes end), ''),
    v_delivery, v_sub, v_fee, v_sub + v_fee)
  returning * into v_order;

  insert into public.order_items (order_id, product_id, product_name, quantity, unit_price, line_total, options)
  select v_order.id, (l->>'product_id')::uuid, l->>'name', (l->>'qty')::int,
         (l->>'unit')::numeric, (l->>'unit')::numeric * (l->>'qty')::int, l->'options'
  from jsonb_array_elements(v_lines) l;

  return jsonb_build_object('order_number', v_order.order_number, 'subtotal', v_sub,
    'delivery_fee', v_fee, 'total', v_sub + v_fee);
end;
$$;
revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;
