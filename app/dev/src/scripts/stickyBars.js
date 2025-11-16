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
  const initialViewportHeight = window.innerHeight || doc.clientHeight;
  const initialDocHeight = doc.scrollHeight;
  const isShortPage = initialDocHeight <= initialViewportHeight + 1;

  const footerMeta =
    selector === '.footer' ? bar.querySelector('.footer__meta') : null;
  const footerMetaHeight = footerMeta
    ? Math.max(0, footerMeta.getBoundingClientRect().height)
    : 0;
  const footerScrollHeight = Math.max(0, initialDocHeight - footerMetaHeight);
  const footerAlwaysVisible =
    selector === '.footer' && footerScrollHeight <= initialViewportHeight + 1;

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

    let visible = true;

    if (selector === '.header') {
      // Header:
      // - kurze Seite: immer visible=true
      // - sonst: visible=true nur oberhalb anchorTop, darunter compact
      if (!isShortPage && anchorTop !== null) {
        visible = scrollY <= anchorTop;
      }
    } else {
      // Footer:
      // - kurze Seite oder kein Scrollraum ohne Meta: immer visible=true
      // - sonst: visible=true nur am (ursprünglichen) Seitenende
      if (footerAlwaysVisible) {
        visible = true;
      } else {
        const viewportHeightNow = window.innerHeight || doc.clientHeight;
        const atEnd =
          scrollY + viewportHeightNow >= footerScrollHeight - 1;
        visible = isShortPage || atEnd;
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
