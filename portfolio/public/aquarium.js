// Background ASCII aquarium. Fish swim behind the page, scatter from the cursor,
// and chase food dropped by clicking empty space. Decorative only (aria-hidden).
const canvas = document.createElement('canvas');
canvas.className = 'aquarium';
canvas.setAttribute('aria-hidden', 'true');
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const css = getComputedStyle(document.documentElement);
const palette = ['--green', '--green', '--amber', '--dim'].map((name) => css.getPropertyValue(name).trim());
const font = 14;
const line = 16;
// Fish are drawn larger than the bubbles and seaweed.
const fishFont = 21;
const fishLine = 23;
const charWidth = fishFont * 0.6;

// Each shape faces right (r) and left (l); multi-line shapes are arrays of rows.
const shapes = [
  { r: ['><>'], l: ['<><'] },
  { r: ['><(((º>'], l: ['<º)))><'] },
  { r: ['><{{°>'], l: ['<°}}><'] },
  { r: ['   __', '\\/ o\\', '/\\__/'], l: [' __', '/o \\/', '\\__/\\'] },
];

let width = 0;
let height = 0;
let fish = [];
let food = [];
let bubbles = [];
let pointer = { x: -1e3, y: -1e3 };
let column = { left: 0, right: 0 };
let running = false;
let last = 0;
let enabled = true;
try { enabled = localStorage.getItem('aquarium') !== 'off'; } catch {}
// A small corner hint that goes away once the visitor has fed the fish.
let fed = false;
try { fed = localStorage.getItem('aquarium-fed') === 'yes'; } catch {}
const hint = document.createElement('p');
hint.className = 'aquarium-hint';
hint.setAttribute('aria-hidden', 'true');
hint.textContent = '><> tap empty space to feed the fish';
document.body.append(hint);
const showHint = () => { hint.classList.toggle('visible', running && !fed); };

const random = (min, max) => min + Math.random() * (max - min);
function spawnFish(anywhere) {
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const dir = Math.random() < 0.5 ? 1 : -1;
  const speed = random(18, 46) / shape.r.length;
  return {
    shape, dir, speed, vy: 0,
    x: anywhere ? random(0, width) : (dir > 0 ? -80 : width + 20),
    y: random(80, height - 90),
    phase: random(0, Math.PI * 2),
    color: palette[Math.floor(Math.random() * palette.length)],
  };
}
function resize() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  width = innerWidth;
  height = innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  // The text column; fish passing behind it are drawn fainter so the copy stays readable.
  const main = document.querySelector('main')?.getBoundingClientRect();
  column = main ? { left: main.left, right: main.right } : { left: 0, right: 0 };
  const count = Math.max(5, Math.min(14, Math.round(width / 110)));
  while (fish.length < count) fish.push(spawnFish(true));
  fish.length = count;
  for (const f of fish) f.y = Math.min(f.y, height - 90);
}

function update(dt, time) {
  for (const f of fish) {
    const rows = f.shape.r.length;
    const fw = Math.max(...f.shape.r.map((row) => row.length)) * charWidth;
    const cx = f.x + fw / 2;
    const cy = f.y + (rows * fishLine) / 2;
    let boost = 1;
    // Chase the nearest food pellet within reach.
    let target = null;
    let best = 320;
    for (const p of food) {
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < best) { best = d; target = p; }
    }
    if (target) {
      f.dir = target.x > cx ? 1 : -1;
      f.vy += Math.sign(target.y - cy) * 40 * dt;
      boost = 2.2;
      if (best < 14) {
        food.splice(food.indexOf(target), 1);
        bubbles.push({ x: cx, y: cy, vy: random(20, 35), phase: random(0, 6) });
      }
    }
    // Scatter from the cursor.
    const away = Math.hypot(pointer.x - cx, pointer.y - cy);
    if (away < 110) {
      f.dir = pointer.x > cx ? -1 : 1;
      f.vy += Math.sign(cy - pointer.y || 1) * 90 * dt;
      boost = 3.5;
    }
    f.vy *= 0.94;
    f.x += f.dir * f.speed * boost * dt;
    f.y += f.vy * dt + Math.sin(time / 900 + f.phase) * 0.15;
    f.y = Math.max(60, Math.min(height - 80, f.y));
    if (f.x > width + 90 || f.x < -120) Object.assign(f, spawnFish(false));
    if (Math.random() < dt * 0.05) bubbles.push({ x: f.dir > 0 ? f.x + fw : f.x, y: f.y, vy: random(18, 32), phase: random(0, 6) });
  }
  for (const p of food) { p.y = Math.min(p.y + 22 * dt, height - 40); p.age += dt; }
  food = food.filter((p) => p.age < 14);
  for (const b of bubbles) { b.y -= b.vy * dt; b.x += Math.sin(time / 300 + b.phase) * 0.3; }
  bubbles = bubbles.filter((b) => b.y > 40).slice(-60);
}

const behindText = (x, w) => x + w > column.left && x < column.right;
function draw(time) {
  ctx.clearRect(0, 0, width, height);
  ctx.font = `${font}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.textBaseline = 'top';
  // Seaweed along the bottom edge.
  ctx.fillStyle = palette[0];
  for (let x = 24; x < width; x += 140) {
    ctx.globalAlpha = behindText(x, 8) ? 0.08 : 0.22;
    const tall = 3 + ((x / 140) % 3);
    for (let i = 0; i < tall; i++) {
      const sway = Math.sin(time / 1200 + x + i * 0.6) > 0;
      ctx.fillText((i % 2 === 0) === sway ? '(' : ')', x + (sway ? 0 : 4), height - 22 - i * line);
    }
  }
  ctx.globalAlpha = 0.3;
  for (const b of bubbles) { ctx.fillStyle = palette[3]; ctx.fillText(b.vy > 26 ? 'o' : '°', b.x, b.y); }
  ctx.globalAlpha = 0.6;
  for (const p of food) { ctx.fillStyle = palette[2]; ctx.fillText('.', p.x, p.y); }
  ctx.font = `${fishFont}px "JetBrains Mono", ui-monospace, monospace`;
  for (const f of fish) {
    ctx.fillStyle = f.color;
    const rows = f.dir > 0 ? f.shape.r : f.shape.l;
    ctx.globalAlpha = behindText(f.x, Math.max(...rows.map((row) => row.length)) * charWidth) ? 0.11 : 0.34;
    rows.forEach((row, i) => ctx.fillText(row, f.x, f.y + i * fishLine));
  }
  ctx.globalAlpha = 1;
}

function frame(now) {
  if (!running) return;
  requestAnimationFrame(frame);
  if (document.hidden || now - last < 33) return;
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  update(dt, now);
  draw(now);
}
function start() {
  canvas.hidden = !enabled;
  running = false;
  showHint();
  if (!enabled) return;
  resize();
  if (reduceMotion.matches) { draw(0); return; }
  running = true;
  showHint();
  last = performance.now();
  requestAnimationFrame(frame);
}

addEventListener('resize', () => { resize(); if (!running && enabled) draw(0); });
addEventListener('pointermove', (event) => { pointer = { x: event.clientX, y: event.clientY }; }, { passive: true });
document.addEventListener('pointerleave', () => { pointer = { x: -1e3, y: -1e3 }; });
// Clicking empty space (not a link, button or text selection) drops food.
document.addEventListener('click', (event) => {
  if (!running || event.target.closest('a, button, summary, input, textarea, dialog, kbd')) return;
  if (!getSelection().isCollapsed) return;
  for (let i = 0; i < 3; i++) food.push({ x: event.clientX + random(-12, 12), y: event.clientY + random(-6, 6), age: 0 });
  if (!fed) { fed = true; try { localStorage.setItem('aquarium-fed', 'yes'); } catch {} showHint(); }
});
reduceMotion.addEventListener('change', start);

const toggle = document.getElementById('aquarium-toggle');
function renderToggle() {
  if (!toggle) return;
  toggle.textContent = enabled ? 'aquarium: on' : 'aquarium: off';
  toggle.setAttribute('aria-pressed', String(enabled));
}
toggle?.addEventListener('click', () => {
  enabled = !enabled;
  try { localStorage.setItem('aquarium', enabled ? 'on' : 'off'); } catch {}
  renderToggle();
  start();
});
renderToggle();
start();
