import { createGalleryItemsBySlug } from './utils/_slugLoader.js';
import { loadImageWithTransition } from './utils/_transitionLoader.js';

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
const MAX_VISIBLE_THUMBS = 7;
const EXTRA_VISIBLE_THUMBS = 0;

const parseLength = (value) => {
  const length = parseFloat(value);
  return Number.isFinite(length) ? length : null;
};

const buildRemoteUrl = (id, shareKey, kind) => {
  if (!id || !shareKey) return undefined;
  const endpoint = kind === 'thumb' ? 'thumbnail' : 'original';
  return `https://img.foxx.pet/api/assets/${id}/${endpoint}?key=${shareKey}`;
};

export default function initGalleryPage() {

    const frame = document.querySelector('.media-frame[data-slug]');
  if (!frame) return;

  const slug     = frame.getAttribute('data-slug');
  const autoplay = frame.getAttribute('data-autoplay') === 'true';
  const random   = frame.getAttribute('data-random') === 'true';
  const interval = parseInt(frame.getAttribute('data-interval') || '7000', 10);
  const imgEl     = frame?.querySelector('.media-image');
  const controls = document.querySelector('.card__overlay--controls');
  const btnPrev = controls?.querySelector('.media-controls.media-prev');
  const btnNext = controls?.querySelector('.media-controls.media-next');
  const btnPlay = controls?.querySelector('.media-controls.media-play');
  const btnPause = controls?.querySelector('.media-controls.media-pause');
  const btnFullscreen = controls?.querySelector('.media-controls.media-fullscreen');
  const progress = controls?.querySelector('.media-progress');
  const thumbsWrap = document.querySelector('.media-wrapper--thumbs');
  const thumbs = thumbsWrap?.querySelector('.media-wrapper--frames');
  const thumbsPrev = thumbsWrap?.querySelector('.media-controls.media-prev.is-thumbs-prev');
  const thumbsNext = thumbsWrap?.querySelector('.media-controls.media-next.is-thumbs-next');
  const imgClass = 'media-image media-image--thumb'
  const buttonClass = 'media-frame media-frame--thumb';

  const albumEntry = itemsBySlug.get(slug);
  const attrShareKey = frame.getAttribute('data-share-key') || undefined;
  const { items: rawItems = [], shareKey: albumShareKey } = Array.isArray(albumEntry)
    ? { items: albumEntry, shareKey: attrShareKey }
    : albumEntry ?? {};

  const resolvedShareKey = albumShareKey || attrShareKey || undefined;

  const items = rawItems.reduce((acc, raw) => {
    if (!raw || typeof raw !== 'object') return acc;
    const itemShareKey = raw.shareKey || resolvedShareKey || undefined;
    const id = raw.id || undefined;
    const full = raw.full
      || buildRemoteUrl(id, itemShareKey, 'full')
      || null;
    const thumb = raw.thumb
      || buildRemoteUrl(id, itemShareKey, 'thumb')
      || raw.full
      || full
      || null;

    if (!full) return acc;

    acc.push({
      ...raw,
      id,
      shareKey: itemShareKey,
      full,
      thumb,
    });
    return acc;
  }, []);

  const order = items.map((_, index) => index);
  if (random) order.sort(() => Math.random() - 0.5);

  imgEl.decoding = 'async';

  if (order.length === 0) {
    progress.hidden = true;
    btnPrev.disabled = true;
    btnNext.disabled = true;
    btnPlay.disabled = true;
    btnPlay.hidden = true;
    thumbsPrev.hidden = true;
    thumbsNext.hidden = true;
    const empty = document.createElement('p');
    empty.className = 'media-empty';
    empty.textContent = 'No artworks available yet.';
    thumbs?.removeAttribute('role');
    thumbsWrap.replaceChildren(empty);
    return;
  }

  const hasMultiple = order.length > 1;
  btnPrev.disabled = btnNext.disabled = !hasMultiple;
  btnPrev.hidden = btnNext.hidden = !hasMultiple;
  btnPlay.hidden = !hasMultiple;
  progress.hidden = !hasMultiple;
  let i = 0;
  let timer = null;
  let playing = hasMultiple && autoplay;
  let elapsedBeforePause = 0;
  let tickStartTime = 0;
  let resumeAfterLightbox = false;
  let pauseKenBurns = () => {};
  let resumeKenBurns = () => {};
  let windowStart = 0;
  const configuredWindow = Math.max(
    1,
    Math.min(parseInt(thumbs.getAttribute('data-window') || '', 10) || MAX_VISIBLE_THUMBS, MAX_VISIBLE_THUMBS),
  );
  let maxVisible = configuredWindow;

  const computeWindowFromLayout = () => {
    const wrapRect = thumbsWrap.getBoundingClientRect();
    const thumbsRect = thumbs.getBoundingClientRect();
    const availableWidth = wrapRect.width || thumbsRect.width;

    if (!availableWidth) return configuredWindow;

    const styles = getComputedStyle(thumbsWrap);
    const sampleThumb = thumbs.querySelector('.media-frame.is-thumb');
    const sampleWidth = sampleThumb?.getBoundingClientRect().width;
    const thumbSize = (sampleWidth && sampleWidth > 0)
      ? sampleWidth
      : parseLength(styles.gridAutoColumns)
        ?? parseLength(styles.getPropertyValue('--thumb-size'));
    const gap = parseLength(styles.columnGap) ?? parseLength(styles.gap) ?? 0;

    if (!thumbSize || thumbSize <= 0) return configuredWindow;

    const totalWidthPerThumb = thumbSize + gap;
    if (totalWidthPerThumb <= 0) return configuredWindow;

    const fit = Math.floor((availableWidth + gap) / totalWidthPerThumb);
    return Math.max(1, fit);
  };

  const updateMaxVisible = () => {
    const layoutWindow = computeWindowFromLayout();
    const next = Math.max(1, Math.min(configuredWindow, layoutWindow));
    if (next === maxVisible) return false;

    maxVisible = next;
    if (windowStart + maxVisible > order.length) {
      windowStart = Math.max(0, order.length - maxVisible);
    }
    return true;
  };

  thumbs.toggleAttribute('data-has-multiple', hasMultiple);
  thumbsPrev.hidden = thumbsNext.hidden = order.length <= maxVisible;

  const setProgress = (p) => progress.style.setProperty('--p', String(p));
  const updatePlayButton = () => {
    btnPause.setAttribute('data-active', playing ? true : false);
    btnPlay.setAttribute('data-active', playing ? false : true);
    btnPlay.setAttribute('aria-label', playing ? 'Pause autoplay' : 'Resume autoplay');
  };

  frame.style.setProperty('--gallery-interval', `${interval}ms`);

  const lightbox = (() => {
    let overlay = document.querySelector('.media-lightbox');
    let created = false;
    if (!(overlay instanceof HTMLElement)) {
      overlay = document.createElement('div');
      overlay.className = 'media-lightbox';
      overlay.innerHTML = `
        <figure>
          <img class="media-lightbox-image" alt="" />
          
          <button class="media-lightbox__close" type="button" aria-label="Close">×</button>
        </figure>
      `;
      document.body.appendChild(overlay);
      created = true;
    }

    const img = overlay.querySelector('.media-lightbox-image');
    
    const btnClose = overlay.querySelector('.media-lightbox__close');

    if (!img || !btnClose) {
      if (created) overlay.remove();
      return null;
    }

    const close = () => {
      overlay.classList.remove('is-open');
      document.body.classList.remove('media-lightbox-open');
      document.removeEventListener('keydown', handleKey);
      if (resumeAfterLightbox) {
        playing = true;
        resumeAfterLightbox = false;
        updatePlayButton();
        resumeKenBurns();
        run({ resetProgress: false });
      }
    };

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };

    if (!(overlay instanceof HTMLElement)) return null;

    if (!overlay.dataset.bound) {
      btnClose.addEventListener('click', close);
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) close();
      });
      overlay.dataset.bound = 'true';
    }

    return {
      open(item) {
        if (!item) return;

        const primarySrc = item.full || item.thumb || '';
        const fallbackSrc = item.thumb && item.thumb !== primarySrc ? item.thumb : null;
        img.onerror = () => {
          if (fallbackSrc && img.src !== fallbackSrc) {
            img.src = fallbackSrc;
          }
        };
        img.src = primarySrc;
        img.alt = item.alt || '';
        overlay.classList.add('is-open');
        document.body.classList.add('media-lightbox-open');
        document.addEventListener('keydown', handleKey);
      },
      close,
    };
  })();

  const getMaxStart = () => Math.max(0, order.length - maxVisible);

  const renderThumbs = () => {
    updateMaxVisible();
    const fragment = document.createDocumentFragment();
    const end = Math.min(order.length, windowStart + maxVisible + EXTRA_VISIBLE_THUMBS);

    for (let orderIdx = windowStart; orderIdx < end; orderIdx += 1) {
      const item = items[order[orderIdx]];
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
      button.addEventListener('click', () => {
        show(orderIdx, 0);
        run();
      });
      fragment.appendChild(button);
    }

    thumbs.replaceChildren(fragment);
    highlightThumbs();
    updateThumbNav();
  };

  const highlightThumbs = () => {
    thumbs.querySelectorAll('.media-frame.is-thumb').forEach((thumb) => {
      const thumbIndex = parseInt(thumb.dataset.index || '', 10);
      const isActive = thumbIndex === i;
      thumb.classList.toggle('active', isActive);
      thumb.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
  };

  const ensureThumbVisibility = (direction = 0) => {
    const maxStart = getMaxStart();

    if (direction > 0) {
      if (i < windowStart) {
        windowStart = i;
      } else if (i >= windowStart + maxVisible - 1 && windowStart < maxStart) {
        windowStart = Math.min(i, maxStart);
      }
    } else if (direction < 0) {
      if (i > windowStart + maxVisible - 1) {
        windowStart = Math.max(0, Math.min(i - maxVisible + 1, maxStart));
      } else if (i <= windowStart && windowStart > 0) {
        const target = Math.max(0, Math.min(maxStart, i - maxVisible + 1));
        windowStart = target;
      }
    } else {
      if (i < windowStart) {
        windowStart = i;
      } else if (i >= windowStart + maxVisible) {
        windowStart = Math.max(0, Math.min(i - maxVisible + 1, maxStart));
      }
    }

    renderThumbs();
  };

  const handleResize = () => {
    if (updateMaxVisible()) {
      ensureThumbVisibility(0);
    }
  };

  const updateThumbNav = () => {
    const maxStart = getMaxStart();
    thumbsPrev.disabled = windowStart === 0;
    thumbsNext.disabled = windowStart >= maxStart;
    thumbsPrev.hidden = thumbsNext.hidden = order.length <= maxVisible;
  };

  const show = (idx, direction = 0) => {
    if (order.length === 0) return;
    i = (idx + order.length) % order.length;
    const item = items[order[i]];
    if (!item) return;

    const altText = item.alt || item.filename || '';
    const width = Number.isFinite(item.width) ? item.width : null;
    const height = Number.isFinite(item.height) ? item.height : null;

    loadImageWithTransition(imgEl, {
      src: item.full,
      alt: altText,
      fallbackSrc: item.thumb || item.full,
      onApply: () => {
        if (width && width > 0) {
          imgEl.width = width;
        } else {
          imgEl.removeAttribute('width');
        }
        if (height && height > 0) {
          imgEl.height = height;
        } else {
          imgEl.removeAttribute('height');
        }
        delete imgEl.dataset.initialFull;
      },
    });

    ensureThumbVisibility(direction);
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
      const progressValue = elapsed / interval;
      setProgress(progressValue);
      if (progressValue >= 1) {
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

  pauseKenBurns = () => {
    imgEl.classList.remove('is-transitioning');
    imgEl.style.opacity = '1';
    imgEl.style.animationPlayState = 'paused';
  };

  resumeKenBurns = () => {
    if (imgEl.style.animationPlayState !== 'paused') return;
    imgEl.style.animationPlayState = '';
    imgEl.style.opacity = '';
  };

  const run = ({ resetProgress = true } = {}) => {
    if (timer) cancelAnimationFrame(timer);
    timer = null;
    if (resetProgress) {
      elapsedBeforePause = 0;
      setProgress(0);
    } else {
      setProgress(Math.min(1, elapsedBeforePause / interval));
    }
    if (playing) {
      resumeKenBurns();
      tick();
    }
  };

  const captureElapsed = () => {
    if (!timer) return;
    const now = performance.now();
    elapsedBeforePause = Math.min(interval, elapsedBeforePause + (now - tickStartTime));
    cancelAnimationFrame(timer);
    timer = null;
    tickStartTime = 0;
  };

  btnPrev.addEventListener('click', (event) => {
    event.stopPropagation();
    prev();
    run();
  });
  btnNext.addEventListener('click', (event) => {
    event.stopPropagation();
    next();
    run();
  });
  btnPlay.addEventListener('click', (event) => {
    event.stopPropagation();
    const wasPlaying = playing;
    playing = !playing;
    updatePlayButton();
    document.querySelectorAll('.card__overlay--hover').forEach((overlay) => {
      overlay.setAttribute('data-show',false) });    
    if (wasPlaying && !playing) {
      captureElapsed();
      pauseKenBurns();
    } else if (!wasPlaying && playing) {
      resumeKenBurns();
      run({ resetProgress: false });
    }
  });
  btnPause.addEventListener('click', (event) => {
    event.stopPropagation();
    const wasPlaying = playing;
    playing = !playing;
    updatePlayButton();
    document.querySelectorAll('.card__overlay--hover').forEach((overlay) => {
      overlay.setAttribute('data-show',true) });
    if (wasPlaying && !playing) {
      captureElapsed();
      pauseKenBurns();
    } else if (!wasPlaying && playing) {
      resumeKenBurns();
      run({ resetProgress: false });
    }
  });
  window.addEventListener('resize', handleResize);

  thumbsPrev.addEventListener('click', () => {
    windowStart = Math.max(0, windowStart - maxVisible);
    renderThumbs();
  });
  thumbsNext.addEventListener('click', () => {
    const maxStart = getMaxStart();
    if (windowStart < maxStart) {
      windowStart = Math.min(maxStart, windowStart + maxVisible);
      renderThumbs();
    }
  });

  btnFullscreen.addEventListener('click', (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest('button')) return;
    if (lightbox) {
      if (playing) {
        captureElapsed();
        resumeAfterLightbox = true;
        playing = false;
        updatePlayButton();
      }
      pauseKenBurns();
      lightbox.open(items[order[i]]);
    }
  });

  frame.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      frame.click();
    }
  });

  // Thumbnails rendern
  renderThumbs();
  updatePlayButton();
  show(0, 0);
  requestAnimationFrame(handleResize);
  if (autoplay && hasMultiple) run();
}
