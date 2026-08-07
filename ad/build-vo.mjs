#!/usr/bin/env node
/**
 * Assemble a voiceover track from per-line TTS clips and mux it onto the video.
 *
 * Why per-line instead of one long render with <break> tags: TTS break timing is
 * approximate and drifts with the voice's reading speed, so a 40s narration can
 * land a second or more off by the end. Placing each line at an explicit offset
 * is exact and survives re-rendering a single line.
 *
 *   1. Render each line in vo-lines.json as its own clip (no break tags).
 *   2. Save them as vo/01.mp3, vo/02.mp3, ... matching the "n" field.
 *   3. node build-vo.mjs
 *
 * Flags:
 *   --check    report each clip's duration and flag overruns, then exit
 *   --dry      print the ffmpeg command without running it
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const here = path.dirname(new URL(import.meta.url).pathname);
const cfg = JSON.parse(fs.readFileSync(path.join(here, 'vo-lines.json'), 'utf8'));
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const checkOnly = args.includes('--check');

const clipPath = (n) => path.join(here, cfg.clipDir, String(n).padStart(2, '0') + '.mp3');

const probe = (f, entries) =>
  execFileSync('ffprobe', ['-v', 'error', '-show_entries', entries,
    '-of', 'default=nw=1:nk=1', f], { encoding: 'utf8' }).trim();

// ---- collect clips -------------------------------------------------------
const missing = cfg.lines.filter(l => !fs.existsSync(clipPath(l.n)));
if (missing.length) {
  console.error(`Missing ${missing.length} clip(s) in ${cfg.clipDir}/:\n`);
  for (const l of missing) {
    console.error(`  ${String(l.n).padStart(2, '0')}.mp3  @ ${l.start.toFixed(1)}s  "${l.text}"`);
  }
  console.error('\nRender each line as its own file, then re-run.');
  process.exit(1);
}

const videoDur = parseFloat(probe(path.join(here, cfg.video), 'format=duration'));

// ---- check fit -----------------------------------------------------------
let worst = Infinity;
console.log(`video: ${cfg.video}  (${videoDur.toFixed(2)}s)\n`);
console.log('  #   start     dur     ends   headroom  line');
cfg.lines.forEach((l, i) => {
  const dur = parseFloat(probe(clipPath(l.n), 'format=duration'));
  const ends = l.start + dur;
  const next = cfg.lines[i + 1] ? cfg.lines[i + 1].start : videoDur;
  const head = next - ends;
  if (head < worst) worst = head;
  const flag = head < 0 ? '  <-- OVERRUNS' : '';
  console.log(
    `  ${String(l.n).padStart(2)}  ${l.start.toFixed(2).padStart(6)}  ` +
    `${dur.toFixed(2).padStart(6)}  ${ends.toFixed(2).padStart(6)}  ` +
    `${head.toFixed(2).padStart(8)}   ${l.text.slice(0, 42)}${flag}`
  );
});

if (worst < 0) {
  console.log(`\nWorst overlap: ${worst.toFixed(2)}s. Either shorten that line's text,`);
  console.log('nudge the next "start" later in vo-lines.json, or speed the clip:');
  console.log('  ffmpeg -i vo/07.mp3 -filter:a "atempo=1.06" vo/07-fit.mp3');
} else {
  console.log(`\nAll lines fit. Tightest gap: ${worst.toFixed(2)}s.`);
}
if (checkOnly) process.exit(worst < 0 ? 1 : 0);

// ---- build the mux -------------------------------------------------------
const inputs = ['-i', path.join(here, cfg.video)];
cfg.lines.forEach(l => inputs.push('-i', clipPath(l.n)));

// delay each clip to its cue, then sum them into one track
const delays = cfg.lines
  .map((l, i) => `[${i + 1}:a]adelay=${Math.round(l.start * 1000)}:all=1[a${i}]`)
  .join(';');
const mixIn = cfg.lines.map((_, i) => `[a${i}]`).join('');
const filter = `${delays};${mixIn}amix=inputs=${cfg.lines.length}:normalize=0:dropout_transition=0[vo]`;

const out = path.join(here, cfg.output);
const cmd = [
  '-y', ...inputs,
  '-filter_complex', filter,
  '-map', '0:v', '-map', '[vo]',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
  '-shortest', out,
];

if (dry) {
  console.log('\nffmpeg ' + cmd.map(a => (/[\s;\[\]]/.test(a) ? `'${a}'` : a)).join(' '));
  process.exit(0);
}

console.log('\nmuxing…');
execFileSync('ffmpeg', cmd, { stdio: ['ignore', 'ignore', 'pipe'] });
const finalDur = parseFloat(probe(out, 'format=duration'));
console.log(`wrote ${cfg.output}  (${finalDur.toFixed(2)}s)`);
