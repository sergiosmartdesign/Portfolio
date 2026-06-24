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

**Preloader / loading screen — phone (2026-06-24)**
- `css/responsive.css` (new `2 · PRELOADER` block, ≤768px): shrank
  `.preloader-label` (1.15rem → `clamp(0.82rem,3.4vw,1.15rem)`), `.preloader-pct`
  (1.5rem → `clamp(1.05rem,4.6vw,1.5rem)`) and `.preloader-stage` gap
  (90px → `clamp(54px,16vw,90px)`). clamp upper bounds = desktop values, so
  desktop can never change.
- `js/particle-system.js`: added optional `maxPopMobile` / `zoomMobile` instance
  options, applied **only when `isMobile`**. The preloader swarm now uses
  `maxPopMobile: 40` (was 60 on phones) and `zoomMobile: 1.25` (was 1.6) so the
  multicolor field reads as a subtle backdrop, not a busy full-screen swarm.
  Desktop (150/Safari 100, zoom 1.6) and the intro/illustration swarms are
  untouched.

**#intro social icons — phone (2026-06-24)**
- `css/responsive.css` (#INTRO block, ≤768px): `#intro .social-media-icons`
  moved from the desktop bottom-right corner (`right:35px`) to centered along
  the bottom of the hero — `left:0; right:0; justify-content:center;
  gap:--spacing-xl; bottom:max(--spacing-lg, safe-area-inset-bottom)`. No
  translateX (the socialIconsGrow scale() entrance owns `transform`); centering
  is done with the full-bleed flex row instead. Desktop corner placement
  unchanged.

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

### Deep-links & QR codes — 2026-06-24

7. **Section deep-linking verified + fixed.** The hash router in `js/script.js`
   (`_deepLinkSectionId` / `routeDeepLink` / `goToSection`) is domain-independent
   and already handles every section (`#about`, `#art-direction`, `#photo`,
   `#illustration`, `#contact`) plus bare-domain/`#intro` → top/intro. No JS bug.
   - Fixed the one stale anchor: JSON-LD `artdirection-robot-image.url` used
     `/#web` (a non-existent section id) → corrected to `/#art-direction`.

8. **Regenerated all per-section QR codes** to encode the new domain
   (`segno`, black/white, scale 10, border 4, error-correction M):
   - `qr-intro` → `/#intro` · `qr-about` → `/#about` ·
     `qr-art-direction` → `/#art-direction` · `qr-photo` → `/#photo` ·
     `qr-illustration` → `/#illustration` · `qr-contact` → `/#contact` ·
     `qr-sergio-ayala-com` (.png + .svg) → `/`
   - Verified by decode (6/7 via OpenCV) + exact module-matrix comparison for the
     7th (`qr-art-direction`, 0 mismatches). QR assets are standalone (not
     referenced in the page) — used for print/sharing.

## ⚠️ Open questions for the owner

- _None outstanding._

---

## Files touched this session
- `index.html` — head meta (og/twitter removed broken img), domain → www.sergio-ayala.com,
  new photo-gallery JSON-LD block, `#web`→`#art-direction` anchor, unified email
- `sitemap.xml` — rebuilt as an image sitemap (68 images)
- `robots.txt` — domain + AI/image crawler allowlist
- `js/contact.js`, `locales/{en,es}.json` — unified contact email
- `images/qr-*.png` + `qr-sergio-ayala-com.svg` — regenerated for new domain
- `css/responsive.css` — preloader type/% shrink + particle note + intro social-icons centering
- `js/particle-system.js` — `maxPopMobile`/`zoomMobile` opts (isMobile-gated) + preloader values
- `RESPONSIVE-SESSION.md` — this file

_Desktop output unchanged: every visual edit is inside a ≤768px / coarse-pointer
media query, or JS guarded by `isMobile`._

---

## 🧷 Session close — 2026-06-24

**Git:** clean working tree, `main` in sync with `origin/main` (all pushed).
Session commits: `6205173` (seo) · `f44abcc` (deep-links + QR) · `f60304c`
(preloader responsive) · `03c1483` (intro social icons).

**Deploy:** all live on GitHub Pages (`https://sergiosmartdesign.github.io/Portfolio/`).
Pages redeploys ~1–2 min after each push; assets cache ~10 min client-side
(`max-age=600`, no cache-bust) → hard-reload (⌘⇧R) to see fresh changes.

**Local preview server:** stopped. To resume:
`python3 -m http.server 8000 --bind 127.0.0.1` from `web/`, then open
`http://127.0.0.1:8000/` (DevTools ⌘⇧M for mobile emulation).

**Production domain:** `https://www.sergio-ayala.com` (canonical). The github.io
URL is a project-pages preview at the `/Portfolio/` subpath.

### Done this session
- SEO/metadata: domain, image sitemap, photo-gallery JSON-LD, robots, email,
  removed broken og-image, fixed `#web` anchor.
- QR codes regenerated for the new domain (verified).
- Responsive (phone-only): preloader type/% + particle swarm reduced; intro
  social icons centered at the bottom of the hero.

### Recommended next steps (not started)
- **Share card:** add a real 1200×630 `og:image` (jpg/png) — 5-line wire-in at
  the `TODO(share-card)` comment in `<head>`. Highest-impact virality asset.
- **Responsive visual passes** still open for: #about, #art-direction, #photo,
  #illustration, #contact — review each live on a phone and tune in
  `responsive.css` / `isMobile`-gated JS only (desktop frozen).

_To resume: re-read this file + the unbreakable rule at the top before any
responsive edit._
