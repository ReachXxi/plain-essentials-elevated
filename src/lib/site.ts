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
};


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
};

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

export function cartMessage(cart: CartLine[], rate: number, brand: string) {
  const lines = cart
    .map(
      (l) =>
        `• ${l.name} — ${l.size} / ${l.color} × ${l.qty} — ${usd(lineSubtotal(l))}`,
    )
    .join("\n");
  const total = cartTotalUsd(cart);
  return `Hello ${brand}, I'd like to place this order:\n\n${lines}\n\nTotal: ${usd(total)} (${ngn(total, rate)})\n\nName:\nPhone:\nDelivery address:`;
}

/** Turn any video link (YouTube, Vimeo, Instagram, TikTok, X, direct file) into an embeddable URL. */
export function embedUrl(raw: string): { kind: "iframe" | "video"; src: string } | null {
  const url = (raw || "").trim();
  if (!url) return null;
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return { kind: "video", src: url };

  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i,
  );
  if (yt?.[1]) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo?.[1]) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}` };

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
