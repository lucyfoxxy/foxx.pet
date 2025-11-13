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

export function ResponsiveSiteHeader() {

  const root = document.documentElement;

  const nav = document.querySelector('.header');
  const navBar = nav?.querySelector('.header__nav');

  if (!root || !nav) return undefined;

  const media = window.matchMedia(MOBILE_QUERY);
  const SCROLL_THRESHOLD = 4;
  let lastScrollY = window.scrollY;
  let rafId = 0;
  let detailsVisible = true;

  const setDetailsVisible = (visible) => {
    if (detailsVisible === visible) return;
    detailsVisible = visible;
    nav.toggleAttribute('data-show-details', visible);
  };

  nav.toggleAttribute('data-show-details', detailsVisible);

  const applyScrollState = (currentY) => {
    if (!media.matches) {
      setDetailsVisible(true);
      lastScrollY = currentY;
      return;
    }

    const delta = currentY - lastScrollY;
    if (currentY <= 0 || delta < -SCROLL_THRESHOLD) {
      setDetailsVisible(true);
    } else if (delta > SCROLL_THRESHOLD) {
      setDetailsVisible(false);
    }

    lastScrollY = currentY;
  };

  const handleScroll = () => {
    const currentY = window.scrollY;
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      applyScrollState(currentY);
    });
  };

  const updateStickyOffset = () => {
    const target = media.matches && navBar ? navBar : nav;
    const height = Math.round(measure(target));
    root.style.setProperty('--site-header--sticky-offset', `${height}px`);
    root.toggleAttribute('data-site-header-compact', media.matches);
  };

  const updateLayout = () => {
    updateStickyOffset();
    applyScrollState(window.scrollY);
  };

  updateLayout();

  const resizeObservers = [];
  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(() => updateLayout());

    resizeObserver.observe(nav);
    resizeObservers.push(resizeObserver);
  }

  const removeMediaListener = addMediaListener(media, updateLayout);
  window.addEventListener('orientationchange', updateLayout);
  window.addEventListener('resize', updateLayout);
  window.addEventListener('scroll', handleScroll, { passive: true });

  const cleanup = () => {
    removeMediaListener();
    resizeObservers.forEach((observer) => observer.disconnect());
    window.removeEventListener('orientationchange', updateLayout);
    window.removeEventListener('resize', updateLayout);
    window.removeEventListener('scroll', handleScroll);
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    root.style.removeProperty('--site-header--sticky-offset');
    root.removeAttribute('data-site-header-compact');
    nav.removeAttribute('data-show-details');
  };

  return cleanup;
}



export function observer() {
  const nav = document.querySelector('.header');
  if (nav) {
    const sentry = document.createElement('div');
    sentry.style.position = 'absolute';
    sentry.style.top = '0';
    sentry.style.height = '1px';
    nav.before(sentry); // direkt vor die Nav

    const io = new IntersectionObserver(([e]) => {
      nav.toggleAttribute('data-stuck', e.intersectionRatio === 0);
    }, { rootMargin: `-${getComputedStyle(nav).top || 0} 0px 0px 0px`, threshold: [0,1] });

    io.observe(sentry);
  }
}

