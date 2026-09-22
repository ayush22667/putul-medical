import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import { $$ } from './dom.js';
import { store, KEYS } from './storage.js';

const DICTS = { en, hi };
const listeners = new Set();

let lang = store.get(KEYS.lang) === 'hi' ? 'hi' : 'en';

export const getLang = () => lang;

/** Translation as HTML (dictionary entries may contain <em>/<strong>). */
export function t(key) {
  const value = DICTS[lang][key] ?? DICTS.en[key];
  if (value == null) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing key "${key}"`);
    return key;
  }
  return value;
}

const decoder = document.createElement('template');
/** Translation as plain text — for textContent, attributes and WhatsApp messages. */
export function tText(key) {
  decoder.innerHTML = t(key);
  return decoder.content.textContent;
}

export function applyI18n(root = document) {
  // Dictionary values are first-party content; user input never flows through here.
  $$('[data-i18n]', root).forEach((el) => {
    el.innerHTML = t(el.dataset.i18n);
  });
  $$('[data-i18n-ph]', root).forEach((el) => {
    el.placeholder = tText(el.dataset.i18nPh);
  });
}

/** Swap an element to a different key and re-render it. */
export function setKey(el, key) {
  el.dataset.i18n = key;
  el.innerHTML = t(key);
}

export function setLang(next, { animate = false } = {}) {
  lang = next === 'hi' ? 'hi' : 'en';
  store.set(KEYS.lang, lang);
  document.documentElement.lang = lang;
  applyI18n();
  if (animate) {
    document.body.classList.remove('lang-swap');
    void document.body.offsetWidth; // restart the animation
    document.body.classList.add('lang-swap');
    setTimeout(() => document.body.classList.remove('lang-swap'), 450);
  }
  listeners.forEach((fn) => fn(lang));
}

export const onLangChange = (fn) => listeners.add(fn);

export function initI18n() {
  // English is baked into the HTML; only re-render when the visitor chose Hindi.
  if (lang !== 'en') setLang(lang);
}
