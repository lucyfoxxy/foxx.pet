// src/scripts/mediaLightbox.js

export function initMediaLightbox({ root = document } = {}) {
  const el = root.querySelector('.media-lightbox');
  if (!el) return null;

  const img = el.querySelector('.media-lightbox-image');
  const closeButton = el.querySelector('.media-lightbox__close');

  if (!img || !closeButton) return null;

  let onClose = null;

  const handleKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  const close = () => {
    el.setAttribute('data-visible', 'false');
   
   
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

    onClose = typeof closeCb === 'function' ? closeCb : null;

    img.src = primary;
    img.alt = item.alt || '';

    el.setAttribute('data-visible', 'true');
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
