import { $ } from '../lib/dom.js';
import { setKey } from '../lib/i18n.js';

/** "View sample prescription" disclosure. */
export function initSample() {
  const toggle = $('#sampleToggle');
  const sample = $('#sample');
  if (!toggle || !sample) return;
  toggle.addEventListener('click', () => {
    const open = sample.classList.toggle('show');
    toggle.setAttribute('aria-expanded', String(open));
    setKey(toggle, open ? 'req_hide_sample' : 'req_view_sample');
  });
}
