-- Nested categories: parent_id must exist in Postgres AND in PostgREST schema cache.
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories(parent_id);

NOTIFY pgrst, 'reload schema';
