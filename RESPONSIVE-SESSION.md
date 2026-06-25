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

### Share card — DONE 2026-06-24
- Created `images/og-image.jpg` (1200×630, 164 KB) by cropping the owner-supplied
  cyber-hero (`images/usa esta imagen.jpg`, 1067×1085) to a centered 1.905:1 band
  (full width, text block centered) and resizing (OpenCV, Lanczos, q90).
- Wired `<head>`: `og:image` (+ secure_url/type/width/height/alt),
  `twitter:image` (+alt), and restored JSON-LD `Person.image` → og-image.jpg.
- ⚠️ After deploy, **force a re-scrape** (platforms cache cards hard): FB Sharing
  Debugger, LinkedIn Post Inspector, X Card Validator.
- Source `images/usa esta imagen.jpg` left in place (owner-supplied) — safe to
  delete now that og-image.jpg exists.

### Embedded image metadata (IPTC/XMP/EXIF) — DONE 2026-06-24
- Tool: `exiftool 13.50`, **lossless** (no pixel re-encode; ~+0.2 KB/file).
- **8 illustrations + 56 photos** (webp): XMP-dc Creator/Title/Description/Subject/
  Rights + photoshop:Credit + xmpRights (Marked/WebStatement/UsageTerms) +
  plus:LicensorURL + EXIF Artist/Copyright/ImageDescription. License URL =
  `https://www.sergio-ayala.com/#contact` (matches the JSON-LD `acquireLicensePage`
  → reinforces Google "Licensable" eligibility; the embedded copy survives
  hotlinking/scraping where JSON-LD can't).
- **Photos:** GPS + camera serial **stripped** (privacy) while credit/copyright
  added — selective metadata.
- **og-image.jpg** (jpeg): full IPTC IIM + XMP + EXIF (by-line/copyright/credit/
  caption/keywords).
- **QR PNGs:** self-documenting only — a `PNG:Comment` recording the encoded URL +
  EC level (maintenance/provenance, **not** SEO; QRs intentionally stay out of
  the sitemap and image index). Verified still scannable post-write.
- Regenerate with `qrenv`/exiftool; keep embedded metadata in sync with the
  JSON-LD if image copy/licensing changes.

---

## 🧷 Session close — 2026-06-25

**Git:** clean, `main` synced. This session built the phone-only **#intro hero
frame** + tickers + entrance, and the **menu open replay**. Key commits: `20c7708`
(neon frame) · `fa2b6ed` (cyberpunk HUD) · swap to the dnacapsule shell + recolor
orange + crop/clean (`b87eb72`→`a2afca1`) · `8aaa79c` (space the two bars) ·
`8b7527b` (menu line-grow) · tickers (`3816f54`/`ffb0a5d`) · `0b319d7` (per-line
grow + real glitch-text on menu open).
⚠️ An earlier inline staggered **stroke-draw** entrance (`ed7572f`) was
force-reset off `main` — it looked janky. See the lesson below.

### #intro — mobile hero frame (NEW)
- **What/where:** orange (`#ff3c00`) capsule frame around the hero, **inlined** in
  `index.html` as `<svg class="ifm-svg">` inside `<div class="intro-frame-mobile"
  aria-hidden>`. Derived from `images/dnacapsule1.svg` (the #about/#contact DNA
  capsule) but it is NOT that file (the original stays cyan + shared; **do not
  edit it**) and NOT a background image (inline so each line can animate).
- **Geometry:** `viewBox="5 0 193 410.66" preserveAspectRatio="none"`, full-bleed
  (`left/right:0`) so the side walls touch the screen edges. Stripped the cyan
  glow-fill, binary text, left instrument lines and bottom barcode; strokes →
  `#ff3c00`; neon glow via CSS `filter: drop-shadow` on the container. The two top
  bars were spaced apart (bar2 `y 33.09 → 42`) so each hosts a readable ticker.
- **Two tickers** on the bars (`.ifm-ticker--top` y=15.32 → `top:3.73%`,
  `--bottom` y=42 → `top:10.23%`): seamless marquees (2 seqs + `translateX(-50%)`),
  uppercase bold (Funnel Display 800), dark `#001219` on orange, edge-fade `mask`,
  pause off-screen via `.paused-animations`. Top = "· MORE TO EXPLORE ON DESKTOP ✦"
  (counter-scrolls); bottom = positioning/status/CTA/skills. Text is a separate
  HTML layer (never inside the stretched SVG → no distortion).
- **Entrance** (gated on `body:not(.preloading)` so it plays in view, not behind
  the loader): each capsule line scale-grows (`ifmGrowX`/`ifmGrowY`, scale 0→1,
  `transform-box: fill-box`, staggered via inline `--d`) — mirrors the desktop
  `.panel-line` draw. Then the tickers glitch in (`ifmTickerGlitchIn`).
- **Desktop-safe:** hidden ≥769px (`@media (min-width:769px){display:none}`) + all
  styling ≤768px → desktop byte-for-byte.
- ⚠️ **Lesson:** do NOT animate the entrance with `stroke-dashoffset` "draw" on the
  outline — `preserveAspectRatio="none"` distorts the stroke and varies the pen
  speed → janky. Uniform `transform: scale` is clean.

### Nav — menu open replays the load-in (NEW)
- Drawer slides in via transform (never `display:none`), so the page-load
  `lineGrow` ran off-screen once. Now (phones) the base run is cancelled and a
  fresh `lineGrow` (orange top-line grows per row, staggered via `--nav-i`) binds
  to `.main-nav.is-open`, and the **real** character glitch fires from JS:
  `GlitchSystem.triggerGlitchBatch(this.navButtons)` in `MobileNav.openDrawer()`
  (same `glitch-switch` as the logo/name) — not a positional shake.

### Recommended next steps (not started)
- **Responsive visual passes** still open for: #about, #art-direction, #photo,
  #illustration, #contact — review each live on a phone and tune in
  `responsive.css` / `isMobile`-gated JS only (desktop frozen).

_To resume: re-read this file + the unbreakable rule at the top before any
responsive edit._
