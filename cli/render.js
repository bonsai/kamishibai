const { chromium } = require('playwright');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ENGINE_JS = fs.readFileSync(
  path.join(__dirname, '..', 'js', 'kamishibai.js'),
  'utf-8'
);
const PLUGIN_INDEX = fs.readFileSync(
  path.join(__dirname, '..', 'js', 'plugins', 'index.js'),
  'utf-8'
);

/** Build a headless-ready HTML page that embeds the story inline. */
function buildHtml(story) {
  const scripts = [
    `<script>${ENGINE_JS}</script>`,
    `<script>${PLUGIN_INDEX.replace(
      "export { default as core } from './core.js';",
      `const core = { name: 'core', render() { return '<div class=\\"kamishibai-scene scene-core\\">core</div>'; }, css: undefined, setup(e){ e.renderBase(); return {}; }};`
    )}</script>`,
    `const story = ${JSON.stringify(story)};`,
    `
      (async () => {
        try {
          window.__k = new Kamishibai(document.getElementById('stage'), story, {
            onSceneEnd: (index) => { window.__sceneIndex = index; }
          });
          await window.__k.play();
          window.__done = true;
        } catch (err) {
          console.error('[renderer]', err);
          window.__error = err.message;
        }
      })();
    `,
  ];

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body { margin: 0; overflow: hidden; background: var(--bg, #0f0f1a); }
  #stage { position: absolute; inset: 0; }
</style>
</head><body>
<div id="stage"></div>
${scripts.join('\n')}
</body></html>`;
}

/** Render a story to video using headless Chromium + ffmpeg. */
async function render(storyPath, options) {
  const story = JSON.parse(fs.readFileSync(storyPath, 'utf-8'));
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kamishibai-'));
  const fps = options.framerate || 30;
  const width = options.width || 1280;
  const height = options.height || 720;
  const framePattern = path.join(outDir, 'frame-%03d.png');
  const clipPattern = path.join(outDir, 'clip-%03d.mp4');
  const concatList = path.join(outDir, 'concat.txt');

  fs.writeFileSync(path.join(outDir, 'index.html'), buildHtml(story));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width, height } });
  const fileUrl = 'file://' + path.join(outDir, 'index.html');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  const clips = [];
  try {
    for (let i = 0; i < story.scenes.length; i++) {
      await page.waitForFunction(
        (idx) => window.__sceneIndex === idx,
        { timeout: 15000 },
        i
      );
      const framePath = framePattern.replace('%03d', String(i).padStart(3, '0'));
      await page.screenshot({ path: framePath });
      const clipPath = clipPattern.replace('%03d', String(i).padStart(3, '0'));
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(framePath)
          .inputOptions(['-loop', '1', '-framerate', String(fps)])
          .outputOptions([
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-crf', '28',
            '-pix_fmt', 'yuv420p',
          ])
          .duration((story.scenes[i].duration_ms || 5000) / 1000)
          .on('end', resolve)
          .on('error', reject)
          .save(clipPath);
      });
      clips.push(`file '${clipPath}'`);
    }
  } finally {
    await browser.close();
  }

  fs.writeFileSync(concatList, clips.join('\n'));

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatList)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions([
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
      ])
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(options.out);
  });

  console.log(`rendered ${options.out}`);
}

module.exports = { render, buildHtml };
