# CHRM Growth System

## Objective

Drive qualified finance candidates to one promise:

> Practice a real finance interview answer out loud and get scored instantly.

Until the funnel has enough data to justify expanding, every organic campaign should send candidates to:

`https://chrm-two.vercel.app/finance-interview-prep`

## Phase 1 funnel

| Stage | Event | Success signal |
|---|---|---|
| Qualified visit | `marketing_page_view` | Candidate reaches the finance landing page |
| Intent | `marketing_cta_clicked` | Candidate clicks the free-rep CTA |
| Activation start | `finance_rep_started` | Candidate types or records an answer |
| Activation complete | `finance_rep_completed` | Candidate receives a score |
| Product value | `finance_redo_started` | Candidate immediately practices again |
| Learning assist | `finance_reference_opened` | Candidate checks what interviewers want |

Primary Phase 1 metric: **completed finance reps per qualified landing-page visitor**.

Supporting diagnostics:

- CTA click rate
- rep start rate
- rep completion rate
- redo rate
- completion rate by source, campaign, content, question, and input method
- score distribution by campaign (diagnostic only; never optimize toward artificially high scores)

Do not optimize for impressions or likes unless they lead to qualified visits and completed reps.

## Required setup before launch

1. Add `POSTHOG_API_KEY` and `POSTHOG_HOST` to the Vercel server environment.
2. Redeploy the production server.
3. Open the finance page with a test campaign URL and complete one rep.
4. Confirm the PostHog events arrive with UTM properties.
5. Create a PostHog funnel in the event order above.
6. Exclude internal test traffic from decisions by using `utm_source=internal`.

The endpoint silently reports `tracked: false` when PostHog is not configured, so verify this explicitly before distributing links.

## Campaign naming

Use lowercase kebab-case and never publish an untagged campaign link.

```
utm_source=<platform-or-partner>
utm_medium=<organic-social|campus-partner|creator-partner|email|paid>
utm_campaign=finance-reps-launch
utm_content=<creative-or-partner-id>
```

Examples:

```
?utm_source=tiktok&utm_medium=organic-social&utm_campaign=finance-reps-launch&utm_content=dcf-30-sec-v1

?utm_source=linkedin&utm_medium=organic-social&utm_campaign=finance-reps-launch&utm_content=founder-story-v1

?utm_source=utampa-ibs&utm_medium=campus-partner&utm_campaign=finance-reps-launch&utm_content=club-challenge-v1
```

## Channel roles

### Short-form video

Job: create high-volume awareness and turn interview anxiety into an immediate challenge.

Format:

1. Hook in the first three seconds.
2. Show one finance interview question.
3. Demonstrate a weak or incomplete answer.
4. Reveal the CHRM score and one improvement.
5. CTA: "Try the same question free. Link in bio."

### Casey's LinkedIn

Job: create trust through founder credibility, finance experience, and build-in-public progress.

Use first-person stories, actual product decisions, anonymized learnings, and screen recordings. Do not write as though CHRM is an established company with unverified outcomes.

### Campus partners

Job: acquire concentrated groups of qualified candidates.

Offer a no-cost Finance Interview Rep Challenge with a partner-specific link. Do not claim a university endorsement. A club can be described as participating only after it agrees.

### SEO

Job: compound high-intent traffic.

Each page must answer a real recruiting question, include an original example, and lead into one relevant free rep. Do not mass-publish thin AI pages.

## Autonomy guardrails

The growth agent may automatically:

- research themes and questions
- draft scripts, posts, SEO briefs, and landing-page tests
- create campaign links
- prepare GitHub pull requests
- summarize performance
- recommend repeating or stopping a format

Casey approval is required before:

- spending money
- sending cold email or direct messages
- posting from Casey's personal account
- responding publicly to sensitive comments
- changing pricing, positioning, legal copy, or subscription terms
- using a person's name, logo, quote, testimonial, or university affiliation
- publishing claims about outcomes, hiring, acceptance, or score improvement

The agent must never send transcripts, answers, resumes, names, or emails to analytics.

## Weekly operating loop

### Monday

- Review the prior seven days by campaign and content.
- Select three hypotheses.
- Prepare five short-form scripts, three LinkedIn drafts, and one partner batch.
- Create tagged links for every asset.

### Tuesday–Thursday

- Publish approved assets.
- Monitor for broken links or a sharp funnel drop.
- Record qualitative objections and content questions.
- Do not change strategy from one isolated result.

### Friday

Report:

- qualified visits
- completed reps
- completion rate
- redo rate
- best source and creative
- worst source and creative
- what will be repeated
- what will be stopped
- one product insight from user behavior

## Phase 1 decision rule

After the first 100 qualified visits, establish a baseline by source. Continue formats that generate completed reps, revise high-traffic/low-activation formats, and stop formats that produce neither reach nor activation. Paid promotion starts only after at least one organic creative and landing path demonstrate repeatable activation.
