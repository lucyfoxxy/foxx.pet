export function runOnReady(callback) {
  if (typeof callback !== 'function') return;

  let lastUrl = null;

  const run = () => {
    try {
      const currentUrl = window.location.href;
      if (currentUrl === lastUrl) return;

      lastUrl = currentUrl;
      callback();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize page script', error);
    }
  };

  const scheduleRun = () => requestAnimationFrame(run);

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    scheduleRun();
  } else {
    document.addEventListener('DOMContentLoaded', scheduleRun, { once: true });
  }

  document.addEventListener('astro:page-load', scheduleRun);
}

export default runOnReady;
