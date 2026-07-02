// Static legal pages served by the CHRM backend.
//
// Apple Guideline 3.1.2(c) requires a functional Privacy Policy and Terms of
// Use (EULA) reachable from the paywall and the App Store listing. These are
// plain, dependency-free HTML strings rendered by the Hono routes in index.js.
//
// If you change company details, support email, or pricing, update the
// constants below and the dates so the published pages stay accurate.

const COMPANY = 'CHRM';
const SUPPORT_EMAIL = 'caseyraffone@comcast.net';
const LAST_UPDATED = 'June 28, 2026';

// Shared shell — light theme to match the app's design system.
function page(title, bodyHtml, options = {}) {
  const description =
    options.description ||
    'CHRM is a voice-first finance interview coach for technical, fit, resume, and HireVue practice.';
  const url = options.url || 'https://chrm-two.vercel.app/';
  const image = options.image || 'https://chrm-two.vercel.app/screenshots/6.9-inch/3-finance.png';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title} · ${COMPANY}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${image}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title} · ${COMPANY}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <link rel="icon" href="/favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <title>${title} · ${COMPANY}</title>
  <style>
    :root {
      --bg: #F2F1EE;
      --surface: #FFFFFF;
      --accent: #1747D4;
      --text: #0F0F0E;
      --text-secondary: #686866;
      --border: #E3E2DE;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      font-size: 16px;
    }
    .wrap { max-width: 1120px; margin: 0 auto; padding: 44px 24px 96px; }
    .brand {
      font-family: "Bebas Neue", Impact, sans-serif; font-size: 24px; letter-spacing: 5px; text-transform: uppercase;
      color: var(--accent); font-weight: 400; margin-bottom: 8px; line-height: 1;
    }
    h1, h2, h3 { font-family: "Space Grotesk", "DM Sans", sans-serif; }
    h1 { font-size: 34px; line-height: 1.15; letter-spacing: -0.5px; margin: 0 0 4px; }
    .updated { color: var(--text-secondary); font-size: 14px; margin-bottom: 32px; }
    h2 { font-size: 20px; margin: 36px 0 10px; letter-spacing: -0.3px; }
    h3 { font-size: 16px; margin: 22px 0 6px; }
    p, li { color: #1c1c1b; }
    ul { padding-left: 22px; }
    li { margin-bottom: 6px; }
    a { color: var(--accent); }
    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; padding: 18px 22px; margin: 18px 0;
    }
    .hero {
      display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);
      gap: 44px; align-items: center; padding: 24px 0 34px;
    }
    .lead { max-width: 640px; color: var(--text-secondary); font-size: 18px; }
    .cta-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
    .cta {
      display: inline-flex; align-items: center; justify-content: center;
      min-height: 44px; border-radius: 10px; padding: 0 18px;
      font-weight: 700; text-decoration: none;
    }
    .cta.primary { background: var(--accent); color: #fff; }
    .cta.secondary { border: 1px solid var(--border); color: var(--text); background: var(--surface); }
    .hero h1 { font-size: 52px; max-width: 660px; }
    .hero-media { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; align-items: end; }
    .phone-shot {
      width: 100%; border-radius: 28px; border: 1px solid var(--border);
      box-shadow: 0 18px 44px rgba(15, 15, 14, 0.16); background: var(--surface);
    }
    .phone-shot.secondary { transform: translateY(28px); }
    .trust-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
    .trust-pill {
      display: inline-flex; align-items: center; min-height: 32px; padding: 0 11px;
      border: 1px solid var(--border); border-radius: 999px; background: rgba(255,255,255,0.72);
      color: var(--text-secondary); font-size: 13px; font-weight: 600;
    }
    .section { padding: 52px 0; border-top: 1px solid var(--border); }
    .section-head { max-width: 680px; margin-bottom: 22px; }
    .section-kicker { color: var(--accent); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: 800; margin-bottom: 8px; }
    .section h2 { font-size: 30px; line-height: 1.15; margin: 0 0 8px; }
    .feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 28px 0 12px; }
    .feature { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
    .feature strong { display: block; margin-bottom: 8px; }
    .feature p { margin: 0; color: var(--text-secondary); font-size: 15px; line-height: 1.45; }
    .proof-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
    .proof { background: #0F0F0E; color: #fff; border-radius: 14px; padding: 18px; }
    .proof strong { display: block; color: #fff; font-size: 22px; margin-bottom: 4px; }
    .proof p { margin: 0; color: rgba(255,255,255,0.72); font-size: 14px; line-height: 1.45; }
    .sample {
      background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
      padding: 20px; display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 18px; align-items: start;
    }
    .score {
      display: grid; place-items: center; width: 84px; height: 84px; border-radius: 50%;
      background: var(--accent); color: #fff; font-size: 28px; font-weight: 800;
    }
    .sample h3 { margin-top: 0; font-size: 18px; }
    .sample ul { margin-bottom: 0; }
    .pricing { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; max-width: 620px; }
    .price-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
    .price { font-size: 30px; font-weight: 800; letter-spacing: -0.4px; }
    .price span { color: var(--text-secondary); font-size: 15px; font-weight: 600; }
    .site-nav { display: flex; justify-content: space-between; align-items: center; gap: 18px; margin-bottom: 34px; }
    .nav-links { display: flex; gap: 18px; align-items: center; }
    .nav-links a { color: var(--text-secondary); font-size: 14px; font-weight: 800; text-decoration: none; }
    .nav-links a:hover { color: var(--text); }
    .marketing-hero {
      display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(400px, 1.08fr);
      gap: 46px; align-items: center; padding: 8px 0 58px;
    }
    .eyebrow { color: var(--accent); font-size: 13px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; margin: 0 0 16px; }
    .marketing-hero h1 { font-size: clamp(44px, 6vw, 72px); line-height: 0.94; letter-spacing: -2.2px; margin: 0; }
    .hero-proof { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 18px; }
    .hero-proof span { background: rgba(255,255,255,0.78); border: 1px solid var(--border); border-radius: 999px; padding: 7px 11px; color: var(--text-secondary); font-size: 13px; font-weight: 800; }
    .device-stage { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: end; min-height: 560px; }
    .phone-frame {
      border: 10px solid #111; border-radius: 42px; background: #111; padding: 0;
      box-shadow: 0 26px 80px rgba(15,15,14,0.22); overflow: hidden;
    }
    .phone-frame img { display: block; width: 100%; border-radius: 30px; background: #fff; }
    .phone-frame.secondary { transform: translateY(58px); }
    .coverage-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
    .coverage-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px; min-height: 138px; }
    .coverage-card strong { display: block; font-family: "Space Grotesk", sans-serif; margin-bottom: 8px; }
    .coverage-card p { margin: 0; color: var(--text-secondary); font-size: 14px; line-height: 1.42; }
    .steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; counter-reset: step; }
    .step { counter-increment: step; background: #0f0f0e; border-radius: 16px; padding: 18px; color: #fff; min-height: 164px; }
    .step:before { content: counter(step); display: grid; place-items: center; width: 32px; height: 32px; background: var(--accent); color: #fff; border-radius: 999px; font-weight: 900; margin-bottom: 18px; }
    .step strong { display: block; font-family: "Space Grotesk", sans-serif; margin-bottom: 6px; }
    .step p { color: rgba(255,255,255,0.72); margin: 0; font-size: 14px; line-height: 1.45; }
    .faq-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .faq { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
    .faq strong { display: block; font-family: "Space Grotesk", sans-serif; margin-bottom: 8px; }
    .faq p { margin: 0; color: var(--text-secondary); font-size: 15px; line-height: 1.48; }
    .prep-hero {
      display: grid; grid-template-columns: minmax(0, 0.82fr) minmax(420px, 1.18fr);
      gap: 28px; align-items: stretch; padding: 22px 0 44px;
    }
    .prep-copy {
      display: flex; flex-direction: column; justify-content: space-between; gap: 26px;
      min-height: 560px;
    }
    .prep-copy h1 { font-size: 52px; line-height: 0.98; letter-spacing: -1.4px; margin: 0; }
    .prep-copy .lead { margin: 18px 0 0; }
    .prep-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .prep-stat {
      background: rgba(255,255,255,0.72); border: 1px solid var(--border);
      border-radius: 12px; padding: 14px;
    }
    .prep-stat strong { display: block; font-size: 20px; line-height: 1; }
    .prep-stat span { color: var(--text-secondary); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
    .workbench {
      background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
      box-shadow: 0 22px 70px rgba(15, 15, 14, 0.10); overflow: hidden;
    }
    .workbench-top {
      display: flex; justify-content: space-between; gap: 18px; align-items: center;
      border-bottom: 1px solid var(--border); padding: 18px 20px;
    }
    .workbench-title { margin: 0; font-size: 13px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent); }
    .workbench-subtitle { margin: 3px 0 0; color: var(--text-secondary); font-size: 14px; }
    .rep-meter { min-width: 154px; }
    .rep-meter span { display: flex; justify-content: space-between; color: var(--text-secondary); font-size: 12px; font-weight: 700; margin-bottom: 7px; }
    .rep-track { height: 7px; background: var(--border); border-radius: 999px; overflow: hidden; }
    .rep-fill { height: 100%; width: 20%; background: var(--accent); border-radius: 999px; transition: width 220ms ease; }
    .workbench-body { padding: 20px; }
    .control-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
    .field label { display: block; color: var(--text-secondary); font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
    .field select {
      width: 100%; appearance: none; border: 1px solid var(--border); border-radius: 10px;
      background: #fbfbfa; color: var(--text); padding: 11px 12px; font: inherit; font-weight: 650;
    }
    .question-card {
      background: #0f0f0e; color: #fff; border-radius: 16px; padding: 20px;
      min-height: 176px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .question-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .question-meta span {
      border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; padding: 5px 9px;
      color: rgba(255,255,255,0.74); font-size: 12px; font-weight: 750;
    }
    .question-card h2 { color: #fff; font-size: 25px; line-height: 1.18; margin: 0; }
    .reference-toggle {
      width: fit-content; margin-top: 18px; border: 0; background: transparent; color: rgba(255,255,255,0.72);
      font: inherit; font-size: 13px; font-weight: 750; padding: 0; cursor: pointer;
    }
    .reference-answer { display: none; color: rgba(255,255,255,0.76); font-size: 14px; line-height: 1.45; margin: 12px 0 0; }
    .reference-answer.show { display: block; }
    .answer-zone { margin-top: 16px; display: grid; gap: 12px; }
    .transcript-box {
      width: 100%; min-height: 150px; resize: vertical; border: 1px solid var(--border); border-radius: 14px;
      background: #fbfbfa; color: var(--text); font: inherit; line-height: 1.45; padding: 14px;
    }
    .transcript-box:focus, .field select:focus { outline: 3px solid rgba(23, 71, 212, 0.16); border-color: var(--accent); }
    .action-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .button {
      min-height: 44px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface);
      color: var(--text); padding: 0 15px; font: inherit; font-weight: 800; cursor: pointer;
    }
    .button.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
    .button.dark { background: #0f0f0e; border-color: #0f0f0e; color: #fff; }
    .button:disabled { opacity: 0.46; cursor: not-allowed; }
    .recording-dot {
      display: none; width: 9px; height: 9px; border-radius: 99px; background: #d93025;
      box-shadow: 0 0 0 7px rgba(217,48,37,0.12);
    }
    .recording .recording-dot { display: inline-block; }
    .status-line { color: var(--text-secondary); font-size: 13px; min-height: 20px; }
    .feedback-panel {
      display: none; margin-top: 16px; border: 1px solid var(--border); border-radius: 16px;
      background: #fbfbfa; overflow: hidden;
    }
    .feedback-panel.show { display: block; }
    .feedback-head { display: grid; grid-template-columns: 96px minmax(0, 1fr); gap: 16px; padding: 18px; border-bottom: 1px solid var(--border); }
    .feedback-score {
      display: grid; place-items: center; width: 82px; height: 82px; border-radius: 50%;
      background: var(--accent); color: #fff; font-size: 27px; font-weight: 900;
    }
    .feedback-head h3 { margin: 0 0 5px; font-size: 20px; }
    .feedback-head p { margin: 0; color: var(--text-secondary); font-size: 14px; }
    .feedback-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; background: var(--border); }
    .feedback-block { background: #fbfbfa; padding: 16px; }
    .feedback-block strong { display: block; color: var(--accent); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
    .feedback-block ul { margin: 0; padding-left: 19px; }
    .feedback-block li { color: var(--text); font-size: 14px; line-height: 1.45; }
    .model-answer { grid-column: 1 / -1; }
    .model-answer p { margin: 0; color: var(--text); font-size: 14px; line-height: 1.5; }
    .browser-note {
      margin-top: 24px; background: rgba(23, 71, 212, 0.07); border: 1px solid rgba(23, 71, 212, 0.18);
      border-radius: 14px; padding: 16px 18px; color: var(--text-secondary);
    }
    @media (max-width: 640px) {
      .wrap { padding-top: 30px; }
      .hero { grid-template-columns: 1fr; gap: 26px; }
      .hero h1 { font-size: 38px; }
      .hero-media { max-width: 430px; margin: 0 auto; }
      .feature-grid, .proof-grid, .pricing { grid-template-columns: 1fr; }
      .sample { grid-template-columns: 1fr; }
      .cta { width: 100%; }
      .site-nav { align-items: flex-start; flex-direction: column; }
      .nav-links { flex-wrap: wrap; gap: 12px; }
      .marketing-hero { grid-template-columns: 1fr; gap: 24px; padding-bottom: 42px; }
      .device-stage { grid-template-columns: repeat(2, minmax(0, 1fr)); min-height: auto; gap: 10px; }
      .phone-frame { border-width: 6px; border-radius: 28px; }
      .phone-frame img { border-radius: 22px; }
      .phone-frame.secondary { transform: translateY(24px); }
      .coverage-grid, .steps, .faq-grid { grid-template-columns: 1fr; }
      .prep-hero { grid-template-columns: 1fr; }
      .prep-copy { min-height: auto; }
      .prep-copy h1 { font-size: 38px; }
      .prep-stats, .control-row, .feedback-grid, .feedback-head { grid-template-columns: 1fr; }
      .workbench-top { align-items: stretch; flex-direction: column; }
      .rep-meter { min-width: 0; }
      .question-card h2 { font-size: 22px; }
      .button { flex: 1 1 auto; }
    }
    .muted { color: var(--text-secondary); font-size: 14px; }
    footer { margin-top: 48px; padding-top: 18px; border-top: 1px solid var(--border); }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: top; font-size: 14px; }
    th { color: var(--text-secondary); font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrap">
    ${options.hideBrand ? '' : `<div class="brand">${COMPANY}</div>`}
    ${bodyHtml}
    <footer class="muted">
      <p>${COMPANY} — AI Communication Coach. Questions? Email
      <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      <p><a href="/privacy">Privacy Policy</a> &middot; <a href="/terms">Terms of Use</a> &middot; <a href="/support">Support</a></p>
    </footer>
  </div>
</body>
</html>`;
}

export const privacyHtml = page(
  'Privacy Policy',
  `
  <h1>Privacy Policy</h1>
  <p class="updated">Last updated: ${LAST_UPDATED}</p>

  <p>This Privacy Policy explains how ${COMPANY} ("we", "us", or "our") collects,
  uses, and protects information when you use the ${COMPANY} mobile application and
  related services (the "App"). ${COMPANY} is an AI-powered communication coaching
  app that helps you practice interviews and high-stakes communication through
  voice drills and AI feedback. We have designed the App to collect as little
  personal information as possible.</p>

  <div class="card">
    <strong>The short version:</strong>
    <ul>
      <li>We do <strong>not</strong> require an account, and we do not collect your name, email, or contact information through the App.</li>
      <li>Your practice recordings and transcripts are sent to our AI providers only to generate your transcript and coaching feedback. We do not sell them or use them for advertising.</li>
      <li>We collect anonymous, aggregate usage analytics to improve the product — never the content of your answers.</li>
      <li>Your practice history is stored locally on your device.</li>
    </ul>
  </div>

  <h2>1. Information We Collect</h2>

  <h3>a. Audio recordings and transcripts you create</h3>
  <p>When you complete a voice drill or mock interview, the App records your spoken
  answer and sends the audio to our transcription provider to convert it to text,
  and then sends that text to our AI provider to generate coaching feedback and
  practice questions. Audio and transcripts are processed to deliver the feature
  you requested and are not used to identify you.</p>

  <h3>b. Practice content and progress</h3>
  <p>Your drills, scores, rep counts, saved prep kits, and similar progress data
  are stored <strong>locally on your device</strong>. We do not maintain a copy of
  this content on our servers.</p>

  <h3>c. Usage analytics</h3>
  <p>We collect privacy-preserving, product analytics events (for example: app
  opened, a drill was completed, a category was selected, a screen was viewed, and
  associated metadata such as a numeric score or selected role). These events are
  designed to be free of personal data. <strong>We never include the content of
  your recordings, transcripts, names, or email addresses in analytics.</strong></p>

  <h3>d. Subscription information</h3>
  <p>Subscriptions are processed by Apple and managed through our subscription
  provider, RevenueCat. We receive subscription status (for example, whether you
  have an active subscription and when it renews or expires) and an anonymous
  subscriber identifier. We do not receive your full payment card details; those
  are handled by Apple.</p>

  <h3>e. Information collected automatically</h3>
  <p>Like most apps, our service providers may process limited technical data such
  as device type, operating system version, app version, and IP address (used for
  security and rate limiting and not stored long-term to profile you).</p>

  <h2>2. How We Use Information</h2>
  <ul>
    <li>To transcribe your recordings and generate AI coaching feedback, questions, and prep materials.</li>
    <li>To operate, maintain, and secure the App, including preventing abuse and limiting request rates.</li>
    <li>To understand how features are used, in aggregate, so we can improve the product.</li>
    <li>To manage subscriptions and entitlements.</li>
  </ul>

  <h2>3. Third-Party Service Providers</h2>
  <p>We share the minimum information necessary with the following processors so
  the App can function:</p>
  <table>
    <tr><th>Provider</th><th>Purpose</th><th>Data shared</th></tr>
    <tr><td>OpenAI (Whisper API)</td><td>Speech-to-text transcription</td><td>Your audio recordings</td></tr>
    <tr><td>Anthropic (Claude API)</td><td>AI feedback, questions, and prep content</td><td>Your transcribed text and inputs (e.g., target role/company)</td></tr>
    <tr><td>RevenueCat / Apple</td><td>Subscription processing and management</td><td>Subscription status, anonymous identifier</td></tr>
    <tr><td>PostHog</td><td>Privacy-preserving product analytics</td><td>Anonymous usage events (no transcripts or contact info)</td></tr>
  </table>
  <p>These providers are bound by their own terms and privacy commitments and act
  as processors on our behalf. We do not sell your personal information, and we do
  not use your recordings or transcripts to serve advertising.</p>

  <h2>4. AI Processing</h2>
  <p>To deliver coaching, your transcribed answers are processed by third-party AI
  models. We instruct our providers to process this content to return your result.
  Please avoid including sensitive personal information in your spoken answers that
  you would not want processed by an AI service.</p>

  <h2>5. Data Retention</h2>
  <p>Practice content stored on your device remains until you delete it or uninstall
  the App. Audio and transcripts are processed transiently to produce your results
  and are subject to our providers' retention practices. Analytics events are
  retained in aggregate for product analysis. You can clear local data at any time
  from within the App or by uninstalling it.</p>

  <h2>6. Your Choices and Rights</h2>
  <ul>
    <li><strong>Local data:</strong> You can delete your practice history on your device or uninstall the App to remove locally stored content.</li>
    <li><strong>Microphone:</strong> You can revoke microphone access in your device settings at any time (the recording features will not work without it).</li>
    <li><strong>Access / deletion requests:</strong> Depending on your location (including under the GDPR and CCPA/CPRA), you may have rights to access, correct, or delete personal data and to opt out of "sale" or "sharing" of personal information. We do not sell personal information. To make a request, email us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</li>
  </ul>

  <h2>7. Children's Privacy</h2>
  <p>The App is not directed to children under 13 (or the minimum age required in
  your jurisdiction), and we do not knowingly collect personal information from
  them. If you believe a child has provided us information, contact us and we will
  delete it.</p>

  <h2>8. International Users</h2>
  <p>We and our service providers may process information in the United States and
  other countries. By using the App, you understand your information may be
  transferred to and processed in countries that may have different data protection
  laws than your own.</p>

  <h2>9. Security</h2>
  <p>We use reasonable technical and organizational measures to protect information,
  including keeping AI provider credentials on our servers rather than in the app.
  No method of transmission or storage is completely secure, and we cannot
  guarantee absolute security.</p>

  <h2>10. Changes to This Policy</h2>
  <p>We may update this Privacy Policy from time to time. We will revise the "Last
  updated" date above and, where appropriate, provide additional notice.</p>

  <h2>11. Contact Us</h2>
  <p>If you have questions about this Privacy Policy or your data, contact us at
  <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
  `
);

export const homeHtml = page(
  'Finance Interview Coach',
  `
  <nav class="site-nav" aria-label="Site navigation">
    <div class="brand">${COMPANY}</div>
    <div class="nav-links">
      <a href="#coverage">Coverage</a>
      <a href="#workflow">How it works</a>
      <a href="#pricing">Pricing</a>
      <a href="/finance-interview-prep">Try browser prep</a>
    </div>
  </nav>

  <section class="marketing-hero">
    <div>
      <p class="eyebrow">Voice-first finance interview prep</p>
      <h1>Practice finance answers before the room gets quiet.</h1>
      <p class="lead">CHRM turns technicals, fit questions, resume walkthroughs, and HireVue prep
      into spoken reps with scored feedback and a tighter answer to practice next.</p>
      <div class="cta-row">
        <a class="cta primary" href="https://apps.apple.com/app/id6759968325">View on the App Store</a>
        <a class="cta secondary" href="/finance-interview-prep">Try it in your browser</a>
      </div>
      <div class="hero-proof" aria-label="Trust signals">
        <span>Technical answer grading</span>
        <span>Voice-first reps</span>
        <span>Built for recruiting season</span>
      </div>
    </div>
    <div class="device-stage" aria-label="CHRM app screenshots">
      <div class="phone-frame">
        <img src="/screenshots/6.9-inch/3-finance.png" alt="CHRM finance question bank screen" />
      </div>
      <div class="phone-frame secondary">
        <img src="/screenshots/6.9-inch/2-feedback.png" alt="CHRM feedback score screen" />
      </div>
    </div>
  </section>

  <section class="section" id="coverage">
    <div class="section-head">
      <div class="section-kicker">Question-bank coverage</div>
      <h2>Practice the categories candidates usually only read.</h2>
      <p class="lead">The free app path focuses on the reps that matter most when recruiting gets real:
      technical precision, concise story structure, and calm delivery.</p>
    </div>
    <div class="coverage-grid" aria-label="CHRM question bank coverage">
      <article class="coverage-card"><strong>Investment Banking</strong><p>Accounting, valuation, DCF, M&A, LBO basics, and markets awareness.</p></article>
      <article class="coverage-card"><strong>Private Equity</strong><p>LBO drivers, deal sense, investment judgment, and value creation.</p></article>
      <article class="coverage-card"><strong>Markets</strong><p>Stock pitches, macro views, product knowledge, and trade logic.</p></article>
      <article class="coverage-card"><strong>Behavioral</strong><p>STAR stories, leadership, failure, teamwork, and motivation.</p></article>
      <article class="coverage-card"><strong>HireVue</strong><p>Timed one-way answers with concise structure and full-session debriefs.</p></article>
    </div>
  </section>

  <section class="section" id="workflow">
    <div class="section-head">
      <div class="section-kicker">How it works</div>
      <h2>A complete practice loop, not another guide.</h2>
    </div>
    <div class="steps" aria-label="CHRM practice workflow">
      <article class="step"><strong>Record</strong><p>Answer the prompt out loud so you train the same muscles the interview uses.</p></article>
      <article class="step"><strong>Transcript</strong><p>CHRM converts your spoken answer into text without putting API keys in the client.</p></article>
      <article class="step"><strong>Scored feedback</strong><p>Get graded against the reference answer, key points, and delivery clarity.</p></article>
      <article class="step"><strong>Sharper redo</strong><p>Practice the tighter version immediately while the correction is still fresh.</p></article>
    </div>
  </section>

  <section class="section" id="sample-feedback">
    <div class="section-head">
      <div class="section-kicker">Sample coaching</div>
      <h2>Specific enough to improve the next answer.</h2>
    </div>
    <div class="sample">
      <div class="score">6/10</div>
      <div>
        <h3>Walk me through how depreciation flows through the three statements.</h3>
        <ul>
          <li><strong>What worked:</strong> You identified depreciation as a non-cash expense.</li>
          <li><strong>Improve:</strong> Add the tax shield and explicitly tie the balance sheet.</li>
          <li><strong>Redo:</strong> CHRM gives the tighter statement path to practice immediately.</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section" id="pricing">
    <div class="section-head">
      <div class="section-kicker">Pricing</div>
      <h2>Start free. Upgrade when recruiting season gets serious.</h2>
      <p class="lead">Free features stay useful on web and mobile. CHRM Pro unlocks deeper prep,
      unlimited reps, company kits, mock interviews, and HireVue simulations.</p>
    </div>
    <div class="pricing" aria-label="CHRM Pro pricing">
      <article class="price-card">
        <div class="price">$7.99 <span>/ month</span></div>
        <p>Flexible access when interviews are close.</p>
      </article>
      <article class="price-card">
        <div class="price">$59.99 <span>/ year</span></div>
        <p>Best for students building a full recruiting habit.</p>
      </article>
    </div>
    <div class="cta-row">
      <a class="cta primary" href="https://apps.apple.com/app/id6759968325">Get it on the App Store</a>
      <a class="cta secondary" href="/finance-interview-prep">Try browser prep</a>
    </div>
  </section>

  <section class="section">
    <div class="proof-grid" aria-label="Product proof points">
      <article class="proof"><strong>10 min</strong><p>Enough time for a realistic drill, score, and next-answer rewrite.</p></article>
      <article class="proof"><strong>4 modes</strong><p>Behavioral, technical, resume walkthrough, and one-way interview practice.</p></article>
      <article class="proof"><strong>Private by design</strong><p>No account required. Recordings are processed for feedback, not sold or used for ads.</p></article>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div class="section-kicker">FAQ</div>
      <h2>What candidates ask before trying it.</h2>
    </div>
    <div class="faq-grid">
      <article class="faq"><strong>Is this just flashcards?</strong><p>No. The core product is spoken practice: answer, transcript, scored feedback, and redo.</p></article>
      <article class="faq"><strong>Can I use it without the iPhone app?</strong><p>The browser prep page gives you a working sample loop. The full mobile app has the broader native experience.</p></article>
      <article class="faq"><strong>What happens to recordings?</strong><p>They are processed to create transcripts and feedback. CHRM does not sell recordings or use them for ads.</p></article>
      <article class="faq"><strong>Who is it for?</strong><p>Students and early-career candidates recruiting for IB, PE, markets, consulting, and adjacent finance roles.</p></article>
    </div>
  </section>
  `,
  {
    description:
      'CHRM is a voice-first finance interview coach for IB, PE, markets, consulting, behavioral, resume, and HireVue practice.',
    url: 'https://chrm-two.vercel.app/',
    hideBrand: true,
  }
);

export const financeInterviewPrepHtml = page(
  'Finance Interview Reps',
  `
  <section class="prep-hero">
    <div class="prep-copy">
      <div>
        <p class="updated">Finance interview reps in the browser</p>
        <h1>Practice the answer, get graded, then run the redo.</h1>
        <p class="lead">CHRM now lets candidates do the actual prep loop on this page:
        choose a finance track, answer by voice or typing, get scored feedback, and
        immediately tighten the next rep.</p>
        <div class="trust-row" aria-label="Finance prep signals">
          <span class="trust-pill">IB technicals</span>
          <span class="trust-pill">PE deal sense</span>
          <span class="trust-pill">Markets and fit</span>
          <span class="trust-pill">Spoken delivery</span>
        </div>
      </div>
      <div>
        <div class="prep-stats" aria-label="Practice stats">
          <div class="prep-stat"><strong id="rep-count">0</strong><span>Reps done</span></div>
          <div class="prep-stat"><strong id="best-score">--</strong><span>Best score</span></div>
          <div class="prep-stat"><strong>5</strong><span>Free reps</span></div>
        </div>
        <div class="browser-note">
          This is the browser version of the app workflow. Voice input works best in Chrome and Safari;
          typed answers work everywhere.
        </div>
      </div>
    </div>

    <div class="workbench" id="prep-app">
      <div class="workbench-top">
        <div>
          <p class="workbench-title">CHRM Prep Console</p>
          <p class="workbench-subtitle">Select a question, answer out loud, review feedback, redo.</p>
        </div>
        <div class="rep-meter" aria-label="Free rep usage">
          <span><b id="meter-label">0 / 5 free reps</b><b id="meter-score">No score yet</b></span>
          <div class="rep-track"><div class="rep-fill" id="rep-fill"></div></div>
        </div>
      </div>

      <div class="workbench-body">
        <div class="control-row">
          <div class="field">
            <label for="track-select">Track</label>
            <select id="track-select"></select>
          </div>
          <div class="field">
            <label for="question-select">Question</label>
            <select id="question-select"></select>
          </div>
          <div class="field">
            <label for="role-input">Target role</label>
            <select id="role-input">
              <option>Investment Banking Summer Analyst</option>
              <option>Private Equity Analyst</option>
              <option>Sales and Trading Analyst</option>
              <option>Consulting Analyst</option>
            </select>
          </div>
        </div>

        <div class="question-card">
          <div>
            <div class="question-meta">
              <span id="question-track">Technical</span>
              <span id="question-difficulty">Core</span>
              <span id="question-focus">Accounting</span>
            </div>
            <h2 id="question-text">Loading question...</h2>
          </div>
          <div>
            <button class="reference-toggle" id="reference-toggle" type="button">Show what interviewers listen for</button>
            <p class="reference-answer" id="reference-answer"></p>
          </div>
        </div>

        <div class="answer-zone" id="answer-zone">
          <textarea class="transcript-box" id="transcript" placeholder="Answer here, or use voice and your transcript will appear in this box."></textarea>
          <div class="action-row">
            <button class="button dark" id="record-button" type="button"><span class="recording-dot"></span> Start voice answer</button>
            <button class="button primary" id="grade-button" type="button">Grade answer</button>
            <button class="button" id="next-button" type="button">Next question</button>
            <button class="button" id="redo-button" type="button">Redo this rep</button>
          </div>
          <div class="status-line" id="status-line">Ready for your first rep.</div>
        </div>

        <div class="feedback-panel" id="feedback-panel" aria-live="polite">
          <div class="feedback-head">
            <div class="feedback-score" id="feedback-score">--</div>
            <div>
              <h3 id="feedback-title">Feedback will appear here.</h3>
              <p id="feedback-summary">Submit an answer to get CHRM-style coaching.</p>
            </div>
          </div>
          <div class="feedback-grid">
            <div class="feedback-block">
              <strong>What worked</strong>
              <ul id="strong-list"></ul>
            </div>
            <div class="feedback-block">
              <strong>Improve</strong>
              <ul id="improve-list"></ul>
            </div>
            <div class="feedback-block model-answer">
              <strong>Tighter version to practice next</strong>
              <p id="model-answer"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div class="section-kicker">Why this feels different</div>
      <h2>The page is no longer just a pitch. It is a working rep loop.</h2>
      <p class="lead">The App Store link still matters, but candidates should feel the product in
      the browser first: question bank, recording, scoring, corrected answer, and progress.</p>
    </div>
    <div class="feature-grid" aria-label="Finance interview prep workflow">
      <article class="feature">
        <strong>Answer capture</strong>
        <p>Students can speak or type directly on the page instead of joining an early-access list first.</p>
      </article>
      <article class="feature">
        <strong>Technical grading</strong>
        <p>Responses are graded against reference answers and key points through the existing CHRM feedback API.</p>
      </article>
      <article class="feature">
        <strong>Redo loop</strong>
        <p>The corrected answer stays visible so users can immediately record a sharper second take.</p>
      </article>
    </div>
  </section>

  <script>
    (function () {
      var questions = [
        {
          id: 'depreciation',
          track: 'IB Technical',
          difficulty: 'Core',
          focus: 'Accounting',
          question: 'Walk me through how depreciation flows through the three financial statements.',
          reference: 'Depreciation reduces EBIT and pre-tax income, lowering net income by depreciation times one minus the tax rate. On the cash flow statement, you add depreciation back because it is non-cash. On the balance sheet, PP&E decreases by depreciation, cash increases by the tax savings, and retained earnings decreases by the after-tax hit to net income.',
          keyPoints: ['Depreciation reduces EBIT and net income', 'Add back depreciation on cash flow statement', 'Cash rises by the tax shield', 'PP&E decreases', 'Retained earnings decreases by after-tax depreciation']
        },
        {
          id: 'dcf',
          track: 'IB Technical',
          difficulty: 'Core',
          focus: 'Valuation',
          question: 'Walk me through a DCF.',
          reference: 'Project free cash flow, discount those cash flows using WACC, calculate terminal value with either a perpetuity growth method or exit multiple, discount the terminal value, add the present values together for enterprise value, then bridge to equity value by subtracting net debt and other claims.',
          keyPoints: ['Project free cash flow', 'Use WACC to discount unlevered FCF', 'Calculate terminal value', 'Discount terminal value', 'Bridge enterprise value to equity value']
        },
        {
          id: 'ev-equity',
          track: 'IB Technical',
          difficulty: 'Core',
          focus: 'Valuation',
          question: 'Explain the difference between enterprise value and equity value.',
          reference: 'Equity value is the value attributable to common shareholders. Enterprise value is the value of the entire operating business available to all capital providers. You calculate enterprise value as equity value plus debt, preferred stock, and minority interest, minus cash and equivalents.',
          keyPoints: ['Equity value belongs to common shareholders', 'Enterprise value values operations for all capital providers', 'Add debt, preferred stock, minority interest', 'Subtract cash', 'Use EV for capital-structure-neutral multiples']
        },
        {
          id: 'lbo-drivers',
          track: 'PE / LBO',
          difficulty: 'Intermediate',
          focus: 'Returns',
          question: 'What are the main drivers of returns in an LBO?',
          reference: 'The main drivers are entry multiple, exit multiple, leverage, EBITDA growth, margin expansion, free cash flow generation, and debt paydown. Strong returns usually come from buying at a reasonable price, improving or growing EBITDA, using cash flow to reduce debt, and exiting at a stable or higher multiple.',
          keyPoints: ['Entry and exit multiple', 'Leverage at purchase', 'EBITDA growth', 'Margin expansion', 'Free cash flow and debt paydown', 'Multiple expansion or contraction']
        },
        {
          id: 'stock-pitch',
          track: 'Markets',
          difficulty: 'Intermediate',
          focus: 'Stock pitch',
          question: 'Pitch me a stock in under 90 seconds.',
          reference: 'A strong pitch names the company and recommendation, gives a concise thesis, explains key catalysts, supports valuation with a clear method or multiple, identifies risks, and ends with why the market is mispricing the opportunity.',
          keyPoints: ['Clear buy/sell/hold recommendation', 'Concise investment thesis', 'Catalysts', 'Valuation support', 'Key risks', 'Why market is mispricing it']
        },
        {
          id: 'why-banking',
          track: 'Fit',
          difficulty: 'Core',
          focus: 'Motivation',
          question: 'Why investment banking?',
          reference: 'A strong answer connects your past experiences to banking, shows you understand the job, and explains why the learning curve, transaction exposure, analytical rigor, and team environment fit your goals. It should be specific and not just say you like finance or want to work hard.',
          keyPoints: ['Connect past experience to banking', 'Show understanding of the analyst role', 'Mention transactions and analytical work', 'Explain fit with goals', 'Avoid generic prestige or money answers']
        }
      ];

      var state = {
        currentIndex: 0,
        reps: Number(localStorage.getItem('chrm_web_reps') || '0'),
        best: Number(localStorage.getItem('chrm_web_best') || '0'),
        recognition: null,
        recording: false
      };

      var els = {
        trackSelect: document.getElementById('track-select'),
        questionSelect: document.getElementById('question-select'),
        roleInput: document.getElementById('role-input'),
        questionTrack: document.getElementById('question-track'),
        questionDifficulty: document.getElementById('question-difficulty'),
        questionFocus: document.getElementById('question-focus'),
        questionText: document.getElementById('question-text'),
        referenceToggle: document.getElementById('reference-toggle'),
        referenceAnswer: document.getElementById('reference-answer'),
        transcript: document.getElementById('transcript'),
        recordButton: document.getElementById('record-button'),
        gradeButton: document.getElementById('grade-button'),
        nextButton: document.getElementById('next-button'),
        redoButton: document.getElementById('redo-button'),
        statusLine: document.getElementById('status-line'),
        feedbackPanel: document.getElementById('feedback-panel'),
        feedbackScore: document.getElementById('feedback-score'),
        feedbackTitle: document.getElementById('feedback-title'),
        feedbackSummary: document.getElementById('feedback-summary'),
        strongList: document.getElementById('strong-list'),
        improveList: document.getElementById('improve-list'),
        modelAnswer: document.getElementById('model-answer'),
        repCount: document.getElementById('rep-count'),
        bestScore: document.getElementById('best-score'),
        meterLabel: document.getElementById('meter-label'),
        meterScore: document.getElementById('meter-score'),
        repFill: document.getElementById('rep-fill'),
        answerZone: document.getElementById('answer-zone')
      };

      function uniqueTracks() {
        return questions.map(function (q) { return q.track; }).filter(function (track, index, arr) {
          return arr.indexOf(track) === index;
        });
      }

      function currentQuestion() {
        var filtered = filteredQuestions();
        return filtered[state.currentIndex % filtered.length] || questions[0];
      }

      function filteredQuestions() {
        var track = els.trackSelect.value;
        return questions.filter(function (q) { return !track || q.track === track; });
      }

      function fillSelects() {
        uniqueTracks().forEach(function (track) {
          var option = document.createElement('option');
          option.value = track;
          option.textContent = track;
          els.trackSelect.appendChild(option);
        });
        fillQuestionSelect();
      }

      function fillQuestionSelect() {
        els.questionSelect.innerHTML = '';
        filteredQuestions().forEach(function (q, index) {
          var option = document.createElement('option');
          option.value = String(index);
          option.textContent = q.question.length > 46 ? q.question.slice(0, 46) + '...' : q.question;
          els.questionSelect.appendChild(option);
        });
      }

      function renderQuestion() {
        var q = currentQuestion();
        els.questionTrack.textContent = q.track;
        els.questionDifficulty.textContent = q.difficulty;
        els.questionFocus.textContent = q.focus;
        els.questionText.textContent = q.question;
        els.referenceAnswer.textContent = q.reference;
        els.referenceAnswer.classList.remove('show');
        els.referenceToggle.textContent = 'Show what interviewers listen for';
        els.questionSelect.value = String(state.currentIndex);
      }

      function renderProgress() {
        els.repCount.textContent = String(state.reps);
        els.bestScore.textContent = state.best ? String(state.best) + '/10' : '--';
        els.meterLabel.textContent = Math.min(state.reps, 5) + ' / 5 free reps';
        els.meterScore.textContent = state.best ? 'Best ' + state.best + '/10' : 'No score yet';
        els.repFill.style.width = String(Math.min(state.reps, 5) / 5 * 100) + '%';
      }

      function setStatus(text) {
        els.statusLine.textContent = text;
      }

      function listItems(el, items) {
        el.innerHTML = '';
        (items && items.length ? items : ['No specific note returned.']).forEach(function (item) {
          var li = document.createElement('li');
          li.textContent = item;
          el.appendChild(li);
        });
      }

      function localFeedback(answer, q) {
        var lower = answer.toLowerCase();
        var hits = q.keyPoints.filter(function (point) {
          return point.toLowerCase().split(/\\W+/).some(function (word) {
            return word.length > 5 && lower.indexOf(word) !== -1;
          });
        });
        var lengthScore = answer.length > 420 ? 2 : answer.length > 180 ? 1 : 0;
        var score = Math.max(3, Math.min(8, 3 + hits.length + lengthScore));
        return {
          score: score,
          strong: hits.length ? ['You covered ' + hits.slice(0, 2).join(' and ') + '.'] : ['You made a real attempt and gave CHRM material to coach.'],
          improve: ['Hit the missing key points explicitly: ' + q.keyPoints.filter(function (p) { return hits.indexOf(p) === -1; }).slice(0, 2).join(', ') + '.'],
          stronger_version: q.reference
        };
      }

      async function gradeAnswer() {
        var q = currentQuestion();
        var answer = els.transcript.value.trim();
        if (!answer) {
          setStatus('Add an answer first. A few sentences is enough for a first rep.');
          els.transcript.focus();
          return;
        }
        els.gradeButton.disabled = true;
        setStatus('Grading your answer...');
        try {
          var res = await fetch('/api/technical-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transcript: answer,
              question: q.question,
              referenceAnswer: q.reference,
              keyPoints: q.keyPoints,
              role: els.roleInput.value
            })
          });
          if (!res.ok) throw new Error('feedback failed');
          showFeedback(await res.json());
          setStatus('Feedback ready. Redo this rep while the fix is fresh.');
        } catch (err) {
          showFeedback(localFeedback(answer, q));
          setStatus('Showing local feedback because the AI grader was unavailable.');
        } finally {
          els.gradeButton.disabled = false;
        }
      }

      function showFeedback(feedback) {
        var score = Math.round(Number(feedback.score || 0));
        state.reps += 1;
        state.best = Math.max(state.best, score);
        localStorage.setItem('chrm_web_reps', String(state.reps));
        localStorage.setItem('chrm_web_best', String(state.best));
        renderProgress();

        els.feedbackScore.textContent = score + '/10';
        els.feedbackTitle.textContent = score >= 8 ? 'Strong answer. Tighten the edges.' : score >= 6 ? 'Good base. Make it cleaner.' : 'Useful rep. Rebuild the structure.';
        els.feedbackSummary.textContent = 'CHRM graded against the reference answer and the key points an interviewer listens for.';
        listItems(els.strongList, feedback.strong || feedback.whatWorked);
        listItems(els.improveList, feedback.improve);
        els.modelAnswer.textContent = feedback.stronger_version || feedback.strongerVersion || currentQuestion().reference;
        els.feedbackPanel.classList.add('show');
      }

      function nextQuestion() {
        state.currentIndex = (state.currentIndex + 1) % filteredQuestions().length;
        els.transcript.value = '';
        els.feedbackPanel.classList.remove('show');
        renderQuestion();
        setStatus('New question loaded.');
      }

      function redoRep() {
        els.transcript.value = '';
        els.transcript.focus();
        setStatus('Redo mode: answer the same question again with the tighter version in mind.');
      }

      function speechRecognitionCtor() {
        return window.SpeechRecognition || window.webkitSpeechRecognition;
      }

      function toggleRecording() {
        var SpeechRecognition = speechRecognitionCtor();
        if (!SpeechRecognition) {
          setStatus('Voice input is not supported in this browser. Type your answer instead.');
          return;
        }
        if (state.recording && state.recognition) {
          state.recognition.stop();
          return;
        }
        var recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        var finalText = els.transcript.value ? els.transcript.value + ' ' : '';
        recognition.onresult = function (event) {
          var interim = '';
          for (var i = event.resultIndex; i < event.results.length; i += 1) {
            var part = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalText += part + ' ';
            else interim += part;
          }
          els.transcript.value = finalText + interim;
        };
        recognition.onerror = function () {
          setStatus('Voice input stopped. You can keep typing or try recording again.');
        };
        recognition.onend = function () {
          state.recording = false;
          els.answerZone.classList.remove('recording');
          els.recordButton.textContent = 'Start voice answer';
          setStatus('Recording stopped. Grade when you are ready.');
        };
        state.recognition = recognition;
        state.recording = true;
        els.answerZone.classList.add('recording');
        els.recordButton.innerHTML = '<span class="recording-dot"></span> Stop recording';
        recognition.start();
        setStatus('Recording. Speak your answer naturally.');
      }

      els.trackSelect.addEventListener('change', function () {
        state.currentIndex = 0;
        fillQuestionSelect();
        els.transcript.value = '';
        els.feedbackPanel.classList.remove('show');
        renderQuestion();
      });
      els.questionSelect.addEventListener('change', function () {
        state.currentIndex = Number(els.questionSelect.value || '0');
        els.transcript.value = '';
        els.feedbackPanel.classList.remove('show');
        renderQuestion();
      });
      els.referenceToggle.addEventListener('click', function () {
        var showing = els.referenceAnswer.classList.toggle('show');
        els.referenceToggle.textContent = showing ? 'Hide what interviewers listen for' : 'Show what interviewers listen for';
      });
      els.gradeButton.addEventListener('click', gradeAnswer);
      els.nextButton.addEventListener('click', nextQuestion);
      els.redoButton.addEventListener('click', redoRep);
      els.recordButton.addEventListener('click', toggleRecording);

      fillSelects();
      renderQuestion();
      renderProgress();
    })();
  </script>
  `
);

export const supportHtml = page(
  'Support',
  `
  <h1>Support</h1>
  <p class="updated">Last updated: ${LAST_UPDATED}</p>

  <p>If you need help with ${COMPANY}, email
  <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>. Include the device you
  are using, what you were trying to do, and any error message you saw so we can
  help faster.</p>

  <div class="card">
    <strong>Common support topics</strong>
    <ul>
      <li>Question generation, prep kits, voice drills, and mock interviews.</li>
      <li>Subscription access or restore-purchase issues.</li>
      <li>Privacy, data handling, or account questions.</li>
      <li>Bug reports and feature requests.</li>
    </ul>
  </div>

  <p>Subscriptions are billed through Apple. You can manage, cancel, or request
  help with App Store billing in your Apple ID settings.</p>
  `
);

export const termsHtml = page(
  'Terms of Use',
  `
  <h1>Terms of Use (EULA)</h1>
  <p class="updated">Last updated: ${LAST_UPDATED}</p>

  <p>These Terms of Use ("Terms") govern your use of the ${COMPANY} application and
  services (the "App"). By downloading, accessing, or using the App, you agree to
  these Terms. If you do not agree, do not use the App. This is the End User License
  Agreement between you and ${COMPANY}.</p>

  <h2>1. License</h2>
  <p>Subject to these Terms, we grant you a personal, limited, non-exclusive,
  non-transferable, revocable license to use the App for your own
  non-commercial use. This license is the standard Apple Licensed Application End
  User License Agreement (the "Apple Standard EULA"), as supplemented by these
  Terms. You may review the Apple Standard EULA at
  <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">https://www.apple.com/legal/internet-services/itunes/dev/stdeula/</a>.</p>

  <h2>2. Subscriptions and Auto-Renewal</h2>
  <p>${COMPANY} offers an auto-renewable subscription ("${COMPANY} Pro") that unlocks
  premium features such as unlimited drills, company prep kits, AI mock interviews,
  and HireVue-style simulations.</p>
  <ul>
    <li><strong>Pricing:</strong> $7.99 per month or $59.99 per year. Prices may
    vary by region and are shown in the App before purchase.</li>
    <li><strong>Billing:</strong> Payment is charged to your Apple ID account at
    confirmation of purchase.</li>
    <li><strong>Auto-renewal:</strong> Your subscription automatically renews for
    the same period unless you cancel at least 24 hours before the end of the
    current period. Your account is charged for renewal within 24 hours prior to
    the end of the current period.</li>
    <li><strong>Managing and cancelling:</strong> You can manage or cancel your
    subscription in your device's App Store account settings. Cancellation takes
    effect at the end of the current billing period.</li>
    <li><strong>Refunds:</strong> Purchases are handled by Apple and are subject to
    Apple's refund policies. Except where required by law, payments are
    non-refundable.</li>
  </ul>

  <h2>3. Acceptable Use</h2>
  <p>You agree not to:</p>
  <ul>
    <li>Use the App for any unlawful purpose or in violation of these Terms.</li>
    <li>Reverse engineer, decompile, or attempt to extract source code, except as permitted by law.</li>
    <li>Interfere with, overload, or abuse the service, including its AI endpoints or rate limits.</li>
    <li>Upload content you do not have the right to share, or content that is unlawful, infringing, or harmful.</li>
  </ul>

  <h2>4. AI-Generated Content</h2>
  <p>The App uses artificial intelligence to generate practice questions, feedback,
  scores, and prep materials. This content is provided for practice and educational
  purposes only. It may be inaccurate or incomplete and does not constitute
  professional, career, legal, or other advice. You are responsible for how you use
  it, and outcomes (including interview results) are not guaranteed.</p>

  <h2>5. Your Content</h2>
  <p>You retain ownership of the recordings and inputs you create. You grant us a
  limited license to process that content through our service providers solely to
  provide the App's features to you, as described in our
  <a href="/privacy">Privacy Policy</a>.</p>

  <h2>6. Intellectual Property</h2>
  <p>The App, including its design, text, graphics, and software, is owned by
  ${COMPANY} and protected by intellectual property laws. These Terms do not grant
  you any rights to our trademarks or branding.</p>

  <h2>7. Disclaimers</h2>
  <p>THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
  WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
  PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE APP WILL BE
  UNINTERRUPTED, ERROR-FREE, OR THAT AI OUTPUTS WILL BE ACCURATE.</p>

  <h2>8. Limitation of Liability</h2>
  <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${COMPANY} WILL NOT BE LIABLE FOR ANY
  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
  DATA, PROFITS, OR GOODWILL, ARISING FROM YOUR USE OF THE APP. OUR TOTAL LIABILITY
  FOR ANY CLAIM RELATING TO THE APP WILL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12
  MONTHS BEFORE THE CLAIM.</p>

  <h2>9. Termination</h2>
  <p>We may suspend or terminate your access to the App if you violate these Terms.
  You may stop using the App at any time. Provisions that by their nature should
  survive termination will survive.</p>

  <h2>10. Third-Party Terms</h2>
  <p>The App relies on third-party services (including Apple, OpenAI, Anthropic, and
  RevenueCat). Your use may also be subject to their terms. Apple and its
  subsidiaries are third-party beneficiaries of these Terms and may enforce them
  against you as a user of an Apple-distributed application.</p>

  <h2>11. Governing Law</h2>
  <p>These Terms are governed by the laws of the United States and the state in
  which ${COMPANY} operates, without regard to conflict-of-laws principles, except
  where local consumer law provides otherwise.</p>

  <h2>12. Changes to These Terms</h2>
  <p>We may update these Terms from time to time. Continued use of the App after
  changes take effect constitutes acceptance of the revised Terms.</p>

  <h2>13. Contact</h2>
  <p>Questions about these Terms? Email
  <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
  `
);
