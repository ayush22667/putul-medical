import { $ } from '../lib/dom.js';
import { t } from '../lib/i18n.js';
import { store, KEYS } from '../lib/storage.js';
import { submitNetlifyForm, setLoading } from '../lib/forms.js';
import { openSheet, showStep, isSheetOpen } from './sheets.js';
import { confetti } from './effects.js';

const SCROLL_DEPTH = 0.55;
const FALLBACK_DELAY_MS = 40_000;

/** Offer shown once per visitor, after real engagement — never on arrival. */
export function initNewsletter() {
  const form = $('#nlForm');
  if (!form) return;
  const notice = $('#nlNotice');

  document.addEventListener('sheet:close', (e) => {
    if (e.detail === 'newsletter') store.set(KEYS.newsletterSeen, '1');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    notice.className = 'notice';
    setLoading(button, true);
    const ok = await submitNetlifyForm(form);
    setLoading(button, false);
    if (!ok) {
      notice.className = 'notice show err';
      notice.innerHTML = t('nl_failed');
      return;
    }
    store.set(KEYS.newsletterSeen, '1');
    showStep('newsletter', 'done');
    confetti($('[data-sheet="newsletter"] [data-step="done"] .check'));
  });

  if (store.get(KEYS.newsletterSeen)) return;

  let fired = false;
  const tryOpen = () => {
    if (fired || isSheetOpen()) return;
    fired = true;
    window.removeEventListener('scroll', onScroll);
    openSheet('newsletter');
  };
  const onScroll = () => {
    const depth = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
    if (depth > SCROLL_DEPTH) tryOpen();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  setTimeout(tryOpen, FALLBACK_DELAY_MS);
}
