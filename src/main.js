import './styles/main.css';

import { initI18n } from './lib/i18n.js';
import { initSheets } from './modules/sheets.js';
import { initHeader } from './modules/header.js';
import { initBottomNav } from './modules/bottomNav.js';
import { initReveal, initCounters } from './modules/reveal.js';
import { initRipple } from './modules/effects.js';
import { initSearch } from './modules/search.js';
import { initTabs } from './modules/tabs.js';
import { initSample } from './modules/sample.js';
import { initUpload } from './modules/upload.js';
import { initTrack } from './modules/track.js';
import { initBooking } from './modules/booking.js';
import { initNewsletter } from './modules/newsletter.js';
import { initSignin } from './modules/signin.js';
import { initCarousel } from './modules/carousel.js';

// Enables JS-only styles (scroll reveals). Without JS, all content stays visible.
document.documentElement.classList.add('js');

// Language first, so a returning Hindi visitor sees Hindi before anything animates.
initI18n();

initSheets();
initHeader();
initBottomNav();
initReveal();
initCounters();
initRipple();
initSearch();
initTabs();
initSample();
initUpload();
initTrack();
initBooking();
initNewsletter();
initSignin();
initCarousel();
