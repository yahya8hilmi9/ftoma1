-- تتبع الطلب من طرف الزبون: رقم الطلب + رقم الهاتف
-- شغّل هاد الملف مرة وحدة فـ Supabase > SQL Editor
-- الزبون ما كيقدر يقرا حتى شي من جدول orders مباشرة (RLS). كيمر غير من هاد الدالة،
-- وكتعطيه غير: الحالة، المنتجات، المجاميع. بلا اسم/عنوان/هاتف.

create table if not exists public.track_attempts (
  id bigint generated always as identity primary key,
  ip text not null,
  at timestamptz not null default now()
);
alter table public.track_attempts enable row level security;  -- بلا policies = ما كيقراها حتى واحد من المتصفح
create index if not exists track_attempts_ip_at on public.track_attempts (ip, at);

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
    'delivery_fee', o.delivery_fee, 'total', o.total, 'items', v_items);
end;
$$;

revoke all on function public.track_order(bigint, text) from public;
grant execute on function public.track_order(bigint, text) to anon, authenticated;
