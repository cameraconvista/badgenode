-- Rollback: ripristina la policy di lettura pubblica su public.app_settings
-- (riporta lo stato precedente alla migrazione 20260714T0100).
-- Da usare solo se la rimozione della SELECT pubblica dovesse rompere qualcosa.

drop policy if exists "app_settings_select_all" on public.app_settings;
create policy "app_settings_select_all"
  on public.app_settings
  for select
  to anon, authenticated
  using (true);
