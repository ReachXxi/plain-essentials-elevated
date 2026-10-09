export type Product = {
  id: string;
  name: string;
  slug: string | null;
  category: string;
  description: string;
  price_usd: number;
  vat_percent: number;
  shipping_usd: number;
  discount_percent: number;
  images: string[];
  video_url: string | null;
  colors: string[];
  sizes: string[];
  badge: string | null;
  active: boolean;
  sort_order: number;
  in_collection?: boolean;
};

export type GalleryItem = {
  id: string;
  image_url: string;
  title: string;
  description: string;
  sort_order: number;
};

export type Collection = {
  title: string;
  description: string;
  image: string;
};

export type SiteSettings = {
  brand: string;
  tagline: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroKicker: string;
  heroCta: string;
  heroSlides: string[];
  primaryColor: string;
  accentColor: string;
  inkColor: string;
  themeReference: string;
  usdToNgn: number;
  whatsapp: string;
  adEnabled: boolean;
  adText: string;
  adSubtext: string;
  adImage: string;
  adLink: string;
  adCta: string;
  requireReceipt: boolean;
  sheetWebhookUrl?: string;
  galleryHeroVideo: string;
  galleryHeroTitle: string;
  galleryHeroSubtitle: string;
  collectionTitle: string;
  collectionSubtitle: string;
  collectionBody: string;
  collectionImage: string;
  collections: Collection[];
  aboutTitle: string;
  aboutBody: string;
  aboutImage: string;
  contactTitle: string;
  contactBody: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactImage: string;
  checkoutMessage: string;
  checkoutItemLine: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  preorderMinutes: number;
  preorderMsgPending: string;
  preorderMsgPaid: string;
  preorderMsgDelivered: string;
  promoEnabled?: boolean;
  promoHeadline?: string;
  promoCode?: string;
  promoPercent?: number;
  promoMinutes?: number;
  promoFrequency?: PromoFrequency;
  promoSegments?: PromoSegment[];
  hero2Label?: string;
  hero2Link?: string;
  showCategories?: boolean;
  featuredTitle?: string;
  featuredSubtitle?: string;
  featuredIds?: string[];
  showFeatured?: boolean;
  banners?: Banner[];
  showBanners?: boolean;
  showCollectionSection?: boolean;
  shopTitle?: string;
  pillars?: Pillar[];
  showPillars?: boolean;
  circles?: Circle[];
  giftEnabled?: boolean;
  giftMode?: GiftMode;
  giftMinQty?: number;
  giftMinNgn?: number;
  giftName?: string;
  giftImage?: string;
  giftValueNgn?: number;
  giftSizes?: string[];
  giftHeadline?: string;
};

/** Homepage category circle. `category` filters the shop ("All" = everything); `link` overrides. */
export type Circle = { label: string; image: string; category: string; link: string; hidden?: boolean };

export type GiftMode = "qty" | "value" | "both" | "either";

/** Free-gift (gift with purchase) rule check, shared by checkout and server. */
export function giftUnlocked(s: Partial<SiteSettings>, qty: number, subtotalUsd: number) {
  if (!s.giftEnabled) return false;
  const q = qty >= (s.giftMinQty ?? 3);
  const v = subtotalUsd * (s.usdToNgn || 1600) >= (s.giftMinNgn ?? 100000);
  const m = s.giftMode ?? "qty";
  return m === "qty" ? q : m === "value" ? v : m === "both" ? q && v : q || v;
}

export type Banner = { image: string; kicker: string; title: string; cta: string; link: string; hidden?: boolean };
export type Pillar = { n: string; t: string; d: string };


export const DEFAULT_BANNERS: Banner[] = [
  { image: "", kicker: "New in", title: "Everyday essentials", cta: "Shop now", link: "#shop" },
  { image: "", kicker: "Pre-order", title: "The Collection", cta: "Shop now", link: "/collection" },
];
export const DEFAULT_PILLARS: Pillar[] = [
  { n: "01.", t: "Premium Quality", d: "Sourced from the finest mills worldwide." },
  { n: "02.", t: "Transparent Pricing", d: "VAT and shipping shown before you pay." },
  { n: "03.", t: "Sustainable", d: "Eco-friendly materials and packaging." },
  { n: "04.", t: "Bank Transfer Checkout", d: "Pay by transfer, upload your receipt, done." },
];

export type PromoFrequency = "visit" | "session" | "daily";
/** One wheel slice. `weight` is its priority: chance = weight / sum of weights. Empty code = no reward. */
export type PromoSegment = { label: string; code: string; percent: number; weight: number };

export const DEFAULT_PROMO_SEGMENTS: PromoSegment[] = [
  { label: "15% OFF", code: "PLAIN15", percent: 15, weight: 50 },
  { label: "FREE SHIP", code: "", percent: 0, weight: 0 },
  { label: "5% OFF", code: "PLAIN5", percent: 5, weight: 20 },
  { label: "VAULT", code: "", percent: 0, weight: 0 },
  { label: "10% OFF", code: "PLAIN10", percent: 10, weight: 30 },
  { label: "TRY AGAIN", code: "", percent: 0, weight: 0 },
];

/** Segments in use; falls back to the legacy single code/percent when none are configured. */
export function promoSegmentsOf(s: Partial<SiteSettings>): PromoSegment[] {
  if (s.promoSegments && s.promoSegments.length >= 2) return s.promoSegments;
  const code = s.promoCode || "PLAIN15";
  const pct = s.promoPercent ?? 15;
  return DEFAULT_PROMO_SEGMENTS.map((seg, i) =>
    i === 0 ? { label: `${pct}% OFF`, code, percent: pct, weight: 100 } : { ...seg, weight: 0 },
  );
}

/** Finds the reward for a typed code (case-insensitive). */
export function findPromo(s: Partial<SiteSettings>, input: string): PromoSegment | null {
  const c = input.trim().toUpperCase();
  if (!c) return null;
  return promoSegmentsOf(s).find((g) => g.code && g.percent > 0 && g.code.toUpperCase() === c) ?? null;
}

export const defaultPreorderMsgPending =
  "Hi {name}, thanks for checking out {brand}! Your pre-order for {items} has been accepted and we are verifying your payment. We'll get back to you with delivery details once validated.";
export const defaultPreorderMsgPaid =
  "Hi {name}, your payment of {total} for {items} has been confirmed! Your pre-order is queued for dispatch and we'll keep you updated.";
export const defaultPreorderMsgDelivered =
  "Hi {name}, your {brand} pre-order for {items} has been delivered! We hope you love your piece. Welcome to the {brand} Society.";

export const defaultCheckoutItem = "The {name} ({color} / {size}) is my entry piece.";
export const defaultCheckoutMessage = `{brand} Society, I'm pledging my membership.

{items}

Total: {total}

Name: {name}
Phone: {phone}
Address: {address}

Let me in. I'm ready.`;

export const defaultSettings: SiteSettings = {
  brand: "PLAIN",
  tagline: "Essentials. Elevated.",
  logoUrl: "",
  heroTitle: "Essentials. Elevated.",
  heroSubtitle: "Heavyweight organic cotton. Made for the everyday.",
  heroKicker: "New Season",
  heroCta: "Shop Now",
  heroSlides: [],
  primaryColor: "#12235A",
  accentColor: "#C8A87C",
  inkColor: "#0A1128",
  themeReference: "",
  usdToNgn: 1600,
  whatsapp: "2349074473570",
  adEnabled: true,
  adText: "",
  adSubtext: "",
  adImage: "",
  adLink: "/",
  adCta: "",
  requireReceipt: true,
  sheetWebhookUrl: "",
  galleryHeroVideo: "",
  galleryHeroTitle: "Welcome to PLAIN",
  galleryHeroSubtitle: "",
  collectionTitle: "The Collection",
  collectionSubtitle: "Season 01",
  collectionBody:
    "Every PLAIN piece begins as a single idea: an essential worth keeping. Heavyweight organic cotton, boxy tailored cuts and prints that hold their colour wash after wash.",
  collectionImage: "",
  collections: [],

  aboutTitle: "About",
  aboutBody: "",
  aboutImage: "",
  contactTitle: "Contact Us",
  contactBody: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  contactImage: "",
  checkoutMessage: defaultCheckoutMessage,
  checkoutItemLine: defaultCheckoutItem,
  bankName: "OPay",
  bankAccount: "9074473570",
  bankAccountName: "KOLADE OLADIMEJI",
  preorderMinutes: 30,
  preorderMsgPending: defaultPreorderMsgPending,
  preorderMsgPaid: defaultPreorderMsgPaid,
  preorderMsgDelivered: defaultPreorderMsgDelivered,
  promoEnabled: true,
  promoHeadline: "Your Society welcome gift is almost unlocked",
  promoCode: "PLAIN15",
  promoPercent: 15,
  promoMinutes: 15,
};

/** Fill {name} {brand} {items} {total} {ref} in a pre-order WhatsApp template. */
export function fillTemplate(
  tpl: string,
  vars: { name?: string; brand?: string; items?: string; total?: string; ref?: string },
) {
  return tpl
    .replaceAll("{name}", vars.name?.trim() || "there")
    .replaceAll("{brand}", vars.brand || "PLAIN")
    .replaceAll("{items}", vars.items || "your order")
    .replaceAll("{total}", vars.total || "")
    .replaceAll("{ref}", vars.ref || "");
}

export type CartLine = {
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  qty: number;
  unitUsd: number;
  vatPercent: number;
  shippingUsd: number;
  discountPercent: number;
};

export const lineKey = (l: CartLine) => `${l.productId}|${l.size}|${l.color}`;

export function unitAfterDiscount(p: {
  price_usd: number;
  discount_percent: number;
}): number {
  return p.price_usd * (1 - (p.discount_percent || 0) / 100);
}

export function lineSubtotal(l: CartLine): number {
  const net = l.unitUsd * (1 - (l.discountPercent || 0) / 100);
  const vat = net * ((l.vatPercent || 0) / 100);
  return (net + vat) * l.qty + (l.shippingUsd || 0) * l.qty;
}

export function cartTotalUsd(cart: CartLine[]): number {
  return cart.reduce((s, l) => s + lineSubtotal(l), 0);
}

export const usd = (n: number) => `$${n.toFixed(2)}`;
export const ngn = (usdAmount: number, rate: number) =>
  "\u20A6" + Math.round(usdAmount * rate).toLocaleString("en-NG");

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** Make a product image link absolute so WhatsApp can render a preview. */
export function absoluteUrl(src: string, origin?: string): string {
  const s = (src || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  const base =
    origin || (typeof window !== "undefined" ? window.location.origin : "");
  if (!base) return "";
  return `${base.replace(/\/$/, "")}/${s.replace(/^\//, "")}`;
}

export function cartMessage(
  cart: CartLine[],
  rate: number,
  brand: string,
  origin?: string,
  name?: string,
  phone?: string,
  address?: string,
  templates?: { item?: string; body?: string },
) {
  const total = cartTotalUsd(cart);
  const first = absoluteUrl(cart[0]?.image ?? "", origin);
  const preview = first ? `${first}\n\n` : "";
  const itemTpl = (templates?.item || "").trim() || defaultCheckoutItem;
  const bodyTpl = (templates?.body || "").trim() || defaultCheckoutMessage;
  const items = cart
    .map((l) =>
      itemTpl
        .replaceAll("{name}", l.name)
        .replaceAll("{color}", l.color)
        .replaceAll("{size}", l.size)
        .replaceAll("{qty}", String(l.qty)),
    )
    .join("\n");
  const body = bodyTpl
    .replaceAll("{brand}", brand)
    .replaceAll("{items}", items)
    .replaceAll("{total}", `${usd(total)} (${ngn(total, rate)})`)
    .replaceAll("{name}", name?.trim() || "[Insert name]")
    .replaceAll("{phone}", phone?.trim() || "[Insert phone]")
    .replaceAll("{address}", address?.trim() || "[Insert address]");
  return `${preview}${body}`;
}


/** Turn any video link (YouTube, Vimeo, Instagram, TikTok, X, direct file) into an embeddable URL. */
export function embedUrl(
  raw: string,
  opts: { autoplay?: boolean; loop?: boolean; muted?: boolean } = {},
): { kind: "iframe" | "video"; src: string } | null {
  const url = (raw || "").trim();
  if (!url) return null;
  const auto = opts.autoplay ?? false;
  const loop = opts.loop ?? false;

  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return { kind: "video", src: url };

  const withParams = (src: string, params: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return q ? `${src}${src.includes("?") ? "&" : "?"}${q}` : src;
  };

  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i,
  );
  if (yt?.[1]) {
    const id = yt[1];
    return {
      kind: "iframe",
      src: withParams(`https://www.youtube.com/embed/${id}`, {
        autoplay: auto ? "1" : "0",
        mute: auto || opts.muted ? "1" : "0",
        loop: loop ? "1" : "0",
        playlist: id,
        controls: auto && loop ? "0" : "1",
        rel: "0",
        modestbranding: "1",
        playsinline: "1",
      }),
    };
  }

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo?.[1])
    return {
      kind: "iframe",
      src: withParams(`https://player.vimeo.com/video/${vimeo[1]}`, {
        autoplay: auto ? "1" : "0",
        muted: auto || opts.muted ? "1" : "0",
        loop: loop ? "1" : "0",
        background: auto && loop ? "1" : "0",
      }),
    };

  if (/instagram\.com\//i.test(url))
    return { kind: "iframe", src: url.replace(/\/?(\?.*)?$/, "/embed") };

  const tiktok = url.match(/tiktok\.com\/.*\/video\/(\d+)/i);
  if (tiktok?.[1])
    return { kind: "iframe", src: `https://www.tiktok.com/embed/v2/${tiktok[1]}` };

  if (/(twitter|x)\.com\//i.test(url))
    return {
      kind: "iframe",
      src: `https://twitframe.com/show?url=${encodeURIComponent(url)}`,
    };

  return { kind: "iframe", src: url };
}

