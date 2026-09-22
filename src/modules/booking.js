import { $, $$ } from '../lib/dom.js';
import { getLang, setKey } from '../lib/i18n.js';
import en from '../i18n/en.json';
import { submitNetlifyForm, setLoading, validateForm, clearValidityOnInput } from '../lib/forms.js';
import { waLink } from '../lib/whatsapp.js';
import { openSheet, showStep } from './sheets.js';
import { confetti } from './effects.js';

const pad = (n) => String(n).padStart(2, '0');

/** Next day at the given hour, formatted for <input type="datetime-local">. */
function nextSlot(hour) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:00`;
}

function minNow() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const formatTime = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Shared submit flow for booking sheets: record via Netlify Forms, then show either
 * "request received" (stored) or "one last step" (send it on WhatsApp).
 */
function wireBookingForm({ sheetName, form, buildMessage, waButton }) {
  const sheet = $(`[data-sheet="${sheetName}"]`);
  const title = $('.result-title', sheet);
  const sub = $('.result-sub', sheet);
  const waLabel = $('.result-wa-label', sheet);
  const defaults = { title: title.dataset.i18n, sub: sub.dataset.i18n, wa: waLabel.dataset.i18n };

  clearValidityOnInput(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;
    const button = form.querySelector('button[type="submit"]');
    setLoading(button, true);
    const ok = await submitNetlifyForm(form);
    setLoading(button, false);

    waButton.href = waLink(buildMessage());
    setKey(title, ok ? defaults.title : 'wa_last_step_h');
    setKey(sub, ok ? defaults.sub : 'wa_last_step_sub');
    setKey(waLabel, ok ? defaults.wa : 'wa_send_request');
    waButton.classList.toggle('btn-pulse', !ok);
    // Not stored yet → show a WhatsApp badge instead of a "done" tick.
    const check = $('.check', sheet);
    check.classList.toggle('pending', !ok);
    $('use', check).setAttribute('href', ok ? '#i-check' : '#i-wa');
    showStep(sheetName, 'done');
    if (ok) confetti($('.check', sheet));
  });
}

function initDoctorBooking() {
  const form = $('#bookingForm');
  if (!form) return;
  let doctor = null;

  $$('.book-doc').forEach((btn) =>
    btn.addEventListener('click', () => {
      doctor = { ...btn.dataset };
      $('#bkDoctor').textContent = doctor.doctor;
      setKey($('#bkSpec'), doctor.spec);
      $('#bkAvatar').textContent = doctor.avatar;
      $('#bkCode').textContent = `DOC${doctor.discount}`;
      form.reset();
      $('#bkDoctorField').value = `${doctor.doctor} (${en[doctor.spec]})`;
      $('#bkCodeField').value = `DOC${doctor.discount}`;
      $('#bkTime').min = minNow();
      $('#bkTime').value = nextSlot(10);
      showStep('booking', 'form');
      openSheet('booking');
    }),
  );

  wireBookingForm({
    sheetName: 'booking',
    form,
    waButton: $('#bkWa'),
    buildMessage: () =>
      [
        "Hi Putul Medical, I'd like to book a doctor's appointment.",
        `Doctor: ${doctor.doctor} (${en[doctor.spec]})`,
        `Name: ${$('#bkName').value.trim()}`,
        `Phone: ${$('#bkPhone').value.trim()}`,
        `Preferred time: ${formatTime($('#bkTime').value)}`,
        `Code: DOC${doctor.discount}`,
        `Language: ${getLang() === 'hi' ? 'Hindi' : 'English'}`,
      ].join('\n'),
  });
}

function initLabBooking() {
  const form = $('#labForm');
  if (!form) return;
  let test = null;

  $$('.book-lab').forEach((btn) =>
    btn.addEventListener('click', () => {
      test = { ...btn.dataset };
      setKey($('#labTest'), test.test);
      $('#labCode').textContent = test.code;
      form.reset();
      $('#labTestField').value = en[test.test];
      $('#labCodeField').value = test.code;
      $('#labTime').min = minNow();
      $('#labTime').value = nextSlot(8);
      showStep('lab', 'form');
      openSheet('lab');
    }),
  );

  wireBookingForm({
    sheetName: 'lab',
    form,
    waButton: $('#labWa'),
    buildMessage: () =>
      [
        "Hi Putul Medical, I'd like to book a home test.",
        `Test: ${en[test.test]}`,
        `Name: ${$('#labName').value.trim()}`,
        `Phone: ${$('#labPhone').value.trim()}`,
        `Address: ${$('#labAddress').value.trim()}`,
        `Preferred time: ${formatTime($('#labTime').value)}`,
        `Code: ${test.code}`,
        `Language: ${getLang() === 'hi' ? 'Hindi' : 'English'}`,
      ].join('\n'),
  });
}

export function initBooking() {
  initDoctorBooking();
  initLabBooking();
}
