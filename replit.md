# AA WIGS — Where Luxury Meets Confidence

## Overview
Mobile-first luxury eCommerce website for the AA WIGS wig brand. Built with vanilla HTML, CSS, and JavaScript — no frameworks. Designed for quiet luxury, premium spacing, smooth animations, and a clean boutique feel.

## Brand
- **Name**: AA WIGS
- **Tagline**: Where Luxury Meets Confidence
- **Values**: Premium + Luxury + Confidence
- **Instagram**: @aawigshair

## Color Palette
- Burgundy (main): `#7C0832` (CMYK C25 M95 Y70 K35)
- Gold accent: `#C5A355`
- Champagne background: `#FDF8F0`
- Cream: `#FFFBF5`

## Typography
- Headlines: Playfair Display (serif)
- Body: Inter (sans-serif)

## File Structure
```
/index.html         — Home (hero, collection preview, experience, reviews)
/product.html        — Product detail page with shade selector + checkout CTA
/collection.html     — All wigs / shades grid with filter bar
/waitlist.html       — Notify-me form for out-of-stock colors
/about.html          — Brand story + quality promise
/care.html           — Wig care guide
/contact.html        — Contact form + Instagram link
/success.html        — Thank-you page after form submission
/styles.css          — All styles (single CSS file)
/app.js              — All JS (hamburger menu, scroll, filters, shade selector, form handling)
/assets/             — Image placeholders directory
```

## Navigation
- Sticky header with blur backdrop
- Desktop: Shop, Experience, Reviews, Care, Contact + "Shop The Crown" CTA
- Mobile: Hamburger menu with large tap targets
- Sticky "Shop Now" button fixed to bottom on mobile

## Server
- Static file server (`static-web-server`) on port 5000
- Workflow: "Start application"
