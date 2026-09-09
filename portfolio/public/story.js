// Scroll-driven storytelling. Every scene renders its final state without JavaScript motion;
// GSAP ScrollTrigger only adds pinning, scrubbing, and transitions on wide screens without reduced motion.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (parent) parent.append(el);
    return el;
  };
  const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
  const rng = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const fitCanvas = (canvas, onResize) => {
    const ctx = canvas.getContext('2d');
    const state = { w: 0, h: 0, ctx };
    new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      state.w = r.width; state.h = r.height;
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      onResize?.();
    }).observe(canvas);
    return state;
  };

  /* ---------------- Builders: always run, final state by default ---------------- */

  // IRCC chart: points, three model lines, band, split.
  function buildForecast(svg) {
    const r = rng(7);
    const grid = svgEl('g', { class: 'chart-grid' }, svg);
    for (let y = 60; y <= 260; y += 50) svgEl('line', { x1: 30, y1: y, x2: 570, y2: y }, grid);
    const series = Array.from({ length: 24 }, (_, i) => ({ x: 30 + i * 14, y: 230 - i * 4.2 - Math.sin(i / 2.1) * 26 + (r() - .5) * 18 }));
    const noise = series.map(() => ({ x: 40 + r() * 520, y: 40 + r() * 240 }));
    const band = svgEl('path', { class: 'chart-band', d: 'M352 128 L570 70 L570 175 L352 156 Z' }, svg);
    const split = svgEl('line', { class: 'chart-split', x1: 352, y1: 40, x2: 352, y2: 270, stroke: css('--line-2'), 'stroke-dasharray': '3 4' }, svg);
    const lines = [
      ['Prophet', css('--cyan'), 'M352 142 C 400 120, 460 110, 570 96'],
      ['ARIMA', css('--magenta'), 'M352 142 C 410 135, 480 118, 570 112'],
      ['Exp. Smoothing', css('--violet'), 'M352 142 C 420 128, 490 124, 570 124'],
    ].map(([name, stroke, d], i) => {
      const p = svgEl('path', { class: 'chart-line', d, stroke }, svg);
      svgEl('text', { class: 'chart-label', x: 372, y: 40 + i * 14, fill: stroke }, svg).textContent = name.toUpperCase();
      return p;
    });
    const history = svgEl('path', { class: 'chart-line', stroke: css('--ink'), d: 'M' + series.map(p => `${p.x} ${p.y}`).join(' L ') }, svg);
    const pts = series.map((p, i) => svgEl('circle', { class: 'chart-pt' + (i % 5 === 0 ? ' noise' : ''), r: 3.5, cx: p.x, cy: p.y }, svg));
    svgEl('text', { class: 'chart-label', x: 30, y: 300 }, svg).textContent = 'HISTORY · 15+ CATEGORIES';
    svgEl('text', { class: 'chart-label', x: 372, y: 300 }, svg).textContent = 'PLANNING HORIZONS';
    return { pts, series, noise, lines, band, history, split };
  }

  // SceneSense sample: a synthetic street scene with detection boxes, labels, and an audio wave.
  function buildScene(svg) {
    svg.replaceChildren();
    svgEl('rect', { x: 0, y: 0, width: 320, height: 140, fill: '#e3f2fb' }, svg);
    svgEl('rect', { x: 0, y: 140, width: 320, height: 80, fill: '#d9dce8' }, svg);
    svgEl('rect', { x: 0, y: 150, width: 320, height: 3, fill: '#f7f7fb' }, svg);
    for (let i = 0; i < 6; i++) svgEl('rect', { x: 10 + i * 56, y: 186, width: 28, height: 3, fill: '#f7f7fb' }, svg);
    [[40, 92], [250, 84]].forEach(([x, y]) => { svgEl('rect', { x: x + 6, y: y + 30, width: 8, height: 40, fill: '#8a6a4a' }, svg); svgEl('circle', { cx: x + 10, cy: y + 20, r: 24, fill: '#7cc47f' }, svg); });
    svgEl('rect', { x: 170, y: 118, width: 90, height: 30, rx: 5, fill: '#4c5fd6' }, svg);
    svgEl('path', { d: 'M185 118 L200 100 H235 L248 118 Z', fill: '#6b7ce0' }, svg);
    svgEl('circle', { cx: 190, cy: 150, r: 8, fill: '#0e1226' }, svg); svgEl('circle', { cx: 242, cy: 150, r: 8, fill: '#0e1226' }, svg);
    svgEl('circle', { cx: 112, cy: 98, r: 8, fill: '#f0b8a0' }, svg);
    svgEl('rect', { x: 104, y: 106, width: 16, height: 26, rx: 3, fill: '#e5187a' }, svg);
    svgEl('rect', { x: 105, y: 132, width: 6, height: 24, fill: '#2b3150' }, svg); svgEl('rect', { x: 113, y: 132, width: 6, height: 24, fill: '#2b3150' }, svg);
    svgEl('path', { d: 'M120 120 L142 146', stroke: '#2b3150', 'stroke-width': 1.5, fill: 'none' }, svg);
    svgEl('rect', { x: 138, y: 140, width: 22, height: 12, rx: 4, fill: '#b98a5a' }, svg); svgEl('circle', { cx: 162, cy: 140, r: 5, fill: '#b98a5a' }, svg);
    for (let i = 0; i <= 8; i++) svgEl('line', { class: 'grid-line', x1: i * 40, y1: 0, x2: i * 40, y2: 220 }, svg);
    for (let i = 0; i <= 5; i++) svgEl('line', { class: 'grid-line', x1: 0, y1: i * 44, x2: 320, y2: i * 44 }, svg);
    const boxes = [['person', '0.97', 98, 86, 28, 74, true], ['dog', '0.91', 134, 132, 36, 22, false], ['car', '0.98', 166, 96, 98, 62, false], ['tree', '0.88', 24, 64, 44, 100, false]];
    boxes.forEach(([label, score, x, y, w, h, hi]) => {
      svgEl('rect', { class: 'box' + (hi ? ' hi' : ''), x, y, width: w, height: h }, svg);
      svgEl('rect', { class: 'tagbg', x, y: y - 12, width: 54, height: 12 }, svg);
      svgEl('text', { class: 'tagtx', x: x + 3, y: y - 3 }, svg).textContent = `${label} ${score}`;
    });
    const wave = 'M20 190 ' + Array.from({ length: 28 }, (_, i) => `L${30 + i * 10} ${190 + Math.sin(i * 1.3) * (6 + (i % 5) * 4)}`).join(' ');
    svgEl('path', { class: 'wave', d: wave }, svg);
  }

  // Infidata ETL: manual QA (before) versus event-driven Lambda pipeline (after).
  function buildFlow(svg, variant) {
    svg.replaceChildren();
    const box = (x, y, w, h, title, sub, cls = '') => {
      svgEl('rect', { class: 'fbox ' + cls, x, y, width: w, height: h, rx: 2 }, svg);
      svgEl('text', { class: 'ft', x: x + w / 2, y: y + h / 2 - 2, 'text-anchor': 'middle' }, svg).textContent = title;
      svgEl('text', { class: 'fs', x: x + w / 2, y: y + h / 2 + 14, 'text-anchor': 'middle' }, svg).textContent = sub;
    };
    const line = (d, cls = '') => svgEl('path', { class: 'fl ' + cls, d }, svg);
    if (variant === 'before') {
      box(30, 40, 120, 60, 'Source', 'DAILY EXPORT');
      box(180, 40, 120, 60, 'Manual QA', 'SPREADSHEETS', 'warn');
      box(330, 40, 120, 60, 'Database', 'STALE BY A DAY');
      line('M150 70 H180', 'warn'); line('M300 70 H330', 'warn');
      svgEl('text', { class: 'big bad', x: 30, y: 190 }, svg).textContent = '~40 hrs / month';
      svgEl('text', { class: 'fs', x: 30, y: 212 }, svg).textContent = 'MANUAL CHECKS · DAILY FRESHNESS';
      for (let i = 0; i < 24; i++) svgEl('rect', { class: 'tick' + (i === 0 ? '' : ' off'), x: 30 + i * 17, y: 240, width: 10, height: 18 }, svg);
      svgEl('text', { class: 'fs', x: 30, y: 280 }, svg).textContent = 'ONE REFRESH PER DAY';
    } else {
      box(30, 40, 110, 60, 'Event', 'S3 · TRIGGER', 'on');
      box(170, 40, 130, 60, 'AWS Lambda', 'PYTHON ETL', 'on');
      box(330, 40, 120, 60, 'RDS', 'HOURLY FRESH', 'on');
      line('M140 70 H170', 'on'); line('M300 70 H330', 'on');
      box(170, 120, 130, 44, 'CodeDeploy', 'BLUE-GREEN', 'on');
      line('M235 100 V120', 'on');
      svgEl('text', { class: 'big good', x: 30, y: 210 }, svg).textContent = '0 hrs manual QA';
      svgEl('text', { class: 'fs', x: 30, y: 232 }, svg).textContent = 'EVENT-DRIVEN · HOURLY FRESHNESS';
      for (let i = 0; i < 24; i++) svgEl('rect', { class: 'tick', x: 30 + i * 17, y: 250, width: 10, height: 18 }, svg);
      svgEl('text', { class: 'fs', x: 30, y: 288 }, svg).textContent = '24 REFRESHES PER DAY';
    }
  }

  // Generic node/link diagram builder for the agents and architecture scenes.
  function buildDiagram(svg, nodes, links, extras = []) {
    const linkEls = links.map(([a, b, curve]) => {
      const A = nodes[a], B = nodes[b];
      const d = curve ? `M${A.x} ${A.y} C ${A.x + curve[0]} ${A.y + curve[1]}, ${B.x + curve[2]} ${B.y + curve[3]}, ${B.x} ${B.y}` : `M${A.x} ${A.y} L ${B.x} ${B.y}`;
      return svgEl('path', { class: 'link on', d }, svg);
    });
    const extraEls = extras.map(({ x, y, w, h, label, d }) => {
      const g = svgEl('g', { class: 'tool' }, svg);
      svgEl('path', { class: 'tool-call', d }, g);
      svgEl('text', { class: 'tool-label', x, y, 'text-anchor': 'middle' }, g).textContent = label;
      return g;
    });
    const nodeEls = nodes.map(n => {
      const g = svgEl('g', { class: 'node', transform: `translate(${n.x} ${n.y})` }, svg);
      svgEl('rect', { class: 'node-box on', x: -n.w / 2, y: -n.h / 2, width: n.w, height: n.h, rx: 2 }, g);
      svgEl('text', { class: 'node-title', x: 0, y: -2, 'text-anchor': 'middle' }, g).textContent = n.title;
      svgEl('text', { class: 'node-sub', x: 0, y: 14, 'text-anchor': 'middle' }, g).textContent = n.sub;
      return g;
    });
    const packet = svgEl('circle', { class: 'packet', r: 5, cx: nodes[nodes.length - 1].x, cy: nodes[nodes.length - 1].y }, svg);
    return { nodes, nodeEls, linkEls, extraEls, packet };
  }

  const forecast = buildForecast($('.forecast'));
  buildScene($('.sample-scene'));
  buildFlow($('.compare-side.before .flow-svg'), 'before');
  buildFlow($('.compare-side.after .flow-svg'), 'after');

  const agentNodes = [
    { title: 'Intake', sub: 'VALIDATE INPUT', x: 100, y: 90, w: 150, h: 56 },
    { title: 'Extract', sub: 'FIND CLAUSES', x: 320, y: 90, w: 150, h: 56 },
    { title: 'Ground', sub: 'POLICY EVIDENCE', x: 540, y: 90, w: 150, h: 56 },
    { title: 'Reason', sub: 'ASSESS RISK', x: 540, y: 270, w: 150, h: 56 },
    { title: 'Verify', sub: 'FLAG HUMAN REVIEW', x: 320, y: 270, w: 150, h: 56 },
    { title: 'Report', sub: 'CITED · TRACED', x: 100, y: 270, w: 150, h: 56 },
  ];
  const agentLinks = [[0, 1], [1, 2], [2, 3, [90, 0, 90, 0]], [3, 4], [4, 5]];
  const agentTools = [
    { x: 540, y: 32, label: 'FOUNDRY · POLICY SEARCH', d: 'M520 62 C 520 30, 560 30, 560 62' },
    { x: 540, y: 330, label: 'FOUNDRY · REASONING', d: 'M520 298 C 520 330, 560 330, 560 298' },
    { x: 320, y: 330, label: 'HUMAN-REVIEW FLAG', d: 'M300 298 C 300 330, 340 330, 340 298' },
  ];
  const agentDiagram = buildDiagram($('.agent-svg'), agentNodes, agentLinks, agentTools);
  const agentCaptions = [
    'Intake validates the synthetic contract before anything else runs.',
    'Extraction identifies the clauses worth a second look.',
    'Grounding retrieves policy evidence through Microsoft Foundry.',
    'Reasoning scores risk on top of grounded findings.',
    'Verification flags high-risk items for a human.',
    'The report keeps citations, flags, and the full agent trace.',
  ];

  const archNodes = [
    { title: 'You', sub: 'BROWSER · CTRL+K', x: 100, y: 80, w: 150, h: 56 },
    { title: '/api/agent', sub: 'RATE-LIMITED · JSON', x: 320, y: 80, w: 150, h: 56 },
    { title: 'Agent', sub: 'PERSONA · GUARDRAILS', x: 540, y: 80, w: 150, h: 56 },
    { title: 'Model', sub: 'AZURE AI FOUNDRY', x: 540, y: 220, w: 150, h: 56 },
    { title: 'Tools', sub: 'NOTES · RESUME · BRIEF', x: 320, y: 220, w: 150, h: 56 },
    { title: 'Project notes', sub: 'APPROVED JSON ONLY', x: 100, y: 220, w: 150, h: 56 },
    { title: 'Structured reply', sub: 'TEXT + SOURCE LINKS', x: 320, y: 330, w: 190, h: 48 },
  ];
  const archLinks = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6, [0, 60, -120, 0]], [6, 0, [-120, 0, 0, 60]]];
  const archDiagram = buildDiagram($('.arch-svg'), archNodes, archLinks);

  /* ---------------- Canvas scenes ---------------- */

  // Subtle 3D network in the hero (custom projection, no WebGL).
  function heroNet(canvas) {
    const r = rng(42);
    const N = 64;
    const pts = Array.from({ length: N }, () => {
      const u = r() * 2 - 1, t = r() * Math.PI * 2, s = Math.sqrt(1 - u * u), rad = .72 + r() * .28;
      return { x: s * Math.cos(t) * rad, y: u * rad, z: s * Math.sin(t) * rad };
    });
    const edges = [];
    pts.forEach((p, i) => {
      const near = pts.map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z) })).filter(o => o.j !== i).sort((a, b) => a.d - b.d).slice(0, 3);
      near.forEach(o => { if (i < o.j) edges.push([i, o.j]); });
    });
    const st = fitCanvas(canvas, () => draw(performance.now()));
    let progress = 0;
    function draw(time) {
      const { ctx, w, h } = st;
      if (!w) return;
      ctx.clearRect(0, 0, w, h);
      const narrow = w <= 900;
      const cx = narrow ? w * .5 : w * .72, cy = narrow ? h * .74 : h * .5, R = Math.min(w, h) * (narrow ? .22 : .3), dim = narrow ? .5 : 1;
      const ay = time * .00006 + progress * Math.PI * 1.4, ax = .4 + progress * .5;
      const proj = pts.map(p => {
        let x = p.x * Math.cos(ay) - p.z * Math.sin(ay), z = p.x * Math.sin(ay) + p.z * Math.cos(ay);
        let y = p.y * Math.cos(ax) - z * Math.sin(ax); z = p.y * Math.sin(ax) + z * Math.cos(ax);
        const f = 1 / (2.2 - z);
        return { x: cx + x * R * f * 1.6, y: cy + y * R * f * 1.6, z, f };
      });
      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        const A = proj[a], B = proj[b], depth = (A.z + B.z) / 2;
        ctx.strokeStyle = `rgba(0,184,212,${(.12 + (depth + 1) * .16) * dim})`;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }
      proj.forEach((p, i) => {
        const size = 1.6 + (p.z + 1) * 1.6;
        ctx.fillStyle = i % 7 === 0 ? `rgba(229,24,122,${(.5 + p.z * .3) * dim})` : `rgba(10,142,166,${(.35 + p.z * .3) * dim})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI * 2); ctx.fill();
      });
    }
    return { setProgress: v => { progress = v; }, draw };
  }

  // Constellation of projects and skills grouped into clusters; the camera zooms per cluster.
  function constellation(canvas, legend) {
    const clusters = [
      { name: 'AI Research', color: '10,142,166', items: ['IRCC forecasting', 'CSE threat classification', 'Lambton applied AI', 'Applied research', 'Border anomaly detection', 'Pistachio anomalies', 'Admissions NN', 'Prophet', 'YOLO', 'PyTorch'] },
      { name: 'Agentic Systems', color: '229,24,122', items: ['BogdAI', 'Retention Intelligence', 'SceneSense', 'Read Less. Listen More.', 'Code, Explained.', 'LangGraph', 'LangChain', 'Microsoft Foundry', 'RAG', 'MCP'] },
      { name: 'Infrastructure', color: '108,76,241', items: ['AWS Lambda ETL', 'Docker', 'Lightning AI', 'MLflow', 'Retail data blueprint', 'OCR Proofkit', 'Quota Journal', 'Quantisation Demystified', 'SQL'] },
      { name: 'Startups', color: '47,212,143', items: ['Paresium'] },
    ];
    const centers = [[-.5, -.35], [.5, -.35], [-.45, .45], [.55, .5]];
    const r = rng(9);
    const nodes = [];
    clusters.forEach((c, ci) => c.items.forEach((label, i) => {
      const a = (i / c.items.length) * Math.PI * 2 + r() * .6, d = c.items.length === 1 ? 0 : .12 + r() * .16;
      nodes.push({ label, c: ci, x: centers[ci][0] + Math.cos(a) * d, y: centers[ci][1] + Math.sin(a) * d, big: i === 0 });
    }));
    const edges = [];
    nodes.forEach((n, i) => nodes.forEach((m, j) => { if (i < j && n.c === m.c && Math.hypot(n.x - m.x, n.y - m.y) < .22) edges.push([i, j]); }));
    edges.push([0, 10], [1, 20], [11, 24], [2, 29]);
    const keys = [{ x: 0, y: .05, z: 1 }, ...centers.map(([x, y]) => ({ x, y, z: 2.4 }))];
    const st = fitCanvas(canvas, () => draw());
    let progress = 0, cluster = -1;
    const smooth = t => t * t * (3 - 2 * t);
    function draw() {
      const { ctx, w, h } = st;
      if (!w) return;
      const t = clamp(progress) * 4, k = Math.min(3, Math.floor(t)), f = smooth(t - k);
      const A = keys[k], B = keys[k + 1];
      const cam = { x: A.x + (B.x - A.x) * f, y: A.y + (B.y - A.y) * f, z: A.z + (B.z - A.z) * f };
      const active = t < .5 ? -1 : Math.min(3, Math.round(t) - 1);
      if (active !== cluster) { cluster = active; legend.forEach((li, i) => li.classList.toggle('active', i === active)); }
      const S = Math.min(w, h) * (w < 600 ? .36 : .42) * cam.z;
      const P = n => ({ x: w / 2 + (n.x - cam.x) * S, y: h / 2 + (n.y - cam.y) * S });
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        const A = P(nodes[a]), B = P(nodes[b]);
        ctx.strokeStyle = nodes[a].c === nodes[b].c ? `rgba(${clusters[nodes[a].c].color},.35)` : 'rgba(14,18,38,.12)';
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }
      ctx.font = `${Math.round(10 + cam.z * 1.2)}px "JetBrains Mono", monospace`;
      nodes.forEach(n => {
        const p = P(n), col = clusters[n.c].color, dim = active >= 0 && active !== n.c;
        const rad = (n.big ? 7 : 4) * (0.7 + cam.z * .25);
        ctx.fillStyle = `rgba(${col},${dim ? .25 : .95})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.fill();
        if (!dim) { ctx.strokeStyle = `rgba(${col},.25)`; ctx.beginPath(); ctx.arc(p.x, p.y, rad + 5, 0, Math.PI * 2); ctx.stroke(); }
        ctx.fillStyle = dim ? 'rgba(14,18,38,.25)' : 'rgba(14,18,38,.85)';
        if (w > 600 || n.big || (active === n.c && cam.z > 1.8)) ctx.fillText(n.label, p.x + rad + 6, p.y + 4);
      });
      clusters.forEach((c, i) => {
        const p = P({ x: centers[i][0], y: centers[i][1] - .3 });
        ctx.font = `600 ${Math.round(11 + cam.z * 2)}px "Space Grotesk", sans-serif`;
        ctx.fillStyle = `rgba(${c.color},${active === -1 || active === i ? .9 : .3})`;
        ctx.textAlign = 'center'; ctx.fillText(c.name.toUpperCase(), p.x, p.y); ctx.textAlign = 'left';
      });
    }
    return { setProgress: v => { progress = v; draw(); }, draw };
  }

  const net = heroNet($('.net-canvas'));
  const map = constellation($('.map-canvas'), $$('.map-legend li'));

  /* ---------------- Reading progress + chapter rail (both modes) ---------------- */
  const progressBar = $('.reading-progress span');
  const rail = $$('.section-rail a').map(a => ({ a, el: $(a.getAttribute('href')) })).filter(r => r.el);
  let frame = 0;
  function paint() {
    frame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max) : 0})`;
    let current = rail[0];
    rail.forEach(r => { if (r.el.getBoundingClientRect().top <= innerHeight * .45) current = r; });
    rail.forEach(r => r === current ? r.a.setAttribute('aria-current', 'location') : r.a.removeAttribute('aria-current'));
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  paint();

  if (!window.gsap || !window.ScrollTrigger) { net.draw(0); map.draw(); return; }
  gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, DrawSVGPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const counters = $$('[data-count]');
  function runCounters() {
    counters.forEach(el => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const value = Number(el.dataset.count), decimals = Number(el.dataset.decimals || 0), o = { v: 0 };
      gsap.to(o, { v: value, duration: 1.2, ease: 'power3.out', onUpdate: () => { el.textContent = o.v.toFixed(decimals); } });
    });
  }

  const mm = gsap.matchMedia();
  mm.add({ motion: '(min-width: 901px) and (prefers-reduced-motion: no-preference)', still: '(max-width: 900px), (prefers-reduced-motion: reduce)' }, (ctx) => {
    if (!ctx.conditions.motion) {
      net.draw(0); map.draw();
      // Counters still animate once when their panel appears; everything else is static.
      counters.forEach(el => { el.textContent = '0'; });
      ScrollTrigger.create({ trigger: '.counters', start: 'top 90%', once: true, onEnter: runCounters });
      return;
    }
    document.body.classList.add('story-motion');
    const tints = [[244, 246, 251], [230, 246, 250], [250, 236, 245]];

    /* Background tint follows the story. */
    $$('.scene[data-tint]').forEach(scene => {
      const [rr, gg, bb] = tints[Number(scene.dataset.tint)];
      const apply = () => gsap.to(document.documentElement, { '--tint-r': rr, '--tint-g': gg, '--tint-b': bb, duration: .8, ease: 'sine.inOut' });
      ScrollTrigger.create({ trigger: scene, start: 'top 55%', end: 'bottom 55%', onEnter: apply, onEnterBack: apply });
    });

    /* 01 Hero: verbs scramble as you scroll; the network rotates with progress. */
    const words = ['reason', 'automate', 'deploy', 'solve real problems'];
    const verb = $('#hero-verb'), index = $$('.verb-index li'), heroProgress = $('#hero-progress');
    let wordIndex = -1;
    const setWord = (i) => {
      if (i === wordIndex) return;
      wordIndex = i;
      index.forEach((li, j) => li.classList.toggle('active', j === i));
      gsap.to(verb, { duration: .7, scrambleText: { text: words[i], chars: '01<>/_#$%', speed: .5, revealDelay: .1 }, overwrite: true });
    };
    setWord(0);
    const heroTick = (time) => net.draw(time * 1000);
    gsap.ticker.add(heroTick);
    ScrollTrigger.create({
      trigger: '.hero', pin: '.hero-pin', start: 'top top', end: '+=180%', scrub: true,
      onUpdate: self => { net.setProgress(self.progress); setWord(Math.min(3, Math.floor(self.progress * 4))); heroProgress.textContent = String(Math.round(self.progress * 100)).padStart(2, '0') + '%'; },
      onToggle: self => { if (self.isActive) gsap.ticker.add(heroTick); else gsap.ticker.remove(heroTick); },
    });

    /* 02 Terminal types itself. */
    const lines = $$('.t-line');
    const lengths = lines.map(l => l.textContent.length);
    const total = lengths.reduce((a, b) => a + b, 0);
    gsap.set(lines, { clipPath: 'inset(0 100% 0 0)' });
    gsap.set($('.terminal-cta'), { autoAlpha: 0, y: 12 });
    const typeTo = (progress) => {
      let budget = (0.06 + progress) * total * 1.04;
      lines.forEach((l, i) => { const f = clamp(budget / lengths[i]); budget -= lengths[i]; l.style.clipPath = `inset(0 ${(1 - f) * 100}% 0 0)`; });
      gsap.to($('.terminal-cta'), { autoAlpha: progress > .92 ? 1 : 0, y: progress > .92 ? 0 : 12, duration: .3, overwrite: true });
    };
    ScrollTrigger.create({ trigger: '.terminal-scene', pin: '.terminal-scene .pin', start: 'top top', end: '+=120%', scrub: true, onUpdate: self => typeTo(self.progress) });
    typeTo(0);

    /* 03 Journey: glowing node travels the rail; skills fly into the active stop. */
    const stops = $$('.stop'), railStops = $$('.rail-stops li'), railEl = $('.journey-rail');
    const cloud = $('.skill-cloud'), pills = $$('.pill', cloud);
    const pr = rng(21);
    const home = pills.map((p, i) => {
      const x = pr() * Math.max(0, cloud.clientWidth - p.offsetWidth), y = (i / pills.length) * Math.max(0, cloud.clientHeight - 30);
      gsap.set(p, { left: x, top: y });
      gsap.to(p, { y: '+=' + (8 + pr() * 10), duration: 2.4 + pr() * 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      return { x, y };
    });
    stops.forEach((stop, i) => {
      const slots = $('.stop-skills', stop);
      pills.filter(p => Number(p.dataset.stop) === i).forEach(p => {
        const slot = Object.assign(document.createElement('span'), { className: 'slot' });
        slot.style.width = p.offsetWidth + 'px'; slot.style.height = p.offsetHeight + 'px';
        slots.append(slot);
      });
    });
    let stopIndex = -1;
    const absorb = (i) => {
      const slots = $$('.slot', stops[i]);
      const cloudRect = cloud.getBoundingClientRect();
      let s = 0;
      pills.forEach((p, k) => {
        const mine = Number(p.dataset.stop) === i;
        if (mine && slots[s]) {
          const slot = slots[s++], t = slot.getBoundingClientRect();
          slot.classList.add('filled');
          gsap.to(p, { x: t.left - cloudRect.left - home[k].x, y: t.top - cloudRect.top - home[k].y, duration: .7, ease: 'power3.inOut', overwrite: true });
          p.classList.add('absorbed');
        } else {
          gsap.to(p, { x: 0, y: 0, duration: .6, ease: 'power3.inOut', overwrite: true });
          p.classList.remove('absorbed');
        }
      });
      stops.forEach((stop, j) => { if (j !== i) $$('.slot', stop).forEach(sl => sl.classList.remove('filled')); });
    };
    const setStop = (i) => {
      if (i === stopIndex) return;
      stopIndex = i;
      stops.forEach((s, j) => s.classList.toggle('active', j === i));
      railStops.forEach((s, j) => s.classList.toggle('active', j === i));
      // Measure slots once the card has finished expanding (transition end, with a timed fallback).
      pendingAbsorb = i;
      gsap.delayedCall(.8, () => { if (pendingAbsorb === i) { pendingAbsorb = -1; absorb(i); } });
    };
    let pendingAbsorb = -1;
    $$('.stop-body').forEach(body => body.addEventListener('transitionend', () => {
      const i = Number(body.closest('.stop').dataset.stop);
      if (pendingAbsorb === i) { pendingAbsorb = -1; absorb(i); }
    }));
    ScrollTrigger.create({
      trigger: '.journey', pin: '.journey .pin', start: 'top top', end: '+=220%', scrub: true,
      onUpdate: self => { railEl.style.setProperty('--p', clamp(self.progress * 1.02)); setStop(Math.min(stops.length - 1, Math.floor(self.progress * stops.length))); },
    });
    setStop(0);

    /* 04 IRCC sticky story: chart transforms per step; numbers count when the result appears. */
    const panel = $('.forecast-panel'), steps = $$('.story-steps .step'), indicator = $('.stage-indicator', panel);
    const { pts, series, noise, lines: models, band, history } = forecast;
    let stage = -1;
    const setStage = (i) => {
      if (i === stage) return;
      stage = i;
      panel.dataset.stage = i;
      indicator.textContent = `0${i + 1} / 04`;
      steps.forEach((s, j) => s.classList.toggle('active', j === i));
      pts.forEach((c, k) => gsap.to(c, { attr: i === 0 ? { cx: noise[k].x, cy: noise[k].y } : { cx: series[k].x, cy: series[k].y }, duration: .8, ease: 'power2.inOut', delay: k * .012, overwrite: true }));
      gsap.to(history, { drawSVG: i >= 1 ? '0% 100%' : '0% 0%', duration: 1, ease: 'power2.inOut', overwrite: true });
      models.forEach((m, k) => gsap.to(m, { drawSVG: i >= 2 ? '0% 100%' : '0% 0%', duration: .9, delay: k * .15, ease: 'power2.out', overwrite: true }));
      gsap.to(band, { autoAlpha: i >= 3 ? 1 : 0, duration: .6, overwrite: true });
      if (i === 3) runCounters();
    };
    gsap.set(band, { autoAlpha: 0 });
    gsap.set([history, ...models], { drawSVG: '0% 0%' });
    counters.forEach(el => { el.textContent = '0'; });
    steps.forEach((step, i) => ScrollTrigger.create({ trigger: step, start: 'top 62%', end: 'bottom 62%', onEnter: () => setStage(i), onEnterBack: () => setStage(i) }));
    setStage(0);

    /* 05 Pipeline: the sample image travels the stations. */
    const traveller = $('.traveller'), track = $('.traveller-track'), stations = $$('.station');
    let station = -1;
    const setStation = (i) => {
      if (i === station) return;
      station = i;
      traveller.dataset.stage = i;
      stations.forEach((s, j) => { s.classList.toggle('active', j === i); s.classList.toggle('done', j < i); });
    };
    gsap.fromTo(traveller, { x: 0 }, {
      x: () => track.clientWidth - traveller.clientWidth, ease: 'none',
      scrollTrigger: { trigger: '.pipeline', pin: '.pipeline .pin', start: 'top top', end: '+=240%', scrub: .4, invalidateOnRefresh: true, onUpdate: self => setStation(Math.min(5, Math.floor(self.progress * 6))) },
    });
    setStation(0);

    /* 05b Before/after slider driven by scroll. */
    gsap.fromTo($('.compare-stage'), { '--split': '100%' }, { '--split': '0%', ease: 'none', scrollTrigger: { trigger: '.compare', pin: '.compare .pin', start: 'top top', end: '+=100%', scrub: .3 } });

    /* 06 Code lines leave the editor and become interface. */
    const codeLines = $$('.c-line'), uiEls = $$('.ui-el');
    gsap.set(uiEls, { autoAlpha: 0, scale: .92 });
    const shipTl = gsap.timeline({ scrollTrigger: { trigger: '.ship', pin: '.ship .pin', start: 'top top', end: '+=200%', scrub: .5, invalidateOnRefresh: true } });
    codeLines.forEach((line, i) => {
      const target = document.getElementById(line.dataset.to);
      const delta = () => { const a = line.getBoundingClientRect(), b = target.getBoundingClientRect(); return { x: b.left - a.left, y: b.top - a.top }; };
      shipTl.to(line, { x: () => delta().x, y: () => delta().y, autoAlpha: 0, duration: 1, ease: 'power2.inOut' }, i)
        .to(target, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(1.6)' }, i + .6);
    });

    /* 07 Horizontal journey. */
    const hTrack = $('.h-track');
    gsap.to(hTrack, {
      x: () => -(hTrack.scrollWidth - innerWidth + 24), ease: 'none',
      scrollTrigger: { trigger: '.horizontal', pin: '.horizontal .pin', start: 'top top', end: () => '+=' + (hTrack.scrollWidth - innerWidth + 400), scrub: .5, invalidateOnRefresh: true, snap: { snapTo: 1 / 5, duration: { min: .15, max: .4 }, ease: 'power1.inOut', delay: .05 } },
    });

    /* 08 Agents hand work to each other. */
    const buildFlow = (diagram, trigger, pinTarget, end, onIndex) => {
      const { nodes, nodeEls, linkEls, extraEls, packet } = diagram;
      gsap.set(nodeEls, { scale: 0, transformOrigin: 'center', opacity: 0 });
      gsap.set(linkEls, { drawSVG: '0% 0%' });
      if (extraEls.length) gsap.set(extraEls, { autoAlpha: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger, pin: pinTarget, start: 'top top', end, scrub: .5, onUpdate: self => onIndex?.(Math.min(nodeEls.length - 1, Math.floor(self.progress * nodeEls.length))) } });
      nodeEls.forEach((n, i) => {
        tl.to(n, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(1.7)' }, i);
        if (linkEls[i]) tl.to(linkEls[i], { drawSVG: '0% 100%', duration: .6, ease: 'none' }, i + .4);
        const next = nodes[i + 1] ? { cx: nodes[i + 1].x, cy: nodes[i + 1].y } : null;
        if (i === 0) tl.set(packet, { attr: { cx: nodes[0].x, cy: nodes[0].y } }, 0);
        if (next) tl.to(packet, { attr: next, duration: .6, ease: 'power1.inOut' }, i + .4);
      });
      extraEls.forEach((e, i) => tl.to(e, { autoAlpha: 1, duration: .3 }, [2, 3, 4][i] ?? i + 1));
      return tl;
    };
    const caption = $('#agent-caption');
    let agentIndex = -1;
    buildFlow(agentDiagram, '.agents', '.agents .pin', '+=220%', (i) => { if (i !== agentIndex) { agentIndex = i; caption.textContent = agentCaptions[i]; } });

    /* 09 The site's own architecture assembles itself. */
    buildFlow(archDiagram, '.arch', '.arch .pin', '+=200%');

    /* 10 Cards expand into case studies as they cross the viewport. */
    $$('[data-expander]').forEach(exp => {
      const card = $('.case', exp), body = $('.case-body', exp);
      gsap.timeline({ scrollTrigger: { trigger: exp, start: 'top 85%', end: 'bottom 15%', scrub: .4 } })
        .fromTo(card, { scale: .74, opacity: .55 }, { scale: 1, opacity: 1, duration: .4, ease: 'power2.out' })
        .fromTo(body, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .25 }, '<.15')
        .to({}, { duration: .3 })
        .to(card, { scale: .8, opacity: .5, duration: .35, ease: 'power2.in' });
    });

    /* 11 Constellation camera moves per cluster. */
    ScrollTrigger.create({ trigger: '.constellation', pin: '.constellation .pin', start: 'top top', end: '+=260%', scrub: .5, onUpdate: self => map.setProgress(self.progress) });
    map.setProgress(0);

    return () => { gsap.ticker.remove(heroTick); document.body.classList.remove('story-motion'); counters.forEach(el => { el.textContent = el.dataset.count; }); };
  });

  /* Cursor-reactive previews for the project grid (pointer devices only). */
  const preview = $('#cursor-preview');
  if (preview && matchMedia('(hover: hover)').matches) {
    const toX = gsap.quickTo(preview, 'x', { duration: .35, ease: 'power3' }), toY = gsap.quickTo(preview, 'y', { duration: .35, ease: 'power3' });
    $$('.work-grid button').forEach(button => {
      button.addEventListener('pointerenter', (e) => { preview.textContent = `${button.dataset.preview} · ${button.querySelector('span').textContent}`; gsap.set(preview, { x: e.clientX + 18, y: e.clientY + 18 }); gsap.to(preview, { opacity: 1, duration: .2 }); });
      button.addEventListener('pointermove', (e) => { toX(e.clientX + 18); toY(e.clientY + 18); });
      button.addEventListener('pointerleave', () => gsap.to(preview, { opacity: 0, duration: .2 }));
    });
  }

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
