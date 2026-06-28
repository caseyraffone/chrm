/**
 * App Store screenshot generator.
 *
 * These are product-page screenshots, not raw QA captures. The layout keeps the
 * app UI honest while adding clear value-prop copy that sells CHRM in the first
 * three screenshots users see on the App Store install sheet.
 *
 *   node scripts/generate-screenshots.js
 *
 * Output: assets/screenshots/<device>/<screen>.png
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const CHROME_CANDIDATES = [
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];
const executablePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p));

const colors = {
  background: '#F2F1EE',
  surface: '#FFFFFF',
  accent: '#1747D4',
  accentSoft: '#E7ECFF',
  text: '#0F0F0E',
  textSecondary: '#5F625D',
  textMuted: '#8C8C87',
  border: '#DEDCD6',
  ink: '#151515',
  success: '#16824B',
  warning: '#E5A000',
  error: '#D62828',
};

const DEVICES = [
  { id: '6.9-inch', w: 440, h: 956, scale: 3, px: '1320x2868' },
  { id: '6.5-inch', w: 414, h: 896, scale: 3, px: '1242x2688' },
  { id: '5.5-inch', w: 414, h: 736, scale: 3, px: '1242x2208' },
  { id: 'ipad-13', w: 1032, h: 1376, scale: 2, px: '2064x2752' },
];

const fontLinks = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
`;

const css = `
  * { box-sizing: border-box; }
  html, body { width: 100%; height: 100%; margin: 0; }
  body {
    background: ${colors.background};
    color: ${colors.text};
    font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }
  .shot {
    width: 100vw;
    height: 100vh;
    position: relative;
    display: grid;
    grid-template-rows: auto 1fr;
    overflow: hidden;
    isolation: isolate;
  }
  .shot::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(135deg, rgba(23, 71, 212, 0.16) 0%, rgba(23, 71, 212, 0) 32%),
      linear-gradient(315deg, rgba(15, 15, 14, 0.08) 0%, rgba(15, 15, 14, 0) 42%);
    z-index: -1;
  }
  .copy {
    padding: clamp(34px, 8vh, 86px) clamp(24px, 7vw, 74px) 18px;
  }
  .brand {
    font-family: "Bebas Neue", sans-serif;
    font-size: clamp(54px, 13vw, 112px);
    letter-spacing: 0.04em;
    color: ${colors.accent};
    line-height: 0.86;
    margin-bottom: clamp(20px, 4vh, 42px);
  }
  .eyebrow {
    color: ${colors.accent};
    font: 700 clamp(12px, 2.9vw, 18px)/1 "DM Sans", sans-serif;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
  h1 {
    margin: 0;
    max-width: 860px;
    color: ${colors.text};
    font: 700 clamp(42px, 10.4vw, 94px)/0.95 "Space Grotesk", sans-serif;
    letter-spacing: 0;
  }
  .sub {
    max-width: 760px;
    margin-top: 16px;
    color: ${colors.textSecondary};
    font: 500 clamp(17px, 4.3vw, 30px)/1.28 "DM Sans", sans-serif;
  }
  .stage {
    min-height: 0;
    display: grid;
    place-items: end center;
    padding: 8px clamp(18px, 6vw, 72px) clamp(22px, 6vh, 76px);
  }
  .phone {
    width: min(78vw, 380px);
    aspect-ratio: 430 / 888;
    background: ${colors.background};
    border: 10px solid ${colors.ink};
    border-radius: 42px;
    box-shadow: 0 32px 70px rgba(15, 15, 14, 0.27);
    overflow: hidden;
    position: relative;
  }
  .phone::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 108px;
    height: 28px;
    border-radius: 999px;
    background: ${colors.ink};
    z-index: 3;
  }
  .screen {
    position: absolute;
    inset: 0;
    padding: 52px 22px 22px;
    overflow: hidden;
  }
  .topbar { display:flex; justify-content:space-between; align-items:center; color:${colors.textMuted}; font-size:12px; margin-bottom:18px; }
  .app-title { font-family:"Bebas Neue"; font-size:52px; line-height:.9; letter-spacing:.04em; color:${colors.accent}; }
  .card { background:${colors.surface}; border:1px solid ${colors.border}; border-radius:16px; box-shadow:0 8px 24px rgba(15, 15, 14, .08); }
  .pill { display:inline-flex; align-items:center; border-radius:999px; padding:6px 10px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
  .primary { background:${colors.accent}; color:#fff; border-radius:14px; padding:15px 18px; text-align:center; font:700 14px/1 "Space Grotesk"; letter-spacing:.08em; }
  .small { color:${colors.textMuted}; font-size:12px; line-height:1.35; }
  .score { font-family:"Space Grotesk"; font-size:64px; line-height:.9; font-weight:700; color:${colors.accent}; }
  .metric { display:flex; justify-content:space-between; gap:12px; align-items:center; padding:12px 0; border-bottom:1px solid ${colors.border}; }
  .metric:last-child { border-bottom:0; }
  .bar { height:7px; border-radius:999px; background:${colors.accentSoft}; overflow:hidden; }
  .bar span { display:block; height:100%; background:${colors.accent}; border-radius:999px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .tile { min-height:94px; padding:14px; border-radius:15px; background:${colors.surface}; border:1px solid ${colors.border}; }
  .tile strong { display:block; font:700 15px/1.05 "Space Grotesk"; margin-bottom:8px; }
  .record {
    width: 126px;
    height: 126px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: ${colors.accent};
    box-shadow: 0 0 0 18px rgba(23, 71, 212, .11), 0 0 48px rgba(23, 71, 212, .44);
    margin: 20px auto;
  }
  .record span { width: 34px; height: 34px; border-radius: 8px; background:#fff; display:block; }
  .ipad .shot { grid-template-columns: .86fr 1fr; grid-template-rows: 1fr; align-items: center; }
  .ipad .copy { padding: 86px 32px 86px 74px; }
  .ipad .stage { place-items:center; padding: 72px 74px 72px 24px; }
  .ipad .phone { width: min(38vw, 400px); }
  .ipad .brand { font-size: 106px; }
  .ipad h1 { font-size: 82px; }
  .ipad .sub { font-size: 27px; }
  .phone-size .copy {
    padding: clamp(30px, 5.5vh, 52px) 30px 8px;
  }
  .phone-size .brand {
    font-size: clamp(54px, 14vw, 66px);
    margin-bottom: clamp(16px, 2.8vh, 26px);
  }
  .phone-size .eyebrow {
    font-size: clamp(12px, 3vw, 14px);
    margin-bottom: 10px;
  }
  .phone-size h1 {
    font-size: clamp(38px, 9vw, 52px);
    line-height: .98;
  }
  .phone-size .sub {
    margin-top: 10px;
    font-size: clamp(15px, 3.7vw, 18px);
  }
  .phone-size .stage {
    padding: clamp(10px, 2vh, 18px) 22px clamp(16px, 4vh, 34px);
    place-items: start center;
  }
  .phone-size .phone {
    width: min(55vw, 286px);
    border-width: 7px;
    border-radius: 32px;
  }
  .phone-size .phone::before {
    width: 82px;
    height: 22px;
    top: 8px;
  }
  .phone-size .screen {
    padding: 42px 16px 16px;
  }
  .phone-size .app-title { font-size: 40px; }
  .phone-size .tile { min-height: 82px; padding: 12px; }
  .phone-size .record { width: 98px; height: 98px; }
  @media (max-height: 800px) {
    .phone-size .copy { padding: 24px 30px 4px; }
    .phone-size .brand {
      font-size: 52px;
      margin-bottom: 12px;
    }
    .phone-size .eyebrow {
      font-size: 11px;
      margin-bottom: 8px;
    }
    .phone-size h1 {
      font-size: 34px;
      line-height: 1;
    }
    .phone-size .sub {
      font-size: 13px;
      line-height: 1.22;
      margin-top: 8px;
      max-width: 330px;
    }
    .phone-size .stage { padding-top: 8px; padding-bottom: 12px; }
    .phone-size .phone {
      width: 48vw;
      max-width: 214px;
    }
    .phone-size .screen {
      width: 125%;
      height: 125%;
      transform: scale(.8);
      transform-origin: top left;
    }
  }
`;

function html(meta, phoneHtml) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
    ${fontLinks}
    <style>${css}</style>
  </head><body>
    <main class="shot">
      <section class="copy">
        <div class="brand">CHRM</div>
        <div class="eyebrow">${meta.eyebrow}</div>
        <h1>${meta.title}</h1>
        <p class="sub">${meta.sub}</p>
      </section>
      <section class="stage">
        <div class="phone"><div class="screen">${phoneHtml}</div></div>
      </section>
    </main>
  </body></html>`;
}

function prepPhone() {
  return `
    <div class="topbar"><span>Today</span><span>12 drills</span></div>
    <div class="app-title">CHRM</div>
    <p style="font:700 24px/1.05 'Space Grotesk'; margin:14px 0 16px;">Interview prep that feels like the real thing.</p>
    <div class="card" style="padding:18px; margin-bottom:12px;">
      <span class="pill" style="background:${colors.accentSoft}; color:${colors.accent};">Next drill</span>
      <p style="font:700 22px/1.12 'Space Grotesk'; margin:14px 0 12px;">Walk me through a DCF.</p>
      <p class="small">2-minute answer. Voice recording. Instant feedback.</p>
    </div>
    <div class="primary">START PRACTICE</div>
  `;
}

function feedbackPhone() {
  return `
    <div class="topbar"><span>Feedback</span><span>Saved</span></div>
    <div class="card" style="padding:18px; margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <div class="small" style="text-transform:uppercase; letter-spacing:.12em;">Overall score</div>
          <div class="score">8.4</div>
        </div>
        <span class="pill" style="background:#E8F6EF; color:${colors.success};">Strong</span>
      </div>
      <div class="metric"><span>Structure</span><strong>9/10</strong></div>
      <div class="metric"><span>Technical accuracy</span><strong>8/10</strong></div>
      <div class="metric"><span>Conciseness</span><strong>7/10</strong></div>
    </div>
    <div class="card" style="padding:16px;">
      <p style="font:700 17px/1.1 'Space Grotesk'; margin:0 0 8px;">Sharper version</p>
      <p class="small">Lead with enterprise value, explain FCF, then sanity-check terminal value.</p>
    </div>
  `;
}

function financePhone() {
  return `
    <div class="topbar"><span>Question banks</span><span>Pro</span></div>
    <div class="grid">
      <div class="tile"><strong>Investment Banking</strong><p class="small">DCF, M&A, accounting, valuation.</p></div>
      <div class="tile"><strong>Private Equity</strong><p class="small">LBOs, returns, deal thinking.</p></div>
      <div class="tile"><strong>Behaviorals</strong><p class="small">Leadership, conflict, motivation.</p></div>
      <div class="tile"><strong>Resume Walkthrough</strong><p class="small">Tell your story clearly.</p></div>
    </div>
    <div class="card" style="padding:18px; margin-top:12px; background:${colors.accent}; color:#fff;">
      <p style="font:700 22px/1.1 'Space Grotesk'; margin:0 0 8px;">Company prep kit</p>
      <p style="margin:0; color:rgba(255,255,255,.78); font-size:12px;">Custom drills for Goldman Sachs, Blackstone, JPMorgan, and more.</p>
    </div>
  `;
}

function hireVuePhone() {
  return `
    <div class="topbar"><span>HireVue Simulation</span><span>3 of 6</span></div>
    <p style="font:700 22px/1.12 'Space Grotesk'; margin:8px 0 18px;">Why are you interested in this firm?</p>
    <div class="card" style="padding:18px; text-align:center;">
      <div style="font:700 38px/1 'Space Grotesk'; color:${colors.accent}; letter-spacing:.1em;">00:24</div>
      <div style="display:flex; justify-content:center; gap:6px; align-items:center; margin-top:10px;">
        <span style="width:8px; height:8px; border-radius:50%; background:${colors.error}; display:block;"></span>
        <span style="font-size:11px; color:${colors.error}; letter-spacing:.14em; font-weight:700;">REC</span>
      </div>
      <div class="record"><span></span></div>
      <p class="small">Practice under pressure before the real screen starts.</p>
    </div>
  `;
}

function proPhone() {
  return `
    <div class="topbar"><span>CHRM Pro</span><span>Restore</span></div>
    <p style="font:700 38px/.98 'Space Grotesk'; margin:10px 0 18px;">Unlimited reps. Better interviews.</p>
    <div class="card" style="padding:16px; margin-bottom:10px;">
      <strong>Unlimited voice drills</strong>
      <div class="bar" style="margin-top:10px;"><span style="width:92%;"></span></div>
    </div>
    <div class="card" style="padding:16px; margin-bottom:10px;">
      <strong>AI mock interviews</strong>
      <p class="small" style="margin:8px 0 0;">Follow-up questions and a full debrief.</p>
    </div>
    <div class="card" style="padding:16px; margin-bottom:16px;">
      <strong>Company prep kits</strong>
      <p class="small" style="margin:8px 0 0;">Role-specific drills for target firms.</p>
    </div>
    <div class="primary">$59.99 / YEAR</div>
  `;
}

const SCREENS = [
  {
    id: '1-practice',
    meta: {
      eyebrow: 'AI interview coach',
      title: 'Practice before it counts.',
      sub: 'Voice drills, realistic prompts, and feedback built for high-stakes interviews.',
    },
    phone: prepPhone,
  },
  {
    id: '2-feedback',
    meta: {
      eyebrow: 'Instant scoring',
      title: 'Know what to fix after every answer.',
      sub: 'Get scores, sharper rewrites, and specific coaching instead of vague advice.',
    },
    phone: feedbackPhone,
  },
  {
    id: '3-finance',
    meta: {
      eyebrow: 'Finance ready',
      title: 'Master technicals and behaviorals.',
      sub: 'Train for investment banking, private equity, markets, and resume walkthroughs.',
    },
    phone: financePhone,
  },
  {
    id: '4-hirevue',
    meta: {
      eyebrow: 'Timed simulation',
      title: 'Rehearse HireVue pressure.',
      sub: 'Record one-way video-style answers and build calm under the clock.',
    },
    phone: hireVuePhone,
  },
  {
    id: '5-pro',
    meta: {
      eyebrow: 'Go deeper',
      title: 'Build a repeatable prep system.',
      sub: 'Unlimited reps, mock interviews, and company prep kits when the role matters.',
    },
    phone: proPhone,
  },
];

async function main() {
  if (!executablePath) {
    console.error('Could not find a Chromium binary. Looked in:\n  ' + CHROME_CANDIDATES.join('\n  '));
    process.exit(1);
  }

  const outRoot = path.join(__dirname, '..', 'assets', 'screenshots');
  const browser = await chromium.launch({
    executablePath,
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });

  let count = 0;
  for (const device of DEVICES) {
    const dir = path.join(outRoot, device.id);
    fs.mkdirSync(dir, { recursive: true });
    for (const existing of fs.readdirSync(dir)) {
      if (existing.endsWith('.png')) fs.rmSync(path.join(dir, existing));
    }

    const context = await browser.newContext({
      viewport: { width: device.w, height: device.h },
      deviceScaleFactor: device.scale,
    });
    const page = await context.newPage();

    for (const screen of SCREENS) {
      const markup = html(screen.meta, screen.phone()).replace('<body>', `<body class="${device.id === 'ipad-13' ? 'ipad' : 'phone-size'}">`);
      await page.setContent(markup, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      await page.waitForTimeout(150);
      const file = path.join(dir, `${screen.id}.png`);
      await page.screenshot({ path: file });
      count += 1;
      console.log(`Wrote ${device.id} (${device.px}) ${screen.id}`);
    }
    await context.close();
  }

  await browser.close();
  console.log(`\nDone. ${count} screenshots written to assets/screenshots/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
