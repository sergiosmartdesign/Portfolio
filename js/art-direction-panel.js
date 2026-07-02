/* ── Art Direction — discipline selector + works list ────────────────────────
   ArtWorksPanel wires the inline-SVG nav card (.ad-explore-card) to the works
   table, the cursor-following row preview and the full-screen project modal
   (static image or interactive <model-viewer> for 3D entries).

   Data-driven: the catalog + discipline constants live in art-direction-data.js
   (WORKS_DATA, DISCIPLINE_BACKDROPS, DISCIPLINE_LABELS, AD_PM_DESC_PLACEHOLDER).
   DOM rows are always generated from WORKS_DATA — never authored in HTML.

   Depends on (load order in index.html):
     • art-direction-data.js  — WORKS_DATA + discipline constants
     • lib/scramble.js        — window.scrambleText
   ─────────────────────────────────────────────────────────────────────────── */

// Glyph pool + cadence for the panel's scramble effect (discipline name, row
// titles). Distinct from the nav-card decode in art-direction.js.
const AD_PANEL_SCRAMBLE = { chars: '!<>-_\\/[]{}—=+*^?#∆◊§øΩ†‡', frameMs: 38 };

// Glyph pool for the modal text's Splitting.js char-cycle glitch — mirrors the
// site-wide GLITCH_CHARS used on headings (script.js).
const AD_PM_GLITCH_CHARS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?░▒▓<>/'.split('');

class ArtWorksPanel {
    constructor() {
        this.panel    = document.querySelector('#art-direction .ad-works-panel');
        if (!this.panel) return;

        this.table         = this.panel.querySelector('.ad-works-table');
        this.discName      = this.panel.querySelector('.ad-works-disc-name');
        this.section       = document.getElementById('art-direction');
        this.navSvg        = document.querySelector('#art-direction .ad-explore-card .ad-nav-svg');
        this.navItems      = [...document.querySelectorAll('#art-direction .ad-explore-card .adnav-cat[data-discipline]')];

        this.activeDiscipline = null;
        this._transitioning   = false;

        this.init();
    }

    init() {
        this.navItems.forEach(item => {
            const choose = () => {
                this._dismissIntro();
                this.selectDiscipline(item.dataset.discipline);
            };
            item.addEventListener('click', choose);
            item.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    choose();
                }
            });
        });

        // Show intro card; pre-populate identity data silently so first click is instant
        if (this.section) this.section.classList.add('ad-intro-active');
        this.panel.classList.add('ad-works-ready');
        this._initModal();
        this._initRowPreview();
        this.selectDiscipline('identity', true);
    }

    _dismissIntro() {
        if (this.section) this.section.classList.remove('ad-intro-active');
    }

    // ── Scramble helper ───────────────────────────────────────────────────────
    // Thin wrapper over the shared window.scrambleText with the panel's glyph
    // pool + cadence. Honors prefers-reduced-motion inside scrambleText.
    _scrambleText(el, onDone, overrideTarget) {
        window.scrambleText(el, {
            chars:   AD_PANEL_SCRAMBLE.chars,
            frameMs: AD_PANEL_SCRAMBLE.frameMs,
            target:  overrideTarget,
        }, onDone);
    }

    // ── Discipline selection ──────────────────────────────────────────────────

    selectDiscipline(key, immediate = false) {
        if (this._transitioning || key === this.activeDiscipline) return;
        if (!WORKS_DATA[key]) return;

        this._transitioning   = true;
        this.activeDiscipline = key;

        // Discipline contains 3D models — start fetching the viewer bundle now
        // so the modal opens without a library-download stall.
        if (WORKS_DATA[key].some(w => w.model)) this._ensureModelViewer();

        if (!immediate) {
            // First real selection ends the nav card's attract cycle — the
            // amber highlight becomes a pure active-state indicator.
            this.navSvg?.classList.add('has-active');
            this.navItems.forEach(item => {
                const active = item.dataset.discipline === key;
                item.classList.toggle('is-active', active);
                item.setAttribute('aria-pressed', String(active));
            });
        }

        const activeSpan = this.navItems
            .find(item => item.dataset.discipline === key)
            ?.querySelector('.adnav-label');

        const label = `· ${DISCIPLINE_LABELS[key] ?? (key.charAt(0).toUpperCase() + key.slice(1))} ·`;

        if (immediate) {
            this._renderRows(key);
            this._animateRowsIn();
            if (this.discName) this.discName.textContent = label;
            return;
        }

        let tableReady   = false;
        let scrambleDone = false;

        const tryAnimate = () => {
            if (!tableReady || !scrambleDone) return;
            this.table.style.opacity = '';
            this._animateRowsIn();
        };

        this.table.classList.add('is-leaving');
        setTimeout(() => {
            this._renderRows(key);
            this.table.classList.remove('is-leaving');
            this.table.style.opacity = '0';
            tableReady = true;
            tryAnimate();
        }, 160);

        this._scrambleText(activeSpan, () => {
            scrambleDone = true;
            tryAnimate();
        });

        if (this.discName) this._scrambleText(this.discName, null, label);
    }

    // ── Row rendering ─────────────────────────────────────────────────────────

    _renderRows(key) {
        const works = WORKS_DATA[key];

        if (!works.length) {
            this.table.innerHTML = `
            <div class="ad-works-empty" aria-live="polite">
                <span class="ad-works-empty-text">· s e l e c t i o n &nbsp;i n &nbsp;p r o g r e s s ·</span>
            </div>`;
            return;
        }

        this.table.innerHTML = works.map(w => {
            const scope = w.specs.find(s => s[0] === 'Scope')?.[1] ?? '—';
            const tools = w.specs.find(s => s[0] === 'Tools')?.[1] ?? '—';
            const year  = w.specs.find(s => s[0] === 'Year')?.[1]  ?? '—';
            return `
            <div class="ad-work-item" role="listitem" tabindex="0" aria-label="Open ${w.title}">
                <span class="ad-work-data ad-work-title">${w.title}</span>
                <span class="ad-work-data ad-work-scope">${scope}</span>
                <span class="ad-work-data ad-work-tools">${tools}</span>
                <span class="ad-work-data ad-work-year">${year}</span>
            </div>`;
        }).join('');

        this.table.querySelectorAll('.ad-work-item').forEach((row, i) => {
            row.addEventListener('click', () => this._openModal(works[i]));
            row.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this._openModal(works[i]);
                }
            });
            row.addEventListener('mouseenter', () => {
                // Title glitch/scramble on hover disabled for now (froze on
                // rapid re-hover, leaving the name unreadable). Preview kept.
                if (works[i].bg) this._showRowPreview(works[i].bg, works[i].whiteBg);
            });
            row.addEventListener('mouseleave', () => this._hideRowPreview());
        });
    }

    _animateRowsIn() {
        const rows = [...this.table.querySelectorAll('.ad-work-item')];
        if (!rows.length) {
            // Empty discipline — still un-hide the table so the empty state shows.
            this.table.style.opacity = '1';
            this._transitioning = false;
            return;
        }

        rows.forEach((row, i) => {
            row.style.setProperty('--row-index', i);
            row.classList.add('ad-row-entering');
        });
        void this.table.offsetWidth; // flush CSSOM so entering state is computed

        rows.forEach(row => {
            row.classList.remove('ad-row-entering');
            row.classList.add('ad-row-visible');
        });

        // Cleanup after the last row's transition ends.
        // Last stagger delay: 20ms + (n-1) * 60ms. Duration: --duration-quick (200ms).
        const lastDelay = 20 + (rows.length - 1) * 60;
        setTimeout(() => {
            rows.forEach(r => {
                r.classList.remove('ad-row-visible');
                r.style.removeProperty('--row-index');
            });
            this._transitioning = false;
        }, lastDelay + 220); // 200 = --duration-quick, 20 = settle buffer

        this.table.style.opacity = '1';
    }

    // ── Floating row preview ──────────────────────────────────────────────────

    _initRowPreview() {
        this._preview          = document.getElementById('adRowPreview');
        this._previewVisible   = false;
        this._previewTargetX   = 0;
        this._previewTargetY   = 0;
        this._previewRafPending = false;
        this._PREVIEW_W        = 200;
        this._PREVIEW_H        = 260;

        const zone = document.querySelector('#art-direction .ad-works-zone');
        if (zone) {
            zone.addEventListener('mousemove', e => this._moveRowPreview(e), { passive: true });
        }
    }

    _showRowPreview(imageUrl, whiteBg = false) {
        if (!this._preview) return;
        this._preview.classList.toggle('is-white', !!whiteBg);
        this._preview.style.backgroundImage = `url('${imageUrl}')`;
        this._preview.style.transform       = `translate(${this._previewTargetX}px,${this._previewTargetY}px)`;
        this._preview.style.opacity         = '1';
        this._preview.classList.add('is-visible');
        this._previewVisible = true;
    }

    _hideRowPreview() {
        if (!this._preview) return;
        this._preview.style.opacity = '0';
        this._preview.classList.remove('is-visible');
        this._previewVisible = false;
    }

    _moveRowPreview(e) {
        const OFFSET_X = 24;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let x = e.clientX + OFFSET_X;
        let y = e.clientY - (this._PREVIEW_H >> 1);

        if (x + this._PREVIEW_W > vw - 8) x = e.clientX - this._PREVIEW_W - OFFSET_X;
        if (y < 8)                         y = 8;
        if (y + this._PREVIEW_H > vh - 8)  y = vh - this._PREVIEW_H - 8;

        this._previewTargetX = x;
        this._previewTargetY = y;

        if (!this._previewVisible || this._previewRafPending) return;
        this._previewRafPending = true;
        requestAnimationFrame(() => {
            this._preview.style.transform = `translate(${this._previewTargetX}px,${this._previewTargetY}px)`;
            this._previewRafPending = false;
        });
    }

    // ── Modal ─────────────────────────────────────────────────────────────────

    _initModal() {
        this.modal     = document.querySelector('#art-direction .ad-project-modal');
        if (!this.modal) return;

        this.modalBg     = this.modal.querySelector('.ad-pm-bg');
        this.modalStage  = this.modal.querySelector('.ad-pm-stage');
        this.modalStageImg = this.modal.querySelector('.ad-pm-stage-img');
        this.modalNum    = this.modal.querySelector('.ad-pm-num');
        this.modalCat    = this.modal.querySelector('.ad-pm-cat');
        this.modalTitle  = this.modal.querySelector('.ad-pm-title');
        this.modalSub    = this.modal.querySelector('.ad-pm-sub');
        this.modalDesc   = this.modal.querySelector('.ad-pm-desc');
        this.modalSpecs  = this.modal.querySelector('.ad-pm-specs');
        this.modalTags   = this.modal.querySelector('.ad-pm-tags');
        this.modalThumbs = this.modal.querySelector('.ad-pm-thumbs');
        this.modalClose  = this.modal.querySelector('.ad-pm-close');
        this._triggerEl  = null;

        this.modalClose.addEventListener('click', () => this._closeModal());

        // Click anywhere closes the modal — except on genuinely interactive
        // controls: description links, the thumbnail strip, the orbitable 3D
        // stage and the flipbook (both need their own gestures), and the close
        // button (its own handler above). Everything else — backdrop, photo,
        // text, specs — dismisses.
        this.modal.addEventListener('click', e => {
            if (e.target.closest(
                'a[href], .ad-pm-thumb, .ad-pm-close, .ad-pm-stage.has-model, .ad-pm-stage.has-book, .ad-book'
            )) {
                return;
            }
            this._closeModal();
        });

        document.addEventListener('keydown', e => {
            if (!this.modal.classList.contains('is-open')) return;

            if (e.key === 'Escape') {
                this._closeModal();
                return;
            }

            if (e.key === 'Tab') {
                const focusable = Array.from(
                    this.modal.querySelectorAll(
                        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    )
                ).filter(el => el.offsetParent !== null);

                if (!focusable.length) { e.preventDefault(); return; }

                const first = focusable[0];
                const last  = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        // Auto-close a left-open project when the section scrolls out of view —
        // otherwise the full-bleed overlay (and any live model-viewer WebGL
        // context) bleeds over the sections below.
        if (this.section && 'IntersectionObserver' in window) {
            new IntersectionObserver(entries => {
                entries.forEach(e => {
                    if (!e.isIntersecting && this.modal.classList.contains('is-open')) {
                        this._closeModal();
                    }
                });
            }, { threshold: 0 }).observe(this.section);
        }

        // Menu navigation jumps instantly and may not trip the observer above —
        // close the project on any nav selection (NavigationManager fires this).
        document.addEventListener('app:navigate', () => {
            if (this.modal.classList.contains('is-open')) this._closeModal();
        });
    }

    _openModal(work) {
        if (!this.modal) return;

        this._triggerEl = document.activeElement;

        this.modal.classList.toggle('is-white-media', !!work.whiteBg);
        this._fixedBackdrop = DISCIPLINE_BACKDROPS[this.activeDiscipline] ?? null;

        if (this.modalBg) {
            const backdrop = this._fixedBackdrop || work.bg;
            this.modalBg.style.backgroundImage = backdrop ? `url('${backdrop}')` : 'none';
        }

        // Stage media — flipbook (editorial catalogs) · 3D model · static image
        clearTimeout(this._mvTeardownTimer);
        this._teardownModelViewer();
        this._teardownFlipbook();

        const hasCatalogs = Array.isArray(work.catalogs) && work.catalogs.length > 0;
        const useFlip = this.activeDiscipline === 'editorial'
            && (hasCatalogs || (Array.isArray(work.images) && work.images.length > 1))
            && !!window.ADFlipbook;

        if (work.model) this._mountModelViewer(work);
        else if (useFlip) this._mountFlipbook(work);

        if (this.modalStageImg) {
            if (work.bg && !work.model && !useFlip) {
                this.modalStageImg.src = work.bg;
                this.modalStageImg.alt = `${work.title} — project image`;
            } else {
                this.modalStageImg.removeAttribute('src');
                this.modalStageImg.alt = '';
            }
        }
        this.modal.classList.toggle('is-flipbook', useFlip);

        this.modalNum.textContent   = work.num;
        this.modalCat.textContent   = `· ${work.cat.toUpperCase()} ·`;
        this.modalTitle.textContent = work.title;
        this.modalSub.textContent   = work.sub;

        // Re-split on each open so the fresh [data-char] pseudo-elements re-fire
        // the glitch-switch char-cycle (keyframes in styles.css). The plain-text
        // assignment above wipes any prior split, so Splitting starts clean.
        this._glitchSplit(this.modalCat);
        this._glitchSplit(this.modalTitle);
        this._glitchSplit(this.modalSub);

        if (this.modalDesc) {
            this.modalDesc.innerHTML = work.desc ?? AD_PM_DESC_PLACEHOLDER;
        }

        this.modalSpecs.innerHTML = work.specs.map(([k, v]) => `
            <div class="ad-pm-spec-row">
                <span class="ad-pm-spec-key">${k}</span>
                <span class="ad-pm-spec-val">${v}</span>
            </div>`).join('');

        this.modalTags.innerHTML = work.tags.map(t => `
            <span class="ad-pm-tag"><span class="ad-pm-dot"></span>${t}</span>`).join('');

        if (this.modalThumbs && useFlip && hasCatalogs) {
            // Multi-catalog project — the thumb strip becomes a catalog
            // selector: one cover per book, click swaps the flipbook.
            this.modalThumbs.innerHTML = work.catalogs.map((cat, i) =>
                `<div class="ad-pm-thumb${i === 0 ? ' is-active' : ''}" role="listitem"
                      style="background-image:url('${cat.images[0]}')"
                      tabindex="0" title="${cat.label}"
                      aria-label="${cat.label} (${i + 1} de ${work.catalogs.length})"></div>`
            ).join('');
            this.modalThumbs.querySelectorAll('.ad-pm-thumb').forEach((thumb, i) => {
                const pick = () => this._switchCatalog(work, i);
                thumb.addEventListener('click', pick);
                thumb.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        pick();
                    }
                });
            });
        } else if (this.modalThumbs && useFlip) {
            // The flipbook carries its own page navigation — no thumb strip.
            this.modalThumbs.innerHTML = '';
        } else if (this.modalThumbs) {
            const imgs = work.images;
            if (imgs && imgs.length > 1) {
                this.modalThumbs.innerHTML = imgs.map((src, i) =>
                    `<div class="ad-pm-thumb${i === 0 ? ' is-active' : ''}" role="listitem"
                          style="background-image:url('${src}')"
                          tabindex="0"
                          aria-label="Image ${i + 1} of ${imgs.length}"></div>`
                ).join('');
                this.modalThumbs.querySelectorAll('.ad-pm-thumb').forEach((thumb, i) => {
                    thumb.addEventListener('click', () => this._switchModalImage(imgs[i], i));
                    thumb.addEventListener('keydown', e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this._switchModalImage(imgs[i], i);
                        }
                    });
                });
            } else {
                this.modalThumbs.innerHTML = '';
            }
        }

        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => this.modalClose.focus());
    }

    // Run Splitting.js on an element and seed each char with 10 random glyphs so
    // the CSS glitch-switch animation has frames to cycle through before settling
    // on the real character. Same recipe as GlitchSystem.initSplitting (script.js).
    _glitchSplit(el) {
        if (!el || !window.Splitting) return;
        const results = window.Splitting({ target: el, by: 'chars' });
        results.forEach(result => {
            result.chars.forEach(char => {
                char.style.setProperty('--count', String(Math.random() * 5 + 1));
                for (let g = 0; g < 10; g++) {
                    const r = AD_PM_GLITCH_CHARS[Math.floor(Math.random() * AD_PM_GLITCH_CHARS.length)];
                    char.style.setProperty(`--char-${g}`, `"${r}"`);
                }
            });
        });
    }

    _switchModalImage(src, index) {
        if (this.modalBg && !this._fixedBackdrop) {
            this.modalBg.style.backgroundImage = `url('${src}')`;
        }
        if (this.modalStageImg) {
            this.modalStageImg.src = src;
        }
        if (this.modalThumbs) {
            this.modalThumbs.querySelectorAll('.ad-pm-thumb').forEach((t, i) => {
                t.classList.toggle('is-active', i === index);
            });
        }
    }

    _closeModal() {
        if (!this.modal) return;
        this.modal.classList.remove('is-open');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this._triggerEl?.focus({ preventScroll: true });
        this._triggerEl = null;
        this._teardownFlipbook();
        // Free the WebGL context once the fade-out (0.22s) has finished.
        this._mvTeardownTimer = setTimeout(() => this._teardownModelViewer(), 240);
    }

    // ── Flipbook stage — editorial catalogs (js/ad-flipbook.js) ─────────────────

    _mountFlipbook(work, catalogIndex = 0) {
        if (!this.modalStage || !window.ADFlipbook) return;
        const cat = Array.isArray(work.catalogs) && work.catalogs.length
            ? work.catalogs[Math.min(catalogIndex, work.catalogs.length - 1)]
            : null;
        this.modalStage.classList.add('has-book');
        this._flipbook = new ADFlipbook(this.modalStage, cat ? cat.images : work.images, {
            label: cat ? `${work.title} — ${cat.label}` : `${work.title} — catalog`,
        });
    }

    // Swap the mounted book for another catalog of the same work (multi-catalog
    // projects); the thumb strip acts as the selector.
    _switchCatalog(work, index) {
        this._teardownFlipbook();
        this._mountFlipbook(work, index);
        if (this.modalThumbs) {
            this.modalThumbs.querySelectorAll('.ad-pm-thumb').forEach((t, i) => {
                t.classList.toggle('is-active', i === index);
            });
        }
    }

    _teardownFlipbook() {
        if (this._flipbook) { this._flipbook.destroy(); this._flipbook = null; }
        this.modalStage?.classList.remove('has-book');
    }

    // ── 3D model stage ────────────────────────────────────────────────────────

    // Lazy-load the self-hosted <model-viewer> bundle on first need.
    // The Draco decoder location must be configured before the module runs —
    // the default points at Google's CDN, which this site's CSP blocks.
    _ensureModelViewer() {
        const DRACO_PATH = 'js/lib/draco/';
        const Defined = customElements.get('model-viewer');
        if (Defined) {
            // Module already evaluated (e.g. loaded eagerly elsewhere) — the
            // global-object config was consumed at eval time with the CDN
            // default; repoint the decoder via the class's static setter.
            Defined.dracoDecoderLocation = DRACO_PATH;
            return;
        }
        if (this._mvRequested) return;
        this._mvRequested = true;
        self.ModelViewerElement = Object.assign(self.ModelViewerElement || {}, {
            dracoDecoderLocation: DRACO_PATH
        });
        const s = document.createElement('script');
        s.type = 'module';
        s.src  = 'js/lib/model-viewer.min.js';
        document.head.appendChild(s);
    }

    _mountModelViewer(work) {
        if (!this.modalStage) return;
        this._ensureModelViewer();
        const mv = document.createElement('model-viewer');
        mv.className = 'ad-pm-model';
        mv.setAttribute('src', work.model);
        mv.setAttribute('alt', `${work.title} — interactive 3D model`);
        mv.setAttribute('loading', 'eager');
        mv.setAttribute('camera-controls', '');
        mv.setAttribute('auto-rotate', '');
        mv.setAttribute('auto-rotate-delay', '0');
        mv.setAttribute('rotation-per-second', '32deg');
        mv.setAttribute('shadow-intensity', '1');
        mv.setAttribute('touch-action', 'pan-y');

        // Reveal sequence: the red deco frame draws first; the model fades in
        // only once the GLB has loaded AND the frame has had time to appear —
        // so a cached model still enters after the frame, never before.
        // Fail-open: on 'error' or a stalled load (10s), reveal anyway so the
        // stage can never be stranded invisible.
        const frameDrawn = new Promise(r => setTimeout(r, 900));
        const modelReady = new Promise(r => {
            mv.addEventListener('load',  r, { once: true });
            mv.addEventListener('error', e => {
                console.warn('[ad-3d] model failed to load:', work.model, e.detail);
                r();
            }, { once: true });
            setTimeout(r, 10000);
        });
        Promise.all([frameDrawn, modelReady]).then(() => mv.classList.add('is-loaded'));

        this.modalStage.classList.add('has-model');
        this.modalStage.appendChild(mv);
    }

    _teardownModelViewer() {
        if (!this.modalStage) return;
        this.modalStage.classList.remove('has-model');
        this.modalStage.querySelector('.ad-pm-model')?.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ArtWorksPanel();
});
