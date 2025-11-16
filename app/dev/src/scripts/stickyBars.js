// @Scripts/stickyBars.js
// Steuert data-visible für Header (oben) und Footer (unten).
// CSS macht position: sticky; wir schalten nur, ob der "volle" Zustand sichtbar ist.

export default function stickyBar(selector) {
  // Wir unterstützen nur Header & Footer explizit
  if (selector !== '.header' && selector !== '.footer') return;

  const bar = document.querySelector(selector);
  
  if (!bar) return;
  
  const meta = (selector === '.footer') 
    ? (bar.querySelector('.footer__meta')) 
    : null;
  
  const item = (selector === '.header') 
    ? (document.querySelectorAll('.header__nav-item')) 
    : null;
  
  const label = (selector === '.header')
    ? (document.querySelectorAll('.header__nav-label')) 
    : null;
  
  
  const style = window.getComputedStyle(bar);
  if (style.position !== 'sticky') {
    // Falls Layout mal geändert wird, ohne sticky: still aussteigen
    return;
  }

  const doc = document.documentElement;
  let anchorTop = null;
  let lastVisible = null;

  // Nur für Header relevant
  if (selector === '.header') {
    const initialScrollY = window.scrollY || window.pageYOffset;
    const initialRect = bar.getBoundingClientRect();
    const topOffset = parseFloat(style.top || '0') || 0;

    anchorTop = initialRect.top + initialScrollY - topOffset;
  }

  let rafId = 0;

  const update = () => {
    rafId = 0;
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeightNow = window.innerHeight || doc.clientHeight;
    const docHeightNow = doc.scrollHeight;
    const contentHeightNow = docHeightNow - bar.offsetHeight;
    const isShortPageNow = contentHeightNow <= viewportHeightNow + 1;


    let visible = true;

    if (selector === '.header') {
      if (scrollY <= 1) {
        const rect = bar.getBoundingClientRect();
        const topOffset = parseFloat(style.top || '0') || 0;
        anchorTop = rect.top + scrollY - topOffset;
      }
      // Header:
      // - kurze Seite: immer visible=true
      // - sonst: visible=true nur oberhalb anchorTop, darunter compact
      if (!isShortPageNow && anchorTop !== null) {
        visible = scrollY <= anchorTop;
      }
    } else {
    const barHeight = bar.offsetHeight || 0;
    const scrollRoomNow = Math.max(0, docHeightNow - viewportHeightNow);

    // wirklich "short", wenn man weniger als ~¾ Barhöhe scrollen kann
    const minScrollForLongPage = Math.max(barHeight * 0.75, 32);
    const isShortPageNow = scrollRoomNow <= minScrollForLongPage;
      if (isShortPageNow) {
        visible = true;
      } else {
        // Trick: docHeightNow und footerHeight ändern sich beide,
        // je nachdem ob Meta sichtbar ist. Durch (docHeightNow - footerHeight)
        // bleibt die Schwelle stabil, egal ob Meta an/aus ist.
        const footerHeight = bar.offsetHeight;
        const threshold = Math.max(docHeightNow - footerHeight - 2, 0);
        const atEnd = scrollY + viewportHeightNow >= threshold;
        visible = atEnd;
      }
    }

    if (visible !== lastVisible) {

      if(meta) meta.setAttribute('data-visible', visible ? 'true' : 'false');
      if(item) item.forEach ((item) => ( item.setAttribute('data-visible', visible ? 'true' : 'false')));
      if(label) label.forEach ((label) => ( label.setAttribute('data-visible', visible ? 'true' : 'false')));

      bar.setAttribute('data-visible', visible ? 'true' : 'false');
      lastVisible = visible;
    }
  };

  const onScrollOrResize = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(update);
  };

  // Initialen Zustand setzen
  update();

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);

  // Option für Cleanup (Astro Navigation etc.)
  return () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    window.removeEventListener('scroll', onScrollOrResize);
    window.removeEventListener('resize', onScrollOrResize);
  };
}
