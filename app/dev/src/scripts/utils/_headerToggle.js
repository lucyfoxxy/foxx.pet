// src/Scripts/headerToggle.js
export default function initHeaderToggle() {
  const header = document.getElementById('site-header');
  const sentinel = document.getElementById('hero-sentinel');

  if (!header) return; // kein Header → nichts tun

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (sentinel) {
    const io = new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-compact', !entry.isIntersecting);
      header.classList.toggle('is-home', entry.isIntersecting);
    }, { threshold: 0.01 });

    io.observe(sentinel);
  } else {
    // kein Hero → direkt kompakt
    header.classList.add('is-compact');
  }

  // optional: Animationen aus, wenn reduced motion aktiv
  if (reduceMotion) {
    header.style.transition = 'none';
    header.querySelectorAll('.logo').forEach(el => {
      el.style.transition = 'none';
    });
  }
}
