-- WhatsApp notification for every new order.
-- Run once in Supabase Dashboard > SQL Editor (after deploying the notify-order Edge Function).
alter table public.orders add column if not exists notified_at timestamptz;

create extension if not exists pg_net with schema extensions;

create or replace function public.trg_notify_order() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform net.http_post(
    url := 'https://mwejjmzmdwyxqkxmduwc.supabase.co/functions/v1/notify-order',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('order_id', new.id)
  );
  return new;
exception when others then
  return new; -- a notification problem must never block an order
end $$;
revoke execute on function public.trg_notify_order() from public, anon, authenticated;

-- deferred: fires at commit, after the order lines were inserted too
drop trigger if exists orders_notify on public.orders;
create constraint trigger orders_notify after insert on public.orders
  deferrable initially deferred for each row execute function public.trg_notify_order();
