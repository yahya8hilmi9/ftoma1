-- FATOUMA — ميزات جديدة: موعد التوصيل، كودات الخصم، الهدية، المراجعات، الاشتراكات، طلبات الشركات
-- شغّل هاد الملف مرة وحدة فـ Supabase > SQL Editor (يمكن تشغيله أكثر من مرة بلا مشكل).
-- لازم تكون شغّلتي قبل: schema.sql و track-order.sql (و admin-full.sql باش تخدم صور المنتجات)

-- 0) ضروريات (كتتعاود بلا مشكل إلا كانت موجودة)
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


-- 1) أعمدة جديدة فـ orders
alter table public.orders
  add column if not exists delivery_date date,
  add column if not exists delivery_slot text,
  add column if not exists discount_code text,
  add column if not exists discount_amount numeric not null default 0,
  add column if not exists is_gift boolean not null default false,
  add column if not exists gift_to text,
  add column if not exists gift_message text;

-- 2) كودات الخصم (الزبون ما كيقراهاش مباشرة؛ كيمر من check_discount فقط)
create table if not exists public.discount_codes (
  code text primary key check (code = upper(code) and length(code) between 3 and 30),
  kind text not null default 'percent' check (kind in ('percent','fixed')),
  value numeric not null check (value > 0),
  min_total numeric not null default 0,
  max_uses int,
  uses int not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.discount_codes enable row level security;
drop policy if exists "Admins manage codes" on public.discount_codes;
create policy "Admins manage codes" on public.discount_codes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.check_discount(p_code text, p_subtotal numeric)
returns jsonb language plpgsql security definer set search_path = public as $$
declare dc public.discount_codes%rowtype; v_amt numeric;
begin
  select * into dc from public.discount_codes where code = upper(btrim(coalesce(p_code,''))) and active
    and (expires_at is null or expires_at > now()) and (max_uses is null or uses < max_uses);
  if not found then return jsonb_build_object('ok', false, 'reason', 'invalid'); end if;
  if coalesce(dc.min_total,0) > coalesce(p_subtotal,0) then
    return jsonb_build_object('ok', false, 'reason', 'min', 'min_total', dc.min_total); end if;
  v_amt := case dc.kind when 'percent' then round(p_subtotal * least(dc.value,100) / 100) else least(dc.value, p_subtotal) end;
  return jsonb_build_object('ok', true, 'kind', dc.kind, 'value', dc.value, 'amount', v_amt);
end $$;
revoke all on function public.check_discount(text, numeric) from public;
grant execute on function public.check_discount(text, numeric) to anon, authenticated;

-- 3) المراجعات (كتبان غير بعد موافقة المسؤول)
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  product_slug text,
  name text not null check (length(name) between 2 and 60),
  rating int not null check (rating between 1 and 5),
  comment text not null check (length(comment) between 3 and 500),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
drop policy if exists "Public reads approved reviews" on public.reviews;
create policy "Public reads approved reviews" on public.reviews for select to anon, authenticated using (approved);
drop policy if exists "Admins manage reviews" on public.reviews;
create policy "Admins manage reviews" on public.reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 4) اشتراك فطور الأسبوع + طلبات الشركات
create table if not exists public.subscriptions (
  id bigint generated always as identity primary key,
  name text not null, phone text not null, city text not null, address text not null,
  plan text not null, day text, notes text,
  status text not null default 'new' check (status in ('new','active','paused','cancelled')),
  created_at timestamptz not null default now()
);
create table if not exists public.quotes (
  id bigint generated always as identity primary key,
  name text not null, company text, phone text not null, email text,
  event_date date, people int, message text,
  status text not null default 'new' check (status in ('new','answered','done')),
  created_at timestamptz not null default now()
);
create table if not exists public.form_attempts (
  id bigint generated always as identity primary key, key text not null, at timestamptz not null default now());
alter table public.subscriptions enable row level security;
alter table public.quotes enable row level security;
alter table public.form_attempts enable row level security;
drop policy if exists "Admins manage subscriptions" on public.subscriptions;
create policy "Admins manage subscriptions" on public.subscriptions for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage quotes" on public.quotes;
create policy "Admins manage quotes" on public.quotes for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public._form_limit(p_key text) returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.form_attempts where at < now() - interval '1 day';
  if (select count(*) from public.form_attempts where key = p_key and at > now() - interval '1 hour') >= 4 then
    raise exception 'too many attempts'; end if;
  insert into public.form_attempts (key) values (p_key);
end $$;
revoke all on function public._form_limit(text) from public, anon, authenticated;

create or replace function public.submit_review(p_slug text, p_name text, p_rating int, p_comment text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._form_limit('rev:' || coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', 'x'));
  insert into public.reviews (product_slug, name, rating, comment)
  values (nullif(left(btrim(coalesce(p_slug,'')),60),''), left(btrim(p_name),60), p_rating, left(btrim(p_comment),500));
end $$;
revoke all on function public.submit_review(text, text, int, text) from public;
grant execute on function public.submit_review(text, text, int, text) to anon, authenticated;

create or replace function public.submit_subscription(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_phone text := regexp_replace(coalesce(p->>'phone',''), '[\s.-]', '', 'g');
begin
  if v_phone !~ '^(\+212|0)[5-7][0-9]{8}$' then raise exception 'invalid phone'; end if;
  perform public._form_limit('sub:' || v_phone);
  insert into public.subscriptions (name, phone, city, address, plan, day, notes)
  values (left(btrim(p->>'name'),100), v_phone, left(btrim(p->>'city'),80), left(btrim(p->>'address'),250),
          left(btrim(p->>'plan'),60), left(btrim(coalesce(p->>'day','')),30), nullif(left(btrim(coalesce(p->>'notes','')),300),''));
end $$;
revoke all on function public.submit_subscription(jsonb) from public;
grant execute on function public.submit_subscription(jsonb) to anon, authenticated;

create or replace function public.submit_quote(p jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_phone text := regexp_replace(coalesce(p->>'phone',''), '[\s.-]', '', 'g');
begin
  if v_phone !~ '^(\+212|0)[5-7][0-9]{8}$' then raise exception 'invalid phone'; end if;
  perform public._form_limit('quo:' || v_phone);
  insert into public.quotes (name, company, phone, email, event_date, people, message)
  values (left(btrim(p->>'name'),100), nullif(left(btrim(coalesce(p->>'company','')),100),''), v_phone,
          nullif(left(btrim(coalesce(p->>'email','')),120),''), nullif(p->>'event_date','')::date,
          nullif(p->>'people','')::int, nullif(left(btrim(coalesce(p->>'message','')),600),''));
end $$;
revoke all on function public.submit_quote(jsonb) from public;
grant execute on function public.submit_quote(jsonb) to anon, authenticated;

-- 5) create_order (يدعم موعد التوصيل + الخصم + الهدية)
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
  v_date date := nullif(payload->>'delivery_date','')::date;
  v_slot text := nullif(payload->>'delivery_slot','');
  v_code text := upper(btrim(coalesce(payload->>'discount_code','')));
  v_disc numeric := 0;
  dc public.discount_codes%rowtype;
  v_gift boolean := coalesce((payload->>'gift')::boolean, false);
  v_gto text := nullif(left(btrim(coalesce(payload->>'gift_to','')),80),'');
  v_gmsg text := nullif(left(btrim(coalesce(payload->>'gift_message','')),300),'');
begin
  if v_date is not null and (v_date < (now() at time zone 'Africa/Casablanca')::date
     or v_date > (now() at time zone 'Africa/Casablanca')::date + 120) then raise exception 'invalid date'; end if;
  if v_slot is not null and v_slot not in ('morning','afternoon','evening') then raise exception 'invalid slot'; end if;
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

  if v_code <> '' then
    select * into dc from public.discount_codes where code = v_code and active
      and (expires_at is null or expires_at > now()) and (max_uses is null or uses < max_uses)
      and coalesce(min_total,0) <= v_sub for update;
    if not found then raise exception 'invalid code'; end if;
    v_disc := case dc.kind when 'percent' then round(v_sub * least(dc.value,100) / 100) else least(dc.value, v_sub) end;
    update public.discount_codes set uses = uses + 1 where code = dc.code;
  end if;

  insert into public.orders (customer_name, customer_phone, customer_city, customer_address,
    customer_notes, delivery_method, subtotal, delivery_fee, total,
    delivery_date, delivery_slot, discount_code, discount_amount, is_gift, gift_to, gift_message)
  values (v_name, v_phone, v_city, v_addr,
    nullif(concat_ws(E'\n', v_notes, case when v_cart_notes is not null then 'ملاحظات السلة: ' || v_cart_notes end), ''),
    v_delivery, v_sub, v_fee, v_sub - v_disc + v_fee,
    v_date, v_slot, nullif(v_code,''), v_disc, v_gift, case when v_gift then v_gto end, case when v_gift then v_gmsg end)
  returning * into v_order;

  insert into public.order_items (order_id, product_id, product_name, quantity, unit_price, line_total, options)
  select v_order.id, (l->>'product_id')::uuid, l->>'name', (l->>'qty')::int,
         (l->>'unit')::numeric, (l->>'unit')::numeric * (l->>'qty')::int, l->'options'
  from jsonb_array_elements(v_lines) l;

  return jsonb_build_object('order_number', v_order.order_number, 'subtotal', v_sub,
    'delivery_fee', v_fee, 'discount', v_disc, 'total', v_sub - v_disc + v_fee);
end;
$$;
revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;

-- 6) track_order (كيرجع الموعد والخصم)
create or replace function public.track_order(p_number bigint, p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text;
  v_phone text := right(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), 9);
  o public.orders%rowtype;
  v_items jsonb;
begin
  begin
    v_ip := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', 'unknown'), ',', 1);
  exception when others then v_ip := 'unknown';
  end;

  delete from public.track_attempts where at < now() - interval '1 hour';
  if (select count(*) from public.track_attempts where ip = v_ip and at > now() - interval '10 minutes') >= 15 then
    raise exception 'too many attempts';
  end if;
  insert into public.track_attempts (ip) values (v_ip);

  if p_number is null or length(v_phone) <> 9 then return null; end if;

  select * into o from public.orders
   where order_number = p_number
     and right(regexp_replace(customer_phone, '[^0-9]', '', 'g'), 9) = v_phone;
  if not found then return null; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'name', product_name, 'qty', quantity, 'total', line_total, 'options', options)
         order by id), '[]'::jsonb)
    into v_items from public.order_items where order_id = o.id;

  return jsonb_build_object(
    'order_number', o.order_number, 'status', o.status, 'created_at', o.created_at,
    'delivery_method', o.delivery_method, 'subtotal', o.subtotal,
    'delivery_fee', o.delivery_fee, 'discount_amount', o.discount_amount,
    'delivery_date', o.delivery_date, 'delivery_slot', o.delivery_slot, 'total', o.total, 'items', v_items);
end;
$$;

revoke all on function public.track_order(bigint, text) from public;
grant execute on function public.track_order(bigint, text) to anon, authenticated;
