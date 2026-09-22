import { $$, prefersReducedMotion } from '../lib/dom.js';

const STAGGER_MS = 70;
const DURATION_MS = 700;

/** Fade/slide sections in as they enter the viewport; groups stagger their children. */
export function initReveal() {
  const groups = $$('[data-reveal-group]');
  groups.forEach((group) =>
    [...group.children].forEach((child, i) => child.style.setProperty('--i', i)),
  );
  const targets = [...$$('[data-reveal]'), ...groups];

  const reveal = (el) => {
    el.classList.add('in');
    const count = el.hasAttribute('data-reveal-group') ? el.children.length : 1;
    // Once settled, drop the reveal hooks so hover transforms are no longer overridden.
    setTimeout(() => {
      el.removeAttribute('data-reveal');
      el.removeAttribute('data-reveal-group');
    }, DURATION_MS + count * STAGGER_MS);
  };

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    targets.forEach(reveal);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        reveal(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  targets.forEach((el) => io.observe(el));
}

const easeOutExpo = (x) => (x === 1 ? 1 : 1 - 2 ** (-10 * x));

/** Count numbers up from zero when they scroll into view. Markup keeps the final value. */
export function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length || prefersReducedMotion() || !('IntersectionObserver' in window)) return;

  const run = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';
    const start = performance.now();
    const duration = 1400;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * easeOutExpo(p)).toLocaleString('en-IN') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        run(entry.target);
      });
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => io.observe(el));
}
