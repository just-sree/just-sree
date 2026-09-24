// A small command line at the end of the page. Commands jump to, expand or open
// parts of the page; anything it does not recognise is handed to the agent.
const form = document.getElementById('shell-form');
const input = document.getElementById('shell-input');
const output = document.getElementById('shell-output');
if (form && input && output) {
  const history = [];
  let cursor = 0;
  const motion = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

  // Projects are read from the page, so the shell always matches what is listed.
  const featured = [...document.querySelectorAll('.projects > li')].map((item) => ({
    name: item.querySelector('h3').textContent.replace(/\/$/, ''),
    item,
    open() {
      item.closest('details.group')?.setAttribute('open', '');
      item.querySelector('details')?.setAttribute('open', '');
      item.scrollIntoView({ behavior: motion(), block: 'center' });
    },
  }));
  const others = [...document.querySelectorAll('.group .listing button[data-project]')].map((button) => ({
    name: button.textContent.trim(),
    open() { button.closest('details')?.setAttribute('open', ''); button.click(); },
  }));
  const wip = [...document.querySelectorAll('.group .listing a')].map((link) => ({ name: link.textContent.trim(), url: link.href }));

  // Output helpers: a line is a list of parts, each plain text or a clickable link/action.
  const line = (...parts) => {
    const row = document.createElement('p');
    for (const part of parts) {
      if (typeof part === 'string') { row.append(part); continue; }
      const node = document.createElement(part.href ? 'a' : 'button');
      node.textContent = part.text;
      node.className = 'shell-link';
      if (part.href) { node.href = part.href; if (!part.href.startsWith('mailto:')) { node.target = '_blank'; node.rel = 'noreferrer'; } }
      else { node.type = 'button'; node.addEventListener('click', () => run(part.run)); }
      row.append(node);
    }
    output.append(row);
  };
  const dim = (text) => { const row = document.createElement('p'); row.className = 'dim'; row.textContent = text; output.append(row); };
  const echo = (text) => {
    const row = document.createElement('p');
    row.className = 'shell-echo';
    const ps1 = document.createElement('span');
    ps1.className = 'ps1';
    ps1.textContent = '$ ';
    row.append(ps1, text);
    output.append(row);
  };
  const scrollTo = (selector) => document.querySelector(selector)?.scrollIntoView({ behavior: motion(), block: 'start' });
  const find = (name) => {
    const query = name.toLowerCase().replace(/\/$/, '');
    return [...featured, ...others].find((project) => project.name.toLowerCase() === query)
      || [...featured, ...others].find((project) => project.name.toLowerCase().startsWith(query));
  };
  const openAgent = (detail = {}) => document.dispatchEvent(new CustomEvent('agent:open', { detail }));

  const commands = {
    help: ['list commands', () => {
      for (const [name, [about]] of Object.entries(commands)) line({ text: name.padEnd(12), run: name }, about);
      dim('Anything else is sent to my agent as a question. A few commands are hidden.');
    }],
    whoami: ['who I am', () => {
      line('Sree Sankaran Chackoth. Applied AI and ML engineer and forward-deployed engineer, based in Ontario, Canada.');
      scrollTo('#top');
    }],
    ls: ['list projects', () => {
      line('featured: ', ...featured.flatMap((project) => [{ text: project.name + '/', run: `cat ${project.name}` }, ' ']));
      line('other:    ', ...others.flatMap((project) => [{ text: project.name, run: `cat ${project.name}` }, ' ']));
      line('wip:      ', ...wip.flatMap((project) => [{ text: project.name, href: project.url }, ' ']));
      dim('Try: cat bogdai');
    }],
    cat: ['open a project, e.g. cat bogdai', (args) => {
      if (!args) return dim('usage: cat <project>. Type ls to see names.');
      const project = find(args);
      if (!project) return dim(`cat: ${args}: no such project. Type ls to see names.`);
      line(`opening ${project.name}…`);
      project.open();
    }],
    status: ['am I open to work?', () => {
      line('● open to applied AI, ML and FDE roles');
      line('  remote, hybrid or on-site in Ontario, Canada');
      line('  best first step: ', { text: 'email me', href: 'mailto:sreechackoth@gmail.com' }, ' or ', { text: 'check a job description', run: 'job' });
    }],
    experience: ['jump to experience', () => { scrollTo('#experience'); line('cat experience.log'); }],
    community: ['writing, community and certifications', () => {
      for (const item of document.querySelectorAll('#community .listing li')) {
        const name = item.firstElementChild;
        const about = item.querySelector('.dim')?.textContent ?? '';
        line(name.href ? { text: name.textContent.padEnd(20), href: name.href } : name.textContent.padEnd(20), about);
      }
      scrollTo('#community');
    }],
    stack: ['show my stack', () => {
      for (const [dt, dd] of [...document.querySelectorAll('.tools dt')].map((term) => [term.textContent, term.nextElementSibling?.textContent])) line(`${dt.padEnd(15)}${dd}`);
    }],
    resume: ['open my resume (PDF)', () => { line({ text: 'resume.pdf ↗', href: '/resume.pdf' }); window.open('/resume.pdf', '_blank', 'noopener'); }],
    contact: ['how to reach me', () => {
      line('email:    ', { text: 'sreechackoth@gmail.com', href: 'mailto:sreechackoth@gmail.com' });
      line('linkedin: ', { text: 'linkedin.com/in/sreesankaranc', href: 'https://linkedin.com/in/sreesankaranc' });
      line('github:   ', { text: 'github.com/just-sree', href: 'https://github.com/just-sree' });
    }],
    agent: ['talk to my agent', (args) => { line('opening the agent…'); openAgent(args ? { prompt: args } : {}); }],
    job: ['check a job description against my work', () => { line('opening the job description check…'); openAgent({ job: true }); }],
    feed: ['feed the fish', () => {
      const toggle = document.getElementById('aquarium-toggle');
      if (toggle?.getAttribute('aria-pressed') === 'false') return dim('The aquarium is off. Turn it on in the footer first.');
      document.dispatchEvent(new CustomEvent('aquarium:feed'));
      line('><> dropped some food.');
    }],
    theme: ['switch light/dark, or: theme light', (args) => {
      const now = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
      const want = /^(light|dark)$/i.test(args) ? args.toLowerCase() : args ? null : now === 'light' ? 'dark' : 'light';
      if (!want) return dim('usage: theme [light|dark]');
      document.dispatchEvent(new CustomEvent('theme:set', { detail: { theme: want } }));
      line(`theme: ${want}`);
    }],
    clear: ['clear this output', () => output.replaceChildren()],
  };
  // Hidden commands: not in help or Tab completion, just there to be found.
  const started = performance.now();
  const uptime = () => { const s = Math.round((performance.now() - started) / 1000); return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`; };
  const fortunes = [
    'Most model problems are data problems.',
    'Check the baseline before you celebrate.',
    'If it is not evaluated, it is not done.',
    'The demo worked. Production has opinions.',
    'Accuracy is a number. Ask what it costs to be wrong.',
    'Clean the data once, properly, and write down how.',
    'Ship the boring version first.',
    'Talk to the people with the problem before you pick a model.',
  ];
  const fortune = () => fortunes[Math.floor(Math.random() * fortunes.length)];
  const block = (text, className = '') => { const pre = document.createElement('pre'); pre.className = `shell-block ${className}`.trim(); pre.textContent = text; output.append(pre); return pre; };
  const hidden = {
    neofetch: () => {
      const logo = ['', '     /`·.¸', '    /¸...¸`:·', '¸.·´  ¸   `·.¸.·´)', ': © ):´;      ¸  {', ' `·.¸ `·  ¸.·´\\`·¸)', '     `\\\\´´\\¸.·´', '', '', ''];
      const info = [
        'sree@just-sree',
        '--------------',
        `role      applied AI / ML engineer, FDE`,
        `location  Ontario, Canada`,
        `status    open to AI, ML and FDE roles`,
        `stack     python pytorch langgraph azure aws`,
        `projects  ${featured.length} featured, ${others.length} more, ${wip.length} in progress`,
        `shell     just-sh`,
        `uptime    ${uptime()}`,
        `fish      ${document.getElementById('aquarium-toggle')?.getAttribute('aria-pressed') === 'false' ? 'asleep' : 'swimming'}`,
      ];
      block(info.map((row, i) => (logo[i] ?? '').padEnd(22) + row).join('\n'), 'neofetch');
    },
    sl: () => {
      const train = [
        '      ====        ________                ___________ ',
        '  _D _|  |_______/        \\__I_I_____===__|_________| ',
        '   |(_)---  |   H\\________/ |   |        =|___ ___|  ',
        '   /     |  |   H  |  |     |   |         ||_| |_||  ',
        '  |      |  |   H  |__--------------------| [___] |  ',
        '  | ________|___H__/__|_____/[][]~\\_______|       |  ',
        '  |/ |   |-----------I_____I [][] []  D   |=======|__',
        '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__',
        ' |/-=|___|=    ||    ||    ||    |_____/~\\___/       ',
        '  \\_/      \\O=====O=====O=====O_/      \\_/            ',
      ].join('\n');
      const track = block('', 'sl');
      const car = document.createElement('span');
      car.textContent = train;
      track.append(car);
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return dim('choo choo. (the train stays put when reduced motion is on)');
      car.animate([{ transform: `translateX(${track.clientWidth}px)` }, { transform: 'translateX(-100%)' }], { duration: 4200, easing: 'linear' })
        .finished.then(() => { track.remove(); dim('The train has left the station.'); }, () => {});
    },
    fortune: () => line(fortune()),
    cowsay: (args) => {
      const text = args || fortune();
      const bar = '-'.repeat(text.length + 2);
      block([` ${'_'.repeat(text.length + 2)}`, `< ${text} >`, ` ${bar}`, '        \\   ^__^', '         \\  (oo)\\_______', '            (__)\\       )\\/\\', '                ||----w |', '                ||     ||'].join('\n'));
    },
    uptime: () => line(`up ${uptime()}, 1 visitor, fish: ${document.getElementById('aquarium-toggle')?.getAttribute('aria-pressed') === 'false' ? 'asleep' : 'swimming'}`),
    vim: () => dim('You are in vim now. Just kidding. :q'),
    emacs: () => dim('No emacs here. Try vim. Also no vim here.'),
    exit: () => dim('This is a web page. Close the tab to leave, or stay and feed the fish.'),
    rm: () => dim('rm: permission denied. The fish live here.'),
    hello: () => line('Hi. Type help to see what this does, or just ask a question.'),
    coffee: () => line('  ( (\n   ) )\n ........\n |      |]\n \\      /\n  `----\''),
  };
  const aliases = { 'ls projects': 'ls', 'ls projects/': 'ls', 'cat experience.log': 'experience', 'cat stack.txt': 'stack', './contact': 'contact', email: 'contact', open: 'cat', ask: 'agent', '?': 'help', writing: 'community', 'ls community': 'community', 'ls community/': 'community', 'cat certifications.txt': 'community', 'open to work': 'status', available: 'status', hire: 'status', hi: 'hello', hey: 'hello', logout: 'exit', quit: 'exit', ':q': 'exit', nvim: 'vim', vi: 'vim', 'light mode': 'theme light', 'dark mode': 'theme dark', lights: 'theme' };

  function run(raw) {
    const text = raw.trim();
    if (!text) return;
    echo(text);
    const full = aliases[text.toLowerCase()] ?? text;
    const [word, ...rest] = full.split(/\s+/);
    const name = (aliases[word.toLowerCase()] ?? word).toLowerCase();
    const args = rest.join(' ');
    if (Object.hasOwn(commands, name)) commands[name][1](args);
    else if (Object.hasOwn(hidden, name)) hidden[name](args);
    else if (name === 'sudo') dim('Nice try. No root on this page.');
    else {
      // Not a command: treat it as a question for the agent.
      dim(`${word}: not a command, asking my agent instead…`);
      openAgent({ prompt: text });
    }
    while (output.children.length > 40) output.firstElementChild.remove();
    output.lastElementChild?.scrollIntoView({ block: 'nearest' });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value;
    if (text.trim()) { history.push(text); cursor = history.length; }
    input.value = '';
    run(text);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && cursor > 0) { event.preventDefault(); input.value = history[--cursor]; }
    else if (event.key === 'ArrowDown') { event.preventDefault(); cursor = Math.min(history.length, cursor + 1); input.value = history[cursor] ?? ''; }
    else if (event.key === 'Tab' && input.value.trim()) {
      // Complete a command name, or a project name after cat.
      const [word, rest] = input.value.split(/\s+(.*)/);
      const pool = rest === undefined ? Object.keys(commands) : word === 'cat' ? [...featured, ...others].map((project) => project.name) : [];
      const target = rest === undefined ? word : rest;
      const match = pool.filter((option) => option.startsWith(target.toLowerCase()));
      if (match.length === 1) { event.preventDefault(); input.value = rest === undefined ? `${match[0]} ` : `${word} ${match[0]}`; }
    }
  });
}
