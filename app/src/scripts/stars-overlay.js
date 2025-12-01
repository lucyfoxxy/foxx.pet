import _isMobile from '@Scripts/utils/_isMobile.js';

// stars-overlay.js
export default function initStarsCanvas(canvas, opts = {}) {
  if (_isMobile()) return;

  const ctx = canvas.getContext('2d');
  let animId = null;
  let W = 0;
  let H = 0;

  const fpsCap = opts.fps ?? 50;           // weiches Cap
  const density = opts.density ?? 0.25;    // Sterne pro 1k px²
  const glow = opts.glow ?? true;

  // >>> NEU: Toleranzen für Resize <<<
  const resizeTolerancePx = opts.resizeTolerancePx ?? 1140;   // min. absolute Änderung
  const resizeToleranceRatio = opts.resizeToleranceRatio ?? 0.06; // min. relative Änderung (~6%)

  let stars = [];
  let last = 0;

  function makeStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      len: 1 + Math.random() * 2,
      op: Math.random(),
      inc: Math.random() * 0.03,
      fac: 1,
      rot: Math.random() * Math.PI * 2,
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const newW = Math.max(1, Math.floor(rect.width));
    const newH = Math.max(1, Math.floor(rect.height));

    const prevW = W || newW;
    const prevH = H || newH;

    if (W && H) {
      const diffW = Math.abs(newW - prevW);
      const diffH = Math.abs(newH - prevH);
      const relDiff = Math.max(diffW / prevW, diffH / prevH);

      const withinPx = diffW < resizeTolerancePx && diffH < resizeTolerancePx;
      const withinRatio = relDiff < resizeToleranceRatio;

      // Kleine Layout-Wackler -> nur Canvasgröße anpassen, Sterne nicht anfassen
      if (withinPx && withinRatio) {
        W = newW;
        H = newH;
        canvas.width = W;
        canvas.height = H;
        return;
      }
    }

    W = newW;
    H = newH;
    canvas.width = W;
    canvas.height = H;

    const target = Math.floor((W * H) / 1000 * density);
    const scaleX = prevW > 0 ? W / prevW : 1;
    const scaleY = prevH > 0 ? H / prevH : 1;

    // existierende Sterne mit skalieren, damit kein „Hard Reset“ sichtbar wird
    for (const star of stars) {
      star.x = Math.min(W, Math.max(0, star.x * scaleX));
      star.y = Math.min(H, Math.max(0, star.y * scaleY));
    }

    if (target > stars.length) {
      for (let i = stars.length; i < target; i++) {
        stars.push(makeStar());
      }
    } else if (target < stars.length) {
      stars.length = target;
    }
  }

  function drawStar(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);

    if (s.op > 1) s.fac = -1;
    else if (s.op <= 0) {
      s.fac = 1;
      s.x = Math.random() * W;
      s.y = Math.random() * H;
    }
    s.op += s.inc * s.fac;

    ctx.beginPath();
    for (let i = 5; i--;) {
      ctx.lineTo(0, s.len);
      ctx.translate(0, s.len);
      ctx.rotate(Math.PI * 2 / 10);
      ctx.lineTo(0, -s.len);
      ctx.translate(0, -s.len);
      ctx.rotate(-(Math.PI * 6 / 10));
    }
    ctx.lineTo(0, s.len);
    ctx.closePath();

    if (glow) {
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#8c62ffe6';
    }
    ctx.fillStyle = `rgba(225,200,255,${s.op})`;
    ctx.fill();
    ctx.restore();
  }

  function tick(ts) {
    animId = requestAnimationFrame(tick);
    if (ts - last < 1000 / fpsCap) return;
    last = ts;

    ctx.clearRect(0, 0, W, H);
    for (const s of stars) drawStar(s);
  }

  // init
  resize();

  // >>> NEU: ResizeObserver debouncen <<<
  let resizeQueued = false;
  const ro = new ResizeObserver(() => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      resize();
    });
  });
  ro.observe(canvas);

  animId = requestAnimationFrame(tick);

  // Cleanup für SPA/Hot-swaps:
  return () => {
    ro.disconnect();
    cancelAnimationFrame(animId);
  };
}
