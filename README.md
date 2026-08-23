# Plain Essentials Hub

PLAIN - Complete E-Commerce Website Specification

Minimalist Fashion Brand | UI Inspired by RH-UDE, ZTTW & Nike

---

📋 PROJECT OVERVIEW

Brand Name: PLAIN  
Tagline: "Essentials. Elevated."  
Admin Password: `THEPLAINSOCIETY`  
WhatsApp Number: `2349074473570`

---

🎨 DESIGN PHILOSOPHY

Drawing inspiration from the three reference sites:

| Site | Key Inspiration |
|------|-----------------|
| RH-UDE | Luxury dark aesthetic, premium product presentation, grid layout, country selector, clean typography |
| ZTTW | Streetwear edge, bold visuals, editorial feel, product-centric layout |
| Nike | Dynamic hero sections, performance-driven design, seamless shopping experience, brand storytelling |

Color Palette
```
Primary:      #0A0A0A (Almost Black - RH-UDE inspired)
Secondary:    #F5F5F5 (Off-White - Clean base)
Accent:       #C8A87C (Warm Gold - Premium feel)
Highlight:    #E8E0D5 (Warm Beige - ZTTW inspired)
Text Primary: #1A1A1A
Text Muted:   #6B6B6B
```

Typography
```
Headings:    "Playfair Display" (Serif - RH-UDE elegance)
Body:        "Inter" (Sans-Serif - Nike clean)
Accents:     "Montserrat" (Bold statements - ZTTW edge)
```

---

🏠 PUBLIC MARKETPLACE

1. Header & Navigation (Nike + RH-UDE Hybrid)

```jsx
// Desktop Navigation - RH-UDE style dark header
┌──────────────────────────────────────────────────────────────┐
│  [PLAIN Logo]    NEW   BESTSELLERS   SALE   ALL   [🔍] [👤] [🛒] │
│                     (Categories)                             │
└──────────────────────────────────────────────────────────────┘

// Mobile Navigation - ZTTW style overlay
[☰] [PLAIN Logo] [🔍] [👤] [🛒]
```

Header Features:
- Country/region selector (RH-UDE inspired dropdown)
- Minimal dark background with subtle hover effects
- Sticky on scroll with smooth transition

---

2. Hero Section - "Slat Unveil" Animation (Nike Inspired)

Visual: Full-width background slider featuring:
- High-fashion model photography in urban settings
- Dramatic lighting and shadow play
- Dynamic video backgrounds (Nike style)

Slat Transition Effect:
```
Image breaks into horizontal blind strips
Each strip rotates/slices in sequence (50ms delay)
Reveals: "ESSENTIALS. ELEVATED."
```

Floating Spec Tags (Translucent Badges):
```
🌿 100% Organic Cotton
♻️ Ethically Made  
📏 Premium Fit
🌍 Sustainable
```

Hero Overlay (ZTTW Style):
```
"SEE YOUR DREAM FIT" (Bold statement)
[ SHOP NOW ] [ EXPLORE ] buttons
```

---

3. Product Grid (RH-UDE Product Layout)

Brand Grid (Horizontal Scroll):
```
PANGAIA  UNIQLO  COS  ARKET  NORSE PROJECTS  ACNE STUDIOS
```

Featured Products Grid (RH-UDE Style):
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  [Product]   │ │  [Product]   │ │  [Product]   │
│  PLAIN       │ │  PLAIN       │ │  PLAIN       │
│  Oversized   │ │  Essential   │ │  Classic     │
│  Hoodie      │ │  T-Shirt     │ │  Pants      │
│  ₦45,000     │ │  ₦25,000     │ │  ₦35,000     │
└─────────────┘ └─────────────┘ └─────────────┘
```

Product Card Design (RH-UDE):
- Clean white background with shadow
- Product name in bold
- Price in prominent font
- Hover effect: subtle scale + overlay
- "Quick Add" button on hover

---

4. New Arrivals (ZTTW Streetwear Grid)

Filter Tabs:
```
[ ALL ] [ T-SHIRTS ] [ HOODIES ] [ PANTS ] [ OUTERWEAR ] [ ACCESSORIES ]
```

Card Design (ZTTW Inspired):
```
┌─────────────────────┐
│  [Product Image]     │
│  ───────────────     │
│  PLAIN               │
│  Name                │
│  ₦ Price             │
│  [ NEW ] badge       │
│  [ ❤️ Wishlist ]     │
└─────────────────────┘
```

---

5. Value Proposition (Nike Storytelling)

```
01.  PREMIUM QUALITY     →  Sourced from finest mills worldwide
02.  TRANSPARENT PRICING →  No hidden costs, fair margins
03.  SUSTAINABLE         →  Eco-friendly materials & packaging
04.  FREE SHIPPING       →  On orders over ₦50,000
```

---

6. Customer Testimonials (RH-UDE Style)

```
┌──────────────────────────────────────────┐
│  "Best quality hoodie I've ever owned." │
│  ⭐⭐⭐⭐⭐                                │
│  — ALEX, LAGOS                          │
│  [Outfit Gallery Thumbnails]            │
└──────────────────────────────────────────┘
```

---

7. Instagram Feed (Social Proof)
```
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  [📸] [📸] [📸] [📸] [📸] [📸]
  @PLAINSTYLE
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

---

8. Footer (RH-UDE Dark Style)
```
┌──────────────────────────────────────────────────────────────┐
│  [PLAIN Logo]                                             │
│  ───────────                                              │
│  Newsletter: [Email Field] [Subscribe]                    │
│                                                          │
│  Shop    │ Company    │ Support   │ Social              │
│  New     │ About      │ Contact   │ Instagram           │
│  Sale    │ Careers    │ FAQ       │ Twitter             │
│  All     │           │ Shipping  │ YouTube             │
│                                                          │
│  © 2026 PLAIN. All rights reserved.                      │
└──────────────────────────────────────────────────────────────┘
```

---

👕 PRODUCT DETAILS PAGE

Layout (RH-UDE Style)

```
┌──────────────────────────────────────────────────────────────┐
│  [Back to Collection]                                      │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────────────────┐    │
│  │ [Main Image]  │  │  PRODUCT NAME                   │    │
│  │ [Thumbnails]  │  │  PLAIN                          │    │
│  │               │  │  ₦45,000                       │    │
│  │               │  │  ⭐⭐⭐⭐⭐ (24 reviews)           │    │
│  │               │  │                                │    │
│  │               │  │  Size: [S] [M] [L] [XL]       │    │
│  │               │  │  Color: ● Black ● White ● Beige│    │
│  │               │  │  Qty: [ - ] 1 [ + ]           │    │
│  │               │  │                                │    │
│  │               │  │  [ ADD TO CART ]              │    │
│  │               │  │  [ BUY NOW → WhatsApp ]       │    │
│  │               │  │  [ ♡ Wishlist ]               │    │
│  │               │  │                                │    │
│  │               │  │  Features:                     │    │
│  │               │  │  📹 Lookbook Video             │    │
│  │               │  │  👕 Fit Guide                  │    │
│  │               │  │  🌿 Sustainability             │    │
│  │               │  │  🧵 Care Instructions          │    │
│  └──────────────┘  └──────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

Embedded Video (All Links Supported)
```
✅ YouTube (Standard, Shorts, Live)
✅ Vimeo
✅ Dailymotion
✅ Any video URL
✅ Plays in overlay modal
✅ Auto-play on click
```

---

📱 RESPONSIVE DESIGN BREAKPOINTS

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Desktop | >1024px | Full grid, multi-column |
| Tablet | 768-1023px | 2-column grid, adjusted spacing |
| Mobile | <767px | Single column, bottom nav |

---

🔐 ADMIN PORTAL

Login (Minimal Dark - RH-UDE Inspired)
```
┌──────────────────────────────────┐
│  [PLAIN]                         │
│  ADMIN LOGIN                     │
│  ─────────                      │
│  [Username/Email]                │
│  [••••••••]                     │
│  [✓] Remember Me                │
│  [ LOGIN ]                      │
│                                  │
│  PLAIN CMS v2.0                  │
└──────────────────────────────────┘
```

Dashboard (Nike Analytics Style)
```
┌──────────────────────────────────────────────────────────────┐
│  📊 DASHBOARD                                          [🔔] │
├──────────────────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │👁️ 12.4K│  │🛒 847  │  │📱 203  │  │📈 4.2%│  │💰 ₦3.2M│      │
│  │ Views │  │Orders │  │Inquiry│  │CTR   │  │Revenue│      │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘      │
├──────────────────────────────────────────────────────────────┤
│  📈 Sales Chart (Last 30 Days) - Nike style gradient chart  │
│  [Bar Chart Visualization]                                 │
├──────────────────────────────────────────────────────────────┤
│  🏆 Bestsellers │ 📦 Recent Orders │ 🔥 Top Categories    │
└──────────────────────────────────────────────────────────────┘
```

---

✅ COMPLETE FEATURE CHECKLIST

| Feature | Status |
|---------|--------|
| Branding: "PLAIN" | ✅ |
| Admin Password: `THEPLAINSOCIETY` | ✅ |
| WhatsApp: `2349074473570` | ✅ |
| Hero Slat Animation | ✅ |
| Floating Spec Tags | ✅ |
| Search with Filters | ✅ |
| Brand Grid | ✅ |
| Featured Products Grid | ✅ |
| New Arrivals Grid | ✅ |
| Value Proposition | ✅ |
| Testimonials | ✅ |
| Instagram Feed | ✅ |
| Product Detail Page | ✅ |
| Embedded Video (All Links) | ✅ |
| WhatsApp Integration | ✅ |
| Admin Dashboard | ✅ |
| Product CRUD | ✅ |
| Import/Export CSV | ✅ |
| Order Approval | ✅ |
| Receipt Upload (Toggle) | ✅ |
| Sales Report | ✅ |
| Search Report | ✅ |
| Theme Customizer | ✅ |
| Hero Slider Manager | ✅ |
| Logo Management | ✅ |
| Ad Management | ✅ |
| Google Sheets Integration | ✅ |
| Save Changes (Password Protected) | ✅ |
| Responsive Design | ✅ |
| UI: RH-UDE + ZTTW + Nike | ✅ |

build and connect to the google sheet, 


Also use the attached as product images and logo , 


use N30,000 for the product price, 


image 1 is the logo, the rest are the product images

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fdbd16c7-2c24-4efe-b3b9-4dba318c5c6a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
