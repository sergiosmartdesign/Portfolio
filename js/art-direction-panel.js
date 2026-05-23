/* ── Art Direction — discipline selector + works list ────────────────────────
   Data-driven: WORKS_DATA is the source of truth.
   DOM rows are always generated from it — never authored in HTML.
   ─────────────────────────────────────────────────────────────────────────── */

const WORKS_DATA = {
  branding: [
    {
      num: '01', cat: 'Branding', title: 'Brand Identity Systems', sub: 'From strategy to production',
      specs: [['Scope','Logo · System · Guidelines'],['Tools','Figma · Illustrator'],['Year','2021 – 2024'],['Mode','Freelance · Studio']],
      tags: ['Multi-brand','Identity','Print'],
      bg: 'images/photo/Petra.webp'
    },
    {
      num: '02', cat: 'Branding', title: 'Retail Brand Refresh', sub: 'Visual repositioning at scale',
      specs: [['Scope','Identity · Packaging'],['Tools','Illustrator · InDesign'],['Year','2022'],['Mode','Agency']],
      tags: ['Packaging','Retail','System'],
      bg: 'images/photo/Kotor Montenegro.webp'
    },
    {
      num: '03', cat: 'Branding', title: 'Startup Visual Language', sub: 'Zero to brand from scratch',
      specs: [['Scope','Logo · Motion · Web'],['Tools','Figma · After Effects'],['Year','2023'],['Mode','Freelance']],
      tags: ['Startup','Motion','Guidelines'],
      bg: 'images/photo/Sevilla.webp'
    },
    {
      num: '04', cat: 'Branding', title: 'Heritage Rebranding', sub: 'Tradition meets modernity',
      specs: [['Scope','Logo · Print · Digital'],['Tools','Illustrator · Figma'],['Year','2024'],['Mode','Studio']],
      tags: ['Heritage','Print','Identity'],
      bg: 'images/photo/Goreme.webp'
    }
  ],
  web: [
    {
      num: '01', cat: 'Web', title: 'Digital Product Design', sub: 'UX direction & interface',
      specs: [['Scope','UX · UI · Design Systems'],['Tools','Figma · CSS'],['Year','2020 – 2024'],['Mode','Freelance · Agency']],
      tags: ['UX','Design Systems','Frontend'],
      bg: 'images/photo/Istanbul ships.webp'
    },
    {
      num: '02', cat: 'Web', title: 'E-Commerce Platform', sub: 'Conversion-driven UX',
      specs: [['Scope','UX · Research · UI'],['Tools','Figma · Framer'],['Year','2022 – 2023'],['Mode','Agency']],
      tags: ['E-Commerce','Research','UI'],
      bg: 'images/photo/London Bridge.webp'
    },
    {
      num: '03', cat: 'Web', title: 'SaaS Dashboard', sub: 'Complex data made simple',
      specs: [['Scope','UX · Data Viz · Frontend'],['Tools','Figma · React'],['Year','2023 – 2024'],['Mode','Freelance']],
      tags: ['SaaS','Data','Dashboard'],
      bg: 'images/photo/Rovinj Croatia.webp'
    }
  ],
  editorial: [
    {
      num: '01', cat: 'Editorial', title: 'Print & Layout Direction', sub: 'Publication & visual systems',
      specs: [['Scope','Layout · Typography'],['Tools','InDesign · Illustrator'],['Year','2019 – 2023'],['Mode','Studio · Client']],
      tags: ['Print','Typography','Layout'],
      bg: 'images/photo/Dubrovnik.webp'
    },
    {
      num: '02', cat: 'Editorial', title: 'Annual Report Design', sub: 'Data storytelling through layout',
      specs: [['Scope','Print · Infographic'],['Tools','InDesign · Figma'],['Year','2021'],['Mode','Client']],
      tags: ['Annual Report','Infographics','Data'],
      bg: 'images/photo/Ojo Sevillano.webp'
    },
    {
      num: '03', cat: 'Editorial', title: 'Cultural Magazine', sub: 'Six-issue visual identity',
      specs: [['Scope','Art Direction · Layout'],['Tools','InDesign · Photoshop'],['Year','2020 – 2021'],['Mode','Studio']],
      tags: ['Magazine','Culture','Series'],
      bg: 'images/photo/Streets of Istanbul.webp'
    },
    {
      num: '04', cat: 'Editorial', title: 'Book Cover Series', sub: 'Narrative through typography',
      specs: [['Scope','Cover · Typography'],['Tools','Illustrator · Photoshop'],['Year','2022'],['Mode','Freelance']],
      tags: ['Book','Series','Typography'],
      bg: 'images/photo/Old tombs.webp'
    },
    {
      num: '05', cat: 'Editorial', title: 'Corporate Brochure', sub: 'Brand voice in print',
      specs: [['Scope','Layout · Print'],['Tools','InDesign'],['Year','2023'],['Mode','Agency']],
      tags: ['Corporate','Print','Brand'],
      bg: 'images/photo/Perast.webp'
    }
  ],
  identity: [
    {
      num: '01', cat: 'Identity', title: 'Visual Language Systems', sub: 'Coherent design at scale',
      specs: [['Scope','System · Guidelines'],['Tools','Figma · Illustrator'],['Year','2022 – 2024'],['Mode','Freelance']],
      tags: ['System','Guidelines','Color'],
      bg: 'images/photo/Cajon del Maipo.webp'
    },
    {
      num: '02', cat: 'Identity', title: 'Brand Tone & Voice', sub: 'Language as design material',
      specs: [['Scope','Strategy · Copy · Visual'],['Tools','Figma'],['Year','2023'],['Mode','Studio']],
      tags: ['Strategy','Tone','Messaging'],
      bg: 'images/photo/Wandering Fox Street photo.webp'
    }
  ],
  motion: [
    {
      num: '01', cat: 'Motion', title: 'Animation & Moving Image', sub: 'Brand animation & interaction',
      specs: [['Scope','Animation · Interaction'],['Tools','After Effects · CSS'],['Year','2021 – 2024'],['Mode','Freelance']],
      tags: ['Animation','Brand','UI Motion'],
      bg: 'images/photo/Dali Desert.webp'
    },
    {
      num: '02', cat: 'Motion', title: 'Intro Sequences', sub: 'Title animation for broadcast',
      specs: [['Scope','Motion · Compositing'],['Tools','After Effects · Cinema 4D'],['Year','2022'],['Mode','Studio']],
      tags: ['Broadcast','Compositing','3D'],
      bg: 'images/photo/Laguna Azul Chile.webp'
    },
    {
      num: '03', cat: 'Motion', title: 'UI Micro-interactions', sub: 'Delightful product animation',
      specs: [['Scope','UI · CSS · JS'],['Tools','Figma · CSS'],['Year','2023 – 2024'],['Mode','Freelance']],
      tags: ['UI','CSS','Micro'],
      bg: 'images/photo/Laguna Blanca Andes Bolivianos.webp'
    }
  ]
};

class ArtWorksPanel {
    constructor() {
        this.panel    = document.querySelector('#art-direction .ad-works-panel');
        if (!this.panel) return;

        this.table         = this.panel.querySelector('.ad-works-table');
        this.discName      = this.panel.querySelector('.ad-works-disc-name');
        this.exploreCard   = document.querySelector('#art-direction .ad-explore-card');
        this.section       = document.getElementById('art-direction');
this.listItems     = [...document.querySelectorAll('#art-direction .ad-list-items li[data-discipline]')];

        this.activeDiscipline = null;
        this._transitioning   = false;

        this.init();
    }

    init() {
        this.listItems.forEach(li => {
            li.addEventListener('click', () => {
                this._dismissIntro();
                this.selectDiscipline(li.dataset.discipline);
            });
        });

        // Show intro card; pre-populate branding data silently so first click is instant
        if (this.section) this.section.classList.add('ad-intro-active');
        this.panel.classList.add('ad-works-ready');
        this._initModal();
        this.selectDiscipline('branding', true);
    }

    _dismissIntro() {
        if (this.section) this.section.classList.remove('ad-intro-active');
    }

    // ── Discipline selection ──────────────────────────────────────────────────

    selectDiscipline(key, immediate = false) {
        if (this._transitioning || key === this.activeDiscipline) return;
        if (!WORKS_DATA[key]) return;

        this._transitioning   = true;
        this.activeDiscipline = key;

this.listItems.forEach(li =>
            li.classList.toggle('is-active', li.dataset.discipline === key)
        );

        const activeSpan = this.listItems
            .find(li => li.dataset.discipline === key)
            ?.querySelector('.ad-text-link');

        const label = `· ${key.charAt(0).toUpperCase() + key.slice(1)} ·`;

        if (immediate) {
            this._renderRows(key);
            this._animateRowsIn();
            if (this.discName) this.discName.textContent = label;
            this._showExploreCard(true);
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
        this._showExploreCard();
    }

    _showExploreCard(immediate = false) {
        if (!this.exploreCard) return;
        if (this.section?.classList.contains('ad-intro-active')) return;
        if (immediate) {
            this.exploreCard.classList.add('is-visible');
            return;
        }
        this.exploreCard.classList.remove('is-visible');
        setTimeout(() => this.exploreCard.classList.add('is-visible'), 200);
    }

    // ── Scramble animation ────────────────────────────────────────────────────

    _scrambleText(el, onDone, overrideTarget) {
        if (!el) { onDone?.(); return; }
        const CHARS     = '!<>-_\\/[]{}—=+*^?#∆◊§øΩ†‡';
        const FRAME_MS  = 38;
        const finalText = overrideTarget || el.getAttribute('data-content') || el.textContent;
        const chars     = [...finalText];
        const n         = chars.length;
        const resolveAt = i => i * FRAME_MS;
        const maxResolve = resolveAt(n - 1);
        let elapsed = 0;
        const tick = () => {
            let out = '';
            for (let i = 0; i < n; i++) {
                out += elapsed >= resolveAt(i)
                    ? chars[i]
                    : CHARS[Math.floor(Math.random() * CHARS.length)];
            }
            el.textContent = out;
            elapsed += FRAME_MS;
            if (elapsed <= maxResolve + FRAME_MS) {
                setTimeout(tick, FRAME_MS);
            } else {
                el.textContent = finalText;
                onDone?.();
            }
        };
        tick();
    }

    // ── Row rendering ─────────────────────────────────────────────────────────

    _renderRows(key) {
        const works = WORKS_DATA[key];
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
                const titleEl = row.querySelector('.ad-work-title');
                if (titleEl) this._scrambleText(titleEl);
            });
        });
    }

    _animateRowsIn() {
        const rows = [...this.table.querySelectorAll('.ad-work-item')];
        if (!rows.length) { this._transitioning = false; return; }

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

    // ── Modal ─────────────────────────────────────────────────────────────────

    _initModal() {
        this.modal     = document.querySelector('#art-direction .ad-project-modal');
        if (!this.modal) return;

        this.modalBg    = this.modal.querySelector('.ad-pm-bg');
        this.modalNum   = this.modal.querySelector('.ad-pm-num');
        this.modalCat   = this.modal.querySelector('.ad-pm-cat');
        this.modalTitle = this.modal.querySelector('.ad-pm-title');
        this.modalSub   = this.modal.querySelector('.ad-pm-sub');
        this.modalSpecs = this.modal.querySelector('.ad-pm-specs');
        this.modalTags  = this.modal.querySelector('.ad-pm-tags');
        this.modalClose = this.modal.querySelector('.ad-pm-close');
        this._triggerEl = null;

        this.modalClose.addEventListener('click', () => this._closeModal());

        this.modal.addEventListener('click', e => {
            if (e.target === this.modal || e.target.classList.contains('ad-pm-backdrop')) {
                this._closeModal();
            }
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
    }

    _openModal(work) {
        if (!this.modal) return;

        this._triggerEl = document.activeElement;

        if (this.modalBg) {
            this.modalBg.style.backgroundImage = work.bg ? `url('${work.bg}')` : 'none';
        }

        this.modalNum.textContent   = work.num;
        this.modalCat.textContent   = `· ${work.cat.toUpperCase()} ·`;
        this.modalTitle.textContent = work.title;
        this.modalSub.textContent   = work.sub;

        this.modalSpecs.innerHTML = work.specs.map(([k, v]) => `
            <div class="ad-pm-spec-row">
                <span class="ad-pm-spec-key">${k}</span>
                <span class="ad-pm-spec-val">${v}</span>
            </div>`).join('');

        this.modalTags.innerHTML = work.tags.map(t => `
            <span class="ad-pm-tag"><span class="ad-pm-dot"></span>${t}</span>`).join('');

        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => this.modalClose.focus());
    }

    _closeModal() {
        if (!this.modal) return;
        this.modal.classList.remove('is-open');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this._triggerEl?.focus();
        this._triggerEl = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ArtWorksPanel();
});
