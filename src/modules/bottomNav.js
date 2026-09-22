import { $, $$ } from '../lib/dom.js';

/** Highlights the section in view and slides an indicator under the active tab. */
export function initBottomNav() {
  const nav = $('.bottom-nav');
  if (!nav) return;
  const links = $$('a[data-nav]', nav);
  const indicator = $('.bn-indicator', nav);

  const moveIndicator = () => {
    const active = links.find((a) => a.classList.contains('active'));
    if (!active || !indicator) return;
    const navRect = nav.getBoundingClientRect();
    const r = active.getBoundingClientRect();
    indicator.style.transform = `translateX(${r.left - navRect.left + r.width / 2 - 14}px)`;
  };

  const setActive = (id) => {
    links.forEach((a) => a.classList.toggle('active', a.dataset.nav === id));
    moveIndicator();
  };

  links.forEach((a) => a.addEventListener('click', () => setActive(a.dataset.nav)));

  const spy = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
    { rootMargin: '-45% 0px -50% 0px' },
  );
  links.forEach((a) => {
    const section = document.getElementById(a.dataset.nav);
    if (section) spy.observe(section);
  });

  window.addEventListener('resize', moveIndicator, { passive: true });
  moveIndicator();
}
