import logo from "@/assets/image.png.asset.json";
import hero from "@/assets/hero-plain.jpg.asset.json";
import p2 from "@/assets/image-2.png.asset.json";
import p3 from "@/assets/image-3.png.asset.json";
import p4 from "@/assets/image-4.png.asset.json";
import p5 from "@/assets/image-5.png.asset.json";
import p6 from "@/assets/image-6.png.asset.json";
import p7 from "@/assets/image-7.png.asset.json";
import p8 from "@/assets/image-8.png.asset.json";
import p9 from "@/assets/image-9.png.asset.json";
import p10 from "@/assets/image-10.png.asset.json";

export const LOGO_URL = logo.url;
export const HERO_URL = hero.url;
export const WHATSAPP_NUMBER = "2349074473570";
export const ADMIN_PASSWORD = "THEPLAINSOCIETY";
export const PRICE = 30000;

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  badge?: string;
  colors: string[];
  description: string;
  video?: string;
};

export const naira = (n: number) => "\u20A6" + n.toLocaleString("en-NG");

export const SIZES = ["S", "M", "L", "XL", "XXL"];

export const defaultProducts: Product[] = [
  {
    id: "chill-front",
    name: "Chill Chest Print Tee",
    category: "T-Shirts",
    price: PRICE,
    images: [p2.url, p10.url],
    badge: "NEW",
    colors: ["Black", "Crimson"],
    description:
      "Heavyweight oversized tee with a crimson CHILL block print at the chest. Boxy drop-shoulder fit, garment washed for softness.",
  },
  {
    id: "chill-god",
    name: "Chill God Neighborhood Tee",
    category: "T-Shirts",
    price: PRICE,
    images: [p10.url, p2.url],
    badge: "BESTSELLER",
    colors: ["Black"],
    description:
      "Full back graphic with hanging sneakers and the line 'God is in the neighborhood'. 100% organic combed cotton.",
  },
  {
    id: "freedom",
    name: "Freedom Warp Tee",
    category: "T-Shirts",
    price: PRICE,
    images: [p3.url],
    badge: "NEW",
    colors: ["Black", "Lilac"],
    description:
      "Warped lilac FREEDOM typography across the back with a serif statement underneath. Boxy oversized cut.",
  },
  {
    id: "plain-logo",
    name: "Plain Logo Essential Tee",
    category: "T-Shirts",
    price: PRICE,
    images: [p4.url],
    colors: ["Black", "Purple"],
    description:
      "The core PLAIN essential. Small chest logo, clean neckline, premium 240gsm cotton jersey.",
  },
  {
    id: "sexy-crop",
    name: "Sexy Character Crop Tee",
    category: "T-Shirts",
    price: PRICE,
    images: [p5.url],
    badge: "NEW",
    colors: ["Black", "Pink"],
    description:
      "Cropped silhouette with a hand-illustrated character graphic. Soft-hand screen print that will not crack.",
  },
  {
    id: "anti-social",
    name: "Anti Social Graphic Tee",
    category: "T-Shirts",
    price: PRICE,
    images: [p6.url],
    badge: "BESTSELLER",
    colors: ["Black", "Red", "Blue"],
    description:
      "'Offline is the new peace of mind.' Layered varsity lettering in red and blue on heavyweight black cotton.",
  },
  {
    id: "steeze-dept",
    name: "Steeze Department Tee",
    category: "T-Shirts",
    price: PRICE,
    images: [p7.url, p8.url],
    colors: ["White", "Red"],
    description:
      "White heavyweight tee with the red Steeze Department chest emblem. Ribbed collar, side-seamed body.",
  },
  {
    id: "stay-steezed",
    name: "Stay Steezed Statement Tee",
    category: "T-Shirts",
    price: PRICE,
    images: [p8.url, p7.url],
    badge: "NEW",
    colors: ["White"],
    description:
      "Oversized back typography: 'Stay steezed until death, defeat is a state of mind.' Bold and unmissable.",
  },
  {
    id: "night-shift",
    name: "Night Shift Society Tee",
    category: "T-Shirts",
    price: PRICE,
    images: [p9.url],
    colors: ["Black"],
    description:
      "Photographic city-night print framed in chain detail with script lettering. When the sun leaves, the city speaks.",
  },
];
