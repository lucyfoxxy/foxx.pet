// src/scripts/mediaThumbs.js

const MAX_VISIBLE_THUMBS = 7;
const EXTRA_VISIBLE_THUMBS = 0;

const parseLength = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };

export function initMediaThumbs(api, root =document) {
  if (!api) return null;

  const thumbsWrap = root.querySelector('.media-wrapper--thumbs');
  const thumbs = thumbsWrap?.querySelector('.media-wrapper--frames');
  if (!thumbsWrap || !thumbs) return null;

  const thumbsPrev = thumbsWrap.querySelector('.media-prev.is-thumbs-prev');
  const thumbsNext = thumbsWrap.querySelector('.media-next.is-thumbs-next');

  const imgClass = 'media-image media-image--thumb';
  const buttonClass = 'media-frame media-frame--thumb';

  let windowStart = 0;
  const configuredWindow = Math.max(
    1,
    Math.min(parseInt(thumbs.getAttribute('data-window') || '', 10) || MAX_VISIBLE_THUMBS, MAX_VISIBLE_THUMBS),
  );
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

  const highlightThumbs = () => {
    thumbs.querySelectorAll('.media-frame--thumb').forEach((th) => {
      const idx = parseInt(th.dataset.index || '', 10);
      const active = idx === api.index;
      th.classList.toggle('active', active);
      th.setAttribute('data-current', active ? 'true' : 'false');
      th.querySelector('.media-image.media-image--thumb')?.setAttribute('data-current', active ? 'true' : 'false');
    });
  };

  const updateThumbNav = () => {
    const maxStart = getMaxStart();
    thumbsPrev?.toggleAttribute('disabled', windowStart === 0);
    thumbsNext?.toggleAttribute('disabled', windowStart >= maxStart);
    const hide = api.order.length <= maxVisible;
    thumbsPrev?.toggleAttribute('hidden', hide);
    thumbsNext?.toggleAttribute('hidden', hide);
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

  thumbsPrev?.addEventListener('click', () => {
    windowStart = Math.max(0, windowStart - maxVisible);
    renderThumbs();
  });

  thumbsNext?.addEventListener('click', () => {
    const maxStart = getMaxStart();
    if (windowStart < maxStart) {
      windowStart = Math.min(maxStart, windowStart + maxVisible);
      renderThumbs();
    }
  });

  const unsubscribe = api.subscribeThumbs((dir = 0) => { ensureThumbVisibility(dir); highlightThumbs(); });

  renderThumbs();
  window.addEventListener('resize', () => { if (updateMaxVisible()) ensureThumbVisibility(0); });

  return () => { unsubscribe?.(); };
}

export default initMediaThumbs;
