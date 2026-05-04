class ArtAccordionSlider {
    constructor() {
        this.container = document.querySelector('#art-direction .ad-accordion');
        if (!this.container) return;

        this.slides   = this.container.querySelectorAll('.ad-acc-slide');
        this.prevBtn  = this.container.querySelector('.ad-acc-prev');
        this.nextBtn  = this.container.querySelector('.ad-acc-next');
        this.section  = document.getElementById('art-direction');
        this.current  = -1;

        this._onKey = this._onKey.bind(this);
        this.init();
    }

    init() {
        this.slides.forEach((slide, i) => {
            slide.addEventListener('click', () => this.setActive(i));

            const openBtn = slide.querySelector('.ad-acc-open');
            if (openBtn) {
                openBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.setActive(i);
                });
            }
        });

        this.prevBtn.addEventListener('click', () => this.previous());
        this.nextBtn.addEventListener('click', () => this.next());

        document.addEventListener('keydown', this._onKey);
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

    setActive(index) {
        if (this.current === index) {
            this.slides[index].classList.remove('active');
            this.current = -1;
        } else {
            this.slides.forEach(s => s.classList.remove('active'));
            this.slides[index].classList.add('active');
            this.current = index;
        }
    }

    next() {
        const next = this.current === -1
            ? 0
            : (this.current + 1) % this.slides.length;
        this.setActive(next);
    }

    previous() {
        const prev = this.current === -1
            ? this.slides.length - 1
            : (this.current - 1 + this.slides.length) % this.slides.length;
        this.setActive(prev);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ArtAccordionSlider();
});
