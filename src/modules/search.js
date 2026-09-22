import { $ } from '../lib/dom.js';
import { openWhatsApp } from '../lib/whatsapp.js';

export function initSearch() {
  const form = $('#searchForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = $('#searchInput').value.trim();
    openWhatsApp(
      query
        ? `Hi Putul Medical, do you have: ${query}? Please share price and availability.`
        : "Hi Putul Medical, I'd like to order medicines.",
    );
  });
}
