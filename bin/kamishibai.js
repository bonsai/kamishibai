#!/usr/bin/env node

const path = require('path');
const { render } = require(path.join(__dirname, 'cli', 'render'));

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log('kamishibai - render paper-story JSON to video');
  console.log('');
  console.log('Usage: kamishibai render <story.json> [options]');
  console.log('');
  console.log('Options:');
  console.log('  --out <file>        output file (mp4, default: output.mp4)');
  console.log('  --framerate <fps>   output framerate (default: 30)');
  console.log('  --width <px>        viewport width (default: 1280)');
  console.log('  --height <px>       viewport height (default: 720)');
  console.log('  --help');
}

if (!command || command === 'help' || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command !== 'render') {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

const storyPath = args[1];
if (!storyPath) {
  console.error('Missing story file. Usage: kamishibai render <story.json>');
  process.exit(1);
}

const options = {
  out: args.find((a) => a.startsWith('--out='))?.split('=')[1] || 'output.mp4',
  framerate: parseInt((args.find((a) => a.startsWith('--framerate='))?.split('=')[1]) || '30', 10),
  width: parseInt((args.find((a) => a.startsWith('--width='))?.split('=')[1]) || '1280', 10),
  height: parseInt((args.find((a) => a.startsWith('--height='))?.split('=')[1]) || '720', 10),
};

render(storyPath, options)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
