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
function page(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      font-size: 16px;
    }
    .wrap { max-width: 760px; margin: 0 auto; padding: 48px 24px 96px; }
    .brand {
      font-size: 13px; letter-spacing: 3px; text-transform: uppercase;
      color: var(--accent); font-weight: 700; margin-bottom: 8px;
    }
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
    .hero { padding: 24px 0 20px; }
    .lead { max-width: 640px; color: var(--text-secondary); font-size: 18px; }
    .cta-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
    .cta {
      display: inline-flex; align-items: center; justify-content: center;
      min-height: 44px; border-radius: 10px; padding: 0 18px;
      font-weight: 700; text-decoration: none;
    }
    .cta.primary { background: var(--accent); color: #fff; }
    .cta.secondary { border: 1px solid var(--border); color: var(--text); background: var(--surface); }
    .feature-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 28px 0 12px; }
    .feature { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
    .feature strong { display: block; margin-bottom: 8px; }
    .feature p { margin: 0; color: var(--text-secondary); font-size: 15px; line-height: 1.45; }
    @media (max-width: 640px) {
      .feature-grid { grid-template-columns: 1fr; }
      .cta { width: 100%; }
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
    <div class="brand">${COMPANY}</div>
    ${bodyHtml}
    <footer class="muted">
      <p>${COMPANY} — AI Communication Coach. Questions? Email
      <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
      <p><a href="/privacy">Privacy Policy</a> &middot; <a href="/terms">Terms of Use</a></p>
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
  'AI Interview Coach',
  `
  <section class="hero">
    <p class="updated">AI interview coach for high-stakes communication</p>
    <h1>CHRM helps you practice before it counts.</h1>
    <p class="lead">Voice drills, timed simulations, finance interview banks, and
    AI feedback so candidates can build clear, confident answers under pressure.</p>
    <div class="cta-row">
      <a class="cta primary" href="https://apps.apple.com/app/id6759968325">View on the App Store</a>
      <a class="cta secondary" href="/privacy">Privacy Policy</a>
    </div>
  </section>

  <section class="feature-grid" aria-label="CHRM features">
    <article class="feature">
      <strong>Voice practice</strong>
      <p>Record real answers and train the rhythm, clarity, and structure of your delivery.</p>
    </article>
    <article class="feature">
      <strong>Instant feedback</strong>
      <p>Get scores, strengths, improvement points, and sharper sample phrasing after each drill.</p>
    </article>
    <article class="feature">
      <strong>Finance prep</strong>
      <p>Practice investment banking, private equity, behavioral, and resume walkthrough questions.</p>
    </article>
    <article class="feature">
      <strong>Company kits</strong>
      <p>Generate targeted prep plans and role-specific prompts for the companies that matter.</p>
    </article>
  </section>
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
