---
name: Knowledge Center article CSS pattern
description: How KC articles must be structured — what was missing in the 5 new articles and why they rendered unstyled
---

# KC Article CSS Pattern

## The Rule
Every Knowledge Center article HTML file MUST have `<link rel="stylesheet" href="/styles.css?v=YYYYMMDD">` in `<head>`. Without it the page is completely unstyled (topbar, header, footer, fonts — all missing).

**Why:** New articles created in July 2026 had an inline `<style>` block with article-specific classes (art-toc, art-img, etc.) but were never given the main stylesheet link. The inline styles only covered a small subset of the layout. The result was raw browser-default rendering on production.

## What Was Fixed
1. ALL article-specific CSS moved to `styles.css` (classes: art-meta, art-toc, art-img, art-inline-img, art-caption, art-step, art-step-pill, art-vip, undertone-card).
2. Inline `<style>` blocks stripped from all 10 KC articles.
3. CSS version bumped to `?v=20260705a` across all 10 articles.
4. The 5 new articles had the missing `<link rel="stylesheet">` added.

## How to Apply
When creating a new KC article, copy the full `<head>` from `knowledge-center/aa-wigs-quality-standard/index.html` — it has all required meta tags, the CSS link, and proper JSON-LD structure. Never rely on inline `<style>` blocks alone.

## Step Component Variants
- `.art-step` / `.art-step-num` / `.art-step-body` — editorial style (large gold serif numeral + left-border rule). Used in `what-happens-before-it-reaches-you`.
- `.art-step-pill` / `.art-step-pill-num` / `.art-step-pill-body` — pill style (36px burgundy circle). Used in `refresh-body-wave`.
