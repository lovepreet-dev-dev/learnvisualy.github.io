# Machine Learning Studio — Ad Voiceover Script

**Matches:** `ml-studio-ad.mp4` — 1920×1080, 30 fps, **72.7 s**
**Word count:** 168 · **Pace:** ~2.4 words/sec (relaxed, confident read)

Timecodes are the **video** timeline, verified against the recording's own beat log.

---

## Timed script

| In | Out | Line | What's on screen |
|---|---|---|---|
| 0:00.0 | 0:02.4 | Most courses explain the algorithm. | Title card — "Stop reading about the algorithm. Run it." |
| 0:02.6 | 0:04.8 | Machine Learning Studio lets you run it. | Card holds, then dissolves to home |
| 0:05.0 | 0:10.0 | Forty-two interactive concept pages — foundations, classification, graphical models, clustering, neural networks. | Home hero, scrolls to category grid |
| 0:10.3 | 0:12.4 | One keystroke jumps you anywhere. | ⌘K palette opens, "spectral" typed |
| 0:14.8 | 0:19.2 | Open any concept and you get a lab, not a diagram. | K-Means page loads |
| 0:19.4 | 0:23.4 | Swap the dataset. Watch k-means cut straight through two crescent moons. | "Two moons" preset loads into the chart |
| 0:23.6 | 0:26.8 | Step the loop one iteration at a time — | "Next step" ×3, objective updating |
| 0:27.7 | 0:30.1 | or run it straight to convergence. | "Run to convergence", status → converged |
| 0:31.5 | 0:37.1 | Every formula shows your numbers substituted in — the real distances, the real objective. | Logic trail: d(M1,r₁) = 1.442, cluster sizes |
| 0:37.4 | 0:41.8 | Change k from three to four, and the whole page recomputes. | k retyped to 4, loop re-runs |
| 0:42.8 | 0:46.0 | Drag a point, and the clustering answers instantly. | Point dragged on the chart, objective shifts |
| 0:48.2 | 0:49.8 | Build a neural network. | Backpropagation page, network graph |
| 0:51.2 | 0:56.2 | Walk the four equations of backpropagation, term by term, with real gradients. | "Next step" through the forward pass |
| 0:57.8 | 1:02.8 | Tune the learning rate. Train a hundred epochs. Watch the loss fall. | η slider → 0.78, "Train 100", loss 0.28 |
| 1:03.7 | 1:07.7 | Then the deep dive — intuition, usage, and failure modes. | Detailed explanation — all four cards, math rendered in KaTeX |
| 1:08.8 | 1:12.6 | Forty-two concepts. No signup. Learn Visually dot GitHub dot I-O. | End card + URL |

---

## Paste-ready for ElevenLabs

Break tags are tuned so the read lands on the timecodes above. Use **Eleven Multilingual v2** or **v3**; a warm, mid-range narrator at **Stability 45 / Similarity 75 / Speed 1.0**.

```
Most courses explain the algorithm. <break time="0.2s" /> Machine Learning Studio lets you run it.

<break time="0.2s" /> Forty-two interactive concept pages — foundations, classification, graphical models, clustering, neural networks. <break time="0.3s" /> One keystroke jumps you anywhere.

<break time="2.4s" /> Open any concept and you get a lab, not a diagram.

<break time="0.2s" /> Swap the dataset. Watch k-means cut straight through two crescent moons.

<break time="0.2s" /> Step the loop one iteration at a time — <break time="0.9s" /> or run it straight to convergence.

<break time="1.4s" /> Every formula shows your numbers substituted in — the real distances, the real objective.

<break time="0.3s" /> Change k from three to four, and the whole page recomputes.

<break time="1.0s" /> Drag a point, and the clustering answers instantly.

<break time="2.2s" /> Build a neural network. <break time="1.4s" /> Walk the four equations of backpropagation, term by term, with real gradients.

<break time="1.6s" /> Tune the learning rate. Train a hundred epochs. Watch the loss fall.

<break time="0.9s" /> Then the deep dive — intuition, usage, and failure modes.

<break time="1.1s" /> Forty-two concepts. No signup. Learn Visually dot GitHub dot I-O.
```

**Pronunciation note:** the domain is spelled `learnvisualy` (one `l`), but say it as *"learn visually"* — don't spell it out.

---

## Muxing the audio back in

Export the ElevenLabs render as `vo.mp3` into this folder, then:

```bash
ffmpeg -i ml-studio-ad.mp4 -i vo.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest ml-studio-ad-final.mp4
```

If the VO comes out slightly long or short, nudge it instead of re-reading:

```bash
ffmpeg -i vo.mp3 -filter:a "atempo=0.97" vo-fit.mp3
```

---

## Re-cutting the video

`record.mjs` is the full recording script (Playwright, headless Chromium). It needs the
dev server on `http://localhost:4173` and produces a fresh `video/*.webm` plus a beat log:

```bash
node record.mjs
```

Edit the `lower(...)` captions or the scene blocks to change pacing, then re-encode:

```bash
ffmpeg -y -ss 0.9 -i video/*.webm -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -r 30 -movflags +faststart ml-studio-ad.mp4
```

The `-ss 0.9` trims the recorder's start-up frames so the film opens on the title card.
