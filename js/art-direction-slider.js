/* ── Art Direction — discipline selector + accordion slider ──────────────────
   Data-driven: WORKS_DATA is the source of truth.
   DOM slides are always generated from it — never authored in HTML.
   ─────────────────────────────────────────────────────────────────────────── */

const WORKS_DATA = {
  branding: [
    {
      num: '01', cat: 'Branding', title: 'Brand Identity Systems', sub: 'From strategy to production',
      specs: [['Scope','Logo · System · Guidelines'],['Tools','Figma · Illustrator'],['Year','2021 – 2024'],['Mode','Freelance · Studio']],
      tags: ['Multi-brand','Identity','Print'],
      bg: 'images/photo/Petra.jpg'
    },
    {
      num: '02', cat: 'Branding', title: 'Retail Brand Refresh', sub: 'Visual repositioning at scale',
      specs: [['Scope','Identity · Packaging'],['Tools','Illustrator · InDesign'],['Year','2022'],['Mode','Agency']],
      tags: ['Packaging','Retail','System'],
      bg: 'images/photo/Kotor Montenegro.jpg'
    },
    {
      num: '03', cat: 'Branding', title: 'Startup Visual Language', sub: 'Zero to brand from scratch',
      specs: [['Scope','Logo · Motion · Web'],['Tools','Figma · After Effects'],['Year','2023'],['Mode','Freelance']],
      tags: ['Startup','Motion','Guidelines'],
      bg: 'images/photo/Sevilla.jpg'
    },
    {
      num: '04', cat: 'Branding', title: 'Heritage Rebranding', sub: 'Tradition meets modernity',
      specs: [['Scope','Logo · Print · Digital'],['Tools','Illustrator · Figma'],['Year','2024'],['Mode','Studio']],
      tags: ['Heritage','Print','Identity'],
      bg: 'images/photo/Goreme.jpg'
    }
  ],
  web: [
    {
      num: '01', cat: 'Web', title: 'Digital Product Design', sub: 'UX direction & interface',
      specs: [['Scope','UX · UI · Design Systems'],['Tools','Figma · CSS'],['Year','2020 – 2024'],['Mode','Freelance · Agency']],
      tags: ['UX','Design Systems','Frontend'],
      bg: 'images/photo/Istanbul ships.jpg'
    },
    {
      num: '02', cat: 'Web', title: 'E-Commerce Platform', sub: 'Conversion-driven UX',
      specs: [['Scope','UX · Research · UI'],['Tools','Figma · Framer'],['Year','2022 – 2023'],['Mode','Agency']],
      tags: ['E-Commerce','Research','UI'],
      bg: 'images/photo/London Bridge.jpg'
    },
    {
      num: '03', cat: 'Web', title: 'SaaS Dashboard', sub: 'Complex data made simple',
      specs: [['Scope','UX · Data Viz · Frontend'],['Tools','Figma · React'],['Year','2023 – 2024'],['Mode','Freelance']],
      tags: ['SaaS','Data','Dashboard'],
      bg: 'images/photo/Rovinj Croatia.jpg'
    }
  ],
  editorial: [
    {
      num: '01', cat: 'Editorial', title: 'Print & Layout Direction', sub: 'Publication & visual systems',
      specs: [['Scope','Layout · Typography'],['Tools','InDesign · Illustrator'],['Year','2019 – 2023'],['Mode','Studio · Client']],
      tags: ['Print','Typography','Layout'],
      bg: 'images/photo/Dubrovnik.jpg'
    },
    {
      num: '02', cat: 'Editorial', title: 'Annual Report Design', sub: 'Data storytelling through layout',
      specs: [['Scope','Print · Infographic'],['Tools','InDesign · Figma'],['Year','2021'],['Mode','Client']],
      tags: ['Annual Report','Infographics','Data'],
      bg: 'images/photo/Ojo Sevillano.jpg'
    },
    {
      num: '03', cat: 'Editorial', title: 'Cultural Magazine', sub: 'Six-issue visual identity',
      specs: [['Scope','Art Direction · Layout'],['Tools','InDesign · Photoshop'],['Year','2020 – 2021'],['Mode','Studio']],
      tags: ['Magazine','Culture','Series'],
      bg: 'images/photo/Streets of Istanbul.jpg'
    },
    {
      num: '04', cat: 'Editorial', title: 'Book Cover Series', sub: 'Narrative through typography',
      specs: [['Scope','Cover · Typography'],['Tools','Illustrator · Photoshop'],['Year','2022'],['Mode','Freelance']],
      tags: ['Book','Series','Typography'],
      bg: 'images/photo/Old tombs.jpg'
    },
    {
      num: '05', cat: 'Editorial', title: 'Corporate Brochure', sub: 'Brand voice in print',
      specs: [['Scope','Layout · Print'],['Tools','InDesign'],['Year','2023'],['Mode','Agency']],
      tags: ['Corporate','Print','Brand'],
      bg: 'images/photo/Perast.jpg'
    }
  ],
  identity: [
    {
      num: '01', cat: 'Identity', title: 'Visual Language Systems', sub: 'Coherent design at scale',
      specs: [['Scope','System · Guidelines'],['Tools','Figma · Illustrator'],['Year','2022 – 2024'],['Mode','Freelance']],
      tags: ['System','Guidelines','Color'],
      bg: 'images/photo/Cajon del Maipo.jpg'
    },
    {
      num: '02', cat: 'Identity', title: 'Brand Tone & Voice', sub: 'Language as design material',
      specs: [['Scope','Strategy · Copy · Visual'],['Tools','Figma'],['Year','2023'],['Mode','Studio']],
      tags: ['Strategy','Tone','Messaging'],
      bg: 'images/photo/Wandering Fox Street photo.jpg'
    }
  ],
  motion: [
    {
      num: '01', cat: 'Motion', title: 'Animation & Moving Image', sub: 'Brand animation & interaction',
      specs: [['Scope','Animation · Interaction'],['Tools','After Effects · CSS'],['Year','2021 – 2024'],['Mode','Freelance']],
      tags: ['Animation','Brand','UI Motion'],
      bg: 'images/photo/Dali Desert.jpg'
    },
    {
      num: '02', cat: 'Motion', title: 'Intro Sequences', sub: 'Title animation for broadcast',
      specs: [['Scope','Motion · Compositing'],['Tools','After Effects · Cinema 4D'],['Year','2022'],['Mode','Studio']],
      tags: ['Broadcast','Compositing','3D'],
      bg: 'images/photo/Laguna Azul Chile.jpg'
    },
    {
      num: '03', cat: 'Motion', title: 'UI Micro-interactions', sub: 'Delightful product animation',
      specs: [['Scope','UI · CSS · JS'],['Tools','Figma · CSS'],['Year','2023 – 2024'],['Mode','Freelance']],
      tags: ['UI','CSS','Micro'],
      bg: 'images/photo/Laguna Blanca Andes Bolivianos.jpg'
    }
  ]
};

class ArtAccordionSlider {
    constructor() {
        this.container  = document.querySelector('#art-direction .ad-accordion');
        if (!this.container) return;

        this.track      = this.container.querySelector('.ad-acc-track');
        this.prevBtn    = this.container.querySelector('.ad-acc-prev');
        this.nextBtn    = this.container.querySelector('.ad-acc-next');
        this.section    = document.getElementById('art-direction');
        this.listItems  = [...document.querySelectorAll('#art-direction .ad-list-items li[data-discipline]')];

        this.current          = -1;
        this.activeDiscipline = null;
        this._transitioning   = false;

        this._onKey = this._onKey.bind(this);
        this.init();
    }

    init() {
        this.listItems.forEach(li => {
            const span = li.querySelector('.ad-text-link');

            li.addEventListener('click', () => this.selectDiscipline(li.dataset.discipline));

            if (span) {
                span.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.selectDiscipline(li.dataset.discipline);
                    }
                });
            }
        });

        this.prevBtn.addEventListener('click', () => this.previous());
        this.nextBtn.addEventListener('click', () => this.next());
        document.addEventListener('keydown', this._onKey);

        this.selectDiscipline('branding', true);
    }

    selectDiscipline(key, immediate = false) {
        if (this._transitioning || key === this.activeDiscipline) return;
        if (!WORKS_DATA[key]) return;

        this._transitioning   = true;
        this.activeDiscipline = key;
        this.current          = -1;

        this.listItems.forEach(li => li.classList.toggle('is-active', li.dataset.discipline === key));

        const activeSpan = this.listItems.find(li => li.dataset.discipline === key)
                               ?.querySelector('.ad-text-link');

        if (immediate) {
            this._renderSlides(key);
            this._animateIn();
            return;
        }

        // Two-flag gate: slides must be in DOM AND scramble must be done before _animateIn fires
        let slidesReady  = false;
        let scrambleDone = false;

        const tryAnimate = () => {
            if (!slidesReady || !scrambleDone) return;
            this.track.style.opacity = '';   // CSS transition on .ad-acc-track fades it back in
            this._animateIn();
        };

        // 1. Track fades out → swap DOM → hide slides invisibly → hold
        this.track.classList.add('is-leaving');
        setTimeout(() => {
            this._renderSlides(key);
            this.slides.forEach(s => { s.style.clipPath = 'inset(0 100% 0 0)'; s.style.transition = 'none'; });
            this.track.classList.remove('is-leaving');
            this.track.style.opacity = '0';
            slidesReady = true;
            tryAnimate();
        }, 160);

        // 2. Scramble the active list item — slides reveal only after this resolves
        this._scrambleText(activeSpan, () => {
            scrambleDone = true;
            tryAnimate();
        });
    }

    _scrambleText(el, onDone) {
        if (!el) { onDone?.(); return; }

        const CHARS     = '!<>-_\\/[]{}—=+*^?#∆◊§øΩ†‡';
        const STEP_MS   = 38;
        const FRAME_MS  = 38;
        const finalText = el.getAttribute('data-content') || el.textContent;
        const chars     = [...finalText];
        const n         = chars.length;
        const resolveAt = i => i * STEP_MS;
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

    _renderSlides(key) {
        const works = WORKS_DATA[key];
        this.track.innerHTML = works.map(work => `
            <div class="ad-acc-slide" data-discipline="${key}" style="background-image: url('${work.bg}')">
                <div class="ad-acc-content">
                    <div class="ad-acc-num">${work.num}</div>
                    <div class="ad-acc-cat">${work.cat}</div>
                    <div class="ad-acc-title">${work.title}</div>
                    <div class="ad-acc-sub">${work.sub}</div>
                    <div class="ad-acc-specs">
                        ${work.specs.map(([k, v]) => `<div class="ad-acc-row"><span class="ad-acc-key">${k}:</span><span class="ad-acc-val">${v}</span></div>`).join('')}
                    </div>
                    <div class="ad-acc-tags">
                        ${work.tags.map(t => `<span class="ad-acc-tag"><span class="ad-acc-dot"></span>${t}</span>`).join('')}
                    </div>
                </div>
                <div class="ad-acc-open" aria-label="Expand ${work.cat}" role="button" tabindex="0"></div>
            </div>
        `).join('');

        this.slides.forEach((slide, i) => {
            slide.addEventListener('click', () => this.setActive(i));
            const openBtn = slide.querySelector('.ad-acc-open');
            if (openBtn) openBtn.addEventListener('click', e => { e.stopPropagation(); this.setActive(i); });
        });
    }

    _animateIn() {
        const slides = this.slides;
        if (!slides.length) { this._transitioning = false; return; }

        // Initial hidden state is already set in selectDiscipline before the scramble.
        // Force reflow so the browser registers clip-path before we start animating.
        void this.track.offsetWidth;

        slides.forEach((s, i) => {
            setTimeout(() => {
                s.style.transition = 'clip-path 0.32s ease-out, flex 0.8s cubic-bezier(0.4,0,0.2,1), filter 0.6s ease';
                s.style.clipPath   = 'inset(0 0% 0 0)';

                if (i === slides.length - 1) {
                    setTimeout(() => {
                        slides.forEach(sl => { sl.style.transition = ''; sl.style.clipPath = ''; });
                        this._transitioning = false;
                    }, 360);
                }
            }, i * 65);
        });
    }

    get slides() {
        return [...this.track.querySelectorAll('.ad-acc-slide')];
    }

    setActive(index) {
        const slides = this.slides;
        if (this.current === index) {
            slides[index].classList.remove('active');
            this.current = -1;
        } else {
            slides.forEach(s => s.classList.remove('active'));
            slides[index].classList.add('active');
            this.current = index;
        }
    }

    next() {
        const slides = this.slides;
        const next   = this.current === -1 ? 0 : (this.current + 1) % slides.length;
        this.setActive(next);
    }

    previous() {
        const slides = this.slides;
        const prev   = this.current === -1
            ? slides.length - 1
            : (this.current - 1 + slides.length) % slides.length;
        this.setActive(prev);
    }

    _onKey(e) {
        if (!this._sectionVisible()) return;
        if (e.key === 'ArrowLeft')  this.previous();
        if (e.key === 'ArrowRight') this.next();
    }

    _sectionVisible() {
        const r = this.section.getBoundingClientRect();
        return r.top < window.innerHeight * 0.8 && r.bottom > window.innerHeight * 0.2;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ArtAccordionSlider();
});
