-- Mercati-v2 seed
-- Nota: gli operatori non vengono più seedati.
--   Admin li crea/modifica da /[slug]/admin/operators.

insert into markets (slug, name, city, description, center_lat, center_lng, default_zoom, market_days, timezone)
values (
  'ventimiglia',
  'Mercato del Venerdì',
  'Ventimiglia',
  'Il mercato settimanale di Ventimiglia si tiene ogni venerdì lungo Passeggiata Oberdan, Cavallotti e Via Milite Ignoto.',
  43.7885,
  7.6065,
  16,
  array[5],
  'Europe/Rome'
)
on conflict (slug) do nothing;
