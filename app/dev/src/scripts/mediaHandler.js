// src/scripts/mediaHandler.js
import { initMediaFrame } from './mediaFrame.js';
import { initMediaThumbs } from './mediaThumbs.js';
import { initMediaLightbox } from './mediaLightbox.js';

export function initMediaHandler({
  root = document,
  thumbsRoot = root,
  withThumbs = true,
  withLightbox = true,
  lightboxRoot = root,
  includeLightboxThumbs = true,
} = {}) {
  const lightbox = withLightbox ? initMediaLightbox({ root: lightboxRoot }) : null;
  const api = initMediaFrame({ root, lightbox });

  if (!api) return null;

  if (lightbox?.el) {
    api.setLightbox(lightbox);
    api.addControls(lightbox.el);
  }

  if (withThumbs) {
    initMediaThumbs(api, thumbsRoot);

    if (lightbox?.el && includeLightboxThumbs) {
      initMediaThumbs(api, lightbox.el);
    }
  }

  return api;
}

export { initMediaFrame, initMediaThumbs, initMediaLightbox };
export default initMediaHandler;
