# AA WIGS — Where Luxury Meets Confidence

## Overview
Mobile-first luxury eCommerce website for the AA WIGS wig brand. Built with vanilla HTML, CSS, and JavaScript — no frameworks. Designed for quiet luxury, premium spacing, smooth animations, and a clean boutique feel.

## Brand
- **Name**: AA WIGS
- **Tagline**: Where Luxury Meets Confidence
- **Values**: Premium + Luxury + Confidence
- **Instagram**: @aawigshair
- **Email**: hello@aawigs.com

## Color Palette
- Burgundy (main): `#7C0832`
- Gold accent: `#C5A355`
- Champagne background: `#FDF8F0`
- Cream: `#FFFBF5`

## Typography
- Headlines: Playfair Display (serif)
- Body: Inter (sans-serif)

## File Structure
```
/index.html         — Home (cinematic gradient hero, quick-product card, brand statement, packaging experience, Why AA cards, reviews, waitlist teaser with 4 shade buttons)
/cart.js             — Shopping cart (slide-out panel, localStorage persistence, toast notifications, quantity controls, Stripe checkout per variant)
/products/22-swiss-hd-body-wave/index.html — SEO product page (JSON-LD Product, breadcrumbs, reviews, trust badges, demand indicator, shade swatches)
/product.html        — Meta-refresh redirect to /products/22-swiss-hd-body-wave/ (noindex)
/collection.html     — 6 shade cards (Natural Black=Available → product page, others=Notify Me → waitlist.html?shade=...)
/waitlist.html       — Waitlist form (email, shade dropdown, length preference) with URL param shade pre-fill, Formspree placeholder
/about.html          — Brand story, quality promise, packaging image placeholder, 3 value cards
/care.html           — Full care guide (washing, detangling, heat, storage, lace care), maintenance schedule, print button
/contact.html        — Contact form (Formspree placeholder), FAQ accordion (6 questions), email + Instagram links
/success.html        — Thank-you page after form submission
/shipping.html       — Shipping policy page
/returns.html        — Return & refund policy page
/guides/buying-guide/index.html     — SEO: Human Hair Wig Buying Guide (Article JSON-LD, targets: human hair wigs, HD lace, glueless)
/guides/hd-lace-wigs/index.html     — SEO: HD Lace Wigs Guide (Article JSON-LD, targets: HD lace wigs, Swiss HD lace, pre-plucked)
/guides/wig-length-guide/index.html — SEO: Wig Length Guide 18"–26" (Article JSON-LD, targets: body wave wig lengths, 22 inch wig)
/guides/wig-care-guide/index.html   — SEO: Wig Care Guide (Article + FAQPage JSON-LD, targets: how to wash human hair wig)
/sitemap.xml         — XML sitemap with all pages (12 URLs)
/robots.txt          — Allows all crawlers, points to sitemap
/styles.css          — All styles (single CSS file)
/app.js              — All JS (hamburger, scroll, filters, shade selector, form handling, FAQ accordion, print, URL shade pre-fill)
/chat.js             — Smart customer service chat widget (knowledge-based, covers pricing/shipping/returns/care/colors/lengths, quick-reply buttons, typing indicator)
/assets/             — Image placeholders directory
```

## Key Design Notes
- Hero class is `.hero-cinematic` with gradient applied directly on the section element as a fallback
- `.hero-cinematic-bg` child div provides the animated zoom gradient on top
- `.btn-hero` is a gold-tinted frosted glass button with gold border
- Page curtain with "AA WIGS" logo shows for 1s on load, then lifts (JS in app.js)
- Hero text uses `.hero-fade-up` class (opacity 0 → 1 animation with staggered delays)
- Gold particles, shimmer sweep, scroll indicator all CSS-only animations
- Luxury dividers (gold ✦ with gradient lines) between homepage sections
- Quick-product section has champagne background with gold top border

## Product Page (SEO-optimized)
- Canonical URL: /products/22-swiss-hd-body-wave/
- JSON-LD Product structured data with price, availability, shipping
- Emotional tagline: "This isn't just hair. It's presence."
- Quick specs grid (2-col): Virgin Hair, HD Lace, Density, Hairline, Glueless, Heat Safe
- Length selector: 18", 20", 22" (default), 24", 26" — updates subtitle and price dynamically
- Color selector: 6 colors (1B Natural Black, 2 Dark Brown, 4 Medium Brown, 613 Blonde, 99J Burgundy, 27 Honey Blonde)
- Stripe payment integration: 30 unique Stripe checkout links (6 colors x 5 lengths), "Add to Bag" redirects directly to Stripe
- Variant data stored in inline `<script>` on product page: PRICES, STRIPE_LINKS, COLOR_NAMES objects
- Social proof section (below Add to Bag): star rating summary (4.9/5), 3 review cards (Ashley R., Tiffany J., Jasmine L.), trust badges (Free Shipping, Secure Checkout, Luxury Packaging)
- Trust indicators: Free U.S. Shipping, Secure Stripe Checkout, Limited Stock
- Inventory badge: "Only X Crowns Remaining" when stock ≤ 3; sold-out state with waitlist CTA
- Breadcrumb navigation: Home > Collection > Signature Body Wave
- Price: varies by color + length ($185.99–$259.99), synced to Stripe payment links

## Key Features
- All buttons/inputs have 48px minimum height for mobile accessibility
- Sticky "Shop Now" bar fixed to bottom on mobile (768px and below)
- Hamburger menu with aria-expanded attribute
- FAQ accordion on contact page
- Printable care guide (print styles hide nav/header/footer)
- URL-based shade pre-filling on waitlist (?shade=Shade+Name)
- Fade-in animations via IntersectionObserver
- OG/Twitter meta tags on all pages
- Cart uses localStorage key `aa_cart`; cart.js must be loaded after app.js on every page
- Smart chat widget (chat.js) on all pages: knowledge-based customer assistant, 17 topic patterns, quick-reply buttons, typing indicator, mobile fullscreen

## Placeholders to Replace
- `YOUR_FORM_ID` in waitlist.html and contact.html (Formspree action URLs)
- `#buy-now-stripe-link-placeholder` in product page and cart.js (Stripe checkout link)
- Image placeholder divs throughout (replace with real product/packaging photos)
- `assets/og-image.jpg` and `assets/og-product.jpg` (OG meta images)

## Navigation
- Sticky header with blur backdrop
- Desktop: Shop, Experience, Reviews, Care, Contact + "Shop The Crown" CTA
- Mobile: Hamburger menu with large tap targets
- Sticky "Shop Now" button fixed to bottom on mobile
- All "Shop The Crown" links point to /products/22-swiss-hd-body-wave/

## Server
- Static file server (`static-web-server`) on port 5000
- Workflow: "Start application"
