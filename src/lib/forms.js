import { SITE } from '../config/site.js';
import { tText } from './i18n.js';

/**
 * Submit a form to Netlify Forms. Resolves true only when the submission was stored.
 * Any failure (feature off, non-Netlify host, offline, dev server) resolves false so the
 * caller can fall back to WhatsApp.
 */
export async function submitNetlifyForm(form) {
  if (!SITE.features.netlifyForms || import.meta.env.DEV) return false;
  try {
    const data = new FormData(form);
    const hasFile = [...data.values()].some((v) => v instanceof File && v.size > 0);
    const res = await fetch('/', {
      method: 'POST',
      ...(hasFile
        ? { body: data }
        : {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data).toString(),
          }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function setLoading(button, loading) {
  button.classList.toggle('loading', loading);
  button.disabled = loading;
  button.setAttribute('aria-busy', String(loading));
}

/** Accepts 10-digit Indian mobiles, optionally prefixed with +91 / 91 / 0. */
export function isValidPhone(value) {
  const digits = value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  return /^[6-9]\d{9}$/.test(digits);
}

/** Validate phone inputs with a translated message, then run native validation. */
export function validateForm(form) {
  form.querySelectorAll('input[type="tel"]').forEach((input) => {
    input.setCustomValidity(
      input.value && !isValidPhone(input.value) ? tText('form_phone_invalid') : '',
    );
  });
  return form.reportValidity();
}

/** Clear a field's custom error as soon as the user edits it. */
export function clearValidityOnInput(form) {
  form.addEventListener('input', (e) => {
    if (e.target instanceof HTMLInputElement) e.target.setCustomValidity('');
  });
}
