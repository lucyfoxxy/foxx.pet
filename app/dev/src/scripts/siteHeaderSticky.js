const MOBILE_QUERY = '(max-width: 900px)';

const addMediaListener = (mediaQueryList, handler) => {
  if (!mediaQueryList || typeof handler !== 'function') return () => {};

  if (typeof mediaQueryList.addEventListener === 'function') {
    mediaQueryList.addEventListener('change', handler);
    return () => mediaQueryList.removeEventListener('change', handler);
  }

  if (typeof mediaQueryList.addListener === 'function') {
    mediaQueryList.addListener(handler);
    return () => mediaQueryList.removeListener(handler);
  }

  return () => {};
};

const measure = (element) => (element ? element.getBoundingClientRect().height : 0);

export function initResponsiveSiteHeader() {
  const root = document.documentElement;
  const header = document.getElementById('site-header');
  const nav = header?.querySelector('.site-nav');

  if (!root || !header || !nav) return undefined;

  const media = window.matchMedia(MOBILE_QUERY);
  const updateStickyOffset = () => {
    const target = media.matches ? nav : header;
    const height = Math.round(measure(target));
    root.style.setProperty('--site-header--sticky-offset', `${height}px`);
    root.toggleAttribute('data-site-header-compact', media.matches);
  };

  updateStickyOffset();

  const resizeObservers = [];
  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(() => updateStickyOffset());
    resizeObserver.observe(header);
    resizeObserver.observe(nav);
    resizeObservers.push(resizeObserver);
  }

  const removeMediaListener = addMediaListener(media, updateStickyOffset);
  window.addEventListener('orientationchange', updateStickyOffset);
  window.addEventListener('resize', updateStickyOffset);

  const cleanup = () => {
    removeMediaListener();
    resizeObservers.forEach((observer) => observer.disconnect());
    window.removeEventListener('orientationchange', updateStickyOffset);
    window.removeEventListener('resize', updateStickyOffset);
    root.style.removeProperty('--site-header--sticky-offset');
    root.removeAttribute('data-site-header-compact');
  };

  return cleanup;
}

export default initResponsiveSiteHeader;
