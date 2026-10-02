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
| `speech-bubble` | 吹き出しポップイン | `templates/speech-bubble.css` |
| `character` | 簡易キャラ SVG | `templates/character.svg` |
| `yonkoma` | 4コママンガ風レイアウト | `templates/yonkoma.html` |
| `two-line` | ボケ・ツッコミ会話 | `templates/two-line.html` |
| `screenshot` | スクショムービー脚本 | `templates/screenshot.html` |
| `svg-draw` | SVG パス描画アニメ | `templates/svg-draw.css` |

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
