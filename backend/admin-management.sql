-- Admin management. Run once in Supabase Dashboard > SQL Editor.
-- Lets admins list / add / remove other admins from admin.html.
-- The person must already exist in Authentication > Users (create the account there first).

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.list_admins()
returns table (user_id uuid, email text, created_at timestamptz)
language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query
    select a.user_id, u.email::text, a.created_at
    from public.admin_users a join auth.users u on u.id = a.user_id
    order by a.created_at;
end $$;

create or replace function public.add_admin(p_email text) returns void
language plpgsql security definer set search_path = public, auth as $$
declare v_id uuid;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  select id into v_id from auth.users where lower(email) = lower(btrim(p_email));
  if v_id is null then raise exception 'user not found: create the account in Authentication > Users first'; end if;
  insert into public.admin_users (user_id) values (v_id) on conflict do nothing;
end $$;

create or replace function public.remove_admin(p_user_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if p_user_id = auth.uid() then raise exception 'you cannot remove yourself'; end if;
  if (select count(*) from public.admin_users) <= 1 then raise exception 'at least one admin is required'; end if;
  delete from public.admin_users where user_id = p_user_id;
end $$;

revoke execute on function public.is_admin(), public.list_admins(), public.add_admin(text), public.remove_admin(uuid) from public, anon;
grant execute on function public.is_admin(), public.list_admins(), public.add_admin(text), public.remove_admin(uuid) to authenticated;
