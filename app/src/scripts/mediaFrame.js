// src/scripts/mediaFrame.js
import { createGalleryItemsBySlug } from './utils/_slugLoader.js';
import { loadImageWithTransition } from './utils/_transitionLoader.js';
import _isMobile from '@Scripts/utils/_isMobile.js';

const LIGHTBOX_RESUME_DELAY = 500;

const metas = import.meta.glob('@Content/album/**/*.json', {
  query: '?json',
  eager: true,
});
const assetModules = import.meta.glob('@Assets/albums/**/*', {
  query: '?url',
  import: 'default',
  eager: true,
});
const itemsBySlug = createGalleryItemsBySlug(metas, assetModules);

const buildRemoteUrl = (id, key, kind) =>
  id && key
    ? `https://img.foxx.pet/api/assets/${id}/${kind === 'thumb' ? 'thumbnail' : 'original'}?key=${key}`
    : undefined;

export function initMediaFrame({ root = document, lightbox: providedLightbox = null } = {}) {
  const wrapper = root.querySelector('.media-wrapper:not([data-lightbox="true"])');
  if (!wrapper) return null;
  let lightbox = providedLightbox;
  // Overlays, die während Autoplay ausgeblendet werden
  const overlayTargets = new Set();
  const registerOverlayTargets = (scope) => {
    scope
      ?.querySelectorAll('.card__overlay--hover')
      ?.forEach((el) => overlayTargets.add(el));
  };
  registerOverlayTargets(wrapper);

  const frame = wrapper.querySelector('.media-frame[data-slug]');
  if (!frame) return null;

  const slug = frame.getAttribute('data-slug');
  const autoplay = !_isMobile() && frame.getAttribute('data-autoplay') === 'true';
  frame.dataset.autoplay = _isMobile() ? 'false' : 'true';
  const random = frame.getAttribute('data-random') === 'true';
  const interval = parseInt(frame.getAttribute('data-interval') || '8500', 10);

  const imgEl = frame.querySelector('.media-image');
  if (!imgEl) return null;

  // Album / Items auflösen
  const albumEntry = itemsBySlug.get(slug);
  const attrShareKey = frame.getAttribute('data-share-key') || undefined;

  const { items: rawItems = [], shareKey: albumShareKey } = Array.isArray(albumEntry)
    ? { items: albumEntry, shareKey: attrShareKey }
    : albumEntry ?? {};

  const resolvedShareKey = albumShareKey || attrShareKey || undefined;

  const items = rawItems.reduce((acc, raw) => {
    if (!raw || typeof raw !== 'object') return acc;

    const key = raw.shareKey || resolvedShareKey || undefined;
    const id = raw.id || undefined;

    const full = raw.full || buildRemoteUrl(id, key, 'full') || null;
    const thumb =
      raw.thumb || buildRemoteUrl(id, key, 'thumb') || raw.full || full || null;

    if (!full) return acc;

    acc.push({ ...raw, id, shareKey: key, full, thumb });
    return acc;
  }, []);

  if (!items.length) return null;

  const order = items.map((_, i) => i);
  if (random) order.sort(() => Math.random() - 0.5);

  imgEl.decoding = 'async';

  const hasMultiple = order.length > 1;

  // ---- Controls (mehrere Sets: Card + Lightbox etc.) -----------------------

  const controlSets = new Set();
  

  const setProgress = (p) => {
    controlSets.forEach(({ progress }) => {
      progress?.style.setProperty('--p', String(p));
    });
  };

  const updatePlayButton = (playing) => {
    controlSets.forEach(({ btnPlay, btnPause }) => {
      if (btnPause) {
        btnPause.setAttribute('data-active', playing ? 'true' : 'false');
      }
      if (btnPlay) {
        btnPlay.setAttribute('data-active', playing ? 'false' : 'true');
        btnPlay.setAttribute(
          'aria-label',
          playing ? 'Pause autoplay'
                  : 'Resume autoplay',
        );
      }
    });

    frame.setAttribute('data-active', playing ? 'true' : 'false');
  };

  const updateOverlayState = (playing) => {
    overlayTargets.forEach((o) =>
      o.setAttribute('data-show', playing ? 'false' : 'true'),
    );
  };

  const updateControlAvailability = () => {
    controlSets.forEach(({ btnPrev, btnNext, btnPlay, progress, btnFullscreen }) => {
      if (btnPrev && btnNext) {
        btnPrev.disabled = btnNext.disabled = !hasMultiple;
        btnPrev.hidden = btnNext.hidden = !hasMultiple;
      }

      if (btnPlay && progress) {
        btnPlay.hidden = !hasMultiple;
        progress.hidden = !hasMultiple;
      }

      if (btnFullscreen) {
        btnFullscreen.toggleAttribute('disabled', !lightbox);
      }
    });
  };

  const bindControls = (controlsRoot) => {
    if (!controlsRoot) return;

    const btnPrev = controlsRoot.querySelector('.media-prev');
    const btnNext = controlsRoot.querySelector('.media-next');
    const btnPlay = controlsRoot.querySelector('.media-play');
    const btnPause = controlsRoot.querySelector('.media-pause');
    const btnFullscreen = controlsRoot.querySelector('.media-fullscreen');
    const progress = controlsRoot.querySelector('.media-progress');

    const controls = {
      root: controlsRoot,
      btnPrev,
      btnNext,
      btnPlay,
      btnPause,
      btnFullscreen,
      progress,
    };

    btnPrev?.addEventListener('click', (e) => {
      e.stopPropagation();
      prev();
      run();
    });

    btnNext?.addEventListener('click', (e) => {
      e.stopPropagation();
      next();
      run();
    });

    const handleTogglePlay = (e) => {
      e.stopPropagation();
      togglePlay();
    };

    btnPlay?.addEventListener('click', handleTogglePlay);
    btnPause?.addEventListener('click', handleTogglePlay);

    btnFullscreen?.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox();
    });

    controlSets.add(controls);
    updateControlAvailability();
  };

  // Card-Controls direkt binden
  bindControls(wrapper);

  // ---- Thumbs-Subscriptions -------------------------------------------------

  const thumbSubscribers = new Set();
  const subscribeThumbs = (fn) => {
    if (typeof fn !== 'function') return () => {};
    thumbSubscribers.add(fn);
    return () => thumbSubscribers.delete(fn);
  };

  const notifyThumbs = (dir = 0) => {
    thumbSubscribers.forEach((fn) => fn(dir));
  };

  // ---- Ken Burns / Slideshow / Lightbox ------------------------------------

  let index = 0;
  let timer = null;
  let playing = hasMultiple && autoplay;

  let elapsedBeforePause = 0;
  let tickStartTime = 0;
  let lightboxResumeTimer = null;
  let lightboxOpen = false;

  const pauseKenBurns = () => {
    imgEl.classList.remove('is-transitioning');
    imgEl.style.opacity = '1';
    imgEl.style.animationPlayState = 'paused';
  };

  const resumeKenBurns = () => {
    imgEl.style.animationPlayState = '';
    imgEl.style.opacity = '';
  };

  const clearLightboxResume = () => {
    if (lightboxResumeTimer) {
      clearTimeout(lightboxResumeTimer);
      lightboxResumeTimer = null;
      updatePlayButton(playing);
    }
  };

  const show = (idx, direction = 0) => {
    if (!order.length) return;

    index = (idx + order.length) % order.length;
    const item = items[order[index]];
    if (!item) return;

    const width = Number.isFinite(item.width) ? item.width : null;
    const height = Number.isFinite(item.height) ? item.height : null;

    loadImageWithTransition(imgEl, {
      src: item.full,
      alt: item.alt || item.filename || '',
      fallbackSrc: item.thumb || item.full,
      onApply: () => {
        if (width && width > 0) imgEl.width = width;
        else imgEl.removeAttribute('width');

        if (height && height > 0) imgEl.height = height;
        else imgEl.removeAttribute('height');

        delete imgEl.dataset.initialFull;
      },
    });

    // Wenn Lightbox gerade offen ist → Bild dort synchron mit aktualisieren
    if (lightbox?.el && lightbox.el.getAttribute('data-visible') === 'true') {
      lightbox.open(item, { onClose: handleLightboxClose });
    } else {
      
    }

    notifyThumbs(direction);
    setProgress(0);
  };

  const next = () => show(index + 1, 1);
  const prev = () => show(index - 1, -1);

  const tick = () => {
    tickStartTime = performance.now();

    const step = () => {
      if (!playing) return;

      const now = performance.now();
      const elapsed = Math.min(
        interval,
        elapsedBeforePause + (now - tickStartTime),
      );

      const p = elapsed / interval;
      setProgress(p);

      if (p >= 1) {
        elapsedBeforePause = 0;
        tickStartTime = 0;
        next();
        run();
      } else {
        timer = requestAnimationFrame(step);
      }
    };

    timer = requestAnimationFrame(step);
  };

  const run = ({ resetProgress = true } = {}) => {
    if (timer) {
      cancelAnimationFrame(timer);
      timer = null;
    }

    if (resetProgress) {
      elapsedBeforePause = 0;
      setProgress(0);
    } else {
      setProgress(Math.min(1, elapsedBeforePause / interval));
    }

    if (playing) {
      resumeKenBurns();
      tick();
      updateOverlayState(playing);
    }
  };

  const captureElapsed = () => {
    if (!timer) return;

    const now = performance.now();
    elapsedBeforePause = Math.min(
      interval,
      elapsedBeforePause + (now - tickStartTime),
    );

    cancelAnimationFrame(timer);
    timer = null;
    tickStartTime = 0;
  };

  const togglePlay = () => {
    const wasPlaying = playing;
    playing = !playing;

    updatePlayButton(playing);
    updateOverlayState(playing);

    if (wasPlaying && !playing) {
      captureElapsed();
      pauseKenBurns();
    } else if (!wasPlaying && playing) {
      resumeKenBurns();
      run({ resetProgress: false });
    }
  };

  const handleLightboxClose = () => {
    lightboxOpen = false;
    clearLightboxResume();

    if (!playing) return;

    updatePlayButton(playing);
    resumeKenBurns();
    run({ resetProgress: false });
    updateOverlayState(playing);
  };

  const openLightbox = () => {
    if (!lightbox || typeof lightbox.open !== 'function') return;

    lightboxOpen = true;
    clearLightboxResume();

    if (playing) {
      captureElapsed();
      pauseKenBurns();
      updateOverlayState(false);

      lightboxResumeTimer = setTimeout(() => {
        if (!playing || !lightboxOpen) return;

        resumeKenBurns();
        run({ resetProgress: false });
        updateOverlayState(playing);
      }, LIGHTBOX_RESUME_DELAY);
    } else {
      pauseKenBurns();
    }

    const item = items[order[index]];
    if (item) {
      lightbox.open(item, { onClose: handleLightboxClose });
      updatePlayButton(playing);
    }
  };

  // Frame-Klick toggelt Play/Pause
  frame.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  frame.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      frame.click();
    }
  });

  frame.style.setProperty('--media-animation-interval', `${interval}ms`);

  // ---- API für Thumbs & Lightbox -------------------------------------------

  const api = {
    get items() {
      return items;
    },
    get order() {
      return order;
    },
    get index() {
      return index;
    },
    show,
    next,
    prev,
    subscribeThumbs,
    setLightbox(lb) {
      lightbox = lb;
      updateControlAvailability();
    },
    addControls(rootEl) {
      bindControls(rootEl);
      registerOverlayTargets(rootEl);
      updateOverlayState(playing);
    },
  };

  // Initialer Zustand
  updateControlAvailability();
  updatePlayButton(playing);
  updateOverlayState(playing);
  show(0, 0);
  notifyThumbs(0);

  if (autoplay && hasMultiple) {
    run();
  }

  return api;
}

export default initMediaFrame;
