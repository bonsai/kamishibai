/**
 * kamishibai engine
 * Play scene-based animation shows from JSON story definitions.
 */

class Kamishibai {
  constructor(container, story) {
    this.container = container;
    this.story = story;
    this.current = 0;
    this.timers = [];
    this.renderBase();
  }

  renderBase() {
    this.container.innerHTML = `
      <div class="kamishibai-stage"></div>
      <div class="kamishibai-progress"><div class="kamishibai-progress-bar"></div></div>
    `;
    this.stage = this.container.querySelector('.kamishibai-stage');
    this.progressBar = this.container.querySelector('.kamishibai-progress-bar');
  }

  async play() {
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
      const el = this.renderScene(scene);
      this.stage.appendChild(el);

      const timer = setTimeout(() => {
        resolve();
      }, scene.duration_ms);
      this.timers.push(timer);
    });
  }

  renderScene(scene) {
    const el = document.createElement('div');
    el.className = `kamishibai-scene scene-${scene.template}`;

    switch (scene.template) {
      case 'title':
        el.innerHTML = this.titleTemplate(scene.data);
        break;
      case 'speech-bubble':
        el.innerHTML = this.speechBubbleTemplate(scene.data);
        break;
      case 'yonkoma':
        el.innerHTML = this.yonkomaTemplate(scene.data);
        break;
      case 'two-line':
        el.innerHTML = this.twoLineTemplate(scene.data);
        break;
      case 'screenshot':
        el.innerHTML = this.screenshotTemplate(scene.data);
        break;
      default:
        el.textContent = JSON.stringify(scene);
    }
    return el;
  }

  titleTemplate(data) {
    return `
      <div class="kamishibai-title-card">
        <h1>${this.escape(data.title)}</h1>
        <p>${this.escape(data.subtitle || '')}</p>
      </div>
    `;
  }

  speechBubbleTemplate(data) {
    const chars = (data.characters || []).map((c, i) => `
      <div class="kamishibai-character char-${c.position || (i % 2 === 0 ? 'left' : 'right')}">
        <svg viewBox="0 0 90 140"><circle cx="45" cy="30" r="22" fill="${c.color || '#f4a261'}"/>
          <rect x="23" y="55" width="44" height="60" rx="10" fill="${c.body || '#457b9d'}"/>
          <circle cx="37" cy="28" r="3" fill="#1a1a2e"/><circle cx="53" cy="28" r="3" fill="#1a1a2e"/>
          <path d="M38,38 Q45,44 52,38" fill="none" stroke="#1a1a2e" stroke-width="2"/>
        </svg>
      </div>
    `).join('');

    const bubbles = (data.bubbles || []).map((b, i) => `
      <div class="kamishibai-bubble bubble-${b.position || (i % 2 === 0 ? 'left' : 'right')}" style="animation-delay: ${b.delay_ms || i * 1500}ms">
        <strong>${this.escape(b.speaker)}:</strong> ${this.escape(b.text)}
      </div>
    `).join('');

    return `
      ${chars}
      ${bubbles}
      <div class="kamishibai-narration">${this.escape(data.narration || '')}</div>
    `;
  }

  yonkomaTemplate(data) {
    const panels = (data.panels || []).map((p, i) => `
      <div class="kamishibai-panel" style="animation-delay: ${i * 1000}ms">
        <div class="panel-label">${this.escape(p.label)}</div>
        <div class="panel-text">${this.escape(p.text)}</div>
      </div>
    `).join('');
    return `
      <div class="kamishibai-yonkoma-grid">${panels}</div>
      <div class="kamishibai-narration">${this.escape(data.narration || '')}</div>
    `;
  }

  twoLineTemplate(data) {
    const lines = (data.lines || []).map((l, i) => `
      <div class="kamishibai-two-line-line line-${l.speaker}" style="animation-delay: ${i * 2000}ms">
        <span class="speaker">${this.escape(l.speaker)}</span>
        <span class="text">${this.escape(l.text)}</span>
      </div>
    `).join('');
    return `
      <div class="kamishibai-two-line">
        <h2>${this.escape(data.title || '')}</h2>
        ${lines}
      </div>
    `;
  }

  screenshotTemplate(data) {
    const scenes = (data.scenes || []).map((s, i) => `
      <div class="kamishibai-screenshot-scene" style="animation-delay: ${s.delay_ms || i * 1000}ms">
        <span class="time">${this.escape(s.time)}</span>
        <span class="type">${this.escape(s.type)}</span>
        <p>${this.escape(s.text)}</p>
      </div>
    `).join('');
    return `
      <div class="kamishibai-screenshot">
        <h2>${this.escape(data.title || '')}</h2>
        ${scenes}
      </div>
    `;
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
}

if (typeof window !== 'undefined') {
  window.Kamishibai = Kamishibai;
}

if (typeof module !== 'undefined') {
  module.exports = { Kamishibai };
}
