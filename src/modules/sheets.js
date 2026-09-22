import { $, $$ } from '../lib/dom.js';

let current = null;
let lastFocus = null;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

const background = () =>
  $$('body > *:not(.sheet-backdrop):not(script):not(svg):not(.scroll-progress)');

export const isSheetOpen = () => current !== null;

export function openSheet(name) {
  const el = $(`[data-sheet="${name}"]`);
  if (!el) return;
  if (current && current !== el) closeSheet({ restoreFocus: false });
  if (!current) lastFocus = document.activeElement;

  el.classList.add('open');
  document.body.classList.add('locked');
  background().forEach((node) => (node.inert = true));
  current = el;

  setTimeout(() => {
    const target = el.querySelector('.step-view.active input:not([type="hidden"]), .sheet-close');
    target?.focus({ preventScroll: true });
  }, 320);
  document.dispatchEvent(new CustomEvent('sheet:open', { detail: name }));
}

export function closeSheet({ restoreFocus = true } = {}) {
  if (!current) return;
  const el = current;
  current = null;
  el.classList.remove('open');
  document.body.classList.remove('locked');
  background().forEach((node) => (node.inert = false));
  if (restoreFocus && lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  document.dispatchEvent(new CustomEvent('sheet:close', { detail: el.dataset.sheet }));
}

export function showStep(name, step) {
  const sheet = $(`[data-sheet="${name}"]`);
  if (!sheet) return;
  $$('.step-view', sheet).forEach((view) =>
    view.classList.toggle('active', view.dataset.step === step),
  );
  sheet.querySelector('.sheet').scrollTop = 0;
}

function trapFocus(e) {
  if (e.key !== 'Tab' || !current) return;
  const items = $$(FOCUSABLE, current).filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function enableSwipeToClose(sheet) {
  let startY = null;
  let dy = 0;
  sheet.addEventListener(
    'touchstart',
    (e) => {
      if (sheet.scrollTop > 0) return;
      startY = e.touches[0].clientY;
      dy = 0;
    },
    { passive: true },
  );
  sheet.addEventListener(
    'touchmove',
    (e) => {
      if (startY === null) return;
      dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        sheet.style.transition = 'none';
        sheet.style.transform = `translateY(${dy}px)`;
      }
    },
    { passive: true },
  );
  sheet.addEventListener('touchend', () => {
    if (startY === null) return;
    sheet.style.transition = '';
    sheet.style.transform = '';
    if (dy > 110) closeSheet();
    startY = null;
  });
}

export function initSheets() {
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      openSheet(opener.dataset.open);
      return;
    }
    const closer = e.target.closest('[data-close]');
    if (closer) {
      // Links (menu items) navigate after closing; don't yank focus back to the opener.
      closeSheet({ restoreFocus: closer.tagName !== 'A' });
      return;
    }
    if (e.target.classList.contains('sheet-backdrop')) closeSheet();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSheet();
    trapFocus(e);
  });

  $$('.sheet').forEach(enableSwipeToClose);
  $$('.menu-list li').forEach((li, i) => li.style.setProperty('--i', i));
}
