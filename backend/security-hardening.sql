-- Run once in Supabase Dashboard > SQL Editor.
-- 1) trigger functions must not be callable through the public API
revoke execute on function public.trg_order_item_stock() from public, anon, authenticated;
revoke execute on function public.trg_order_cancel_stock() from public, anon, authenticated;

-- 2) anti-spam: max 3 orders per phone per hour, max 40 orders per 10 minutes overall
create or replace function public.trg_orders_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.orders
      where customer_phone = new.customer_phone and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'too many orders for this phone';
  end if;
  if (select count(*) from public.orders where created_at > now() - interval '10 minutes') >= 40 then
    raise exception 'too many orders, try again later';
  end if;
  return new;
end $$;
revoke execute on function public.trg_orders_rate_limit() from public, anon, authenticated;
drop trigger if exists orders_rate_limit on public.orders;
create trigger orders_rate_limit before insert on public.orders
  for each row execute function public.trg_orders_rate_limit();
