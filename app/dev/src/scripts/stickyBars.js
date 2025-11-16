// @Scripts/stickyBars.js
// Steuert data-visible für Header (oben) und Footer (unten).
// CSS macht position: sticky; wir schalten nur, ob der "volle" Zustand sichtbar ist.

export default function stickyBar(selector) {
  // Wir unterstützen nur Header & Footer explizit
  if (selector !== '.header' && selector !== '.footer') return;

  const bar = document.querySelector(selector);
  if (!bar) return;

  const style = window.getComputedStyle(bar);
  if (style.position !== 'sticky') {
    // Falls Layout mal geändert wird, ohne sticky: still aussteigen
    return;
  }

  const doc = document.documentElement;
  let anchorTop = null;

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
    const isShortPageNow = docHeightNow <= viewportHeightNow + 1;

    let visible = true;

    if (selector === '.header') {
      // Header:
      // - kurze Seite: immer visible=true
      // - sonst: visible=true nur oberhalb anchorTop, darunter compact
      if (!isShortPageNow && anchorTop !== null) {
        visible = scrollY <= anchorTop;
      }
    } else {
      // Footer:
      // - kurze Seite: immer visible=true
      // - sonst: visible=true nur am Seitenende
      if (isShortPageNow) {
        visible = true;
      } else {
        const atEnd = scrollY + viewportHeightNow >= docHeightNow + 2;
        visible = atEnd;
      }
    }

    bar.setAttribute('data-visible', visible ? 'true' : 'false');
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
