import { $ } from '../lib/dom.js';
import { t, tText } from '../lib/i18n.js';
import { submitNetlifyForm, setLoading, validateForm, clearValidityOnInput } from '../lib/forms.js';
import { waLink } from '../lib/whatsapp.js';
import { confetti } from './effects.js';

const MAX_BYTES = 8 * 1024 * 1024; // Netlify Forms upload limit
const ACCEPTED = /^(image\/|application\/pdf$)/;

export function initUpload() {
  const form = $('#rxForm');
  if (!form) return;
  const fileInput = $('#rxFile');
  const preview = $('#filePreview');
  const details = $('#rxDetails');
  const notice = $('#uploadNotice');
  let previewUrl = null;

  const showNotice = (kind, html) => {
    notice.className = `notice show ${kind}`;
    notice.innerHTML = html;
  };
  const hideNotice = () => (notice.className = 'notice');

  const reset = () => {
    fileInput.value = '';
    preview.classList.remove('show');
    details.hidden = true;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  };

  const pick = (useCamera) => {
    if (useCamera) fileInput.setAttribute('capture', 'environment');
    else fileInput.removeAttribute('capture');
    fileInput.click();
  };
  $('#cameraBtn').addEventListener('click', () => pick(true));
  $('#galleryBtn').addEventListener('click', () => pick(false));
  $('#fpRemove').addEventListener('click', () => {
    reset();
    hideNotice();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    hideNotice();
    if (!ACCEPTED.test(file.type)) {
      reset();
      showNotice('err', t('upload_bad_type'));
      return;
    }
    if (file.size > MAX_BYTES) {
      reset();
      showNotice('err', t('upload_too_big'));
      return;
    }

    const isImage = file.type.startsWith('image/');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = isImage ? URL.createObjectURL(file) : null;
    $('#fpImg').hidden = !isImage;
    $('#fpIcon').hidden = isImage;
    if (isImage) $('#fpImg').src = previewUrl;
    $('#fpName').textContent = file.name;
    $('#fpSize').textContent = `${(file.size / 1024 / 1024).toFixed(1)} MB`;

    preview.classList.remove('show');
    void preview.offsetWidth;
    preview.classList.add('show');
    details.hidden = false;
    setTimeout(() => $('#rxName').focus({ preventScroll: true }), 50);
    details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  clearValidityOnInput(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!fileInput.files?.length || !validateForm(form)) return;

    const button = form.querySelector('button[type="submit"]');
    const name = $('#rxName').value.trim();
    const phone = $('#rxPhone').value.trim();
    setLoading(button, true);
    const ok = await submitNetlifyForm(form);
    setLoading(button, false);

    if (ok) {
      form.reset();
      reset();
      showNotice('ok', `<strong>✓</strong> ${t('upload_received')}`);
      confetti(notice, 16);
      return;
    }

    const message = `Hi Putul Medical, I'd like to order medicines from my prescription (attached).\nName: ${name}\nPhone: ${phone}`;
    showNotice('err', t('upload_failed'));
    const link = document.createElement('a');
    link.className = 'btn btn-wa btn-block';
    link.target = '_blank';
    link.rel = 'noopener';
    link.href = waLink(message);
    link.textContent = tText('upload_send_wa');
    notice.appendChild(link);
  });
}
