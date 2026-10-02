/**
 * Default plugin bundle for kamishibai.
 *
 * @example
 * import { defaultPlugins } from './plugins/index.js';
 * const show = new Kamishibai(stage, story, { plugins: defaultPlugins });
 */
export { default as core } from './core.js';
export { default as title } from './title.js';
export { default as speechBubble } from './speech-bubble.js';
export { default as yonkoma } from './yonkoma.js';
export { default as twoLine } from './two-line.js';
export { default as screenshot } from './screenshot.js';
export { default as p5Sketch } from './p5-sketch.js';

/** Core first so renderBase is available before template plugins run. */
export const defaultPlugins = [
  core,
  title,
  speechBubble,
  yonkoma,
  twoLine,
  screenshot,
  p5Sketch,
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    defaultPlugins,
    core,
    title,
    speechBubble,
    yonkoma,
    twoLine,
    screenshot,
    p5Sketch,
  };
}
