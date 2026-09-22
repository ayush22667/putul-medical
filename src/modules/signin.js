// UI-only sign-in flow (phone + OTP). There is no backend: keep features.signin off
// in src/config/site.js until this is connected to a real auth provider.
import { $, $$ } from '../lib/dom.js';
import { t, tText, setKey, applyI18n } from '../lib/i18n.js';
import { showStep } from './sheets.js';

export function initSignin() {
  const sheet = $('[data-sheet="signin"]');
  if (!sheet) return;
  const tabs = $('#signinTabs');
  const otpInputs = $$('.otp input', sheet);
  let mode = 'signin';

  const setMode = (next) => {
    mode = next;
    const create = mode === 'create';
    $$('button', tabs).forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
    $('#nameField').hidden = !create;
    $('#signinName').required = create;
    setKey($('#signinTitle'), create ? 'create_account_h' : 'welcome_back');
    setKey($('#signinSub'), create ? 'create_account_sub' : 'signin_sub');
    tabs.hidden = false;
    showStep('signin', 'phone');
  };

  document.addEventListener('sheet:open', (e) => e.detail === 'signin' && setMode('signin'));
  $$('button', tabs).forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

  $('#phoneForm').addEventListener('submit', (e) => {
    e.preventDefault();
    $('#otpSentTo').textContent = `${tText('otp_sent_prefix')} ${$('#signinPhone').value.trim()}.`;
    setKey($('#otpSubmit'), mode === 'create' ? 'verify_create' : 'verify_signin');
    otpInputs.forEach((input) => (input.value = ''));
    tabs.hidden = true;
    showStep('signin', 'otp');
    setTimeout(() => otpInputs[0].focus(), 50);
  });

  $('#otpBack').addEventListener('click', () => {
    tabs.hidden = false;
    showStep('signin', 'phone');
  });

  otpInputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '');
      if (digits.length > 1) {
        // Pasted or autofilled code: spread across the boxes.
        digits
          .slice(0, otpInputs.length)
          .split('')
          .forEach((d, j) => (otpInputs[j].value = d));
        otpInputs[Math.min(digits.length, otpInputs.length) - 1].focus();
        return;
      }
      input.value = digits;
      if (digits && i < otpInputs.length - 1) otpInputs[i + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) otpInputs[i - 1].focus();
    });
  });

  $('#otpForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#signinName').value.trim();
    $('#doneTitle').textContent =
      mode === 'create'
        ? name
          ? `${tText('welcome_name')}, ${name}!`
          : tText('account_created')
        : tText('youre_signed_in');
    $('#doneSub').innerHTML = t(mode === 'create' ? 'account_ready' : 'welcome_back_msg');
    tabs.hidden = true;
    showStep('signin', 'done');
  });

  applyI18n(sheet);
}
