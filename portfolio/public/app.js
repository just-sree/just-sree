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
  $('#agent-mode').textContent = mode === 'live' ? providerName.toLowerCase() + ' · answers from my notes' : 'preview · written answers';
  $('#mode-disclosure').textContent = mode === 'live'
    ? 'AI can make mistakes. Check linked project sources. Chat messages are sent to ' + providerName + ' to generate replies; resume and brief actions run locally.'
    : 'Preview: answers are written in advance from my notes. No language model is connected.';
}).catch(() => {
  $('#agent-mode').textContent = 'connection unavailable';
  $('#mode-disclosure').textContent = 'The agent server is unavailable. You can still explore the projects.';
});

const email = 'sreechackoth@gmail.com';
// Email hand-off: opens a draft in the visitor's own mail app. Nothing is sent from here.
function mailto(subject, body) {
  const make = (text) => `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  let text = body;
  // Keep the link under the length most mail apps accept.
  while (make(text).length > 1900 && text.length > 200) text = text.slice(0, Math.floor(text.length * 0.9)).trimEnd() + '\n[…]';
  return make(text);
}
function chatEmail() {
  const asked = history.filter((item) => item.role === 'user').map((item) => '- ' + item.content.replace(/\s+/g, ' ').slice(0, 200));
  return `Hi Sree,\n\nI was using the agent on your portfolio. What I asked:\n${asked.join('\n')}\n\n[Your name, what you're working on, and how to reach you]\n`;
}
const strengthLabel = { strong: 'shown in a project or role', partial: 'partial evidence', none: 'not in the notes' };
function jobEmail(match) {
  const lines = match.items.map((item) => `- ${item.requirement}: ${strengthLabel[item.strength]}`);
  return `Hi Sree,\n\nI checked a job description${match.role ? ` (${match.role})` : ''} against your portfolio with your agent:\n\n${lines.join('\n')}\n\n[Your name, company, and a link to the role]\n`;
}
function emailAction(label, subject, body) {
  const link = textElement('a', label + ' ↗', 'message-action');
  // Build the draft on click so edits (for example to a brief) are included.
  link.href = mailto(subject, body());
  link.addEventListener('click', () => { link.href = mailto(subject, body()); });
  const note = textElement('span', 'Opens a draft in your email app. Nothing is sent until you send it.', 'message-note');
  const wrap = document.createElement('div');
  wrap.append(link, note);
  return wrap;
}
let jobMode = false;
function setJobMode(on) {
  jobMode = on;
  input.maxLength = on ? 8000 : 2000;
  input.placeholder = on ? 'Paste the job description here…' : 'What would you like to know?';
  $('#job-banner').hidden = !on;
  input.focus();
}
$('#job-toggle').addEventListener('click', () => setJobMode(true));
$('#job-cancel').addEventListener('click', () => setJobMode(false));
$('#email-chat').addEventListener('click', () => { if (history.length) location.href = mailto('Question from your portfolio', chatEmail()); });

function openAgent(prompt) {
  if (projectDialog.open) projectDialog.close();
  if (!agentDialog.open) {
    returnFocus = document.activeElement;
    agentDialog.showModal();
  }
  input.focus();
  if (prompt) sendMessage(prompt);
}
$$('[data-agent]').forEach((button) => button.addEventListener('click', () => { openAgent(button.dataset.prompt); if ('job' in button.dataset) setJobMode(true); }));
// The page's command line (shell.js) opens the agent through this event.
document.addEventListener('agent:open', (event) => { openAgent(event.detail?.prompt); if (event.detail?.job) setJobMode(true); });
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
async function sendMessage(raw, task) {
  const text = raw.trim();
  if (!text || requestPending) return;
  requestPending = true;
  input.value = '';
  input.style.height = 'auto';
  $('#agent-form button').disabled = true;
  $('#clear-chat').disabled = true;
  addMessage('user', task ? `Job description (${text.length.toLocaleString('en-US')} characters)\n${text.split('\n').find((line) => line.trim())?.trim().slice(0, 100) || ''}…` : text);
  const pending = addMessage('assistant', task ? 'Checking the posting against the project notes and resume…' : 'Looking through the project notes…');
  scrollChat();
  try {
    const response = await fetch('/api/agent', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history.slice(-10), ...(task ? { task } : {}) }),
      signal: AbortSignal.timeout(50000),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The agent could not respond. Please try again.');
    pending.remove();
    const reply = addMessage('assistant', data.answer);
    history.push({ role: 'user', content: task ? 'I pasted a job description: ' + text.slice(0, 400) + (text.length > 400 ? '…' : '') : text }, { role: 'assistant', content: data.answer });
    if (task) setJobMode(false);
    if (data.match?.items?.length) {
      const legend = textElement('p', '[✓] shown in a project or role   [~] partial evidence   [ ] not in the notes', 'match-legend');
      const list = document.createElement('ul');
      list.className = 'match';
      for (const item of data.match.items) {
        const row = document.createElement('li');
        row.className = 'match-' + item.strength;
        const mark = textElement('span', { strong: '[✓]', partial: '[~]', none: '[ ]' }[item.strength], 'match-mark');
        mark.setAttribute('aria-hidden', 'true');
        row.append(mark, textElement('span', strengthLabel[item.strength] + ': ', 'sr-only'), textElement('strong', item.requirement), textElement('span', item.evidence, 'match-evidence'));
        if (item.source === 'resume') {
          const link = textElement('a', 'resume ↗', 'match-source');
          link.href = '/resume.pdf'; link.target = '_blank'; link.rel = 'noreferrer';
          row.append(link);
        } else if (item.source && Object.hasOwn(projects, item.source)) {
          const notes = textElement('button', 'notes ↗', 'match-source');
          notes.addEventListener('click', () => openProject(item.source));
          row.append(notes);
        }
        list.append(row);
      }
      reply.append(legend, list, emailAction('Email Sree this match', 'Job description check' + (data.match.role ? ': ' + data.match.role : ''), () => jobEmail(data.match)));
    }
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
      reply.append(draft, download, emailAction('Email this brief to Sree', 'Collaboration brief', () => draft.value));
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
        // Projects sit in collapsed <details>; open them so the target is visible and focusable.
        target?.closest('details')?.setAttribute('open', '');
        target?.querySelector('details')?.setAttribute('open', '');
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
    if (data.contact && !data.match && !data.brief) reply.append(emailAction('Email Sree about this', 'Question from your portfolio', chatEmail));
  } catch (error) {
    pending.remove();
    addMessage('assistant', error.name === 'TimeoutError' ? 'That took too long. Please try again, or use the project cards to keep exploring.' : error.message).classList.add('error-message');
  } finally {
    requestPending = false;
    $('#email-chat').disabled = !history.length;
    $('#agent-form button').disabled = false;
    $('#clear-chat').disabled = false;
    scrollChat();
    input.focus();
  }
}
$('#agent-form').addEventListener('submit', (event) => { event.preventDefault(); sendMessage(input.value, jobMode ? 'job-match' : undefined); });
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !jobMode) { event.preventDefault(); sendMessage(input.value); }
});
input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 100) + 'px'; });
$('#clear-chat').addEventListener('click', () => { if (!requestPending) { messages.replaceChildren(); history = []; $('#email-chat').disabled = true; setJobMode(false); } });
$('#year').textContent = new Date().getFullYear();


// Printing shows everything: open collapsed sections, then restore them afterwards.
let closedForPrint = [];
addEventListener('beforeprint', () => {
  closedForPrint = [...document.querySelectorAll('main details:not([open])')];
  for (const details of closedForPrint) details.open = true;
});
addEventListener('afterprint', () => {
  for (const details of closedForPrint) details.open = false;
  closedForPrint = [];
});

// Vercel Web Analytics: cookie-free page views, served from this site's own domain.
// Loaded only on the deployed site; turn it on in the Vercel project's Analytics tab.
if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
  const insights = document.createElement('script');
  insights.defer = true;
  insights.src = '/_vercel/insights/script.js';
  document.head.append(insights);
}
