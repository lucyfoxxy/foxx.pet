export function loadImageWithTransition(imgEl, { src, alt = '', fallbackSrc, onApply } = {}) {
  if (!(imgEl instanceof HTMLImageElement) || !src) return null;

  const applyImage = (finalSrc) => {
    imgEl.src = finalSrc;
    imgEl.alt = alt;
    if (typeof onApply === 'function') {
      onApply();
    }
    requestAnimationFrame(() => {
      void imgEl.offsetWidth;
      imgEl.setAttribute('data-animating','true');    
      imgEl.setAttribute('data-transitioning','false');
    });
  };

  const loader = new Image();
  loader.decoding = 'async';
  imgEl.setAttribute('data-animating','false');
  imgEl.setAttribute('data-transitioning','true');
      

  loader.addEventListener('load', () => {
    applyImage(src);
  }, { once: true });

  loader.addEventListener('error', () => {
    applyImage(fallbackSrc ?? src);
  }, { once: true });

  loader.src = src;
  return loader;
}
