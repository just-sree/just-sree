// Page behaviour for the portfolio: figures, fitted type, collapsible project panels and motion.
// The agent and project dialogs live in app.js.
const $ = (selector, root = document) => [...root.querySelectorAll(selector)];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Seat map: curved rows of dots.
const NS = 'http://www.w3.org/2000/svg';
const seats = document.getElementById('seats');
for (let row = 0; row < 6; row++) {
  const count = 14 + row * 2, y0 = 22 + row * 16, half = 150 + row * 4;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1) * 2 - 1, dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', 180 + t * half); dot.setAttribute('cy', y0 + t * t * 14); dot.setAttribute('r', 3.8);
    dot.setAttribute('fill', (row + i) % 9 === 4 ? 'var(--pa)' : 'none');
    dot.setAttribute('stroke', 'var(--pa)'); dot.setAttribute('stroke-width', 1.2);
    seats.appendChild(dot);
  }
}

// Rows of squares: data-pips="won/total".
for (const el of $('[data-pips]')) {
  const [on, total] = el.dataset.pips.split('/').map(Number);
  const dots = document.createElement('span');
  dots.className = 'dots';
  for (let i = 0; i < total; i++) dots.appendChild(Object.assign(document.createElement('i'), { className: i < on ? 'on' : '' }));
  el.append(dots, Object.assign(document.createElement('span'), { textContent: `${on} of ${total}` }));
}

// Hasten waveform bars.
for (const wave of $('.wave')) {
  for (let i = 0; i < 24; i++) {
    const bar = document.createElement('i');
    bar.style.animationDelay = -Math.random() + 's';
    bar.style.animationDuration = 0.55 + Math.random() * 0.6 + 's';
    wave.appendChild(bar);
  }
}

// Fit oversized type to the width of its container.
function fit() {
  for (const el of $('[data-fit]')) {
    el.style.fontSize = '100px';
    el.style.fontSize = Math.floor(100 * el.clientWidth / el.querySelector('.fit .rise').offsetWidth * 99.8) / 100 + 'px';
  }
}
fit();
addEventListener('resize', fit);
document.fonts.ready.then(fit);

// Project panels: always open on wide screens, tap to expand below 1100px (the first starts open).
const cards = $('.proj');
function setOpen(card, on) {
  card.classList.toggle('open', on);
  card.querySelector('.toggle').setAttribute('aria-expanded', on);
  card.dispatchEvent(new Event('opened'));
}
// Stacked panels stick under the nav; a panel too tall for the window just scrolls.
function stick() {
  for (const card of cards) card.style.position = card.offsetHeight <= innerHeight - 78 - 14 ? '' : 'relative';
}
addEventListener('resize', stick);
addEventListener('load', stick);
document.fonts.ready.then(stick);
cards.forEach((card, i) => {
  setOpen(card, i === 0);
  card.querySelector('.toggle').addEventListener('click', () => setOpen(card, !card.classList.contains('open')));
});
// The agent's "Explore project" action scrolls to a panel; make sure it is expanded when it arrives.
addEventListener('focusin', (event) => {
  const card = event.target.closest?.('.proj');
  if (card && event.target.classList.contains('toggle') && !card.classList.contains('open')) setOpen(card, true);
});

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) motion();

function motion() {
  const EASE = 'cubic-bezier(.2,.7,.2,1)';
  const wide = matchMedia('(min-width:1100px)');
  const px = (value) => (typeof value === 'number' ? value + 'px' : value);

  // animate(elements, {opacity, x, y, scale, rotate, ...}, {duration, delay, gap, from}) on the Web Animations API.
  // x and y become the translate property; the end state is written back to the element when it finishes.
  function animate(target, keys, { duration = 0.6, delay = 0, gap = 0, from, easing = EASE } = {}) {
    const els = typeof target === 'string' ? $(target) : target instanceof Element ? [target] : [...target];
    const frames = {};
    for (const [key, value] of Object.entries(keys)) {
      if (key === 'x' || key === 'y') continue;
      frames[key] = key === 'rotate' ? [].concat(value).map((deg) => deg + 'deg') : [].concat(value);
    }
    if ('x' in keys || 'y' in keys) {
      const xs = [].concat(keys.x ?? 0), ys = [].concat(keys.y ?? 0);
      frames.translate = Array.from({ length: Math.max(xs.length, ys.length) }, (_, i) => `${px(xs[Math.min(i, xs.length - 1)])} ${px(ys[Math.min(i, ys.length - 1)])}`);
    }
    const middle = (els.length - 1) / 2;
    for (const [i, el] of els.entries()) {
      const run = el.animate(frames, { duration: duration * 1000, delay: (delay + gap * (from === 'center' ? Math.abs(i - middle) : i)) * 1000, easing, fill: 'both' });
      run.finished.then(() => { try { run.commitStyles(); } catch {} run.cancel(); }).catch(() => {});
    }
  }
  const hide = (els) => { for (const el of els) el.style.opacity = 0; return els; };
  const rise = (els, delay = 0, gap = 0.07, y = 22) => animate(els, { opacity: [0, 1], y: [y, 0] }, { duration: 0.7, delay, gap });
  const pop = (els, delay = 0, gap = 0.04) => animate(els, { opacity: [0, 1], scale: [0.4, 1] }, { duration: 0.5, delay, gap });
  const lower = (els) => { for (const el of els) el.style.translate = '0 115%'; return els; };
  const unmask = (els, delay = 0) => animate(els, { y: ['115%', '0%'] }, { duration: 1, delay, gap: 0.09, easing: 'cubic-bezier(.16,1,.3,1)' });

  // Run a callback once when an element scrolls into view.
  const waiting = new Map(), seen = new WeakSet();
  const onView = (el, callback) => waiting.set(el, callback);
  function check() {
    for (const [el, callback] of waiting) {
      const box = el.getBoundingClientRect();
      if (box.top < innerHeight * 0.9 && box.bottom > 0) { waiting.delete(el); seen.add(el); callback(el); }
    }
  }
  addEventListener('resize', check);

  // Count a number up, keeping its prefix, suffix, commas and decimals.
  function count(el, delay) {
    const parts = el.textContent.match(/^(.*?)([\d,]*\.?\d+)(.*)$/);
    if (!parts || el.textContent.includes('/')) return;
    const [, before, number, after] = parts, target = +number.replace(/,/g, ''), decimals = (number.split('.')[1] || '').length;
    const start = performance.now() + delay * 1000;
    (function tick(now) {
      const t = Math.min(1, Math.max(0, (now - start) / 1300)), eased = 1 - (1 - t) ** 3;
      el.textContent = before + (target * eased).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + after;
      if (t < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  // Scroll-linked: progress bar, and the name drifts and dims as it leaves.
  const progress = document.querySelector('.progress'), hero = document.querySelector('.hero'), nameRows = $('.name .row');
  function onScroll() {
    progress.style.scale = `${scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)} 1`;
    const past = Math.min(1, scrollY / hero.offsetHeight);
    for (const row of nameRows) { row.style.translate = `0 ${-60 * past}px`; row.style.opacity = 1 - 0.75 * past; }
    check();
  }
  addEventListener('scroll', onScroll, { passive: true });

  // Hero: the name rises out of its mask, then everything else lands.
  unmask($('.name .rise'), 0.15);
  pop($('.name img'), 0.55);
  animate('.capsule', { scale: ['0 1', '1 1'], opacity: [0, 1] }, { duration: 0.9, delay: 0.65 });
  animate('.badge', { opacity: [0, 1], scale: [0, 1], rotate: [-90, 0] }, { duration: 0.9, delay: 0.95 });
  rise($('.nav > *'), 0.1, 0.1, -14);
  rise($('.kicker > *'), 0.1, 0.1, 10);
  rise($('.intro h2, .intro p, .cta, .socials'), 0.9, 0.09);
  rise($('.band'), 1.2);

  // Section titles rise out of a mask.
  for (const head of $('.sec-head')) {
    const title = head.querySelector('h2'), rest = [...head.children].filter((child) => child !== title);
    const mask = Object.assign(document.createElement('span'), { className: 'mask' }), inner = Object.assign(document.createElement('span'), { className: 'rise' });
    inner.append(...title.childNodes); mask.append(inner); title.append(mask);
    lower([inner]); hide(rest);
    onView(head, () => { unmask([inner]); rise(rest, 0.3); });
  }

  // Project panels: the header rises in; the figure builds the first time the panel is both open and on screen.
  for (const card of cards) {
    const head = $('.proj-head .label, .proj-head h3, .gist, .nums li', card), nums = $('.nums b', card);
    const story = $('.story > div', card), tags = $('.tags li, .go', card);
    const fades = $('.fade, .chart .label, .range > span:not(.track), .pips > span:not(.dots), .agents, .report', card);
    const seatDots = $('#seats circle', card), draws = $('.draw', card), bars = $('.track i', card), pips = $('.dots i', card), phone = $('.phone', card);
    let built = false;
    hide([card, ...head, ...story, ...tags, ...fades, ...seatDots, ...pips, ...phone]);
    for (const path of draws) { const length = path.getTotalLength(); path.style.strokeDasharray = length; path.style.strokeDashoffset = length; }
    for (const bar of bars) bar.style.scale = '0 1';
    const build = () => {
      if (built || !seen.has(card) || !(wide.matches || card.classList.contains('open'))) return;
      built = true;
      animate(phone, { opacity: [0, 1], y: [30, 0], rotate: [-4, 0] }, { duration: 0.8, delay: 0.15 });
      rise(fades, 0.3, 0.04, 8);
      animate(seatDots, { opacity: [0, 1], scale: [0, 1] }, { duration: 0.4, delay: 0.2, gap: 0.012, from: 'center' });
      animate(draws, { strokeDashoffset: 0 }, { duration: 1.2, delay: 0.2 });
      animate(bars, { scale: ['0 1', '1 1'] }, { duration: 1.1, delay: 0.5, gap: 0.2 });
      pop(pips, 0.5, 0.05);
      rise(story, 0.35, 0.09);
      pop(tags, 0.7, 0.04);
    };
    card.addEventListener('opened', build);
    onView(card, () => {
      animate(card, { opacity: [0, 1] }, { duration: 0.7 });
      rise(head, 0.15, 0.08);
      nums.forEach((number, i) => count(number, 0.45 + i * 0.12));
      build();
    });
  }

  // Figures that play themselves on a loop.
  async function loop(parts, step, pause = 1000) {
    hide(parts);
    await sleep(1400);
    for (;;) {
      for (const part of parts) { animate(part, step, { duration: 0.42 }); await sleep(part.matches('.hint') ? 500 : pause); }
      await sleep(4000);
      animate(parts, { opacity: 0 }, { duration: 0.4 });
      await sleep(900);
    }
  }
  loop($('.chat > *'), { opacity: [0, 1], y: [10, 0], scale: [0.94, 1] });
  loop($('.hphone .seq > :not(.wave)'), { opacity: [0, 1], y: [12, 0], scale: [0.96, 1] }, 1100);
  // BogdAI: the six agents run in order, then the report fills in.
  for (const list of $('.agents')) {
    (async () => {
      const steps = [...list.children], rows = $('.report .row', list.parentNode);
      hide(rows);
      await sleep(1600);
      for (;;) {
        for (const stepEl of steps) { stepEl.classList.add('on'); await sleep(460); }
        for (const row of rows) { animate(row, { opacity: [0, 1], x: [-12, 0] }, { duration: 0.4 }); await sleep(450); }
        await sleep(3800);
        for (const stepEl of steps) stepEl.classList.remove('on');
        animate(rows, { opacity: 0 }, { duration: 0.4 });
        await sleep(900);
      }
    })();
  }

  for (const group of $('.more, .bento, .xp')) { const kids = [...group.children]; hide(kids); onView(group, () => rise(kids, 0, 0.1, 34)); }
  for (const el of $('.all, .note, .chiprow')) { hide([el]); onView(el, () => rise([el], 0.1)); }

  // Contact: the giant line rises, then the row.
  const talk = lower($('.talk .rise')), row = hide($('.contact .label, .contact-row > *, .foot'));
  onView(document.querySelector('.contact'), () => { unmask(talk, 0.1); rise(row, 0.5, 0.1); });

  // A cursor dot that swells over anything clickable, and pills that pull toward the pointer.
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const dot = document.querySelector('.cursor');
    addEventListener('pointermove', (event) => { dot.classList.add('on'); dot.style.translate = `${event.clientX}px ${event.clientY}px`; });
    document.addEventListener('pointerover', (event) => dot.classList.toggle('grow', !!event.target.closest('a, button, .more li, .xp li')));
    document.documentElement.addEventListener('pointerleave', () => dot.classList.remove('on'));
    for (const pill of $('.pill')) {
      pill.addEventListener('pointermove', (event) => {
        const box = pill.getBoundingClientRect();
        pill.style.translate = `${(event.clientX - box.left - box.width / 2) * 0.22}px ${(event.clientY - box.top - box.height / 2) * 0.3}px`;
      });
      pill.addEventListener('pointerleave', () => { pill.style.translate = ''; });
    }
  }

  onScroll();
}
