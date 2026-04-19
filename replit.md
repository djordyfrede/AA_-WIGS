# AA WIGS — Where Luxury Meets Confidence

## Overview
Mobile-first luxury eCommerce website for the AA WIGS wig brand. Built with vanilla HTML, CSS, and JavaScript — no frameworks. Designed for quiet luxury, premium spacing, smooth animations, and a clean boutique feel. Backed by a Node.js/Express server with PostgreSQL for live inventory, orders, and a full CMS admin dashboard.

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
- CSS vars: `--font-serif`, `--font-sans` (NOT `--font-body`)

## Server
- **Runtime**: Node.js + Express (`server.js`)
- **Port**: 5000
- **Workflow**: "Start application" (`node server.js`)
- **Deployment**: `autoscale` target, `run: ["node", "server.js"]` — NOT static
- **Wildcard route**: `app.get(/.*/, ...)` at the bottom of server.js serves all static HTML

## Database
- **Engine**: PostgreSQL (via `DATABASE_URL` env var)
- **ORM**: Raw `pg` Pool queries
- **IMPORTANT**: Production deployment has its own separate PostgreSQL instance from development. The `initDatabase()` function at server startup handles CREATE TABLE IF NOT EXISTS for all 7 tables AND seeds them with default data if empty. This ensures production works on first deploy without manual setup.
- **Tables**:
  - `products` — catalog with visibility flags, badges, compare-at price, sort order
  - `inventory` — per-variant stock, price, compare-at price, sku, active (30 variants seeded: 6 colors × 5 lengths)
  - `orders` — customer orders with Stripe session IDs, fulfillment_status, tracking_number, shipping address
  - `reservations` — 15-min inventory holds during checkout (cleaned up every 5 min)
  - `site_settings` — key/value store for all CMS content (announcement bar, hero text, policies, etc.)
  - `admin_sessions` — admin auth tokens
  - `contact_messages` — contact form submissions and waitlist sign-ups (inbox)
  - `reviews` — customer reviews (customer_name, rating 1–5, review_text, wig_length, wig_texture, verified_purchase, featured, approved, show_on_homepage, show_on_product, photo_urls JSONB)

## Admin Dashboard
- **URL**: `/admin/`
- **Password**: stored in `ADMIN_PASSWORD` env var (`aawigs2024!` default)
- **Auth**: password → JWT-like token stored in sessionStorage; sent as `x-admin-token` header
- **Tabs**:
  - **Overview** — stat cards + recent orders table
  - **Orders** — full order list, add/edit orders, fulfillment status dropdown, tracking number, shipping address modal
  - **Messages** — contact/waitlist inbox with filter (all/contact/waitlist) and delete
  - **Products** — edit product details, visibility, badge flags (best_seller, new_arrival, on_sale, badge_text), compare-at price
  - **Inventory** — per-variant stock editor, compare-at price, low_stock_threshold, bulk enable/disable
  - **Homepage** — announcement bar toggle + text, hero title/subtitle, store info, policies
  - **Reviews** — full review CRUD: approve/reject, toggle featured/homepage/product visibility, add photos, delete; filter by All/Pending/Approved/Homepage/Featured; inline quick-approve button
  - **Settings** — site info display

## API Endpoints
- `GET /api/settings` — public: all site_settings as key/value object
- `GET /api/products/:slug` — public: product row by slug (active only)
- `GET /api/inventory` — public: all variants with stock, price, compareAtPrice, available (minus reservations)
- `POST /api/checkout` — creates Stripe checkout session (price always fetched from DB, never trusted from frontend)
- `POST /api/webhook/stripe` — Stripe webhook handler for payment completion/expiry
- `GET /api/admin/orders` — admin: all orders
- `POST /api/admin/orders` — admin: create order
- `PUT /api/admin/orders/:id` — admin: update order (fulfillment, tracking, etc.)
- `GET /api/admin/products` — admin: all products
- `POST /api/admin/products` — admin: create product
- `PUT /api/admin/products/:id` — admin: update product
- `DELETE /api/admin/products/:id` — admin: delete product
- `PUT /api/admin/inventory/:variantKey` — admin: update inventory variant
- `GET /api/admin/settings` — admin: get all site_settings
- `PUT /api/admin/settings` — admin: update site_settings (bulk key/value)
- `GET /api/admin/messages` — admin: all messages
- `DELETE /api/admin/messages/:id` — admin: delete message
- `GET /api/admin/stats` — admin: overview stats
- `GET /api/reviews` — public: approved reviews (query: `?page=homepage` or `?page=product`)
- `POST /api/reviews` — public: submit review (goes to pending; supports photo upload via multipart)
- `GET /api/admin/reviews` — admin: all reviews (pending + approved)
- `POST /api/admin/reviews` — admin: create review with photos
- `PUT /api/admin/reviews/:id` — admin: update any review field
- `POST /api/admin/reviews/:id/photos` — admin: upload photos to existing review
- `DELETE /api/admin/reviews/:id/photos` — admin: remove a photo (body: {url})
- `DELETE /api/admin/reviews/:id` — admin: delete review + its photo files

## Stripe Integration
- **Mode**: LIVE
- **Webhook**: `https://aa-wigs.replit.app/api/webhook/stripe`
- **Security**: DB price always used server-side; frontend price is NEVER trusted
- **Variant key format**: `body-wave-{color}-{length}` (e.g. `body-wave-1b-22`)
- **Secrets**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

## Product Page (Storefront CMS)
The product page reads live data from the database on every page load:
- **Announcement bar**: fetches `/api/settings` → shows `announcement_bar_text`, hides bar if `announcement_bar_active` is false
- **Product badges**: fetches `/api/products/22-swiss-hd-body-wave` → shows Best Seller / New Arrival / Sale / custom badge pills if toggled in admin
- **Live price**: fetches `/api/inventory` → uses DB price per variant (overrides hardcoded fallback)
- **Compare-at price**: shows strikethrough "was $X" when `compareAtPrice` > selling price (per variant, updates on selection)
- **Stock status**: in-stock / low-stock / sold-out driven by DB `available` count (minus active reservations)

## File Structure
```
/index.html         — Home (cinematic hero, quick-product card, brand statement, reviews, waitlist)
/server.js          — Node.js/Express server (all API routes, Stripe, DB, admin auth)
/cart.js            — Shopping cart (slide-out panel, localStorage, Stripe checkout)
/styles.css         — All styles (single CSS file; CSS vars: --font-serif, --font-sans, --gray-500)
/app.js             — Page JS (hamburger, scroll, FAQ accordion, shade selector, form handling)
/chat.js            — Smart customer service chat widget (knowledge-based)
/admin/index.html   — Full admin dashboard (single-file, self-contained CSS+JS)
/products/22-swiss-hd-body-wave/index.html — Product page (live DB integration)
/product.html        — Meta-refresh redirect to /products/22-swiss-hd-body-wave/ (noindex)
/collection.html     — 6 shade cards (Available → product, others → waitlist)
/waitlist.html       — Waitlist form (saves to DB messages table)
/about.html          — Brand story
/care.html           — Full care guide (printable)
/reviews.html        — Public reviews page: aggregate rating, all approved reviews grid, write-a-review form with photo upload
/contact.html        — Contact form (saves to DB messages table), FAQ accordion
/success.html        — Thank-you page after form submission
/shipping.html       — Shipping policy
/returns.html        — Return & refund policy
/guides/buying-guide/index.html     — SEO article
/guides/hd-lace-wigs/index.html     — SEO article
/guides/wig-length-guide/index.html — SEO article
/guides/wig-care-guide/index.html   — SEO article
/sitemap.xml         — XML sitemap
/robots.txt          — Allows all crawlers
/assets/             — Images, favicons
```

## Key Design Notes
- Hero class is `.hero-cinematic` — NEVER remove; has curtain, particles, shimmer, fade-up
- `.hero-cinematic-bg` child provides animated zoom gradient
- `.btn-hero` is gold-tinted frosted glass with gold border
- Page curtain with "AA WIGS" logo lifts after 1s (JS in app.js)
- Luxury gold dividers (✦) between homepage sections
- Guide pages use `../../` relative paths; cache version: `?v=20260308a`

## Product Variants
- **Colors**: 1B Natural Black, 2 Dark Brown, 4 Medium Brown, 613 Blonde, 99J Burgundy, 27 Honey Blonde
- **Lengths**: 18", 20", 22" (default), 24", 26"
- **30 unique Stripe checkout links** (6 colors × 5 lengths) hardcoded in product page VARIANTS object
- Variant key format: `body-wave-{color-lowercase}-{length}` e.g. `body-wave-1b-22`

## Navigation
- Sticky header with blur backdrop
- Desktop: Shop, Experience, Reviews, Care, Contact + "Shop The Crown" CTA
- Mobile: Hamburger menu with large tap targets (48px min)
- Sticky "Shop Now" button fixed to bottom on mobile
- All "Shop The Crown" links → /products/22-swiss-hd-body-wave/
