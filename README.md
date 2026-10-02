# kamishibai 紙芝居

論文・ストーリー・アイデアを **アニメーションショー** に変換する再利用可能なテンプレート集。

ronbun2x で生成した handoff JSON を入れると、ブラウザ上で自動再生される紙芝居（picture-story show）を出力する。

## 概念

```text
内容（ronbun2x 等）
    │ JSON / Markdown
    ▼
kamishibai engine
    │ template + timing
    ▼
HTML/SVG/CSS/JS アニメーション
    │ screen recording or browser
    ▼
mp4 / gif / スクショムービー
```

## 提供テンプレート

| テンプレート | 用途 | ファイル |
|---|---|---|
| `scene-engine` | シーン切り替え・プログレスバー | `templates/scene-engine.html` |
| `speech-bubble` | 吹き出しポップイン | `js/plugins/speech-bubble.js` |
| `character` | 簡易キャラ SVG | 吹き出しプラグイン内 |
| `yonkoma` | 4 コママンガ風レイアウト | `js/plugins/yonkoma.js` |
| `two-line` | ボケ・ツッコミ会話 | `js/plugins/two-line.js` |
| `screenshot` | スクショムービー脚本 | `js/plugins/screenshot.js` |
| `p5-sketch` | カスタム p5.js スケッチ | `js/plugins/p5-sketch.js` |
| `svg-draw` | SVG パス描画アニメ | `templates/svg-draw.css` |

## プラグインシステム

kamishibai はコアエンジン（`js/kamishibai.js`）と機能プラグイン（`js/plugins/`）を分離しています。

### プラグインの構造

```js
export default {
  name: 'speech-bubble', // scene.template で一致
  css: '../templates/speech-bubble.css', // オプション
  render(data, engine) { // 文字列または DOM 要素を返す
    return `<div class="kamishibai-bubble">...</div>`;
  }
};
```

### 使い方

```html
<script type="module">
  import Kamishibai from '../js/kamishibai.js';
  import { defaultPlugins } from '../js/plugins/index.js';

  const show = new Kamishibai(document.getElementById('stage'), story, {
    plugins: defaultPlugins, // 必要に応じてカスタムも追加可能
  });
  await show.play();
</script>
```

### カスタムプラグインの追加

```js
// plugins/my-plugin.js
export default {
  name: 'my-template',
  render(data, engine) {
    return `<div class="my-template">${engine.escape(data.text)}</div>`;
  },
};

// main
import { defaultPlugins } from './js/plugins/index.js';
import { myPlugin } from './plugins/my-plugin.js';
new Kamishibai(stage, story, { plugins: [...defaultPlugins, myPlugin] });
```

### `p5-sketch` プラグイン（カスタム描画）

任意の p5.js スケッチをシーンに埋め込めます。p5.js は CDN から動的ロードされます。

```json
{
  "template": "p5-sketch",
  "duration_ms": 15000,
  "data": {
    "p5sketch": "p => { p.background(20); p.fill(255); p.ellipse(p.width/2, p.height/2, 100); }"
  }
}
```

関数リテラルでも JSON 文字列でも指定可能です。

## クイックスタート

```bash
cd templates
# サンプル紙芝居をブラウザで開く
python -m http.server 8080
# open http://localhost:8080/scene-engine.html?story=../examples/paper-loop.json
```

## Story JSON Schema

```json
{
  "schema": "kamishibai.story.v1",
  "title": "アニメ生成の自律ループ",
  "duration_seconds": 60,
  "scenes": [
    {
      "id": "op",
      "template": "title",
      "duration_ms": 3000,
      "data": { "title": "...", "subtitle": "..." }
    },
    {
      "id": "problem",
      "template": "speech-bubble",
      "duration_ms": 14000,
      "data": {
        "characters": ["left", "right"],
        "bubbles": [
          {"speaker": "left", "text": "AI で..."},
          {"speaker": "right", "text": "しかも..."}
        ],
        "narration": "生成モデルは便利だが..."
      }
    }
  ]
}
```

## Engine API

```js
const show = new Kamishibai(document.getElementById('stage'), story);
show.play();
```
