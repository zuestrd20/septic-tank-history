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

// A single finite tour: no autoplay, no loops, no background playback.
const animation = document.querySelector('#septic-animation');
if (animation) {
  const stepButtons = [...animation.querySelectorAll('[data-step-button]')];
  const stepCards = [...animation.querySelectorAll('.process-steps li')];
  const play = animation.querySelector('#animation-play');
  const replay = animation.querySelector('#animation-replay');
  const next = animation.querySelector('#animation-next');
  const announcement = animation.querySelector('#animation-status');
  const motionNote = animation.querySelector('#motion-note');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const labels = ['污水流入', '沉澱與上浮', '緩慢厭氧分解', '流向後續處理'];
  const stepDuration = 6000;
  let step = 0;
  let playing = false;
  let complete = false;
  let remaining = stepDuration;
  let startedAt = 0;
  let timer = null;

  function render() {
    animation.dataset.step = String(step);
    animation.dataset.playing = String(playing);
    stepButtons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === step));
      stepCards[index].classList.toggle('is-current', index === step);
    });
    play.disabled = reducedMotion.matches;
    play.textContent = reducedMotion.matches ? '已減少動態效果' : playing ? '暫停動畫' : complete ? '再播放一次' : '播放動畫';
    replay.textContent = reducedMotion.matches ? '回到第一步' : '從頭重播';
    next.textContent = step === labels.length - 1 ? '回到第一步 ↺' : '下一步 →';
    motionNote.hidden = !reducedMotion.matches;
    announcement.textContent = `第 ${step + 1} / ${labels.length} 步 · ${labels[step]} · ${complete ? '播放完畢' : playing ? '播放中' : '已暫停'}`;
  }

  function pause() {
    if (playing) remaining = Math.max(0, remaining - (performance.now() - startedAt));
    clearTimeout(timer);
    timer = null;
    playing = false;
    render();
  }

  function schedule() {
    startedAt = performance.now();
    timer = setTimeout(() => {
      timer = null;
      if (step < labels.length - 1) {
        step += 1;
        remaining = stepDuration;
        render();
        schedule();
      } else {
        playing = false;
        complete = true;
        remaining = stepDuration;
        render();
      }
    }, remaining);
  }

  function selectStep(index) {
    pause();
    step = index;
    complete = false;
    remaining = stepDuration;
    render();
  }

  function start() {
    if (reducedMotion.matches || playing) return;
    if (complete) selectStep(0);
    playing = true;
    render();
    schedule();
  }

  play.addEventListener('click', () => playing ? pause() : start());
  replay.addEventListener('click', () => { selectStep(0); start(); });
  next.addEventListener('click', () => selectStep((step + 1) % labels.length));
  stepButtons.forEach((button, index) => {
    button.disabled = false;
    button.addEventListener('click', () => selectStep(index));
  });
  reducedMotion.addEventListener('change', () => { pause(); render(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting && playing) pause();
    }).observe(animation);
  }
  animation.classList.add('is-ready');
  animation.querySelector('.animation-controls').hidden = false;
  render();
}
