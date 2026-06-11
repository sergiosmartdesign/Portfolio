/* TEMP-PROBE — delete after layout verification */
window.addEventListener('load', () => setTimeout(() => {
  const nav = document.querySelector('.ct-links--mini');
  const link = nav ? [...nav.querySelectorAll('.ct-link')] : [];
  const cs = el => getComputedStyle(el);
  const w = el => Math.round(el.getBoundingClientRect().width);
  document.body.setAttribute('data-probe', JSON.stringify({
    vw: innerWidth,
    navW: nav && w(nav), navH: nav && Math.round(nav.getBoundingClientRect().height),
    navDisplay: nav && cs(nav).display, navWrap: nav && cs(nav).flexWrap, navMaxW: nav && cs(nav).maxWidth,
    linkW: link.map(w), linkFs: link.map(l => cs(l).fontSize),
  }));
}, 600));
