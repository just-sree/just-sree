// Draws the headshot as ASCII in the terminal palette. When it scrolls into view the
// ASCII decodes from random characters, then a scanline wipes down to reveal the photo
// once. Hover, focus or tap plays the same reveal.
const figure = document.querySelector('.portrait');
if (figure) {
  const img = figure.querySelector('img');
  const pre = figure.querySelector('pre');
  const frame = figure.querySelector('.portrait-frame');
  // Sparse to dense: brighter pixels get denser characters on the dark background.
  const ramp = ' .:-=+*#%@';
  const cols = 48;
  const rows = cols / 2; // monospace cells are about twice as tall as they are wide
  // Head-and-shoulders crop of the square photo, as fractions of its size. The photo
  // and the ASCII share it, so switching between them keeps the same framing.
  const crop = { x: 0.175, y: 0.06, size: 0.65 };
  img.style.width = img.style.height = `${100 / crop.size}%`;
  img.style.left = `${(-crop.x / crop.size) * 100}%`;
  img.style.top = `${(-crop.y / crop.size) * 100}%`;

  const inside = (x, y) => Math.hypot((x + 0.5) / cols - 0.5, (y + 0.5) / rows - 0.5) < 0.49;
  const render = () => {
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    context.drawImage(img, crop.x * w, crop.y * h, crop.size * w, crop.size * h, 0, 0, cols, rows);
    const data = context.getImageData(0, 0, cols, rows).data;
    const light = [];
    for (let i = 0; i < data.length; i += 4) light.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
    // Map each cell to its brightness rank inside the circle so every character is used evenly.
    const sorted = light.filter((_, i) => inside(i % cols, Math.floor(i / cols))).sort((a, b) => a - b);
    const rank = (value) => {
      let lo = 0;
      let hi = sorted.length;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (sorted[mid] < value) lo = mid + 1; else hi = mid; }
      return lo / sorted.length;
    };
    let text = '';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        text += inside(x, y) ? ramp[Math.min(ramp.length - 1, Math.floor(rank(light[y * cols + x]) * ramp.length))] : ' ';
      }
      text += '\n';
    }
    finalText = text;
    pre.textContent = animate ? blank(text) : text;
    figure.classList.add('ready');
    fit();
    if (animate) watchForView();
  };

  const animate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finalText = '';
  const glyphs = '.:-=+*#%@/\\<>01';
  const blank = (text) => text.replace(/[^\n]/g, ' ');
  // Characters resolve from random glyphs, roughly top to bottom, like a terminal rendering.
  const decode = () => {
    const cells = [...finalText];
    const row = (i) => Math.floor(i / (cols + 1));
    const at = cells.map((_, i) => (row(i) / rows) * 0.7 + Math.random() * 0.3);
    const start = performance.now();
    const duration = 1100;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      pre.textContent = cells.map((c, i) => (c === '\n' || c === ' ' || at[i] <= t ? c : glyphs[Math.floor(Math.random() * glyphs.length)])).join('');
      if (t < 1) requestAnimationFrame(step);
      else { pre.textContent = finalText; setTimeout(peek, 500); }
    };
    requestAnimationFrame(step);
  };
  // Show the photo once so visitors see there is one, then scan back to ASCII.
  const peek = () => {
    if (figure.matches(':hover') || figure.classList.contains('show-photo')) return;
    figure.classList.add('peek');
    setTimeout(() => figure.classList.remove('peek'), 2800);
  };
  const watchForView = () => {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      decode();
    }, { threshold: 0.5 });
    observer.observe(figure);
  };
  // The glowing scanline only shows while the wipe is moving.
  figure.addEventListener('transitionrun', (event) => { if (event.propertyName === '--reveal') figure.classList.add('scanning'); });
  const stopScan = (event) => { if (event.propertyName === '--reveal') figure.classList.remove('scanning'); };
  figure.addEventListener('transitionend', stopScan);
  figure.addEventListener('transitioncancel', stopScan);
  // Size the characters so the grid exactly fills the square frame.
  const fit = () => {
    const size = frame.clientWidth;
    if (!size) return;
    pre.style.fontSize = `${size / cols / 0.6}px`;
    pre.style.lineHeight = `${size / rows}px`;
  };
  addEventListener('resize', fit);
  if (img.complete && img.naturalWidth) render();
  else {
    img.addEventListener('load', render);
    // No photo uploaded: leave the layout as plain text.
    img.addEventListener('error', () => figure.remove());
  }
  // Tap on touch screens (no hover) switches between the ASCII and the photo.
  const label = figure.querySelector('.reveal');
  figure.addEventListener('click', () => {
    const showing = figure.classList.toggle('show-photo');
    if (label) label.textContent = showing ? 'tap for ascii' : 'hover or tap to reveal';
  });
}
