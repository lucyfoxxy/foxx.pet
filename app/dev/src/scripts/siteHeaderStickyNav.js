const MOBILE_MAX_WIDTH = 900;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`;
const SCROLL_PADDING_VAR = '--site-header-scroll-offset';

function setScrollPadding(nav, matches) {
  const root = document.documentElement;
  if (!matches) {
    root.style.removeProperty(SCROLL_PADDING_VAR);
    return;
  }
  const navHeight = nav?.getBoundingClientRect().height ?? 0;
  root.style.setProperty(SCROLL_PADDING_VAR, `${Math.round(navHeight)}px`);
}

export function initSiteHeaderStickyNav() {
  if (typeof window === 'undefined') return;

  const nav = document.querySelector('#site-header .site-nav');
  if (!nav) return;

  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

  const applyMode = (matches) => {
    setScrollPadding(nav, matches);
  };

  applyMode(mediaQuery.matches);

  const handleMediaChange = (event) => {
    applyMode(event.matches);
  };

  const handleResize = () => {
    if (!mediaQuery.matches) return;
    setScrollPadding(nav, true);
  };

  mediaQuery.addEventListener('change', handleMediaChange);
  window.addEventListener('resize', handleResize);

  const cleanup = () => {
    mediaQuery.removeEventListener('change', handleMediaChange);
    window.removeEventListener('resize', handleResize);
    setScrollPadding(nav, false);
  };

  window.addEventListener('astro:before-swap', cleanup, { once: true });
}

export default initSiteHeaderStickyNav;
