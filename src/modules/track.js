import { $, $$ } from '../lib/dom.js';
import { t, onLangChange } from '../lib/i18n.js';
import { openWhatsApp } from '../lib/whatsapp.js';
import { SITE } from '../config/site.js';

const hash = (str, mod) => {
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % mod;
};

/** Simulated timeline — only rendered when features.demoTracking is on. */
function renderDemo(id) {
  const stage = hash(id, 4); // 0 confirmed · 1 packed · 2 out for delivery · 3 delivered
  $('#trackId').textContent = id;
  $$('#trackResult .step').forEach((el, i) => {
    el.classList.toggle('done', i < stage || stage === 3);
    el.classList.toggle('current', i === stage && stage !== 3);
  });
  $('#stepperFill').style.width = `${(stage / 3) * 75}%`;
  $('#trackEta').innerHTML = t(
    ['track_confirmed', 'track_packing', 'track_arriving', 'track_delivered'][stage],
  );
}

export function initTrack() {
  const form = $('#trackForm');
  if (!form) return;
  let lastId = null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = $('#trackInput').value.trim().toUpperCase();
    if (!id) return;

    if (!SITE.features.demoTracking) {
      openWhatsApp(`Hi Putul Medical, please share the status of my order ${id}.`);
      return;
    }

    lastId = id;
    const result = $('#trackResult');
    result.classList.remove('show');
    $('#stepperFill').style.width = '0';
    void result.offsetWidth;
    result.classList.add('show');
    requestAnimationFrame(() => renderDemo(id));
    $('#trackInput').blur();
  });

  onLangChange(() => lastId && renderDemo(lastId));
}
