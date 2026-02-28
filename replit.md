# AA WIGS — Where Luxury Meets Confidence

## Overview
Mobile-first luxury eCommerce website for the AA WIGS wig brand. Built with vanilla HTML, CSS, and JavaScript — no frameworks. Designed for quiet luxury, premium spacing, and a clean boutique feel.

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
/index.html         — Home (gradient hero, quick-product card, brand statement, packaging experience, Why AA cards, reviews, waitlist teaser with 4 shade buttons)
/cart.js             — Shopping cart (slide-out panel, localStorage persistence, toast notifications, quantity controls)
/product.html        — Product detail (gallery, shade swatches, Buy Now Stripe placeholder, What's Included, specs table, shipping/returns, trust badges, AA Promise)
/collection.html     — 6 shade cards (Natural Black=Available → product.html, others=Notify Me → waitlist.html?shade=...)
/waitlist.html       — Waitlist form (email, shade dropdown, length preference) with URL param shade pre-fill, Formspree placeholder
/about.html          — Brand story, quality promise, packaging image placeholder, 3 value cards
/care.html           — Full care guide (washing, detangling, heat, storage, lace care), maintenance schedule, print button
/contact.html        — Contact form (Formspree placeholder), FAQ accordion (6 questions), email + Instagram links
/success.html        — Thank-you page after form submission
/styles.css          — All styles (single CSS file)
/app.js              — All JS (hamburger, scroll, filters, shade selector, form handling, FAQ accordion, print, URL shade pre-fill)
/assets/             — Image placeholders directory
```

## Key Design Notes
- Hero section uses `.hero` class with burgundy-to-gold gradient applied directly on the section element — no child divs or animations for the background
- Hero CTA button is solid white with burgundy text — always visible on any background
- No page curtain, no opacity-based entrance animations on hero text — everything renders immediately
- Fade-in animations (IntersectionObserver) only used on below-fold sections
- Luxury dividers (gold ✦ with gradient lines) between homepage sections

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

## Placeholders to Replace
- `YOUR_FORM_ID` in waitlist.html and contact.html (Formspree action URLs)
- `#buy-now-stripe-link-placeholder` in product.html (Stripe checkout link)
- Image placeholder divs throughout (replace with real product/packaging photos)
- `assets/og-image.jpg` and `assets/og-product.jpg` (OG meta images)

## Navigation
- Sticky header with blur backdrop
- Desktop: Shop, Experience, Reviews, Care, Contact + "Shop The Crown" CTA
- Mobile: Hamburger menu with large tap targets
- Sticky "Shop Now" button fixed to bottom on mobile

## Server
- Static file server (`static-web-server`) on port 5000
- Workflow: "Start application"
