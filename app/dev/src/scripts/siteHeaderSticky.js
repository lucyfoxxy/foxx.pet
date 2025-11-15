// @Scripts/siteHeaderSticky.js
// Generic sticky helper for header (top) and footer (bottom).
// Assumes the element itself has `position: sticky` in CSS and either `top` or `bottom` set.

function createStickyController(el, { mode = 'top' } = {}) {
  if (!el) return;

  const style = window.getComputedStyle(el);
  if (style.position !== 'sticky') {
    return;
  }

  const doc = document.documentElement;
  const initialScrollY = window.scrollY || window.pageYOffset;
  const initialViewportHeight = window.innerHeight || doc.clientHeight;
  const initialRect = el.getBoundingClientRect();
  const initialDocHeight = doc.scrollHeight;
  const originalMaxScroll = Math.max(0, initialDocHeight - initialViewportHeight);
  const isShortPage = initialDocHeight <= initialViewportHeight + 1;

  let anchorTop = null;
  let anchorBottom = null;

  if (mode === 'top') {
    const topOffset = parseFloat(style.top || '0') || 0;
    anchorTop = initialRect.top + initialScrollY - topOffset;
  } else if (mode === 'bottom') {
    const bottomOffset = parseFloat(style.bottom || '0') || 0;
    // When the bottom edge of the element would naturally be at the bottom
    // of the viewport, sticky mode begins.
    anchorBottom =
      initialRect.top +
      initialScrollY +
      initialRect.height -
      initialViewportHeight +
      bottomOffset;
  }

  let rafId = 0;

  const update = () => {
    rafId = 0;
    const scrollY = window.scrollY || window.pageYOffset;
    const vhNow = window.innerHeight || doc.clientHeight; // aktuell, falls du's mal brauchst

    let stuck = false;

    if (mode === 'top' && anchorTop !== null) {
      // Header: auf kurzen Seiten gar nicht „compakten“,
      // sonst: stuck sobald wir über seine natürliche Position hinaus sind.
      if (!isShortPage) {
        stuck = scrollY > anchorTop;
      }
    } else if (mode === 'bottom' && anchorBottom !== null) {
      // Footer:
      // - Wenn Anfang und Ende quasi zusammenfallen (kurze Seite):
      //   -> nie stuck, immer kompletter Footer.
      // - Sonst:
      //   -> Scrolltiefe über anchorBottom: sticky-Phase (nur Nav-Bar)
      //   -> aber wenn wir das ursprünglich berechnete Seitenende erreichen,
      //      wieder zurück auf „nicht stuck“ (kompletter Footer sichtbar).
      if (!isShortPage) {
        const originalMaxScrollNow = originalMaxScroll; // eingefroren
        const atEnd = scrollY >= originalMaxScrollNow - 1;
        if (!atEnd) {
          stuck = scrollY > anchorBottom;
        }
      } else {
        stuck = false;
      }
    }

    if (stuck) {
      el.setAttribute('data-stuck', 'true');
    } else {
      el.removeAttribute('data-stuck');
    }
  };

  const onScrollOrResize = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(update);
  };

  // Initialer Zustand
  update();

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);

  const cleanup = () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    window.removeEventListener('scroll', onScrollOrResize);
    window.removeEventListener('resize', onScrollOrResize);
  };

  return cleanup;
}

export function initHeaderSticky(selector = '.header') {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  return createStickyController(el, { mode: 'top' });
}

export function initFooterSticky(selector = '.footer') {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  return createStickyController(el, { mode: 'bottom' });
}
