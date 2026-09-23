ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_collection boolean NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_preorder boolean NOT NULL DEFAULT false;