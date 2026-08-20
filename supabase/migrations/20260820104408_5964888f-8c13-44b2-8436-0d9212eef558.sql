
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  category text NOT NULL DEFAULT 'T-Shirts',
  description text NOT NULL DEFAULT '',
  price_usd numeric NOT NULL DEFAULT 0,
  vat_percent numeric NOT NULL DEFAULT 0,
  shipping_usd numeric NOT NULL DEFAULT 0,
  discount_percent numeric NOT NULL DEFAULT 0,
  images text[] NOT NULL DEFAULT '{}',
  video_url text,
  colors text[] NOT NULL DEFAULT '{}',
  sizes text[] NOT NULL DEFAULT ARRAY['S','M','L','XL','XXL'],
  badge text,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon, authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('WA-' || upper(substr(md5(random()::text),1,6))),
  customer_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_usd numeric NOT NULL DEFAULT 0,
  total_ngn numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders public insert" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.analytics_events (
  id bigserial PRIMARY KEY,
  kind text NOT NULL,
  label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.analytics_events_id_seq TO anon, authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics public insert" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.site_settings (key, value) VALUES ('site', jsonb_build_object(
  'brand','PLAIN',
  'tagline','Essentials. Elevated.',
  'logoUrl','/__l5e/assets-v1/7fba1b6b-c271-4657-a79d-b8e1c19e7bd5/image.png',
  'heroTitle','Essentials. Elevated.',
  'heroSubtitle','Heavyweight organic cotton. Made for the everyday.',
  'heroKicker','New Season',
  'heroCta','Shop Now',
  'heroSlides', jsonb_build_array(
    '/__l5e/assets-v1/6d75f760-7900-4c59-b985-bd1bbebeac39/image-3.png',
    '/__l5e/assets-v1/820c4c70-638e-4d4c-a4fc-a3c87259c205/image-5.png',
    '/__l5e/assets-v1/39afc151-c864-4fa6-b5fe-35d934ee7cb0/image-2.png'
  ),
  'primaryColor','#12235A',
  'accentColor','#C8A87C',
  'themeReference','',
  'usdToNgn', 1600,
  'whatsapp','2349074473570',
  'adEnabled', true,
  'adText','Free shipping on orders over $60 — this week only.',
  'adImage','',
  'adLink','/shop',
  'requireReceipt', true,
  'galleryHeroVideo','https://www.youtube.com/watch?v=ScMzIvxBSi4',
  'galleryHeroTitle','Welcome to PLAIN',
  'galleryHeroSubtitle','A quiet study in form, fabric and restraint.',
  'aboutTitle','About PLAIN',
  'aboutBody','PLAIN is a minimalist fashion label built on heavyweight organic cotton, honest pricing and pieces designed to outlast the season.',
  'aboutImage','/__l5e/assets-v1/156b6a7f-68c6-461c-bda8-bb0e14ebd39d/image-4.png',
  'contactTitle','Contact Us',
  'contactBody','We reply on WhatsApp within a few hours, every day.',
  'contactEmail','hello@plain.store',
  'contactPhone','+234 907 447 3570',
  'contactAddress','Lagos, Nigeria',
  'contactImage',''
));
