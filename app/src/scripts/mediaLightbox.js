// src/scripts/mediaLightbox.js
import { loadImageWithTransition } from './utils/_transitionLoader.js';
export function initMediaLightbox({ root = document } = {}) {
  const el = root.querySelector('.media-lightbox');
  if (!el) return null;

  const img = el.querySelector('.media-lightbox-image');
  const closeButton = el.querySelector('.media-lightbox__close');

  if (!img || !closeButton) return null;

  let onClose = null;
  const setVisibility = (visible) => {
    el.setAttribute('data-visible', visible ? 'true' : 'false');
    el.setAttribute('aria-hidden', visible ? 'false' : 'true');
    document.body.classList.toggle('media-lightbox-open', visible);
    el.dispatchEvent(new CustomEvent('media-lightbox-toggle', { detail: { visible } }));
  };

  const handleKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  const close = () => {
    setVisibility(false);


    document.removeEventListener('keydown', handleKey);

    if (typeof onClose === 'function') {
      onClose();
    }
    onClose = null;
  };

  const open = (item, { onClose: closeCb } = {}) => {
    if (!item) return;

    const primary = item.full || item.thumb || '';
    const fallback =
      item.thumb && item.thumb !== primary ? item.thumb : null;

    img.onerror = () => {
      if (fallback && img.src !== fallback) {
        img.src = fallback;
      }
    };
        const width = Number.isFinite(item.width) ? item.width : null;
    const height = Number.isFinite(item.height) ? item.height : null;
    onClose = typeof closeCb === 'function' ? closeCb : null;

    loadImageWithTransition(img, {
      src: item.full,
      alt: item.alt || item.filename || '',
      fallbackSrc: item.thumb || item.full,
      onApply: () => {
        if (width && width > 0) img.width = width;
        else img.removeAttribute('width');

        if (height && height > 0) img.height = height;
        else img.removeAttribute('height');

        delete img.dataset.initialFull;
      },
    });


    setVisibility(true);
    document.addEventListener('keydown', handleKey);
  };

  if (!el.dataset.bound) {
    closeButton.addEventListener('click', close);
    el.addEventListener('click', (e) => {
      if (e.target === el) close();
    });
    el.dataset.bound = 'true';
  }

  return { el, open, close };
}

export default initMediaLightbox;
