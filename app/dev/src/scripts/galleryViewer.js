// src/scripts/galleryViewer.js
import { createGalleryItemsBySlug } from './utils/_slugLoader.js';
import { loadImageWithTransition } from './utils/_transitionLoader.js';

const metas = import.meta.glob('@Content/album/**/*.json', { query: '?json', eager: true });
const assetModules = import.meta.glob('@Assets/albums/**/*', { query: '?url', import: 'default', eager: true });
const itemsBySlug = createGalleryItemsBySlug(metas, assetModules);

const MAX_VISIBLE_THUMBS = 7;
const EXTRA_VISIBLE_THUMBS = 0;

const parseLength = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
const buildRemoteUrl = (id, key, kind) => (id && key) ? `https://img.foxx.pet/api/assets/${id}/${kind === 'thumb' ? 'thumbnail' : 'original'}?key=${key}` : undefined;

export function initGalleryFrame(root = document) {
  const wrapper = root.querySelector('.media-wrapper.media-wrapper--controls');
  if (!wrapper) return null;

  const overlay = wrapper.querySelectorAll('.card__overlay--hover');
  const frame = wrapper.querySelector('.media-frame[data-slug]');
  const slug = frame.getAttribute('data-slug');
  const autoplay = frame.getAttribute('data-autoplay') === 'true';
  const random = frame.getAttribute('data-random') === 'true';
  const interval = parseInt(frame.getAttribute('data-interval') || '8500', 10);
  const imgEl = frame.querySelector('.media-image');

  const controls = wrapper.querySelector('.card__overlay--controls');
  const btnPrev = controls?.querySelector('.media-prev');
  const btnNext = controls?.querySelector('.media-next');
  const btnPlay = controls?.querySelector('.media-play');
  const btnPause = controls?.querySelector('.media-pause');
  const btnFullscreen = controls?.querySelector('.media-fullscreen');
  const progress = controls?.querySelector('.media-progress');

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
    const thumb = raw.thumb || buildRemoteUrl(id, key, 'thumb') || raw.full || full || null;
    if (!full) return acc;
    acc.push({ ...raw, id, shareKey: key, full, thumb });
    return acc;
  }, []);

  const order = items.map((_, i) => i);
  if (random) order.sort(() => Math.random() - 0.5);

  imgEl.decoding = 'async';

  const hasMultiple = order.length > 1;
  if (btnPrev && btnNext) {
    btnPrev.disabled = btnNext.disabled = !hasMultiple;
    btnPrev.hidden = btnNext.hidden = !hasMultiple;
  }
  if (btnPlay && progress) {
    btnPlay.hidden = !hasMultiple;
    progress.hidden = !hasMultiple;
  }

  let i = 0, timer = null, playing = hasMultiple && autoplay;
  let elapsedBeforePause = 0, tickStartTime = 0;
  let resumeAfterLightbox = false;
  let pauseKenBurns = () => {};
  let resumeKenBurns = () => {};

  const setProgress = (p) => progress?.style.setProperty('--p', String(p));
  const updatePlayButton = () => {
    btnPause?.setAttribute('data-active', playing ? 'true' : 'false');
    btnPlay?.setAttribute('data-active', playing ? 'false' : 'true');
    btnPlay?.setAttribute('aria-label', playing ? 'Pause autoplay' : 'Resume autoplay');
  };
  const updateOverlayState = () => overlay.forEach(o => o.setAttribute('data-show', playing ? 'false' : 'true'));

  frame.style.setProperty('--gallery-interval', `${interval}ms`);

  const lightbox = (() => {
    let overlay = document.querySelector('.media-lightbox');
    let created = false;
    if (!(overlay instanceof HTMLElement)) {
      overlay = document.createElement('div');
      overlay.className = 'media-lightbox';
      overlay.innerHTML = `<figure><img class="media-lightbox-image" alt="" /><button class="media-lightbox__close" type="button" aria-label="Close">×</button></figure>`;
      document.body.appendChild(overlay);
      created = true;
    }
    const img = overlay.querySelector('.media-lightbox-image');
    const btnClose = overlay.querySelector('.media-lightbox__close');
    if (!img || !btnClose) { if (created) overlay.remove(); return null; }

    const close = () => {
      overlay.classList.remove('is-open');
      document.body.classList.remove('media-lightbox-open');
      document.removeEventListener('keydown', handleKey);
      if (resumeAfterLightbox) {
        playing = true; resumeAfterLightbox = false; updatePlayButton(); resumeKenBurns(); run({ resetProgress:false });
      }
    };
    const handleKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
    if (!overlay.dataset.bound) {
      btnClose.addEventListener('click', close);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
      overlay.dataset.bound = 'true';
    }
    return {
      open(item) {
        if (!item) return;
        const primary = item.full || item.thumb || '';
        const fallback = item.thumb && item.thumb !== primary ? item.thumb : null;
        img.onerror = () => { if (fallback && img.src !== fallback) img.src = fallback; };
        img.src = primary; img.alt = item.alt || '';
        overlay.classList.add('is-open'); document.body.classList.add('media-lightbox-open');
        document.addEventListener('keydown', handleKey);
      },
      close,
    };
  })();

  const show = (idx, direction = 0) => {
    if (order.length === 0) return;
    i = (idx + order.length) % order.length;
    const item = items[order[i]]; if (!item) return;

    const width  = Number.isFinite(item.width)  ? item.width  : null;
    const height = Number.isFinite(item.height) ? item.height : null;

    loadImageWithTransition(imgEl, {
      src: item.full,
      alt: item.alt || item.filename || '',
      fallbackSrc: item.thumb || item.full,
      onApply: () => {
        if (width && width > 0) imgEl.width = width; else imgEl.removeAttribute('width');
        if (height && height > 0) imgEl.height = height; else imgEl.removeAttribute('height');
        delete imgEl.dataset.initialFull;
      },
    });

    api._notifyThumbs(direction);
    setProgress(0);
  };

  const next = () => show(i + 1, 1);
  const prev = () => show(i - 1, -1);

  const tick = () => {
    tickStartTime = performance.now();
    const step = () => {
      if (!playing) return;
      const now = performance.now();
      const elapsed = Math.min(interval, elapsedBeforePause + (now - tickStartTime));
      const p = elapsed / interval;
      setProgress(p);
      if (p >= 1) { elapsedBeforePause = 0; tickStartTime = 0; next(); run(); }
      else { timer = requestAnimationFrame(step); }
    };
    timer = requestAnimationFrame(step);
  };

  pauseKenBurns = () => { imgEl.classList.remove('is-transitioning'); imgEl.style.opacity='1'; imgEl.style.animationPlayState='paused'; };
  resumeKenBurns = () => { if (imgEl.style.animationPlayState !== 'paused') return; imgEl.style.animationPlayState=''; imgEl.style.opacity=''; };

  const run = ({ resetProgress = true } = {}) => {
    if (timer) cancelAnimationFrame(timer); timer = null;
    if (resetProgress) { elapsedBeforePause = 0; setProgress(0); }
    else { setProgress(Math.min(1, elapsedBeforePause / interval)); }
    if (playing) { resumeKenBurns(); tick(); updateOverlayState(); }
  };

  const captureElapsed = () => {
    if (!timer) return;
    const now = performance.now();
    elapsedBeforePause = Math.min(interval, elapsedBeforePause + (now - tickStartTime));
    cancelAnimationFrame(timer); timer = null; tickStartTime = 0;
  };

  // Controls
  btnPrev?.addEventListener('click', (e) => { e.stopPropagation(); prev(); run(); });
  btnNext?.addEventListener('click', (e) => { e.stopPropagation(); next(); run(); });
  frame.addEventListener('click', (e) => {
    e.stopPropagation();
    const was = playing; playing = !playing; updatePlayButton(); updateOverlayState();
    if (was && !playing) { captureElapsed(); pauseKenBurns(); }
    else if (!was && playing) { resumeKenBurns(); run({ resetProgress:false }); }
  });
  btnPlay?.addEventListener('click', (e) => { e.stopPropagation(); frame.click(); });
  btnPause?.addEventListener('click', (e) => { e.stopPropagation(); frame.click(); });

  btnFullscreen?.addEventListener('click', (e) => {
    const t = e.target; if (t instanceof HTMLElement && t.closest('button')) return;
    if (!lightbox) return;
    if (playing) { captureElapsed(); resumeAfterLightbox = true; playing = false; updatePlayButton(); }
    pauseKenBurns(); lightbox.open(items[order[i]]);
  });

  frame.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); frame.click(); } });

  // API für Thumbs
  const api = {
    get items() { return items; },
    get order() { return order; },
    get index() { return i; },
    show,
    next,
    prev,
    _notifyThumbs: () => {},           // wird von initGalleryThumbs überschrieben
  };

  // initial
  updatePlayButton();
  updateOverlayState();
  show(0, 0);
  if (autoplay && hasMultiple) run();

  return api;
}

export function initGalleryThumbs(api, root = document) {
  if (!api) return null;

  const thumbsWrap = root.querySelector('.media-wrapper--thumbs');
  const thumbs = thumbsWrap?.querySelector('.media-wrapper--frames');
  const thumbsPrev = thumbsWrap?.querySelector('.media-prev.is-thumbs-prev');
  const thumbsNext = thumbsWrap?.querySelector('.media-next.is-thumbs-next');
  if (!thumbsWrap || !thumbs) return null;

  const imgClass = 'media-image media-image--thumb';
  const buttonClass = 'media-frame media-frame--thumb';

  let windowStart = 0;
  const configuredWindow = Math.max(1, Math.min(parseInt(thumbs.getAttribute('data-window') || '', 10) || MAX_VISIBLE_THUMBS, MAX_VISIBLE_THUMBS));
  let maxVisible = configuredWindow;

  const parseLen = (el) => {
    const styles = getComputedStyle(el);
    const sample = thumbs.querySelector('.media-frame.is-thumb');
    const sampleWidth = sample?.getBoundingClientRect().width;
    const thumbSize = (sampleWidth && sampleWidth > 0)
      ? sampleWidth
      : parseLength(styles.gridAutoColumns) ?? parseLength(styles.getPropertyValue('--thumb-size'));
    const gap = parseLength(styles.columnGap) ?? parseLength(styles.gap) ?? 0;
    return { thumbSize, gap };
  };

  const getMaxStart = () => Math.max(0, api.order.length - maxVisible);

  const computeWindowFromLayout = () => {
    const wrapRect = thumbsWrap.getBoundingClientRect();
    const { thumbSize, gap } = parseLen(thumbsWrap);
    if (!thumbSize || thumbSize <= 0) return configuredWindow;
    const fit = Math.floor((wrapRect.width + (gap ?? 0)) / (thumbSize + (gap ?? 0)));
    return Math.max(1, fit);
  };

  const updateMaxVisible = () => {
    const next = Math.max(1, Math.min(configuredWindow, computeWindowFromLayout()));
    if (next === maxVisible) return false;
    maxVisible = next;
    if (windowStart + maxVisible > api.order.length) {
      windowStart = Math.max(0, api.order.length - maxVisible);
    }
    return true;
  };

  const renderThumbs = () => {
    updateMaxVisible();
    const fragment = document.createDocumentFragment();
    const end = Math.min(api.order.length, windowStart + maxVisible + EXTRA_VISIBLE_THUMBS);

    for (let orderIdx = windowStart; orderIdx < end; orderIdx += 1) {
      const item = api.items[api.order[orderIdx]];
      if (!item) continue;

      const button = document.createElement('button');
      button.className = buttonClass;
      button.type = 'button';
      button.dataset.index = String(orderIdx);
      button.setAttribute('aria-label', item.alt || `Image ${orderIdx + 1}`);
      button.setAttribute('role', 'listitem');

      const img = document.createElement('img');
      img.className = imgClass;
      img.src = item.thumb || item.full;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';

      button.appendChild(img);
      button.addEventListener('click', () => api.show(orderIdx, 0));
      fragment.appendChild(button);
    }

    thumbs.replaceChildren(fragment);
    highlightThumbs();
    updateThumbNav();
  };

  const highlightThumbs = () => {
    thumbs.querySelectorAll('.media-frame--thumb').forEach((th) => {
      const idx = parseInt(th.dataset.index || '', 10);
      const active = idx === api.index;
      th.classList.toggle('active', active);
      th.setAttribute('data-current', active ? 'true' : 'false');
      th.querySelector('.media-image.media-image--thumb')?.setAttribute('data-current', active ? 'true' : 'false');
    });
  };

  const ensureThumbVisibility = (direction = 0) => {
    const maxStart = getMaxStart();

    if (direction > 0) {
      if (api.index < windowStart) {
        windowStart = api.index;
      } else if (api.index >= windowStart + maxVisible - 1 && windowStart < maxStart) {
        windowStart = Math.min(api.index, maxStart);
      }
    } else if (direction < 0) {
      if (api.index > windowStart + maxVisible - 1) {
        windowStart = Math.max(0, Math.min(api.index - maxVisible + 1, maxStart));
      } else if (api.index <= windowStart && windowStart > 0) {
        windowStart = Math.max(0, Math.min(maxStart, api.index - maxVisible + 1));
      }
    } else {
      if (api.index < windowStart) {
        windowStart = api.index;
      } else if (api.index >= windowStart + maxVisible) {
        windowStart = Math.max(0, Math.min(api.index - maxVisible + 1, maxStart));
      }
    }

    renderThumbs();
  };

  const updateThumbNav = () => {
    const maxStart = getMaxStart();
    thumbsWrap.querySelector('.is-thumbs-prev')?.toggleAttribute('disabled', windowStart === 0);
    thumbsWrap.querySelector('.is-thumbs-next')?.toggleAttribute('disabled', windowStart >= maxStart);
    const hide = api.order.length <= maxVisible;
    thumbsWrap.querySelector('.is-thumbs-prev')?.toggleAttribute('hidden', hide);
    thumbsWrap.querySelector('.is-thumbs-next')?.toggleAttribute('hidden', hide);
  };

  // Wire buttons
  thumbsWrap.querySelector('.is-thumbs-prev')?.addEventListener('click', () => {
    windowStart = Math.max(0, windowStart - maxVisible);
    renderThumbs();
  });

  thumbsWrap.querySelector('.is-thumbs-next')?.addEventListener('click', () => {
    const maxStart = getMaxStart();
    if (windowStart < maxStart) {
      windowStart = Math.min(maxStart, windowStart + maxVisible);
      renderThumbs();
    }
  });

  // API hook: vom Frame benachrichtigen lassen (Richtung)
  api._notifyThumbs = (dir = 0) => { ensureThumbVisibility(dir); highlightThumbs(); };

  // initial
  renderThumbs();
  window.addEventListener('resize', () => { if (updateMaxVisible()) ensureThumbVisibility(0); });

  return true;
}

// Backwards-Compat: alte Initialisierung (Entry)
export default function initGalleryPage() {
  const api = initGalleryFrame();
  if (api) initGalleryThumbs(api);
}
