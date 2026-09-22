import { prefersReducedMotion } from '../lib/dom.js';

/** Material-style touch ripple on buttons and tiles. */
export function initRipple() {
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (prefersReducedMotion()) return;
      const host = e.target.closest('.btn, .tile');
      if (!host || host.disabled) return;
      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      Object.assign(ripple.style, {
        width: `${size}px`,
        height: `${size}px`,
        left: `${e.clientX - rect.left}px`,
        top: `${e.clientY - rect.top}px`,
      });
      host.appendChild(ripple);
      ripple
        .animate(
          [
            { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.28 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 },
          ],
          { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        )
        .finished.finally(() => ripple.remove());
    },
    { passive: true },
  );
}

const CONFETTI_COLORS = ['#C98A2C', '#24402F', '#D64545', '#25D366', '#E8B563'];

/** Small celebratory burst around an element (used on successful submissions). */
export function confetti(anchor, count = 22) {
  if (!anchor || prefersReducedMotion()) return;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    if (i % 3 === 0) piece.style.borderRadius = '50%';
    anchor.appendChild(piece);

    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const distance = 60 + Math.random() * 60;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance - 20;
    piece
      .animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1) rotate(${Math.random() * 540}deg)`,
            opacity: 1,
            offset: 0.7,
          },
          {
            transform: `translate(calc(-50% + ${x * 1.1}px), calc(-50% + ${y + 30}px)) scale(0.8) rotate(${Math.random() * 720}deg)`,
            opacity: 0,
          },
        ],
        { duration: 1100 + Math.random() * 300, delay: 250, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' },
      )
      .finished.finally(() => piece.remove());
  }
}
