// @Scripts/stickyBars.js
// Steuert data-visible für Header (oben) und Footer (unten).
// CSS macht position: sticky; wir schalten nur, ob der "volle" Zustand sichtbar ist.

export default function stickyBar(selector) {
  if (selector !== '.header' && selector !== '.footer') return;

  const bar = document.querySelector(selector);
  if (!bar) return;

  const isHeader = selector === '.header';
  const doc = document.documentElement;

  // Nur für Footer relevant
  const meta = !isHeader ? bar.querySelector('.footer__meta') : null;

  // Nur für Header relevant
  const items  = isHeader ? bar.querySelectorAll('.header__nav-item')   : null;
  const labels = isHeader ? bar.querySelectorAll('.header__nav-label')  : null;

  let lastVisible = null;
  let rafId = 0;

  const applyVisible = (visible) => {
    const value = visible ? 'true' : 'false';

    if (isHeader) {
      if (items)  items.forEach((el)  => el.setAttribute('data-visible', value));
      if (labels) labels.forEach((el) => el.setAttribute('data-visible', value));
    } else {
      if (meta)  meta.setAttribute('data-visible', value);
      bar.setAttribute('data-visible', value);
    }

    lastVisible = visible;
  };

  const update = () => {
    rafId = 0;

    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight || doc.clientHeight;
    const docHeight = doc.scrollHeight;
    const barHeight = bar.offsetHeight || 0;
    
    let visible = true;

    if (isHeader) {
      // Fester Schwellwert: ab hier darf der Header kompakt werden
      const threshold = Math.max(96, barHeight * 1.5);

      // Einfach: solange wir nah am Seitenanfang sind → voll.
      visible = scrollY <= threshold;
    } else {
      // Footer-Logik: Meta nur einblenden, wenn wir "am Ende" sind
      const maxScroll = Math.max(0, docHeight - viewportHeight);
      const minScrollForLongPage = Math.max(barHeight * 0.75, 32);
      const isShortPage = maxScroll <= minScrollForLongPage;

      if (isShortPage) {
        visible = true;
      } else {
        const threshold = docHeight - barHeight - 2;
        const atEnd = scrollY + viewportHeight >= threshold;
        visible = atEnd;
      }
    }

    if (visible === lastVisible) return;
    applyVisible(visible);
    console.log(`isHeader: ${isHeader}`,`scrollY: ${scrollY}`, `viewportHeight: ${viewportHeight}`,`docHeight: ${docHeight}`,`barHeight: ${barHeight}`);
  };

  const onScrollOrResize = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(update);
  };

  // Initial
  update();

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);

  // Cleanup (falls du mal dynamisch mountest / unmountest)
  return () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    window.removeEventListener('scroll', onScrollOrResize);
    window.removeEventListener('resize', onScrollOrResize);
  };
}

