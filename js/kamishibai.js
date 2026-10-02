/**
 * kamishibai engine
 * Plays scene-based animation shows from JSON story definitions.
 *
 * Plugins extend rendering:
 *   - render(data, engine): returns HTML string or DOM element
 *   - css: optional path to template stylesheet
 *   - setup(engine): optional object merged into the engine
 *
 * Options:
 *   - onSceneEnd(index): callback fired when a scene finishes rendering
 *
 * @example
 * const show = new Kamishibai(stageEl, story, { plugins: [title, speechBubble] });
 * await show.play();
 */

class Kamishibai {
  constructor(container, story, options = {}) {
    this.container = container;
    this.story = story;
    this.current = 0;
    this.timers = [];
    this.options = options;
    this.templates = {};
    this.cssLoaded = Promise.resolve();

    if (Array.isArray(options.plugins)) {
      this._loadPlugins(options.plugins);
    }
    this.renderBase();
  }

  _loadPlugins(plugins) {
    for (const plugin of plugins) {
      if (!plugin.name) continue;
      if (plugin.render) {
        this.templates[plugin.name] = plugin.render;
      }
      if (plugin.css) {
        this.cssLoaded = this.cssLoaded.then(() => this._loadCSS(plugin.css));
      }
      if (plugin.setup) {
        const setup = plugin.setup(this);
        if (setup) Object.assign(this, setup);
      }
    }
  }

  _loadCSS(path) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = path;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  async play() {
    await this.cssLoaded;
    this.current = 0;
    this.startTime = performance.now();
    this.progressBar.style.animation = 'none';
    this.progressBar.offsetHeight; // reflow
    this.progressBar.style.animation = `kamishibai-progress ${this.story.duration_seconds}s linear forwards`;

    for (let i = 0; i < this.story.scenes.length; i++) {
      this.current = i;
      await this.playScene(this.story.scenes[i]);
    }
  }

  playScene(scene) {
    return new Promise((resolve) => {
      this.stage.innerHTML = '';
      this.renderScene(scene).then((el) => {
        this.stage.appendChild(el);
        if (typeof this.options.onSceneEnd === 'function') {
          this.options.onSceneEnd(this.current, el);
        }
      });
      const timer = setTimeout(() => resolve(), scene.duration_ms);
      this.timers.push(timer);
    });
  }

  async renderScene(scene) {
    const render = this.templates[scene.template];
    if (!render) {
      throw new Error(`Unknown scene template: ${scene.template}`);
    }
    const el = document.createElement('div');
    el.className = `kamishibai-scene scene-${scene.template}`;
    const rendered = await render(scene.data || {}, this);
    if (typeof rendered === 'string') {
      el.innerHTML = rendered;
    } else if (rendered && rendered.outerHTML) {
      el.innerHTML = rendered.outerHTML;
    } else {
      el.innerHTML = '';
    }
    return el;
  }

  escape(text) {
    const div = document.createElement('div');
    div.textContent = String(text || '');
    return div.innerHTML;
  }

  stop() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  // --- dynamic asset loading ---

  /** Load p5.js (global CDN) if not present. */
  async _loadP5() {
    if (typeof window !== 'undefined' && window.p5) return window.p5;
    return new Promise((resolve, reject) => {
      if (window.p5) { resolve(window.p5); return; }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js';
      script.onload = () => resolve(window.p5);
      script.onerror = () => reject(new Error('failed to load p5.js from CDN'));
      document.body.appendChild(script);
    });
  }
}

if (typeof window !== 'undefined') {
  window.Kamishibai = Kamishibai;
}

if (typeof module !== 'undefined') {
  module.exports = { Kamishibai };
}
