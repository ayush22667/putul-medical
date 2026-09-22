import { SITE } from '../config/site.js';

export const waLink = (text) =>
  `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export function openWhatsApp(text) {
  window.open(waLink(text), '_blank', 'noopener');
}
