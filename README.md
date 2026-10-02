## Engine API

```js
const show = new Kamishibai(document.getElementById('stage'), story);
show.play();
```

## CLI - render JSON to mp4

Headless Chrome + ffmpeg でストーリーを動画に出力します。

```bash
npm install
npx playwright install chromium   # Chromium をダウンロード

# CLI を使って mp4 に変換
kamishibai render examples/paper-loop.json --out out.mp4

# オプション
kamishibai render story.json \
  --out result.mp4 \
  --framerate 30 \
  --width 1920 \
  --height 1080
```

**前提:** 環境に `ffmpeg` がインストールされていること。

- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `apt install ffmpeg`
- Windows: [ffmpeg.org](https://ffmpeg.org/) からダウンロード

## Story JSON Schema
