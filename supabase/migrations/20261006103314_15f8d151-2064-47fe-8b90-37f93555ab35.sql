ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS discount_percent numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_usd numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal_usd numeric NOT NULL DEFAULT 0;