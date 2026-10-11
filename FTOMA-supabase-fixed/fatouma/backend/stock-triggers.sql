-- Automatic stock: decrease on each order line, restore when an order is cancelled.
-- Run once in Supabase Dashboard > SQL Editor. NULL stock_quantity = unlimited.
create or replace function public.trg_order_item_stock() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.product_id is not null then
    update public.products set stock_quantity = stock_quantity - new.quantity
    where id = new.product_id and stock_quantity is not null;
    if found and (select stock_quantity from public.products where id = new.product_id) < 0 then
      raise exception 'out of stock %', new.product_name;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists order_item_stock on public.order_items;
create trigger order_item_stock after insert on public.order_items
  for each row execute function public.trg_order_item_stock();

create or replace function public.trg_order_cancel_stock() returns trigger
language plpgsql security definer set search_path = public as $$
declare dir int := 0;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then dir := 1;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then dir := -1;
  end if;
  if dir <> 0 then
    update public.products p set stock_quantity = p.stock_quantity + dir * oi.quantity
    from public.order_items oi
    where oi.order_id = new.id and oi.product_id = p.id and p.stock_quantity is not null;
  end if;
  return new;
end $$;
drop trigger if exists order_cancel_stock on public.orders;
create trigger order_cancel_stock after update of status on public.orders
  for each row execute function public.trg_order_cancel_stock();
