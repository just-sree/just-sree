const one = (s) => document.querySelector(s);
const all = (s) => [...document.querySelectorAll(s)];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 800px), (max-height: 560px)');
const hero = one('.narrative-hero');
const verb = one('#hero-verb');
const words = ['reason', 'automate', 'deploy', 'solve real problems'];
const chapters = all('[data-chapter]').map(section => ({ section, steps: [...section.querySelectorAll('.chapter-step')], panel: section.querySelector('.visual-panel'), index: -1 }));
const rail = all('.section-rail a').map(a => ({ a, section: document.querySelector(a.getAttribute('href')) }));
const journey = all('.journey-card');
let frame = 0, wordIndex = -1, typingFrame = 0;
const clamp = (v, lo=0, hi=1) => Math.max(lo, Math.min(hi, v));

function changeWord(index) {
 if(index === wordIndex) return;
 wordIndex = index;
 cancelAnimationFrame(typingFrame);
 all('.verb-index span').forEach((item, i) => item.classList.toggle('active', i === index));
 const next = words[index];
 if(motion.matches || compact.matches) { verb.textContent = next; return; }
 const start = performance.now();
 const draw = now => {
  const p = clamp((now - start) / 290);
  const count = Math.floor(next.length * p);
  verb.textContent = next.slice(0, count) + (count < next.length ? '·' : '');
  if(p < 1) typingFrame = requestAnimationFrame(draw);
 };
 typingFrame = requestAnimationFrame(draw);
}

const captions = [
 ['Understand the data', 'Prepare the time series', 'Compare the models', 'Support the next decision'],
 ['Start with the contract', 'Extract and ground', 'Reason and verify', 'Return an inspectable report'],
];
function paint() {
 frame = 0;
 const vh = innerHeight;
 const rect = hero.getBoundingClientRect();
 const progress = clamp((-rect.top + 96) / Math.max(1, hero.offsetHeight - vh));
 changeWord(motion.matches || compact.matches ? 3 : Math.min(3, Math.floor(progress * 4)));
 chapters.forEach((chapter, ci) => {
  let index = 0;
  chapter.steps.forEach((step, i) => { if(step.getBoundingClientRect().top < vh * .56) index = i; });
  if(compact.matches || motion.matches) index = 3;
  if(chapter.index === index) return;
  chapter.index = index;
  chapter.panel.dataset.stage = index;
  chapter.steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
  chapter.panel.querySelector('.stage-indicator').textContent = `0${index+1} / 04`;
  chapter.panel.querySelector('.stage-caption').textContent = `0${index+1} — ${captions[ci][index]}`;
  const reached = [0, 2, 4, 5][index];
  chapter.panel.querySelectorAll('.flow-node').forEach((node, i) => {
   node.classList.toggle('is-reached', i <= reached);
   node.classList.toggle('is-current', i === reached);
  });
 });
 let current = rail[0];
 rail.forEach(item => { if(item.section.getBoundingClientRect().top <= vh * .4) current = item; });
 rail.forEach(item => { if(item === current) item.a.setAttribute('aria-current', 'location'); else item.a.removeAttribute('aria-current'); });
 let stage = 0;
 journey.forEach((card, i) => { if(card.getBoundingClientRect().top < vh * .55) stage = i; });
 const track = one('.journey-track');
 track.style.setProperty('--journey-progress', stage / Math.max(1, journey.length-1));
 track.querySelectorAll('a').forEach((a, i) => { if(i === stage) a.setAttribute('aria-current','step'); else a.removeAttribute('aria-current'); });
}
function schedule() { if(!frame) frame = requestAnimationFrame(paint); }
function preferences() {
 document.body.classList.toggle('story-motion', !motion.matches && !compact.matches);
 chapters.forEach(chapter => { chapter.index = -1; });
 wordIndex = -1;
 schedule();
}
window.addEventListener('scroll', schedule, { passive:true });
window.addEventListener('resize', schedule, { passive:true });
motion.addEventListener('change', preferences);
compact.addEventListener('change', preferences);
preferences();

// Count only the resume-backed figures, once, when their evidence enters view.
if('IntersectionObserver' in window) {
 const counter = new IntersectionObserver(entries => {
  for(const entry of entries) {
   if(!entry.isIntersecting) continue;
   counter.unobserve(entry.target);
   if(motion.matches) continue;
   const value = Number(entry.target.dataset.count), start = performance.now();
   const tick = now => {
    const p = motion.matches ? 1 : clamp((now-start)/650);
    entry.target.textContent = Math.round(value*(1-Math.pow(1-p,3)));
    if(p<1) requestAnimationFrame(tick);
   };
   requestAnimationFrame(tick);
  }
 }, {threshold:1});
 all('[data-count]').forEach(el=>counter.observe(el));
}
