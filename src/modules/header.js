import { $, $$, rafThrottle } from '../lib/dom.js';
import { setLang, getLang, onLangChange } from '../lib/i18n.js';
import { store, KEYS } from '../lib/storage.js';
import { isSheetOpen } from './sheets.js';

function initPromo() {
  const promo = $('#promo');
  if (!promo) return;
  if (store.get(KEYS.promoClosed)) {
    promo.hidden = true;
    return;
  }
  $('#promoClose').addEventListener('click', () => {
    const anim = promo.animate(
      [
        { height: `${promo.offsetHeight}px`, opacity: 1 },
        { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' },
      ],
      { duration: 300, easing: 'ease-in' },
    );
    anim.finished.finally(() => (promo.hidden = true));
    store.set(KEYS.promoClosed, '1');
  });
}

function initLangToggle() {
  const toggle = $('#langToggle');
  const sync = (lang) => {
    toggle.classList.toggle('hi', lang === 'hi');
    $$('.lang-btn', toggle).forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  };
  $$('.lang-btn', toggle).forEach((btn) =>
    btn.addEventListener('click', () => {
      if (btn.dataset.lang !== getLang()) setLang(btn.dataset.lang, { animate: true });
    }),
  );
  onLangChange(sync);
  sync(getLang());
}

/** Shadow once scrolled, auto-hide on scroll-down (mobile), and a reading-progress bar. */
function initScrollChrome() {
  const header = $('.site-header');
  const progress = $('.scroll-progress');
  const mobile = window.matchMedia('(max-width: 999px)');
  let lastY = window.scrollY;

  const update = rafThrottle(() => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 10);
    if (!isSheetOpen() && mobile.matches) {
      if (y > lastY + 6 && y > 200) header.classList.add('hide');
      else if (y < lastY - 6 || y < 120) header.classList.remove('hide');
    } else {
      header.classList.remove('hide');
    }
    lastY = y;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
  });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('hide'));
  update();
}

export function initHeader() {
  initPromo();
  initLangToggle();
  initScrollChrome();
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
}
