import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:4173';
const OUT = './video';
const W = 1920, H = 1080;

fs.rmSync(OUT, { recursive: true, force: true });

const t0 = Date.now();
const marks = [];
const beat = (label) => {
  const t = (Date.now() - t0) / 1000;
  marks.push({ t: +t.toFixed(2), label });
  console.log(`[${t.toFixed(2).padStart(6)}s] ${label}`);
};

// ---------- injected presentation layer (fake cursor + click ripples) ----------
const CURSOR_JS = `
const boot = () => {
  if (window.__adCursor) return;
  window.__adCursor = true;
  const style = document.createElement('style');
  style.textContent = \`
    #ad-cursor{position:fixed;left:0;top:0;width:30px;height:30px;z-index:2147483647;
      pointer-events:none;transform:translate(-2px,-2px);opacity:0;transition:opacity .25s}
    #ad-cursor.on{opacity:1}
    .ad-ripple{position:fixed;z-index:2147483646;pointer-events:none;border-radius:50%;
      width:14px;height:14px;margin:-7px 0 0 -7px;border:2px solid #0d7a72;
      animation:adr .55s ease-out forwards}
    @keyframes adr{from{transform:scale(.5);opacity:.9}to{transform:scale(3.4);opacity:0}}
    #ad-card{position:fixed;inset:0;z-index:2147483645;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:18px;text-align:center;
      background:linear-gradient(150deg,#0b3f3b 0%,#0d7a72 55%,#0f8f85 100%);color:#fff;
      font-family:ui-serif,Georgia,serif;pointer-events:none;
      opacity:0;visibility:hidden;transition:opacity .5s,visibility 0s .5s}
    #ad-card.on{opacity:1;visibility:visible;transition:opacity .5s}
    #ad-card .eyebrow{font:600 18px/1 ui-sans-serif,system-ui;letter-spacing:.22em;
      text-transform:uppercase;color:rgba(255,255,255,.82)}
    #ad-card h1{font-size:82px;line-height:1.08;margin:0;max-width:1340px;font-weight:700;
      color:#fff}
    #ad-card p{font:400 31px/1.5 ui-sans-serif,system-ui;margin:0;max-width:1000px;
      color:rgba(255,255,255,.92)}
    #ad-card .url{font:600 36px/1 ui-sans-serif,system-ui;letter-spacing:.02em;color:#fff;
      background:rgba(255,255,255,.14);padding:19px 36px;border-radius:999px;margin-top:6px}
    #ad-lower{position:fixed;left:64px;bottom:64px;z-index:2147483644;
      background:rgba(11,63,59,.93);color:#fff;padding:19px 30px;border-radius:18px;
      font:600 29px/1.3 ui-sans-serif,system-ui;letter-spacing:.01em;pointer-events:none;
      box-shadow:0 12px 34px rgba(0,0,0,.28);opacity:0;transform:translateY(10px);
      transition:opacity .35s,transform .35s;max-width:800px}
    #ad-lower.on{opacity:1;transform:translateY(0)}
  \`;
  document.head.appendChild(style);

  const c = document.createElement('div');
  c.id = 'ad-cursor';
  c.innerHTML = '<svg viewBox="0 0 22 22" width="30" height="30">' +
    '<path d="M2 1 L2 17 L6.2 13.1 L9.1 19.6 L12 18.2 L9.2 11.9 L15 11.7 Z" ' +
    'fill="#111" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  document.body.appendChild(c);

  addEventListener('mousemove', e => {
    c.classList.add('on');
    c.style.left = e.clientX + 'px';
    c.style.top = e.clientY + 'px';
  }, true);

  addEventListener('mousedown', e => {
    const r = document.createElement('div');
    r.className = 'ad-ripple';
    r.style.left = e.clientX + 'px';
    r.style.top = e.clientY + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 600);
  }, true);
};
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
else boot();
`;

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: { width: W, height: H } },
  });
  await ctx.addInitScript(CURSOR_JS);
  const page = await ctx.newPage();

  // ---------- helpers ----------
  const wait = (ms) => page.waitForTimeout(ms);

  const moveTo = async (x, y, steps = 26) => page.mouse.move(x, y, { steps });

  const centerOf = async (sel, idx = 0) => {
    const el = page.locator(sel).nth(idx);
    await el.scrollIntoViewIfNeeded();
    await wait(450);
    const b = await el.boundingBox();
    if (!b) throw new Error('no box: ' + sel);
    return [b.x + b.width / 2, b.y + b.height / 2];
  };

  const hoverSel = async (sel, idx = 0) => {
    const [x, y] = await centerOf(sel, idx);
    await moveTo(x, y);
    return [x, y];
  };

  const clickSel = async (sel, idx = 0, pause = 700) => {
    const [x, y] = await hoverSel(sel, idx);
    await wait(260);
    await page.mouse.click(x, y);
    await wait(pause);
  };

  const scrollTo = async (y, pause = 900) => {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'smooth' }), y);
    await wait(pause);
  };

  const scrollToSel = async (sel, offset = -90, pause = 1100) => {
    await page.evaluate(([s, o]) => {
      const el = document.querySelector(s);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + o, behavior: 'smooth' });
    }, [sel, offset]);
    await wait(pause);
  };

  // lower-third caption
  const lower = async (text, ms = 0) => {
    await page.evaluate((t) => {
      let el = document.getElementById('ad-lower');
      if (!el) { el = document.createElement('div'); el.id = 'ad-lower'; document.body.appendChild(el); }
      if (t === null) { el.classList.remove('on'); return; }
      el.textContent = t; el.classList.add('on');
    }, text);
    if (ms) await wait(ms);
  };
  const lowerOff = async () => lower(null);

  // full-screen title card
  const card = async (eyebrow, title, sub, url, holdMs) => {
    await page.evaluate(([e, t, s, u]) => {
      let el = document.getElementById('ad-card');
      if (!el) { el = document.createElement('div'); el.id = 'ad-card'; document.body.appendChild(el); }
      el.innerHTML =
        (e ? `<div class="eyebrow">${e}</div>` : '') +
        (t ? `<h1>${t}</h1>` : '') +
        (s ? `<p>${s}</p>` : '') +
        (u ? `<div class="url">${u}</div>` : '');
      const cur = document.getElementById('ad-cursor');
      if (cur) cur.style.display = 'none';   // no pointer floating over the card text
      requestAnimationFrame(() => el.classList.add('on'));
    }, [eyebrow, title, sub, url]);
    await wait(holdMs);
  };
  const cardOff = async (ms = 600) => {
    await page.evaluate(() => {
      const el = document.getElementById('ad-card');
      if (el) el.classList.remove('on');
      const cur = document.getElementById('ad-cursor');
      if (cur) cur.style.display = '';
    });
    await wait(ms);
  };

  const setNumber = async (sel, value) => {
    const [x, y] = await centerOf(sel);
    await moveTo(x, y);
    await wait(200);
    await page.mouse.click(x, y, { clickCount: 3 });
    await wait(200);
    await page.keyboard.type(String(value), { delay: 130 });
    await page.keyboard.press('Enter');
    await page.evaluate(() => getSelection().removeAllRanges());
    await wait(700);
  };

  // =========================================================================
  // SCENE 1 — Open on the home page, hold a title card
  // =========================================================================
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
  // Card up immediately so the film opens on it; the page finishes loading behind it.
  beat('S1 open title card');
  await card(
    'Machine Learning Studio',
    'Stop reading about<br/>the algorithm.',
    'Run it.',
    null,
    3400
  );
  await page.waitForLoadState('networkidle').catch(() => {});
  await cardOff();
  beat('S1 home hero revealed');

  await moveTo(640, 380, 30);
  await lower('42 interactive concept pages', 0);
  await wait(1500);
  await scrollTo(320, 1200);
  await lowerOff();
  await wait(300);

  // =========================================================================
  // SCENE 2 — Command palette search
  // =========================================================================
  beat('S2 command palette');
  await scrollTo(0, 900);
  await lower('Jump anywhere with ⌘K', 0);
  await clickSel('#topbar-search', 0, 700);
  await page.locator('#palette-input').click();
  await wait(500);
  await page.keyboard.type('spectral', { delay: 115 });
  console.log('  palette query =', await page.locator('#palette-input').inputValue());
  await wait(2200);
  await lowerOff();
  await page.keyboard.press('Escape');
  await wait(500);

  // =========================================================================
  // SCENE 3 — K-Means: the interactive lab
  // =========================================================================
  beat('S3 k-means page');
  await page.goto(`${BASE}/pages/algorithm.html?id=k-means`, { waitUntil: 'networkidle' });
  await wait(1100);
  await lower('Every page is a lab, not a diagram', 0);
  await wait(1600);
  await lowerOff();

  await scrollToSel('#partition-step', -220, 1200);
  beat('S3 load preset');
  await lower('Swap the dataset', 0);
  await page.locator('.preset-select').first().selectOption({ label: 'Two moons' });
  await wait(1600);
  await lowerOff();

  beat('S3 step the loop');
  await lower('Step the loop one iteration at a time', 0);
  for (let i = 0; i < 3; i++) {
    await clickSel('#partition-step', 0, 1000);
  }
  await lowerOff();

  beat('S3 run to convergence');
  await lower('…or run it to convergence', 0);
  await clickSel('#partition-run', 0, 2200);
  await lowerOff();
  await wait(400);

  // formulas with substituted numbers
  beat('S3 substituted formulas');
  await scrollToSel('#partition-step', -60, 400);
  await scrollTo(await page.evaluate(() => window.scrollY + 420), 1200);
  await lower('The formula updates with YOUR numbers', 0);
  await wait(2400);
  await lowerOff();

  // change k and watch everything re-render
  beat('S3 change k');
  await scrollToSel('#partition-k', -240, 1000);
  await lower('Change k — the whole page recomputes', 0);
  await setNumber('#partition-k', 4);
  await clickSel('#partition-run', 0, 2000);
  await lowerOff();
  await wait(400);

  // drag a point on the chart
  beat('S3 drag a point');
  // Bring the chart fully into view and let the smooth scroll settle BEFORE reading
  // any coordinates — stale rects here drag on empty page and text-select everything.
  // centre the chart itself, then let the site's smooth-scroll finish settling
  await page.evaluate(() => {
    const s = document.querySelector('svg');
    if (s) window.scrollTo({ top: s.getBoundingClientRect().top + scrollY - 150, behavior: 'smooth' });
  });
  await wait(1500);
  await lower('Drag the data itself', 0);
  try {
    const pt = await page.evaluate(() => {
      const s = document.querySelector('svg');
      if (!s) return null;
      const pts = [...s.querySelectorAll('circle.draggable-point')]
        .map(c => { const r = c.getBoundingClientRect(); return { r, cx: r.x + r.width / 2, cy: r.y + r.height / 2 }; })
        .filter(p => p.r.width > 3 && p.cy > 110 && p.cy < innerHeight - 60 &&
                     p.cx > 20 && p.cx < innerWidth - 20);
      if (!pts.length) return null;
      // pick the one nearest the vertical middle so there's room to drag it
      pts.sort((a, b) => Math.abs(a.cy - innerHeight / 2) - Math.abs(b.cy - innerHeight / 2));
      return { x: pts[0].cx, y: pts[0].cy };
    });
    if (!pt) throw new Error('no visible chart point');
    console.log('  dragging point at', pt.x.toFixed(0), pt.y.toFixed(0));
    await moveTo(pt.x, pt.y, 24);
    await wait(450);
    await page.mouse.down();
    await moveTo(pt.x + 90, pt.y - 70, 36);
    await wait(250);
    await moveTo(pt.x + 130, pt.y - 25, 24);
    await page.mouse.up();
    await wait(1600);
  } catch (e) { console.log('drag skipped:', e.message); }
  // any accidental selection would show as blue wash across the frame
  await page.evaluate(() => getSelection().removeAllRanges());
  await lowerOff();
  await wait(300);

  // =========================================================================
  // SCENE 4 — Backpropagation: real gradients, real numbers
  // =========================================================================
  beat('S4 backprop page');
  await page.goto(`${BASE}/pages/algorithm.html?id=backpropagation`, { waitUntil: 'networkidle' });
  await wait(1100);
  await lower('Build a network. Watch it learn.', 0);
  await scrollToSel('#bp-next', -230, 1400);
  await lowerOff();

  beat('S4 walk the equations');
  await lower('Walk the four equations, term by term', 0);
  for (let i = 0; i < 3; i++) {
    await clickSel('#bp-next', 0, 950);
  }
  await lowerOff();

  beat('S4 learning rate + train');
  await lower('Tune the learning rate, then train', 0);
  try {
    // Land near ~0.9: clicking the track centre pins it to mid-range (1.5), which is
    // an unhelpfully hot learning rate to show in a teaching product.
    const lb = await page.locator('#bp-lr').boundingBox();
    const lx = lb.x + lb.width * 0.28, ly = lb.y + lb.height / 2;
    await moveTo(lx, ly, 22);
    await wait(300);
    await page.mouse.click(lx, ly);
    for (let i = 0; i < 3; i++) { await page.keyboard.press('ArrowRight'); await wait(190); }
    await wait(700);
    console.log('  lr =', await page.locator('#bp-lr').inputValue());
  } catch (e) { console.log('slider skipped:', e.message); }
  await clickSel('#bp-train', 0, 2400);
  await lowerOff();
  await wait(300);

  beat('S4 deep dive');
  await lower('Then the deep dive: intuition, usage, failure modes', 0);
  // Frame the prose blocks. The "Core Mathematics" card renders raw LaTeX source
  // rather than KaTeX, so keep it out of shot.
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h3,h4,strong')]
      .find(e => /intuition/i.test(e.textContent.trim()));
    if (h) window.scrollTo({ top: h.getBoundingClientRect().top + scrollY - 120, behavior: 'smooth' });
  });
  await wait(2400);
  await page.evaluate(() => {
    const h = [...document.querySelectorAll('h3,h4,strong')]
      .find(e => /when to use it/i.test(e.textContent.trim()));
    if (h) window.scrollTo({ top: h.getBoundingClientRect().top + scrollY - 150, behavior: 'smooth' });
  });
  await wait(2600);
  await lowerOff();

  // =========================================================================
  // SCENE 5 — End card
  // =========================================================================
  beat('S5 end card');
  await card(
    '42 concepts · 5 topic areas · no signup',
    'Machine Learning Studio',
    'Editable data. Live formulas. Step-by-step logic.',
    'learnvisualy.github.io',
    4200
  );
  beat('END');

  await ctx.close();
  await browser.close();

  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.webm'));
  fs.writeFileSync('./timeline.json', JSON.stringify({ marks, video: files[0] }, null, 2));
  console.log('\nvideo:', files);
};

run().catch(e => { console.error(e); process.exit(1); });
