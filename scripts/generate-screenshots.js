/**
 * App Store screenshot generator.
 *
 * Approach: faithful HTML/CSS mockups of 5 app screens, rendered headless with
 * playwright-core pointed at the pre-installed Chromium, then captured at the
 * exact App Store pixel sizes. We render at each device's *logical* point size
 * with the matching deviceScaleFactor, so type/spacing stay natural and the PNG
 * comes out at the required resolution.
 *
 * Why mockups (not the live Expo app): deterministic, pixel-exact, and it pins
 * the colors/fonts/spacing straight from src/constants/theme.js — no RN-Web
 * layout drift, no audio shims, no flaky navigation driving.
 *
 *   node scripts/generate-screenshots.js
 *
 * Output: assets/screenshots/<device>/<screen>.png
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

// ── Pre-installed Chromium (see environment notes) ──────────────────────────────
const CHROME_CANDIDATES = [
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
];
const executablePath = CHROME_CANDIDATES.find((p) => fs.existsSync(p));

// ── Design tokens (mirror of src/constants/theme.js) ────────────────────────────
const colors = {
  background: '#F2F1EE',
  surface: '#FFFFFF',
  accent: '#1747D4',
  accentDim: 'rgba(23, 71, 212, 0.07)',
  text: '#0F0F0E',
  textSecondary: '#686866',
  textMuted: '#AEAEAE',
  border: '#E3E2DE',
  error: '#D62828',
  cream: '#F2F1EE',
};
const fonts = {
  header: "'Bebas Neue', sans-serif",
  display: "'Space Grotesk', sans-serif", // weight 700
  displayMedium: "'Space Grotesk', sans-serif", // weight 600
  body: "'DM Sans', sans-serif", // weight 400
};

// ── Target App Store sizes (logical pt size + scale → exact px) ──────────────────
const DEVICES = [
  { id: '6.9-inch', w: 440, h: 956, scale: 3, px: '1320×2868' }, // iPhone 16 Pro Max
  { id: '6.5-inch', w: 414, h: 896, scale: 3, px: '1242×2688' }, // iPhone 11 Pro Max
  { id: '5.5-inch', w: 414, h: 736, scale: 3, px: '1242×2208' }, // iPhone 8 Plus
  { id: 'ipad-13', w: 1032, h: 1376, scale: 2, px: '2064×2752' }, // iPad Pro 13"
];

// ── Shared page shell ───────────────────────────────────────────────────────────
function shell(inner, { pad = 56 } = {}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
    html, body { width:100%; height:100%; }
    body {
      background:${colors.background};
      font-family:${fonts.body};
      color:${colors.text};
      display:flex; justify-content:center;
    }
    /* App content is a centered portrait column — matches the app's max-width
       behaviour on iPad and full-width on phones. */
    .app {
      width:100%; max-width:480px; min-height:100vh;
      display:flex; flex-direction:column;
      padding-top:${pad}px;
      position:relative;
      overflow:hidden;
    }
    .accent { color:${colors.accent}; }
    .muted { color:${colors.textMuted}; }
  </style></head>
  <body><div class="app">${inner}</div></body></html>`;
}

// ── Reusable bits ───────────────────────────────────────────────────────────────
const px = (n) => `${n}px`;
const sp = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

function primaryBtn(label) {
  return `<div style="background:${colors.accent};border-radius:14px;padding:20px;text-align:center;">
    <span style="font-family:${fonts.display};font-weight:700;font-size:16px;letter-spacing:2px;color:${colors.cream};">${label}</span>
  </div>`;
}

// ── Screen 1: Welcome / Splash ──────────────────────────────────────────────────
function welcomeScreen() {
  return shell(`
    <div style="position:absolute;top:${sp.xl + 24}px;right:${sp.lg}px;font-family:${fonts.body};font-size:14px;color:${colors.textMuted};">Skip</div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 ${sp.lg}px;gap:${sp.sm}px;">
      <div style="font-family:${fonts.header};font-size:96px;color:${colors.accent};letter-spacing:4px;line-height:84px;">CHRM</div>
      <div style="font-family:${fonts.body};font-size:16px;color:${colors.text};margin-top:${sp.md}px;">Train how you communicate.</div>
      <div style="font-family:${fonts.body};font-size:13px;color:${colors.textMuted};letter-spacing:1px;">Reps. Pressure. Feedback.</div>
    </div>
    <div style="padding:0 ${sp.lg}px ${sp.xxl}px;">
      ${primaryBtn('GET STARTED')}
    </div>
    ${dots(0, 2)}
  `);
}

function dots(active, total) {
  let d = '';
  for (let i = 0; i < total; i++) {
    const on = i === active;
    d += `<div style="width:${on ? 20 : 6}px;height:6px;border-radius:3px;background:${on ? colors.text : colors.border};"></div>`;
  }
  return `<div style="position:absolute;bottom:${sp.xxl}px;left:0;right:0;display:flex;justify-content:center;gap:${sp.sm}px;">${d}</div>`;
}

// ── Screen 2: Onboarding Intent ─────────────────────────────────────────────────
function intentScreen() {
  const intents = [
    ['Upcoming interview', "I have a specific role I'm targeting"],
    ['Sharpen my communication', 'I want to get better at speaking under pressure'],
    ['Just exploring', 'Show me what CHRM can do'],
  ];
  const cards = intents
    .map(
      ([label, sub]) => `
    <div style="background:${colors.surface};border:1px solid ${colors.border};border-radius:14px;padding:${sp.lg}px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
      <div style="font-family:${fonts.displayMedium};font-weight:600;font-size:15px;color:${colors.text};margin-bottom:${sp.xs}px;">${label}</div>
      <div style="font-family:${fonts.body};font-size:12px;color:${colors.textMuted};">${sub}</div>
    </div>`
    )
    .join('');
  return shell(`
    <div style="position:absolute;top:${sp.xl + 24}px;right:${sp.lg}px;font-family:${fonts.body};font-size:14px;color:${colors.textMuted};">Skip</div>
    <div style="flex:1;display:flex;flex-direction:column;padding:0 ${sp.lg}px ${px(80)};">
      <div style="font-family:${fonts.display};font-weight:700;font-size:36px;line-height:40px;letter-spacing:-0.5px;margin-top:${sp.xl}px;margin-bottom:${sp.xl}px;">What brings<br/>you here?</div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:${sp.sm}px;">${cards}</div>
    </div>
    ${dots(1, 2)}
  `);
}

// ── Screen 3: Home dashboard ────────────────────────────────────────────────────
function homeScreen() {
  const drillCards = [
    ['Interview Prep', 'Curated banks by finance vertical — IB technicals & more'],
    ['Behaviorals', 'STAR-method answers that work for any role'],
    ['Resume Walkthrough', 'Nail the "walk me through your resume" opener'],
    ['Persuade & Present', 'Pitch and defend ideas with clarity'],
    ['Quick Fire', 'Random prompts, timed pressure'],
  ]
    .map(
      ([t, s]) => `
    <div style="background:${colors.surface};border:1px solid ${colors.border};border-radius:14px;padding:${sp.lg}px;min-height:76px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
      <div style="flex:1;">
        <div style="font-family:${fonts.display};font-weight:700;font-size:15px;color:${colors.text};margin-bottom:2px;">${t}</div>
        <div style="font-family:${fonts.body};font-size:11px;color:${colors.textMuted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px;">${s}</div>
      </div>
      <div style="font-size:20px;color:${colors.accent};margin-left:8px;">›</div>
    </div>`
    )
    .join('');

  const proCard = (title, sub) => `
    <div style="background:${colors.accent};border-radius:14px;padding:${sp.lg}px;min-height:76px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 5px rgba(23,71,212,0.18);">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:${sp.sm}px;margin-bottom:2px;">
          <span style="font-family:${fonts.display};font-weight:700;font-size:15px;color:${colors.cream};">${title}</span>
          <span style="background:rgba(242,241,238,0.18);border-radius:8px;padding:1px 6px;font-family:${fonts.body};font-weight:700;font-size:9px;letter-spacing:1px;color:${colors.cream};">PRO</span>
        </div>
        <div style="font-family:${fonts.body};font-size:11px;color:rgba(242,241,238,0.7);">${sub}</div>
      </div>
      <div style="font-size:20px;color:rgba(242,241,238,0.6);margin-left:8px;">›</div>
    </div>`;

  return shell(`
    <div style="padding:0 ${sp.lg}px;">
      <div style="text-align:right;margin-bottom:${sp.md}px;">
        <div style="font-family:${fonts.display};font-weight:700;font-size:30px;line-height:30px;color:${colors.accent};">12</div>
        <div style="font-family:${fonts.body};font-size:9px;letter-spacing:2px;color:${colors.textMuted};margin-top:2px;">DRILLS DONE</div>
      </div>
      <div style="padding-bottom:20px;">
        <div style="font-family:${fonts.header};font-size:80px;color:${colors.accent};letter-spacing:3px;line-height:96px;">CHRM</div>
        <div style="font-family:${fonts.body};font-size:12px;color:${colors.textMuted};margin-top:8px;letter-spacing:0.4px;">Clear. Confident. Under Pressure.</div>
      </div>
      <div style="height:1px;background:${colors.border};margin-bottom:18px;"></div>
    </div>
    <div style="padding:0 ${sp.lg}px ${sp.xxl}px;display:flex;flex-direction:column;gap:8px;">
      ${drillCards}
      ${proCard('HireVue Simulation', 'One-way recorded interview + AI feedback')}
      ${proCard('Company Prep Kit', 'Deep intel + custom training plan')}
    </div>
  `, { pad: 80 });
}

// ── Screen 4: Practice / Drill mid-session ──────────────────────────────────────
function practiceScreen() {
  return shell(`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:0 ${sp.lg}px;margin-bottom:${sp.xl}px;">
      <div style="width:80px;font-family:${fonts.body};font-size:15px;color:${colors.textMuted};">← Back</div>
      <div style="font-family:${fonts.body};font-size:12px;letter-spacing:1px;color:${colors.textMuted};">3 of 10</div>
      <div style="width:80px;text-align:right;font-size:24px;color:${colors.textMuted};">↺</div>
    </div>
    <div style="padding:0 ${sp.lg}px;margin-bottom:${sp.xxl}px;">
      <div style="font-family:${fonts.body};font-size:10px;letter-spacing:3px;color:${colors.textMuted};text-transform:uppercase;margin-bottom:${sp.sm}px;">YOUR QUESTION</div>
      <div style="font-family:${fonts.display};font-weight:700;font-size:22px;line-height:30px;letter-spacing:-0.3px;color:${colors.text};margin-bottom:${sp.md}px;">Walk me through a DCF and tell me which assumption the valuation is most sensitive to.</div>
      <div style="font-family:${fonts.body};font-size:13px;color:${colors.accent};">Browse Questions ›</div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding-bottom:60px;">
      <div style="font-family:${fonts.display};font-weight:700;font-size:32px;letter-spacing:4px;color:${colors.accent};margin-bottom:${sp.sm}px;">00:24</div>
      <div style="display:flex;align-items:center;gap:${sp.xs}px;margin-bottom:${sp.lg}px;">
        <div style="width:8px;height:8px;border-radius:4px;background:${colors.error};"></div>
        <div style="font-family:${fonts.body};font-size:11px;letter-spacing:2px;color:${colors.error};">REC</div>
      </div>
      <div style="width:130px;height:130px;border-radius:65px;background:${colors.accent};display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(23,71,212,0.5), 0 8px 20px rgba(0,0,0,0.15);margin-bottom:${sp.xl}px;">
        <div style="width:32px;height:32px;border-radius:6px;background:${colors.cream};"></div>
      </div>
      <div style="font-family:${fonts.body};font-size:13px;letter-spacing:0.5px;color:${colors.textMuted};">Tap to stop</div>
    </div>
  `, { pad: 60 });
}

// ── Screen 5: Paywall ───────────────────────────────────────────────────────────
function paywallScreen() {
  const features = [
    ['Unlimited Drills', 'No daily limits. Practice as much as you want.'],
    ['Company Prep Kits', 'AI-generated intel and training plans for any firm.'],
    ['AI Mock Interviews', 'Live voice simulation with full debrief scorecard.'],
  ]
    .map(
      ([t, d]) => `
    <div style="display:flex;background:${colors.surface};border:1px solid ${colors.border};border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
      <div style="width:3px;background:${colors.accent};"></div>
      <div style="flex:1;padding:${sp.md}px;">
        <div style="font-family:${fonts.displayMedium};font-weight:600;font-size:14px;color:${colors.text};margin-bottom:3px;">${t}</div>
        <div style="font-family:${fonts.body};font-size:12px;color:${colors.textMuted};line-height:18px;">${d}</div>
      </div>
    </div>`
    )
    .join('');

  return shell(`
    <div style="padding:0 ${sp.lg}px ${px(60)};">
      <div style="text-align:right;font-size:18px;color:${colors.textMuted};margin-bottom:${sp.lg}px;">✕</div>
      <div style="margin-bottom:${sp.xl}px;">
        <div style="font-family:${fonts.bodyMedium || fonts.body};font-size:13px;letter-spacing:0.5px;color:${colors.accent};margin-bottom:${sp.sm}px;">Prep Kits are a Pro feature.</div>
        <div style="font-family:${fonts.display};font-weight:700;font-size:52px;line-height:52px;letter-spacing:-2px;color:${colors.text};">Unlock<br/>CHRM Pro</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:${sp.sm}px;margin-bottom:${sp.xl}px;">${features}</div>
      <div style="display:flex;flex-direction:column;gap:${sp.sm}px;margin-bottom:${sp.xl}px;">
        <div style="background:${colors.text};border-radius:14px;padding:18px;text-align:center;">
          <span style="font-family:${fonts.display};font-weight:700;font-size:20px;letter-spacing:0.5px;color:${colors.cream};">$7.99 / month</span>
        </div>
        <div style="border:1.5px solid ${colors.text};border-radius:14px;padding:16px ${sp.lg}px;display:flex;align-items:center;justify-content:center;gap:${sp.sm}px;">
          <span style="font-family:${fonts.display};font-weight:700;font-size:20px;letter-spacing:0.5px;color:${colors.text};">$59.99 / year</span>
          <span style="background:${colors.accentDim};border:1px solid rgba(23,71,212,0.25);border-radius:9999px;padding:3px 8px;font-family:${fonts.body};font-size:10px;letter-spacing:1.5px;color:${colors.accent};">SAVE 36%</span>
        </div>
        <div style="text-align:center;padding:${sp.sm}px;font-family:${fonts.body};font-size:13px;color:${colors.textMuted};">Restore Purchase</div>
      </div>
      <div style="text-align:center;font-family:${fonts.body};font-size:13px;color:${colors.textMuted};margin-bottom:${sp.lg}px;">Maybe later</div>
      <div style="text-align:center;">
        <div style="font-family:${fonts.body};font-size:10px;line-height:15px;color:${colors.textMuted};margin-bottom:${sp.sm}px;">Auto-renews at $7.99/month or $59.99/year via your Apple ID unless cancelled 24h before renewal. Manage in Account Settings.</div>
        <div style="display:flex;justify-content:center;gap:${sp.sm}px;font-family:${fonts.body};font-size:12px;">
          <span style="color:${colors.accent};font-weight:500;">Terms of Use</span>
          <span style="color:${colors.textMuted};">·</span>
          <span style="color:${colors.accent};font-weight:500;">Privacy Policy</span>
        </div>
      </div>
    </div>
  `, { pad: 60 });
}

const SCREENS = [
  { id: '1-welcome', html: welcomeScreen },
  { id: '2-intent', html: intentScreen },
  { id: '3-home', html: homeScreen },
  { id: '4-practice', html: practiceScreen },
  { id: '5-paywall', html: paywallScreen },
];

async function main() {
  if (!executablePath) {
    console.error('Could not find a Chromium binary. Looked in:\n  ' + CHROME_CANDIDATES.join('\n  '));
    process.exit(1);
  }
  const outRoot = path.join(__dirname, '..', 'assets', 'screenshots');
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox', '--font-render-hinting=none'] });

  let count = 0;
  for (const device of DEVICES) {
    const dir = path.join(outRoot, device.id);
    fs.mkdirSync(dir, { recursive: true });
    const context = await browser.newContext({
      viewport: { width: device.w, height: device.h },
      deviceScaleFactor: device.scale,
    });
    const page = await context.newPage();
    for (const screen of SCREENS) {
      await page.setContent(screen.html(), { waitUntil: 'networkidle' });
      // Make sure web fonts are actually painted before the shot.
      await page.evaluate(() => document.fonts && document.fonts.ready);
      await page.waitForTimeout(150);
      const file = path.join(dir, `${screen.id}.png`);
      await page.screenshot({ path: file });
      count++;
      console.log(`✓ ${device.id} (${device.px})  ${screen.id}`);
    }
    await context.close();
  }
  await browser.close();
  console.log(`\nDone — ${count} screenshots written to assets/screenshots/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
