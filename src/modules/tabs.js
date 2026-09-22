import { $, $$ } from '../lib/dom.js';

/** Upload / Track segmented control (mobile). Both panes show side by side on desktop. */
export function initTabs() {
  const seg = $('.seg');
  if (!seg) return;
  const tabs = { upload: $('#tabUpload'), track: $('#tabTrack') };
  const panes = { upload: $('#paneUpload'), track: $('#paneTrack') };

  const select = (which) => {
    seg.classList.toggle('track', which === 'track');
    for (const key of Object.keys(tabs)) {
      const on = key === which;
      tabs[key].classList.toggle('active', on);
      tabs[key].setAttribute('aria-selected', String(on));
      panes[key].classList.toggle('is-hidden', !on);
      if (on) {
        panes[key].classList.remove('pane-in');
        void panes[key].offsetWidth;
        panes[key].classList.add('pane-in');
      }
    }
  };

  tabs.upload.addEventListener('click', () => select('upload'));
  tabs.track.addEventListener('click', () => select('track'));
  $$('[data-tab]').forEach((link) => link.addEventListener('click', () => select(link.dataset.tab)));
}
