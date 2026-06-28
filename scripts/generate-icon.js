/**
 * Generate CHRM's 1024x1024 App Store icon.
 *
 * Output: assets/icon.png
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

async function main() {
  if (!executablePath) {
    console.error('Could not find a Chromium binary.');
    process.exit(1);
  }

  const out = path.join(__dirname, '..', 'assets', 'icon.png');
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  await page.setContent(`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; }
          html, body {
            width: 1024px;
            height: 1024px;
            margin: 0;
            overflow: hidden;
            background: #F2F1EE;
          }
          body {
            display: grid;
            place-items: center;
          }
          .mark {
            width: 100%;
            height: 100%;
            display: grid;
            place-items: center;
            background:
              linear-gradient(135deg, rgba(23, 71, 212, 0.16) 0%, rgba(23, 71, 212, 0) 38%),
              linear-gradient(315deg, rgba(15, 15, 14, 0.08) 0%, rgba(15, 15, 14, 0) 46%),
              #F2F1EE;
          }
          .word {
            color: #1747D4;
            font-family: "Bebas Neue", Impact, sans-serif;
            font-size: 286px;
            letter-spacing: 0.045em;
            line-height: 0.9;
            transform: translateX(16px);
          }
          .rule {
            width: 600px;
            height: 18px;
            border-radius: 999px;
            background: #1747D4;
            margin: 38px auto 0;
            box-shadow: 0 10px 28px rgba(23, 71, 212, 0.22);
          }
        </style>
      </head>
      <body>
        <div class="mark">
          <div>
            <div class="word">CHRM</div>
            <div class="rule"></div>
          </div>
        </div>
      </body>
    </html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.screenshot({ path: out, omitBackground: false });
  await browser.close();
  console.log(`Wrote ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
