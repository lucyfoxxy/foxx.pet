import _isMobile from '@Scripts/utils/_isMobile.js';
// stars-overlay.js
export default function initStarsCanvas(canvas, opts = {}) {

  if(_isMobile()) {return;};

  const ctx = canvas.getContext('2d');
  let animId = null;
  let W = 0, H = 0;

  const fpsCap = opts.fps || 50;               // weiches Cap
  const density = opts.density || 0.25;        // Sterne pro 1k px²
  const glow = opts.glow ?? true;

  let stars = [];
  let last = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(rect.width));
    H = Math.max(1, Math.floor(rect.height));
    canvas.width = W;
    canvas.height = H;

    const target = Math.floor((W * H) / 1000 * density);
    if (target !== stars.length) {
      stars = [];
      for (let i = 0; i < target; i++) {
        stars.push(makeStar());
      }
    }
  }

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
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  animId = requestAnimationFrame(tick);

  // Cleanup für SPA/Hot-swaps:
  return () => { ro.disconnect(); cancelAnimationFrame(animId); };
}

// ===== Hook in deinen Loader =====

