# AA WIGS — Replit Agent Prompt
## Create the Knowledge Center Page + AA WIGS Journal

Paste this entire prompt into your Replit agent.

---

## TASK

Create a new page for the AA WIGS website called the Knowledge Center.

**URL:** `/knowledge-center/`  
**Do NOT modify any existing product pages, routes, or database tables.**  
Only add new files and routes.

---

## TECH STACK INSTRUCTIONS

Detect and match the existing stack already in this Replit project:
- If the project uses **Express + EJS/HTML** → create a new route and `.ejs` or `.html` template
- If the project uses **React** → create a new `KnowledgeCenter.jsx` page component and add it to the router
- If the project uses **Next.js** → create `/pages/knowledge-center/index.js` or `/app/knowledge-center/page.js`
- Match whatever CSS approach is already used (plain CSS, Tailwind, styled-components, etc.)

---

## BRAND DESIGN REQUIREMENTS

### Color Palette (use as CSS variables)
```css
--color-burgundy: #4A0E1A;
--color-burgundy-deep: #2C0810;
--color-gold: #B8966E;
--color-gold-light: #D4B896;
--color-champagne: #F7F0E6;
--color-champagne-dark: #EDE0CC;
--color-cream: #FDFAF5;
--color-text-dark: #1A0A0A;
--color-text-mid: #4A3728;
--color-text-muted: #8B7355;
```

### Typography
- **Headings:** `'Cormorant Garamond', Georgia, serif` — weight 300 or 400, large and editorial
- **Body / UI:** `'Jost', 'DM Sans', sans-serif` — weight 300–400
- Import both from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
```

### Visual Style
- Luxury editorial feel — clean, elegant, generous whitespace
- Mobile-first responsive layout
- Soft box shadows: `0 2px 20px rgba(74, 14, 26, 0.08)`
- Gold accent lines (1px, color: `--color-gold`) used as section dividers
- No harsh borders — use subtle shadows and spacing instead
- Cards have a slight hover lift: `transform: translateY(-3px)` on hover, smooth transition

---

## PAGE STRUCTURE

### 1. Page Header / Nav Integration
- Add a link to `Knowledge Center` in the existing site navigation (if a nav component exists)
- Use the same nav style as the rest of the site

---

### 2. HERO SECTION

```
Background: --color-burgundy-deep
Text color: white / champagne

H1: "AA WIGS Knowledge Center"
   Font: Cormorant Garamond, 52px desktop / 36px mobile
   Font-weight: 300
   Letter-spacing: 0.05em

Subtitle paragraph:
"Luxury wig education, care guides, brand stories, and expert resources —
everything you need to wear your AA WIGS collection with confidence."
   Font: Jost, 16px, color: --color-champagne, max-width: 560px, centered

Decorative element:
   A gold horizontal line centered below the H1, above the subtitle.
   color: --color-gold, height: 1px, width: 60px
```

---

### 3. BREADCRUMB (below hero, above guides grid)

```
Home  /  Knowledge Center
```
- Small, muted text (12px, Jost)
- Link "Home" to `/`
- Current page "Knowledge Center" is plain text, not a link
- Include proper breadcrumb JSON-LD schema (see SEO section)

---

### 4. EXPERT GUIDES SECTION

**Section heading:** `"Expert Guides"` — H2, Cormorant Garamond, 32px, color: `--color-burgundy`, centered  
**Section subheading:** `"In-depth education on lace, length, care, and luxury."` — Jost, 14px, color: `--color-text-muted`, centered, margin-bottom 40px

**Layout:** CSS Grid, 3 columns on desktop, 2 on tablet (768px), 1 on mobile (480px)  
**Gap:** 24px  
**Container max-width:** 1100px, centered

**Each guide card contains:**
- Top color bar: 4px tall, color `--color-gold`, full card width, top border-radius matches card
- Card background: white (`#FFFFFF`)
- Border: none
- Border-radius: 8px
- Box-shadow: `0 2px 20px rgba(74, 14, 26, 0.08)`
- Padding: 28px
- Hover: `transform: translateY(-3px)`, shadow deepens
- Transition: `all 0.25s ease`

**Card content structure:**
```
[Category badge pill]    ← small, gold background (#F7F0E6), burgundy text, rounded-full
[Guide Title]            ← H3, Cormorant Garamond, 20px, color: --color-text-dark
[One-line description]   ← Jost, 13px, color: --color-text-muted, margin-top: 8px
[Read Guide →]           ← Jost, 12px, color: --color-gold, margin-top: 16px, letter-spacing: 0.1em
```

**The 5 Expert Guides:**

| # | Title | Description | Category | Link |
|---|-------|-------------|----------|------|
| 1 | What Is 13x6 HD Lace? | Understand the premium lace that defines the AA WIGS difference. | Lace Education | `/hd-lace-guide/` |
| 2 | Why Body Wave Wigs Are The Ultimate Luxury Choice | Discover why body wave is the most versatile, elegant style. | Style Guide | `/body-wave-guide/` |
| 3 | Luxury Wig Length Guide 18–26 Inches | Find your perfect length with our complete editorial guide. | Length Guide | `/wig-length-guide/` |
| 4 | The AA WIGS Luxury Packaging Experience | From our hands to yours — the unboxing experience explained. | Brand Story | `/luxury-packaging/` |
| 5 | How To Maintain Your Luxury Body Wave Wig | Expert care tips to protect your investment for years. | Wig Care | `/wig-care/` |

---

### 5. FEATURED ARTICLES SECTION

**Background:** `--color-champagne` (light champagne, distinct from the guides section)  
**Section heading:** `"Featured Articles"` — H2, Cormorant Garamond, 32px, color: `--color-burgundy`, centered  
**Section subheading:** `"Trending reads on luxury hair, style, and confidence."` — Jost, 14px, color: `--color-text-muted`, centered, margin-bottom 40px

**Layout:** CSS Grid, 2 columns on desktop, 1 on mobile  
**Gap:** 24px  
**Container max-width:** 900px, centered

**Each article card contains:**
- Left border accent: 3px solid `--color-gold` (no top bar — visually distinct from guide cards)
- Card background: white
- Border-radius: 8px
- Box-shadow: `0 2px 16px rgba(74, 14, 26, 0.06)`
- Padding: 24px 28px
- Hover: `transform: translateY(-2px)`

**Card content structure:**
```
[Category badge pill]    ← Jost, 11px, champagne background, burgundy text
[Article Title]          ← H3, Cormorant Garamond, 19px, color: --color-text-dark
[Short teaser]           ← Jost, 13px, color: --color-text-muted, margin-top: 6px
[Read Article →]         ← Jost, 12px, color: --color-gold, margin-top: 14px
```

**The 4 Featured Articles:**

| # | Title | Teaser | Category | Link |
|---|-------|--------|----------|------|
| 1 | Why Body Wave Wigs Are The Ultimate Luxury Choice | The one texture that does everything — and why it defines the AA WIGS standard. | Style | `/body-wave-guide/` |
| 2 | Why Women Are Choosing Wigs More Than Ever | A cultural shift in beauty, confidence, and self-expression. | Culture | `/why-women-choose-wigs/` |
| 3 | The Psychology Of Luxury Hair | Why the way we wear our hair changes the way we carry ourselves. | Lifestyle | `/psychology-of-luxury-hair/` |
| 4 | 22 vs 24 Inch Body Wave — Which Is Right For You? | A practical guide to choosing your perfect body wave length. | Comparison | `/22-vs-24-inch-guide/` |

---

### 6. AA WIGS JOURNAL SECTION

This is the most important new section. Luxury brands don't just educate — they tell stories. The Journal is where AA WIGS speaks directly to its community with emotional, brand-building content.

**Background:** `--color-burgundy-deep` (dark, rich — visually separates this section from the rest of the page)  
**Text colors:** white and `--color-champagne`  
**Section label:** `"AA WIGS Journal"` — Jost, 11px, letter-spacing: 0.2em, uppercase, color: `--color-gold`, centered  
**Section heading:** `"Stories From The Brand"` — H2, Cormorant Garamond, italic weight, 36px, color: white, centered  
**Section subheading:** `"Behind the luxury. Behind the experience. Behind the brand."` — Jost, 14px, color: `--color-champagne`, centered, margin-bottom: 48px

**Layout:** CSS Grid, 2 columns on desktop, 1 on mobile  
**Gap:** 24px  
**Container max-width:** 900px, centered

**Each Journal card contains:**
- Card background: `rgba(255, 255, 255, 0.06)` — subtle glass effect on the dark background
- Border: 0.5px solid `rgba(184, 150, 110, 0.3)` (faint gold border)
- Border-radius: 8px
- Padding: 28px 32px
- Hover: border color transitions to `--color-gold`, background lightens slightly
- Transition: `all 0.3s ease`

**Card content structure:**
```
[Journal label]          ← Jost, 10px, letter-spacing: 0.15em, uppercase, color: --color-gold
[Article Title]          ← H3, Cormorant Garamond, 21px, color: white
[Short teaser]           ← Jost, 13px, color: --color-champagne, opacity: 0.8, margin-top: 8px
[Read Story →]           ← Jost, 12px, color: --color-gold, margin-top: 18px, letter-spacing: 0.08em
```

**The 4 Journal Stories:**

| # | Title | Teaser | Link |
|---|-------|--------|------|
| 1 | Why We Chose Body Wave Only | The decision that defined everything. A story about specialization, standards, and luxury. | `/journal/why-body-wave-only/` |
| 2 | The Story Behind The Burgundy Box | Every detail of the AA WIGS packaging was intentional. Here is why. | `/journal/burgundy-box-story/` |
| 3 | How AA WIGS Designs The Luxury Experience | From the moment you discover us to the moment you unbox your order — this is the experience we build. | `/journal/luxury-experience/` |
| 4 | Why Confidence Is At The Center Of AA WIGS | We don't sell hair. We sell the feeling of walking into a room differently. | `/journal/confidence-at-center/` |

> **Note to agent:** Journal article destination pages (`/journal/...`) do not need to be built now. Use placeholder `href` links. Only the Knowledge Center hub page is in scope for this build.

---

### 7. EMAIL CAPTURE SECTION

**Background:** `--color-champagne`  
**Layout:** Centered, max-width 540px, generous vertical padding (80px top and bottom)

**Content:**
```
Gold decorative line (60px wide, 1px, centered, above heading)

H2: "Join The AA WIGS Insider List"
    Cormorant Garamond, 36px, weight 300, color: --color-burgundy

Paragraph:
"Get luxury wig care tips, early access to new collections,
exclusive Journal stories, and expert guides delivered to your inbox."
    Jost, 15px, color: --color-text-mid, margin-bottom: 32px
```

**Form fields:**
- First Name (text input, placeholder: "First Name")
- Email Address (email input, placeholder: "Email Address")
- Submit button: `"Join The List"`
  - Background: `--color-burgundy`
  - Text: white, Jost, 12px, letter-spacing: 0.15em, uppercase
  - Padding: 14px 32px
  - Border-radius: 2px
  - Hover: background transitions to `--color-gold`

**Form behavior:**
- On submit: POST to the existing subscriber/email endpoint already used in the project (check for existing `/subscribe`, `/api/subscribe`, or `/waitlist` route)
- If no existing endpoint exists: create a new POST route `/api/knowledge-subscribe` that saves `{ firstName, email, source: 'knowledge-center', createdAt }` to the existing database or data store
- Show a success message after submission: `"You're on the list. Watch your inbox."` in champagne/gold styling
- Validate: both fields required, email must be valid format
- Do NOT create a new database — use whatever storage the project already uses

---

### 8. FAQ SECTION

**Background:** white  
**Section heading:** `"Frequently Asked Questions"` — H2, Cormorant Garamond, centered

**5 FAQ items (accordion or static — match existing site pattern):**

**Q1:** What makes 13x6 HD lace different from regular lace?  
**A1:** 13x6 HD lace is an ultra-thin, transparent lace that blends seamlessly with all skin tones. The larger frontal area gives you more styling freedom, and the HD material is virtually invisible at the hairline — creating a natural look that regular lace cannot achieve.

**Q2:** How long does a luxury body wave wig last?  
**A2:** With proper care, a high-quality human hair body wave wig can last 1–3 years or longer. AA WIGS are made with premium human hair and sealed wefts, designed to maintain their texture and beauty with correct maintenance.

**Q3:** What length body wave wig should I choose?  
**A3:** The most popular lengths at AA WIGS are 22" and 24", which offer a glamorous, flowing look. If you prefer something more manageable for daily wear, 18"–20" is ideal. See our full Length Guide for a detailed breakdown by lifestyle and face shape.

**Q4:** How do I maintain a body wave wig?  
**A4:** Use a sulfate-free shampoo, detangle gently from ends to roots, and air dry when possible. Avoid excessive heat styling. Store on a wig stand to preserve the wave pattern. Full instructions are in our Wig Care Guide.

**Q5:** Does AA WIGS offer free shipping or returns?  
**A5:** Please visit our main shop page for current shipping and return policies. Our Knowledge Center focuses on education and care — all order information is available on the product pages.

---

## SEO REQUIREMENTS

### Meta Tags
Add these to the `<head>` of the Knowledge Center page:

```html
<title>AA WIGS Knowledge Center | Luxury Wig Guides, Journal & Education</title>
<meta name="description" content="Expert luxury wig guides and brand stories from AA WIGS — learn about 13x6 HD lace, body wave care, wig lengths, and the AA WIGS Journal. The Signature Body Wave House.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://aawigs.com/knowledge-center/">

<!-- Open Graph -->
<meta property="og:title" content="AA WIGS Knowledge Center | Luxury Wig Education & Journal">
<meta property="og:description" content="Expert guides and brand stories on HD lace, body wave wigs, wig care, and luxury styling from AA WIGS — The Signature Body Wave House.">
<meta property="og:url" content="https://aawigs.com/knowledge-center/">
<meta property="og:type" content="website">
```

### JSON-LD Schema — Breadcrumb
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://aawigs.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Knowledge Center",
      "item": "https://aawigs.com/knowledge-center/"
    }
  ]
}
</script>
```

### JSON-LD Schema — FAQ
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What makes 13x6 HD lace different from regular lace?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "13x6 HD lace is an ultra-thin, transparent lace that blends seamlessly with all skin tones. The larger frontal area gives you more styling freedom, and the HD material is virtually invisible at the hairline."
      }
    },
    {
      "@type": "Question",
      "name": "How long does a luxury body wave wig last?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "With proper care, a high-quality human hair body wave wig can last 1–3 years or longer. AA WIGS are made with premium human hair designed to maintain texture and beauty with correct maintenance."
      }
    },
    {
      "@type": "Question",
      "name": "What length body wave wig should I choose?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The most popular lengths at AA WIGS are 22 and 24 inches. If you prefer something more manageable, 18–20 inches is ideal for daily wear. See our full Length Guide for a detailed breakdown."
      }
    },
    {
      "@type": "Question",
      "name": "How do I maintain a body wave wig?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use a sulfate-free shampoo, detangle gently from ends to roots, and air dry when possible. Avoid excessive heat styling and store on a wig stand to preserve the wave pattern."
      }
    }
  ]
}
</script>
```

### JSON-LD Schema — Article Collection (for Journal)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "AA WIGS Journal",
  "description": "Brand stories, editorial content, and emotional articles from AA WIGS — The Signature Body Wave House.",
  "url": "https://aawigs.com/knowledge-center/",
  "publisher": {
    "@type": "Organization",
    "name": "AA WIGS",
    "url": "https://aawigs.com"
  }
}
</script>
```

### Sitemap
Add all new URLs to the existing `sitemap.xml`:

```xml
<url>
  <loc>https://aawigs.com/knowledge-center/</loc>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
  <lastmod>2026-06-04</lastmod>
</url>
<url>
  <loc>https://aawigs.com/why-women-choose-wigs/</loc>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
  <lastmod>2026-06-04</lastmod>
</url>
<url>
  <loc>https://aawigs.com/psychology-of-luxury-hair/</loc>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
  <lastmod>2026-06-04</lastmod>
</url>
<url>
  <loc>https://aawigs.com/22-vs-24-inch-guide/</loc>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
  <lastmod>2026-06-04</lastmod>
</url>
```

> Note: Journal article URLs (`/journal/...`) will be added to the sitemap when those individual pages are built. Do not add them yet.

---

## INTERNAL LINKING RULES

Every section of the Knowledge Center must link to other sections of the same page or to article destination pages. This tells Google the content is interconnected.

- Expert Guide cards → individual guide pages (`/hd-lace-guide/`, `/body-wave-guide/`, etc.)
- Featured Article cards → individual article pages
- Journal cards → individual journal pages (placeholder links for now)
- FAQ answers → reference the relevant guide where appropriate (e.g. FAQ on maintenance links to `/wig-care/`)
- Email section → no outbound links needed

---

## FINAL CHECKLIST FOR THE AGENT

Before completing, verify:
- [ ] Page loads at `/knowledge-center/` without errors
- [ ] All 4 page sections are present: Expert Guides, Featured Articles, AA WIGS Journal, Email Capture
- [ ] All guide and article card links are correctly set (placeholder `href` is acceptable for pages not yet built)
- [ ] Journal section has dark burgundy background and gold border cards
- [ ] Email form submits without error and shows success message
- [ ] Page is fully mobile responsive (test at 375px, 768px, 1200px)
- [ ] Meta title and description appear in page `<head>`
- [ ] All three JSON-LD schema blocks are present in `<head>`
- [ ] Sitemap updated with `/knowledge-center/` and the 3 new featured article URLs
- [ ] No existing pages or routes were modified
- [ ] Fonts (Cormorant Garamond + Jost) load from Google Fonts
- [ ] Color palette uses CSS variables throughout
- [ ] Each section is visually distinct — backgrounds alternate between cream, champagne, burgundy, and white

---

*AA WIGS — The Signature Body Wave House*  
*Knowledge Center + Journal build spec — June 2026*  
*Version 2.0 — includes Expert Guides, Featured Articles, AA WIGS Journal, and Email Capture*
