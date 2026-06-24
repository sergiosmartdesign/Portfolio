# Responsive Session — Rules & Change Log

> Working document for the **mobile/responsive** work stream.
> Created 2026-06-24.

---

## 🔒 UNBREAKABLE RULE (this session and any "responsive" session)

**Only the responsive (mobile/tablet) version may be changed. The desktop
version must stay byte-for-byte identical in layout, behavior, and appearance.**

This is non-negotiable. Every visual change must be provably invisible to a
desktop (fine-pointer, ≥1025px) user.

### What this means in practice — where visual changes are allowed

| Allowed (responsive only) | Forbidden (would touch desktop) |
|---|---|
| `css/responsive.css` (loaded **last**, every rule inside a media/capability query) | Editing any other `.css` outside a `@media` query |
| New rules inside existing `@media (max-width: …)` / `(hover:none) and (pointer:coarse)` / `(orientation:landscape)` blocks | Changing a desktop rule's base (unqueried) declarations |
| JS gated on `App.BrowserDetect.isTouch` / `.isMobile` | Editing shared JS paths that also run on desktop |

**Breakpoints** (from `responsive.css`): `≤1024px` tablet · `≤768px` primary
phone · `≤380px` small-phone guard rails. Capability: `(hover:none) and
(pointer:coarse)` for touch.

### Why the SEO/metadata work below did NOT break the rule
SEO metadata is **non-visual and document-global** — `<head>` tags, JSON-LD,
`robots.txt`, `sitemap.xml`, and `alt`/`itemprop` attributes. None of them
change the rendered desktop layout, styling, or behavior. They are shared by
both versions and were explicitly requested by the owner.

---

## ✅ Change Log — 2026-06-24

### SEO / image discoverability ("make images viral & easy to find")

1. **Removed broken `og-image.jpg`** (per owner). It was referenced but the file
   never existed → broken social previews. Deleted from Open Graph, Twitter Card,
   and JSON-LD `Person.image`. Left a `TODO(share-card)` comment in `<head>`.
   - ⚠️ **Recommended next step:** add a dedicated **1200×630** `og:image`
     (jpg/png) — single highest-impact asset for share virality. Wire-in is a
     5-line edit once the file exists.

2. **Corrected the canonical domain → `https://www.sergio-ayala.com`** (the real
   live domain). Replaced all `sergioayala.design` (201×) in `index.html`
   (canonical, hreflang, og:url, every JSON-LD `@id`/URL) and the placeholder
   `sergioayala.studio` in `robots.txt` + `sitemap.xml`.

3. **Built a full image sitemap** (`sitemap.xml`): added the
   `xmlns:image` extension and **68 `<image:image>` entries** — 4 section
   backdrops + 8 illustrations + **56 travel photos** — each with
   `<image:title>` and `<image:caption>`. This is the canonical mechanism for
   Google Images discovery.

4. **Exposed the 56 JS-loaded travel photos to crawlers/AI.** They render via
   JS/canvas (`data-image`), so they were invisible to search engines. Added a
   second JSON-LD block: an `ImageGallery` (`#photo-gallery`) enumerating all 56
   as `Photograph` → `ImageObject` nodes (minified, kept out of the main
   `@graph` to keep it readable).

5. **`robots.txt`**: explicitly welcomed `Googlebot-Image`, `GPTBot`,
   `PerplexityBot`, `Google-Extended` (AI + image crawlers) and pointed `Sitemap:`
   at the correct domain.

**Validation:** both JSON-LD blocks parse as valid JSON; `sitemap.xml` is
well-formed XML with 68 image entries.

### Responsive (visual)
- _None yet._ `responsive.css` is already mature and well-documented. Visual
  tuning to be done **with the browser open** so changes are reviewed live —
  no blind edits.

---

## Change Log — 2026-06-24 (cont.)

6. **Contact email unified → `mail@sergio-ayala.com`** (owner-confirmed) across
   every live surface:
   - `js/contact.js` — `CONTACT_EMAIL` + comment
   - `locales/{en,es}.json` — about-CTA `mailto:`
   - `index.html` — JSON-LD `Person.email`, `acquireLicensePage` (image
     licensing), the static about-CTA fallback, and the seal-CTA `mailto:`
   - Was previously split between `mail@sergioayala.studio` and
     `sergionook@gmail.com`; both retired. Locale JSON re-validated.
   - Only stale refs left are in `review/AUDITORIA_RESULTADO.html` (a historical
     audit report, not a live contact surface) — intentionally untouched.

## ⚠️ Open questions for the owner

- _None outstanding._

---

## Files touched this session
- `index.html` — head meta (og/twitter), JSON-LD domain + new photo gallery block
- `sitemap.xml` — rebuilt as image sitemap
- `robots.txt` — domain + crawler allowlist
- `RESPONSIVE-SESSION.md` — this file

_No CSS or JS behavior files were modified. Desktop output is unchanged._
