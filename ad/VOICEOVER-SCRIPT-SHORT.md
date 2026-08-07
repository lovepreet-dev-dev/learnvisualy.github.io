# Machine Learning Studio — Short Ad Voiceover Script

**Matches:** `ml-studio-ad-short.mp4` — 1920×1080, 30 fps, **39.6 s**
**Word count:** 84 · **Pace:** ~2.4 words/sec

Recorded against the redesigned site (live hero, question sections, dark mode) and the new
domain **learnvisually.fun**. Timecodes verified against the recording's beat log.

---

## Timed script

| In | Out | Line | What's on screen |
|---|---|---|---|
| 0:00.0 | 0:03.4 | Twenty-one points. Four algorithms. Every one of them disagrees. | Live hero, k-means solving, "iteration 1" |
| 0:03.7 | 0:07.2 | Add your own point, and watch the answer change. | Two points clicked in; hero re-solves |
| 0:08.9 | 0:13.3 | Then open any of forty-two concepts — a lab, not a diagram. | DBSCAN + k-NN chips, then K-Means page |
| 0:13.4 | 0:16.1 | Step k-means, or run it to convergence. | "Two moons" preset, Next step, Run |
| 0:17.5 | 0:20.2 | Every formula shows your numbers substituted in. | Logic trail: d(M1,r₁) = 1.442, cluster sizes |
| 0:20.5 | 0:23.2 | Change k, and the whole page recomputes. | k → 4, four distances, sizes 2/3/2/5 |
| 0:25.5 | 0:31.7 | Train a real network, and watch the four equations of backpropagation fill in with your gradients. | Backprop page, Train 100, loss 0.0053 |
| 0:32.9 | 0:34.2 | Dark mode, obviously. | Theme toggle flips the whole page |
| 0:36.4 | 0:39.5 | Machine learning you can poke. Learn visually dot fun. | End card + learnvisually.fun |

---

## Paste-ready for ElevenLabs

```
Twenty-one points. Four algorithms. Every one of them disagrees. <break time="0.3s" /> Add your own point, and watch the answer change.

<break time="1.7s" /> Then open any of forty-two concepts — a lab, not a diagram. <break time="0.1s" /> Step k-means, or run it to convergence.

<break time="1.4s" /> Every formula shows your numbers substituted in. <break time="0.3s" /> Change k, and the whole page recomputes.

<break time="2.3s" /> Train a real network, and watch the four equations of backpropagation fill in with your gradients.

<break time="1.2s" /> Dark mode, obviously.

<break time="2.2s" /> Machine learning you can poke. <break time="0.2s" /> Learn visually dot fun.
```

**Pronunciation:** the domain now matches how you say it — *"learn visually dot fun"*. No spelling out.

---

## Mux the audio in

```bash
ffmpeg -i ml-studio-ad-short.mp4 -i vo.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest ml-studio-ad-short-final.mp4
```

## Re-cut

Needs the preview server on `http://localhost:4173` (`python3 serve.py 4173` from the repo root):

```bash
node record-short.mjs
```

Then re-encode, trimming the recorder's start-up frames:

```bash
ffmpeg -y -ss 2.2 -i video-short/*.webm -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -r 30 -movflags +faststart short.mp4
```
