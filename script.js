'use strict';
const buttons = document.querySelectorAll('[data-filter]');
const entries = document.querySelectorAll('[data-era]');
const status = document.querySelector('#filter-status');
buttons.forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let count = 0;
  entries.forEach(entry => { entry.hidden = filter !== 'all' && entry.dataset.era !== filter; if (!entry.hidden) count++; });
  status.textContent = `顯示${button.textContent} ${count} 個歷史節點`;
}));
