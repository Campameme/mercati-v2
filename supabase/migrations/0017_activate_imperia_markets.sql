-- 0017 — Riattiva i mercati seminati della provincia di Imperia.
-- Diagnosi: /api/markets restituiva solo 2 mercati attivi (bordighera-ospedaletti,
-- imperia): gli altri 6 erano is_active=false, quindi RLS li nascondeva all'anon e
-- intere zone (Sanremo, Ventimiglia, Val Nervia, Taggia, Golfo Dianese, Entroterra)
-- sparivano dalla mappa.
--
-- Questa migrazione è ONE-SHOT (le migrazioni sono tracciate in _migrations): NON
-- sovrascrive eventuali disattivazioni fatte in futuro dagli admin.

update markets set is_active = true
where slug in (
  'ventimiglia', 'val-nervia', 'bordighera-ospedaletti', 'sanremo',
  'taggia-e-costa', 'imperia', 'golfo-dianese', 'entroterra'
);

-- Riallinea le sessioni: il trigger di coerenza (0013) può averle forzate a
-- is_active=false quando il mercato padre era disattivato.
update market_schedules ms set is_active = true
from markets m
where ms.market_id = m.id
  and m.slug in (
    'ventimiglia', 'val-nervia', 'bordighera-ospedaletti', 'sanremo',
    'taggia-e-costa', 'imperia', 'golfo-dianese', 'entroterra'
  );
