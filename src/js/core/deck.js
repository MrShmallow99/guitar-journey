// Slide engine: keyboard / click / swipe navigation, hash deep links,
// progress indicator. RTL convention: "next" is leftward, so ArrowLeft
// advances; PageDown and Space always advance (presentation clickers).

const NEXT_KEYS = new Set(['ArrowLeft', 'ArrowDown', 'PageDown', ' ']);
const PREV_KEYS = new Set(['ArrowRight', 'ArrowUp', 'PageUp']);

function isFormControl(el) {
  return el instanceof HTMLElement &&
    (el.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName));
}

export class Deck extends EventTarget {
  constructor(root) {
    super();
    this.root = root;
    this.slides = [...root.querySelectorAll('.slide')];
    this.index = -1;
    this.counter = document.getElementById('slide-counter');
    this.actLabel = document.getElementById('act-label');
    this.progress = document.getElementById('progress-bar');
    this.prevBtn = document.getElementById('prev');
    this.nextBtn = document.getElementById('next');
    this.dots = this.#buildDots(document.getElementById('dots'));

    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    document.addEventListener('keydown', (e) => this.#onKey(e));
    window.addEventListener('hashchange', () => this.go(this.#indexFromHash(), { fromHash: true }));
    this.#bindSwipe();

    this.slides.forEach((s, i) => {
      s.setAttribute('aria-roledescription', 'שקף');
      s.id ||= `slide-${i + 1}`;
    });
  }

  start() {
    this.go(this.#indexFromHash(), { fromHash: true, instant: true });
  }

  get current() { return this.slides[this.index]; }

  next() { this.go(this.index + 1); }
  prev() { this.go(this.index - 1); }

  go(target, { fromHash = false, instant = false } = {}) {
    const i = Math.max(0, Math.min(this.slides.length - 1, target));
    if (i === this.index) return;
    const prev = this.current;
    this.root.dataset.dir = i > this.index ? 'forward' : 'back';
    if (instant) this.root.dataset.dir = 'none';

    this.slides.forEach((s, n) => {
      const active = n === i;
      s.classList.toggle('is-active', active);
      s.classList.toggle('is-leaving', s === prev);
      s.inert = !active;
      s.setAttribute('aria-hidden', String(!active));
    });
    this.index = i;

    const n = this.slides.length;
    this.counter.textContent = `${i + 1} / ${n}`;
    this.actLabel.textContent = this.current.dataset.act ?? '';
    this.progress.style.transform = `scaleX(${(i + 1) / n})`;
    this.prevBtn.disabled = i === 0;
    this.nextBtn.disabled = i === n - 1;
    this.dots.forEach((d, n2) => {
      if (n2 === i) d.setAttribute('aria-current', 'step');
      else d.removeAttribute('aria-current');
    });

    if (!fromHash) history.replaceState(null, '', `#/${i + 1}`);
    else if (location.hash !== `#/${i + 1}`) history.replaceState(null, '', `#/${i + 1}`);

    this.current.scrollTop = 0;
    this.dispatchEvent(new CustomEvent('change', { detail: { index: i, slide: this.current } }));
  }

  #indexFromHash() {
    const m = location.hash.match(/^#\/(\d+)$/);
    return m ? Number(m[1]) - 1 : 0;
  }

  #buildDots(container) {
    return this.slides.map((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', s.getAttribute('aria-label') ?? `שקף ${i + 1}`);
      b.addEventListener('click', () => this.go(i));
      container.append(b);
      return b;
    });
  }

  #onKey(e) {
    if (e.altKey || e.ctrlKey || e.metaKey || isFormControl(e.target)) return;
    // Space/Enter on a focused button should press the button, not navigate.
    if (e.key === ' ' && e.target instanceof HTMLButtonElement) return;
    if (NEXT_KEYS.has(e.key) && !(e.key === ' ' && e.shiftKey)) { e.preventDefault(); this.next(); }
    else if (PREV_KEYS.has(e.key) || (e.key === ' ' && e.shiftKey)) { e.preventDefault(); this.prev(); }
    else if (e.key === 'Home') { e.preventDefault(); this.go(0); }
    else if (e.key === 'End') { e.preventDefault(); this.go(this.slides.length - 1); }
  }

  // Horizontal swipe only; vertical movement is left for scrolling.
  // RTL: dragging content to the right reveals the next slide.
  #bindSwipe() {
    let x0 = null, y0 = null;
    this.root.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1 || e.target.closest('input, select, button, a, svg')) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    this.root.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > 1.5 * Math.abs(dy)) dx > 0 ? this.next() : this.prev();
    });
  }
}
