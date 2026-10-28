const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function setup(reduce = false) {
  class Element {
    constructor(dataset = {}) { this.dataset = dataset; this.hidden = false; this.disabled = false; this.textContent = ''; this.attributes = {}; this.events = {}; this.classes = new Set(); this.classList = { add: c => this.classes.add(c), toggle: (c, on) => on ? this.classes.add(c) : this.classes.delete(c) }; }
    setAttribute(k, v) { this.attributes[k] = v; }
    addEventListener(k, f) { this.events[k] = f; }
    click() { if (!this.disabled) this.events.click?.(); }
  }
  let now = 0, id = 0, observer;
  const timers = new Map();
  const steps = Array.from({ length: 4 }, (_, i) => new Element({ stepButton: String(i) }));
  const cards = steps.map(() => new Element());
  const controls = Object.fromEntries(['animation-play', 'animation-replay', 'animation-next', 'animation-status', 'motion-note', 'controls'].map(x => [x, new Element()]));
  const animation = new Element();
  animation.querySelectorAll = s => s === '[data-step-button]' ? steps : cards;
  animation.querySelector = s => s === '.animation-controls' ? controls.controls : controls[s.slice(1)];
  const filters = ['all', 'early', 'modern', 'today'].map(f => { const e = new Element({ filter: f }); e.textContent = f; return e; });
  const entries = ['early', 'modern', 'modern', 'modern', 'modern', 'today', 'today'].map(era => new Element({ era }));
  const filterStatus = new Element();
  const document = new Element();
  document.querySelectorAll = s => s === '[data-filter]' ? filters : entries;
  document.querySelector = s => s === '#filter-status' ? filterStatus : animation;
  const media = { matches: reduce, addEventListener(_, fn) { this.change = fn; } };
  class Observer { constructor(fn) { observer = fn; } observe() {} }
  const context = { document, window: { matchMedia: () => media, IntersectionObserver: Observer }, IntersectionObserver: Observer, performance: { now: () => now }, setTimeout: (fn, ms) => { timers.set(++id, { fn, due: now + ms }); return id; }, clearTimeout: n => timers.delete(n) };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8'), context);
  function tick(ms) {
    const end = now + ms;
    while (true) {
      const next = [...timers].filter(([, t]) => t.due <= end).sort((a, b) => a[1].due - b[1].due)[0];
      if (!next) break;
      now = next[1].due; timers.delete(next[0]); next[1].fn();
    }
    now = end;
  }
  return { animation, steps, cards, controls, filters, entries, filterStatus, document, media, timers, tick, observe: value => observer([{ isIntersecting: value }]) };
}

test('initializes paused with readable steps and no timer', () => {
  const s = setup(); assert.equal(s.animation.dataset.playing, 'false'); assert.equal(s.animation.dataset.step, '0'); assert.equal(s.timers.size, 0); assert.equal(s.controls.controls.hidden, false); assert.ok(s.steps.every(x => !x.disabled)); assert.equal(s.steps[0].attributes['aria-pressed'], 'true');
});
test('plays four steps once, then stops; play starts a fresh tour', () => {
  const s = setup(); s.controls['animation-play'].click(); s.tick(6000); assert.equal(s.animation.dataset.step, '1'); s.tick(12000); assert.equal(s.animation.dataset.step, '3'); s.tick(6000); assert.equal(s.animation.dataset.playing, 'false'); assert.match(s.controls['animation-status'].textContent, /播放完畢/); assert.equal(s.timers.size, 0); s.controls['animation-play'].click(); assert.equal(s.animation.dataset.step, '0'); assert.equal(s.timers.size, 1);
});
test('pause preserves remaining duration, including repeated clicks', () => {
  const s = setup(); const p = s.controls['animation-play']; p.click(); s.tick(2000); p.click(); s.tick(10000); assert.equal(s.animation.dataset.step, '0'); p.click(); s.tick(3999); assert.equal(s.animation.dataset.step, '0'); s.tick(1); assert.equal(s.animation.dataset.step, '1'); p.click(); p.click(); assert.equal(s.timers.size, 1);
});
test('manual selection pauses; next wraps without starting motion', () => {
  const s = setup(); s.controls['animation-play'].click(); s.steps[2].click(); assert.equal(s.animation.dataset.step, '2'); assert.equal(s.animation.dataset.playing, 'false'); assert.equal(s.timers.size, 0); assert.equal(s.steps[2].attributes['aria-pressed'], 'true'); s.controls['animation-next'].click(); assert.equal(s.animation.dataset.step, '3'); s.controls['animation-next'].click(); assert.equal(s.animation.dataset.step, '0');
});
test('repeated replay never schedules duplicate tours', () => {
  const s = setup(); for (let i = 0; i < 10; i++) s.controls['animation-replay'].click(); assert.equal(s.timers.size, 1); s.tick(24000); assert.equal(s.timers.size, 0);
});
test('reduced motion disables playback but keeps all manual steps', () => {
  const s = setup(true); assert.equal(s.controls['animation-play'].disabled, true); assert.equal(s.controls['motion-note'].hidden, false); s.controls['animation-replay'].click(); assert.equal(s.timers.size, 0); s.steps[3].click(); assert.equal(s.animation.dataset.step, '3'); s.controls['animation-next'].click(); assert.equal(s.animation.dataset.step, '0');
});
test('changing motion preference, hiding tab, or leaving section pauses safely', () => {
  const s = setup(); s.controls['animation-play'].click(); s.media.matches = true; s.media.change(); assert.equal(s.timers.size, 0); s.media.matches = false; s.media.change(); assert.equal(s.animation.dataset.playing, 'false'); s.controls['animation-play'].click(); s.document.hidden = true; s.document.events.visibilitychange(); assert.equal(s.timers.size, 0); s.document.hidden = false; s.document.events.visibilitychange(); assert.equal(s.animation.dataset.playing, 'false'); s.controls['animation-play'].click(); s.observe(false); assert.equal(s.animation.dataset.playing, 'false'); assert.equal(s.timers.size, 0); s.observe(true); assert.equal(s.timers.size, 0);
});
test('original history filters still work independently', () => {
  const s = setup(); s.filters[1].click(); assert.equal(s.entries.filter(x => !x.hidden).length, 1); s.filters[2].click(); assert.equal(s.entries.filter(x => !x.hidden).length, 4); s.filters[3].click(); assert.equal(s.entries.filter(x => !x.hidden).length, 2); s.filters[0].click(); assert.equal(s.entries.filter(x => !x.hidden).length, 7); assert.equal(s.animation.dataset.step, '0');
});
