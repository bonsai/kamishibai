/**
 * p5-sketch plugin — run arbitrary p5.js sketches inside a scene.
 *
 * data: { p5sketch: string | p5 sketch function }
 *
 * @example
 * {
 *   "template": "p5-sketch",
 *   "data": {
 *     "p5sketch": "p => { p.background(20); p.fill(255); p.ellipse(...); }"
 *   }
 * }
 *
 * p5.js is loaded dynamically from CDN if not already present.
 */
export default {
  name: 'p5-sketch',
  css: '../templates/p5-sketch.css',
  async render(data, engine) {
    const p5 = await engine._loadP5();
    const container = document.createElement('div');
    container.className = 'kamishibai-p5-sketch';

    const sketch = (p) => {
      p.setup = () => {
        const w = p.parent().clientWidth || 800;
        const h = p.parent().clientHeight || 600;
        p.createCanvas(w, h);
      };
      p.draw = () => {};
    };

    let userCode;
    if (typeof data.p5sketch === 'function') {
      userCode = data.p5sketch.toString();
    } else if (typeof data.p5sketch === 'string') {
      userCode = data.p5sketch;
    } else {
      userCode =
        'p => { p.background(20); p.fill(244, 162, 97); p.noStroke(); p.ellipse(p.width/2, p.height/2, p.width * 0.5); }';
    }

    try {
      new Function('p', userCode)(sketch);
    } catch (err) {
      throw new Error(`p5-sketch error: ${err.message}`);
    }

    new p5(sketch, container);
    return container.outerHTML;
  },
};
