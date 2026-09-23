// Runs in <head> before first paint so a saved light theme applies without a flash of dark.
try {
  if (localStorage.getItem('theme') === 'light') document.documentElement.dataset.theme = 'light';
} catch {}
