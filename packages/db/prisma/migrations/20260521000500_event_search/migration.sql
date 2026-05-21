-- Trigram search across events. pg_trgm is a contrib extension shipped
-- with Postgres; CREATE EXTENSION IF NOT EXISTS is a no-op when it's
-- already installed.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Event_title_trgm_idx" ON "Event" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Event_venue_trgm_idx" ON "Event" USING gin ("venue" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "Event_city_trgm_idx"  ON "Event" USING gin ("city"  gin_trgm_ops);
