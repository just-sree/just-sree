// Decorative bamboo: local canvas only, capped pixel density, paused off screen.
const motion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.bamboo-canvas').forEach((canvas) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let width = 0, height = 0, frame = 0, visible = false, last = 0, breeze = 0;
  function leaf(x, y, length, angle) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(length * .45, -length * .28, length, 0);
    ctx.quadraticCurveTo(length * .42, length * .11, 0, 0);
    ctx.fill(); ctx.restore();
  }
  function draw(time = 0) {
    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width / 950, 1);
    for (let i = 0; i < 7; i++) {
      const phase = i * 2.1;
      const sway = motion.matches ? 0 : Math.sin(time / 3400 + phase) * .012 + breeze * .016;
      ctx.save();
      ctx.translate(width * (.68 + i * .054), height + 30);
      ctx.rotate(-.13 + i * .035 + sway);
      const tall = height * (.62 + (i % 3) * .19), thick = (8 + i % 3 * 3) * Math.max(scale, .65);
      ctx.fillStyle = i % 2 ? '#527650' : '#2d593f';
      ctx.strokeStyle = '#2d593f';
      ctx.lineWidth = 1;
      for (let n = 0; n < 7; n++) {
        const y = -n * tall / 7;
        ctx.globalAlpha = .12 + i % 3 * .035;
        ctx.beginPath(); ctx.roundRect(-thick / 2, y - tall / 7 + 3, thick, tall / 7 - 6, 3); ctx.fill();
        ctx.globalAlpha = .22; ctx.fillRect(-thick / 2 - 2, y - 3, thick + 4, 2);
        if (n < 2 || (n + i) % 2) continue;
        const side = (n + i) % 3 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(0, y);
        ctx.quadraticCurveTo(side * 36, y - 25, side * 110 * Math.max(scale, .6), y - 42); ctx.stroke();
        for (let k = 1; k < 5; k++) {
          const x = side * k * 22 * Math.max(scale, .6), ly = y - k * 9;
          leaf(x, ly, (35 + k * 5) * Math.max(scale, .6), side > 0 ? -.8 + k * .15 : -2.4 - k * .12);
          leaf(x, ly, 32 * Math.max(scale, .6), side > 0 ? .65 : 2.5);
        }
      }
      ctx.restore();
    }
    if (!motion.matches) {
      ctx.fillStyle = '#6e8855'; ctx.globalAlpha = .2;
      for (let i = 0; i < 4; i++) {
        const y = (time / (60 + i * 13) + i * height / 4) % (height + 80) - 40;
        leaf(width * (.7 + i * .07) + Math.sin(time / 2200 + i) * 25, y, 13 + i * 2, time / 4000 + i);
      }
    }
    ctx.globalAlpha = 1;
  }
  function tick(time) {
    if (!visible || document.hidden || motion.matches) { frame = 0; return; }
    if (time - last >= 32) { draw(time); last = time; }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; draw();
    if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
  }
  new ResizeObserver(() => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); sync();
  }).observe(canvas);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(canvas);
  canvas.parentElement.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    breeze = Math.max(-1, Math.min(1, (event.clientX - rect.left) / width * 2 - 1));
  }, { passive: true });
  canvas.parentElement.addEventListener('pointerleave', () => { breeze = 0; });
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
});
