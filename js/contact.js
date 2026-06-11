/* ─── Contact Section — Synthwave Scene ───────────────────────────────────
   Boot sequence (GSAP timeline, fires once on first intersection):
     stars → mountains → sun → ground → cockpit → content

   Ship cockpit:
     images/ship-cockpit-color.svg is fetch-injected inline into .ct-cockpit
     so internal groups (e.g. the glow-light blink group) can be animated
     with CSS. The windshield is transparent — the scene shows through it.
   ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  const section   = document.getElementById('contact');
  const starsEl   = document.getElementById('ct-stars');
  const cockpitEl = section ? section.querySelector('.ct-cockpit') : null;

  if (!section || !starsEl) return;

  section.classList.add('ct-scene--boot');

  /* ── Star colors ──────────────────────────────────────────────────────── */
  const COLORS = ['#E9D8A6', '#E9D8A6', '#E9D8A6', '#94D2BD'];

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function makeShadows(count, fieldW, fieldH) {
    const parts = [];
    for (let i = 0; i < count; i++) {
      parts.push(`${randInt(0, fieldW)}px ${randInt(0, fieldH)}px ${COLORS[randInt(0, COLORS.length)]}`);
    }
    return parts.join(', ');
  }

  function buildStars() {
    const W = Math.max(window.innerWidth * 1.2, 1600);
    const H = 2000;
    let styleTag = document.getElementById('ct-stars-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'ct-stars-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      .ct-s1, .ct-s1::after { box-shadow: ${makeShadows(700, W, H)}; }
      .ct-s2, .ct-s2::after { box-shadow: ${makeShadows(200, W, H)}; }
      .ct-s3, .ct-s3::after { box-shadow: ${makeShadows(100, W, H)}; }
    `;
    starsEl.innerHTML = '';
    const frag = document.createDocumentFragment();
    ['ct-s1', 'ct-s2', 'ct-s3'].forEach(cls => {
      const el = document.createElement('div');
      el.className = cls;
      frag.appendChild(el);
    });
    starsEl.appendChild(frag);
  }

  /* ════════════════════════════════════════════════════════════════════════
     SHIP COCKPIT — fetch-inject the SVG so internal groups are animatable
     ════════════════════════════════════════════════════════════════════════ */

  let cockpitSvg = null;

  /* The artwork is 3:2. Near-landscape viewports stretch to fill so the
     frame edges always meet the screen edges; portrait viewports scale to
     cover anchored to the bottom so the dashboard stays visible. */
  function updateCockpitAspect() {
    if (!cockpitSvg) return;
    const ar = section.offsetWidth / Math.max(section.offsetHeight, 1);
    cockpitSvg.setAttribute(
      'preserveAspectRatio',
      ar >= 1.05 ? 'none' : 'xMidYMax slice'
    );
  }

  function injectCockpit() {
    if (!cockpitEl) return;
    fetch('images/ship-cockpit-color.svg')
      .then(res => res.text())
      .then(text => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = doc.documentElement;
        if (svg.nodeName !== 'svg') throw new Error('bad SVG payload');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        cockpitEl.appendChild(svg);
        cockpitSvg = svg;
        updateCockpitAspect();
      })
      .catch(err => console.error('[contact] cockpit SVG failed to load:', err));
  }

  injectCockpit();

  /* DNA art inside the capsule next to the form — injected inline so CSS can
     recolor the (black) source paths to the shell's light blue. */
  function injectCapsuleDna() {
    const holder = section.querySelector('.ct-capsule-dna');
    if (!holder) return;
    fetch('images/roptando%201.svg')
      .then(res => res.text())
      .then(text => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = doc.documentElement;
        if (svg.nodeName !== 'svg') throw new Error('bad SVG payload');
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        svg.removeAttribute('style');
        // The numbered top-level groups (1, 2, 3, 3.5, 4 … 8) are rotation
        // frames in document order — tag them so CSS can flipbook-cycle them.
        const frames = Array.from(svg.children).filter(n => n.nodeName === 'g');
        frames.forEach((g, i) => {
          g.classList.add('ct-dna-frame');
          if (i === 0) g.classList.add('ct-dna-first');
          g.style.setProperty('--dna-frame', i);
        });
        svg.style.setProperty('--ct-dna-count', frames.length);
        // Strip ids — Illustrator exports reuse Layer_1 etc. across files
        svg.removeAttribute('id');
        svg.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
        holder.appendChild(svg);
      })
      .catch(err => console.error('[contact] capsule DNA failed to load:', err));
  }

  injectCapsuleDna();

  /* ════════════════════════════════════════════════════════════════════════
     BOOT SEQUENCE — GSAP timeline
     ════════════════════════════════════════════════════════════════════════ */

  let sceneBoot = false;
  let resizeTimer;

  function glitchIn(tl, target, position, opts = {}) {
    const { withY = false, withScaleY = false } = opts;
    const base = withY      ? { opacity: 0, y: '28%' }
               : withScaleY ? { opacity: 0, scaleY: 0.04, scaleX: 1.08 }
               :               { opacity: 0 };

    tl.set(target, base, position);

    if (withY) {
      tl.to(target, { y: 0, opacity: 0.9, duration: 0.14, ease: 'power2.out' });
      tl.to(target, { opacity: 0.05, duration: 0.07 });
    } else if (withScaleY) {
      tl.to(target, { scaleY: 0.08, scaleX: 1.05, opacity: 0.9, duration: 0.10 });
      tl.to(target, { opacity: 0.1,  duration: 0.06 });
      tl.to(target, { scaleY: 0.42, scaleX: 1, opacity: 1, duration: 0.14 });
      tl.to(target, { opacity: 0.45, duration: 0.07 });
      tl.to(target, { scaleY: 0.78, opacity: 1, duration: 0.12 });
      tl.to(target, { opacity: 0.8,  duration: 0.05 });
      tl.to(target, { scaleY: 1,    opacity: 1, duration: 0.10 });
      return;
    } else {
      tl.to(target, { opacity: 0.88, duration: 0.09 });
      tl.to(target, { opacity: 0.04, duration: 0.06 });
    }
    tl.to(target, { opacity: 1,    duration: 0.10 });
    tl.to(target, { opacity: 0.35, duration: 0.06 });
    tl.to(target, { opacity: 1,    duration: 0.09 });
    tl.to(target, { opacity: 0.65, duration: 0.05 });
    tl.to(target, { opacity: 1,    duration: 0.08 });
  }

  function bootScene() {
    if (sceneBoot || typeof gsap === 'undefined') return;
    sceneBoot = true;

    buildStars();

    gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      glitchIn(tl, '#ct-stars', 0);
      glitchIn(tl, ['.ct-horizon-glow', '.ct-mountains--far'], '+=0.08', { withY: true });
      glitchIn(tl, '.ct-mountains--mid',  '+=0.06', { withY: true });
      glitchIn(tl, '.ct-mountains--near', '+=0.05', { withY: true });
      glitchIn(tl, '.ct-sun',   '+=0.08', { withScaleY: true });
      glitchIn(tl, '.ct-ground','+=0.08', { withY: true });
      glitchIn(tl, '.ct-cockpit', '+=0.10');

      tl.fromTo('.ct-content',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
        '+=0.08'
      );

    }, section);
  }

  /* ════════════════════════════════════════════════════════════════════════
     INTERSECTION OBSERVER
     ════════════════════════════════════════════════════════════════════════ */

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          section.classList.remove('ct-paused');
          if (!sceneBoot) bootScene();
        } else {
          section.classList.add('ct-paused');
        }
      });
    },
    { threshold: 0.05 }
  );

  observer.observe(section);

  window.addEventListener('resize', () => {
    updateCockpitAspect();
    if (!sceneBoot) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildStars, 250);
  });

  /* ════════════════════════════════════════════════════════════════════════
     CONTACT FORM — comms-console uplink
     Transport is mocked for now: sendTransmission() resolves after a delay
     and logs the payload. Swap its body for a real endpoint when ready.
     ════════════════════════════════════════════════════════════════════════ */

  function initContactForm() {
    const form      = document.getElementById('ct-form');
    if (!form) return;

    const logText   = form.querySelector('.ct-log-text');
    const srStatus  = document.getElementById('ct-sr-status');
    const sendBtn   = form.querySelector('.ct-send');
    const successEl = document.getElementById('ct-form-success');
    const resetBtn  = form.querySelector('.ct-success-reset');
    const honeypot  = form.querySelector('.ct-hp');

    const fields = [
      { el: document.getElementById('ct-f-name'),  empty: 'ERR: name is required' },
      { el: document.getElementById('ct-f-email'), empty: 'ERR: email is required', invalid: 'ERR: invalid email address' },
      { el: document.getElementById('ct-f-msg'),   empty: 'ERR: message is empty' },
    ];
    if (!sendBtn || !successEl || fields.some(f => !f.el)) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wait = ms => new Promise(r => setTimeout(r, ms));

    /* MOCK TRANSPORT — replace with e.g.
       return fetch('/api/contact', { method: 'POST', body: JSON.stringify(payload), … })
       once a mail backend exists. */
    function sendTransmission(payload) {
      console.info('[contact] mock transmission:', payload);
      return wait(1500);
    }

    function announce(msg) {
      if (srStatus) srStatus.textContent = msg;
    }

    /* Types into the decorative log; instant under reduced motion. */
    let typeToken = 0;
    function typeLog(text, speed = 16) {
      const token = ++typeToken;
      if (!logText) return Promise.resolve();
      if (reducedMotion.matches) {
        logText.textContent = text;
        return Promise.resolve();
      }
      logText.textContent = '';
      return new Promise(resolve => {
        let i = 0;
        (function tick() {
          if (token !== typeToken) return resolve();
          logText.textContent = text.slice(0, ++i);
          if (i < text.length) setTimeout(tick, speed);
          else resolve();
        })();
      });
    }

    function setFieldError(field, msg) {
      const wrap = field.el.closest('.ct-field');
      if (wrap) {
        wrap.classList.toggle('is-invalid', !!msg);
        const err = wrap.querySelector('.ct-field-err');
        if (err) err.textContent = msg || '';
      }
      field.el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }

    function validate() {
      let firstBad = null;
      fields.forEach(f => {
        let msg = '';
        if (!f.el.value.trim())          msg = f.empty;
        else if (!f.el.checkValidity())  msg = f.invalid || f.empty;
        setFieldError(f, msg);
        if (msg && !firstBad) firstBad = f.el;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    fields.forEach(f => {
      f.el.addEventListener('input', () => setFieldError(f, ''));
    });

    let sending = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;
      if (honeypot && honeypot.value) return;   // bot — drop silently

      if (!validate()) {
        typeLog('> ERROR :: CHECK FIELDS');
        announce('Some fields need attention.');
        return;
      }

      sending = true;
      form.classList.add('is-sending');
      sendBtn.disabled = true;
      announce('Sending message…');

      const payload = {
        name:    fields[0].el.value.trim(),
        email:   fields[1].el.value.trim(),
        message: fields[2].el.value.trim(),
        sentAt:  new Date().toISOString(),
      };

      try {
        await typeLog('> CONNECTING…');
        await wait(reducedMotion.matches ? 0 : 250);
        await typeLog('> SENDING MESSAGE…');
        await sendTransmission(payload);
        await typeLog('> MESSAGE SENT ✓');

        form.classList.add('is-sent');
        successEl.hidden = false;
        announce('Message sent. Expect a reply within 24 hours.');
        const title = successEl.querySelector('.ct-success-title');
        if (title) title.focus();
      } catch (err) {
        console.error('[contact] transmission failed:', err);
        await typeLog('> SEND FAILED — RETRY OR USE EMAIL LINK');
        announce('Sending failed. Please retry or use the email link below.');
      } finally {
        sending = false;
        form.classList.remove('is-sending');
        sendBtn.disabled = form.classList.contains('is-sent');
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        fields.forEach(f => setFieldError(f, ''));
        form.classList.remove('is-sent');
        successEl.hidden = true;
        sendBtn.disabled = false;
        typeLog('> READY');
        announce('');
        fields[0].el.focus();
      });
    }
  }

  initContactForm();
})();
