import { $, $$, rafThrottle } from '../lib/dom.js';

/** Pagination dots for the swipeable value-prop cards on mobile. */
export function initCarousel() {
  const scroller = $('#vpScroller');
  const dots = $$('#vpDots span');
  if (!scroller || !dots.length) return;

  scroller.addEventListener(
    'scroll',
    rafThrottle(() => {
      const first = scroller.firstElementChild;
      if (!first) return;
      const step = first.getBoundingClientRect().width + 12;
      const index = Math.round(scroller.scrollLeft / step);
      dots.forEach((dot, i) => dot.classList.toggle('on', i === index));
    }),
    { passive: true },
  );
}
