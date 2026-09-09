const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const projectDialog = $('#project-dialog');
const agentDialog = $('#agent-dialog');
const messages = $('#messages');
const input = $('#agent-input');
let projects = {};
let history = [];
let requestPending = false;
let returnFocus;
const projectReady = fetch('/projects.json').then((response) => {
  if (!response.ok) throw new Error('Project notes are unavailable.');
  return response.json();
}).then((data) => { projects = data; });
projectReady.catch(() => {});

function closeDialog(dialog) {
  dialog.close();
}
$$('[data-close]').forEach((button) => button.addEventListener('click', () => closeDialog(document.getElementById(button.dataset.close))));
[projectDialog, agentDialog].forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog);
  });
  dialog.addEventListener('close', () => {
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
});
function textElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}
async function openProject(id) {
  if (agentDialog.open) agentDialog.close();
  returnFocus = document.activeElement;
  const detail = $('#project-detail');
  detail.replaceChildren(textElement('p', 'Loading project notes…'));
  if (!projectDialog.open) projectDialog.showModal();
  try {
    await projectReady;
    const project = projects[id];
    if (!project) throw new Error('Project not found.');
    const title = textElement('h2', project.name);
    title.id = 'project-dialog-title';
    detail.replaceChildren(title, textElement('p', project.summary, 'detail-lead'));
    const flow = document.createElement('div');
    flow.className = 'detail-flow';
    (project.architecture || []).forEach((name, index) => flow.append(textElement('span', `${index + 1}. ${name}`)));
    detail.append(flow);
    for (const [label, key] of [['The problem', 'problem'], ['The engineering decision', 'decision'], ['Evidence & source', 'evidence'], ['Scope & status', 'limits']]) {
      const section = document.createElement('section');
      section.className = 'detail-section';
      if (!project[key]) continue;
      section.append(textElement('h3', label), textElement('p', project[key]));
      detail.append(section);
    }
    const actions = document.createElement('div');
    actions.className = 'detail-actions';
    const source = textElement('a', (project.sourceLabel || 'Explore the source') + ' ↗', 'button button-dark');
    source.href = project.url;
    source.target = '_blank';
    source.rel = 'noreferrer';
    const ask = textElement('button', 'Ask my agent about this ↗', 'text-link');
    ask.addEventListener('click', () => openAgent(`Explain the engineering decisions in ${project.name}.`));
    actions.append(source, ask);
    detail.append(actions);
  } catch {
    detail.replaceChildren(textElement('h2', 'Project notes unavailable'), textElement('p', 'Please reload the page to try again.'));
  }
}
$$('[data-project]').forEach((button) => button.addEventListener('click', () => openProject(button.dataset.project)));

const prompts = {
  hiring: ['Where is Sree strongest as an engineer?', 'Compare IRCC and BogdAI.', 'Is the latest resume available?'],
  founder: ['What could Sree help a startup build?', 'Help me draft a collaboration brief.', 'What is currently in development?'],
  technical: ['Walk me through the IRCC forecasting pipeline.', 'Explain BogdAI’s six-agent pipeline.', 'How does SceneSense turn images into audio?'],
};
function renderSuggestions(audience) {
  $('#suggestions').replaceChildren();
  for (const prompt of prompts[audience]) {
    const button = textElement('button', prompt);
    button.append(textElement('span', '↗'));
    button.addEventListener('click', () => sendMessage(prompt));
    $('#suggestions').append(button);
  }
}
$$('[data-audience]').forEach((button) => button.addEventListener('click', () => {
  $$('[data-audience]').forEach((item) => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  renderSuggestions(button.dataset.audience);
}));
renderSuggestions('hiring');
fetch('/api/status').then((response) => response.json()).then(({ mode, provider }) => {
  if (mode === 'unavailable') throw new Error('Agent configuration unavailable.');
  const providerName = provider === 'azure' ? 'Azure AI Foundry' : 'OpenAI';
  $('#agent-mode').textContent = mode === 'live' ? providerName.toUpperCase() + ' · PROJECT-GROUNDED' : 'PREVIEW · CURATED GUIDE';
  $('#mode-disclosure').textContent = mode === 'live'
    ? 'AI can make mistakes. Check linked project sources. Chat messages are sent to ' + providerName + ' to generate replies; resume and brief actions run locally.'
    : 'Preview: curated answers, without a connected language model.';
}).catch(() => {
  $('#agent-mode').textContent = 'CONNECTION UNAVAILABLE';
  $('#mode-disclosure').textContent = 'The agent server is unavailable. You can still explore the projects.';
});

function openAgent(prompt) {
  if (projectDialog.open) projectDialog.close();
  if (!agentDialog.open) {
    returnFocus = document.activeElement;
    agentDialog.showModal();
  }
  input.focus();
  if (prompt) sendMessage(prompt);
}
$$('[data-agent]').forEach((button) => button.addEventListener('click', () => openAgent(button.dataset.prompt)));
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (agentDialog.open) agentDialog.close(); else openAgent();
  }
});
function addMessage(role, content) {
  const element = textElement('div', '', `message ${role}`);
  if (role === 'assistant') element.append(textElement('span', 'SREE’S AGENT', 'message-label'));
  element.append(textElement('span', content));
  messages.append(element);
  return element;
}
function scrollChat() { const body = $('.agent-body'); body.scrollTop = body.scrollHeight; }
async function sendMessage(raw) {
  const text = raw.trim();
  if (!text || requestPending) return;
  requestPending = true;
  input.value = '';
  input.style.height = 'auto';
  $('#agent-form button').disabled = true;
  $('#clear-chat').disabled = true;
  addMessage('user', text);
  const pending = addMessage('assistant', 'Looking through the project notes…');
  scrollChat();
  try {
    const response = await fetch('/api/agent', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history.slice(-10) }),
      signal: AbortSignal.timeout(50000),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The agent could not respond. Please try again.');
    pending.remove();
    const reply = addMessage('assistant', data.answer);
    history.push({ role: 'user', content: text }, { role: 'assistant', content: data.answer });
    if (data.resume) {
      const link = textElement('a', 'Read Sree’s resume (PDF) ↗', 'message-source');
      link.href = '/resume.pdf'; link.target = '_blank'; link.rel = 'noreferrer';
      reply.append(link);
    }
    if (data.brief) {
      const draft = document.createElement('textarea');
      draft.className = 'brief-draft';
      draft.setAttribute('aria-label', 'Editable collaboration brief');
      draft.rows = 12;
      draft.value = data.brief;
      draft.style.width = '100%';
      const download = textElement('button', 'Download brief ↓', 'message-action');
      download.addEventListener('click', () => {
        const url = URL.createObjectURL(new Blob([draft.value], { type: 'text/plain;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url; link.download = 'collaboration-brief.txt';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      reply.append(draft, download);
    }
    for (const id of data.sources || []) {
      if (!Object.hasOwn(projects, id)) continue;
      const source = textElement('a', projects[id].name + ' source ↗', 'message-source');
      source.href = projects[id].url; source.target = '_blank'; source.rel = 'noreferrer';
      reply.append(source);
    }
    if (data.project && projects[data.project]) {
      const project = projects[data.project];
      const action = textElement('button', `Explore ${project.name} ↗`, 'message-action');
      action.addEventListener('click', () => {
        agentDialog.close();
        const target = document.getElementById(`project-${data.project}`);
        target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
        target?.querySelector('button')?.focus({ preventScroll: true });
        openProject(data.project);
      });
      reply.append(action);
      const source = textElement('a', `Source: ${project.name} ↗`, 'message-source');
      source.href = project.url;
      source.target = '_blank';
      source.rel = 'noreferrer';
      reply.append(source);
    }
    if (data.contact) {
      const contact = textElement('a', 'Email Sree ↗', 'message-source');
      contact.href = 'mailto:sreechackoth@gmail.com';
      reply.append(contact);
    }
  } catch (error) {
    pending.remove();
    addMessage('assistant', error.name === 'TimeoutError' ? 'That took too long. Please try again, or use the project cards to keep exploring.' : error.message).classList.add('error-message');
  } finally {
    requestPending = false;
    $('#agent-form button').disabled = false;
    $('#clear-chat').disabled = false;
    scrollChat();
    input.focus();
  }
}
$('#agent-form').addEventListener('submit', (event) => { event.preventDefault(); sendMessage(input.value); });
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); sendMessage(input.value); }
});
input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 100) + 'px'; });
$('#clear-chat').addEventListener('click', () => { if (!requestPending) { messages.replaceChildren(); history = []; input.focus(); } });
$('#year').textContent = new Date().getFullYear();

// Scroll-led presentation: native scrolling, one animation frame per paint,
// and full content visibility when reduced motion is preferred.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const progressBar = $('.reading-progress span');
const watermark = $('.hero-watermark');
let scrollFrame = 0;
function paintScroll() {
  scrollFrame = 0;
  const distance = document.documentElement.scrollHeight - innerHeight;
  if (progressBar) progressBar.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0})`;
  if (watermark) watermark.style.transform = reducedMotion.matches ? '' : `translateY(${Math.min(scrollY * .12, 90)}px)`;
}
function scheduleScrollPaint() { if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScroll); }
window.addEventListener('scroll', scheduleScrollPaint, { passive: true });
window.addEventListener('resize', scheduleScrollPaint, { passive: true });
reducedMotion.addEventListener('change', () => {
  document.body.classList.toggle('motion-ready', !reducedMotion.matches && 'IntersectionObserver' in window);
  scheduleScrollPaint();
});
paintScroll();

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: .06, rootMargin: '0px 0px -25px 0px' });
  $$('.reveal').forEach((element) => revealObserver.observe(element));
  if (!reducedMotion.matches) document.body.classList.add('motion-ready');

}
