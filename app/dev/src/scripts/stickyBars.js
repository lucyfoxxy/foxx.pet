// @Scripts/stickyBars.js
// Steuert data-visible für Header (oben) und Footer (unten).
// CSS macht position: sticky; wir schalten nur, ob der "volle" Zustand sichtbar ist.

export default function stickyBar(selector) {
  if (selector !== '.header' && selector !== '.footer') return;

  const bar = document.querySelector(selector);
  if (!bar) return;

  const controller = selector === '.header'
    ? createHeaderController(bar)
    : createFooterController(bar);

  if (!controller.update) return;

  let rafId = 0;
  const wrappedUpdate = () => {
    rafId = 0;
    controller.update();
  };

  const onScrollOrResize = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(wrappedUpdate);
  };

  controller.update();
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);

  return () => {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    window.removeEventListener('scroll', onScrollOrResize);
    window.removeEventListener('resize', onScrollOrResize);
    if (controller.destroy) controller.destroy();
  };
}

const isSticky = (position) => position === 'sticky' || position === '-webkit-sticky';

const setVisibility = ({ bar, meta, items, labels }, visible) => {
  const value = visible ? 'true' : 'false';
  bar?.setAttribute('data-visible', value);
  meta?.setAttribute('data-visible', value);
  items?.forEach((item) => item.setAttribute('data-visible', value));
  labels?.forEach((label) => label.setAttribute('data-visible', value));
};

function createHeaderController(bar) {
  const style = window.getComputedStyle(bar);
  if (!isSticky(style.position)) return {};

  const doc = document.documentElement;
  const items = bar.querySelectorAll('.header__nav-item');
  const labels = bar.querySelectorAll('.header__nav-label');
  let anchorTop = null;
  let lastVisible = null;

  const recalcAnchor = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const rect = bar.getBoundingClientRect();
    const topOffset = parseFloat(style.top || '0') || 0;
    anchorTop = rect.top + scrollY - topOffset;
  };

  recalcAnchor();

  const update = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeightNow = window.innerHeight || doc.clientHeight;
    const docHeightNow = doc.scrollHeight;
    const contentHeightNow = docHeightNow - bar.offsetHeight;
    const isShortPageNow = contentHeightNow <= viewportHeightNow + 1;

    if (scrollY <= 1) {
      recalcAnchor();
    }

    let visible = true;
    if (!isShortPageNow && anchorTop !== null) {
      visible = scrollY <= anchorTop;
    }

    if (visible === lastVisible) return;

    setVisibility({ bar, items, labels }, visible);
    lastVisible = visible;
  };

  return { update };
}

function createFooterController(bar) {
  const style = window.getComputedStyle(bar);
  if (!isSticky(style.position)) return {};

  const doc = document.documentElement;
  const meta = bar.querySelector('.footer__meta');
  let lastVisible = null;

  const update = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeightNow = window.innerHeight || doc.clientHeight;
    const docHeightNow = doc.scrollHeight;
    const barHeight = bar.offsetHeight || 0;
    const scrollRoomNow = Math.max(0, docHeightNow - viewportHeightNow);
    const minScrollForLongPage = Math.max(barHeight * 0.75, 32);
    const shortPage = scrollRoomNow <= minScrollForLongPage;

    let visible = true;
    if (!shortPage) {
      const footerHeight = bar.offsetHeight;
      const threshold = Math.max(docHeightNow - footerHeight - 2, 0);
      const atEnd = scrollY + viewportHeightNow >= threshold;
      visible = atEnd;
    }

    if (visible === lastVisible) return;

    setVisibility({ bar, meta }, visible);
    lastVisible = visible;
  };

  return { update };
}
