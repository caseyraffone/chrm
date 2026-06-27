// ─── IB Fit & Motivation question bank ─────────────────────────────────────────
//
// Curated "why banking / why this firm / your story" prompts. Unlike behavioral
// stories, these have a recognizable strong structure, so each carries a model
// framework (reference_answer) and the things an interviewer listens for
// (key_points). Graded via getTechnicalFeedback() against that framework — the
// candidate's specifics fill it in, but the shape and substance are gradeable.
//
// difficulty: 1 = Foundational (free), 2 = Intermediate (Pro), 3 = Advanced (Pro)

export const IB_FIT_BANK = [
  // ── Why Banking ────────────────────────────────────────────────────────────────
  {
    id: 'ib_fit_why_01',
    topic: 'Why Banking',
    difficulty: 1,
    question: 'Why investment banking?',
    reference_answer:
      'A strong answer connects a genuine interest in finance and how companies make strategic decisions to the specific things banking offers: exposure to high-stakes transactions, a steep learning curve, and the chance to work with smart people on real deals. It should sound personal and specific — ideally tied to a class, internship, or experience that sparked the interest — and avoid clichés like “I like working hard” or “the money.”',
    key_points: [
      'Genuine, specific motivation (not money or clichés)',
      'Tie to a real experience: class, internship, project',
      'Name what banking uniquely offers: deals, learning curve, exposure',
    ],
  },
  {
    id: 'ib_fit_why_02',
    topic: 'Why Banking',
    difficulty: 2,
    question: 'Why investment banking and not consulting or corporate finance?',
    reference_answer:
      'A strong answer shows you understand the differences and have a real preference. Banking offers transaction focus, financial rigor, and tangible outcomes — closing a deal — versus consulting’s slower, advisory, recommendation-driven work, or the steadier internal pace of corporate finance. The candidate should frame it around what genuinely draws them: the markets, the deal cadence, and the financial skill set, not by bashing the alternatives.',
    key_points: [
      'Show you understand the actual differences between paths',
      'Express a real, reasoned preference for banking’s transaction focus',
      'Frame positively — don’t trash consulting / corporate finance',
    ],
  },
  {
    id: 'ib_fit_why_03',
    topic: 'Why Banking',
    difficulty: 2,
    question: 'What does an investment banking analyst actually do day to day?',
    reference_answer:
      'A strong answer shows the candidate knows the real job: building financial models and valuations, preparing pitch books and client materials, conducting company and industry research, and supporting deal execution and due diligence — all while managing long hours and senior bankers’ requests. Demonstrating realistic expectations signals the candidate won’t be surprised or quit, which is what the interviewer is checking.',
    key_points: [
      'Modeling/valuation, pitch books, research, deal support, diligence',
      'Realistic about long hours and the support role',
      'Signals you know what you’re signing up for',
    ],
  },

  // ── Why This Firm ──────────────────────────────────────────────────────────────
  {
    id: 'ib_fit_firm_01',
    topic: 'Why This Firm',
    difficulty: 1,
    question: 'Why our firm specifically?',
    reference_answer:
      'A strong answer gives firm-specific reasons that couldn’t be copy-pasted to a competitor: the firm’s strength in a particular product or sector, its culture or deal profile, a recent transaction it advised on, and — most powerfully — people the candidate has spoken with. It should connect those specifics back to the candidate’s own interests and goals.',
    key_points: [
      'Firm-specific reasons, not generic prestige',
      'Reference deals, sector/product strength, or culture',
      'Cite people you’ve networked with; tie back to your goals',
    ],
  },
  {
    id: 'ib_fit_firm_02',
    topic: 'Why This Firm',
    difficulty: 2,
    question: 'Why this group or product — for example M&A versus leveraged finance?',
    reference_answer:
      'A strong answer shows the candidate understands what the group actually does and has a genuine reason for the interest, ideally tied to a relevant experience or skill. They should articulate what excites them about that product — say, the strategic nature of M&A or the structuring and credit focus of leveraged finance — while showing flexibility and that they’ve done their homework on the group.',
    key_points: [
      'Demonstrate you understand the group’s actual work',
      'Genuine, experience-backed reason for the interest',
      'Show enthusiasm plus reasonable flexibility',
    ],
  },
  {
    id: 'ib_fit_firm_03',
    topic: 'Why This Firm',
    difficulty: 2,
    question: 'What makes you different from other candidates we’re seeing?',
    reference_answer:
      'A strong answer names one or two genuine differentiators — a unique experience, a combination of skills, a specific accomplishment — and backs them with evidence rather than adjectives. It should be confident but not arrogant, and ideally tie the differentiator to why it makes the candidate good at the job, not just interesting.',
    key_points: [
      'One or two real differentiators, backed by evidence',
      'Confident, not arrogant; specific, not adjective-stuffed',
      'Connect the differentiator to success in the role',
    ],
  },

  // ── Your Story ─────────────────────────────────────────────────────────────────
  {
    id: 'ib_fit_story_01',
    topic: 'Your Story',
    difficulty: 1,
    question: 'Walk me through your resume.',
    reference_answer:
      'A strong walkthrough is a concise two-to-three-minute narrative, not a line-by-line reading. It moves chronologically, connecting the dots so each step logically leads to the next and builds toward wanting this job. It highlights a few key experiences and the skills gained, shows increasing interest in finance, and ends with why banking and why now.',
    key_points: [
      'Concise narrative (~2–3 min), not a line-by-line read',
      'Chronological with a logical thread connecting each step',
      'Builds to “why banking, why now,” highlighting key experiences',
    ],
  },
  {
    id: 'ib_fit_story_02',
    topic: 'Your Story',
    difficulty: 1,
    question: 'Tell me about yourself.',
    reference_answer:
      'A strong answer is a tight, structured pitch — usually a quick present (who you are and what you’re studying or doing), past (the key experiences that shaped your interest), and future (why this role is the logical next step). It stays professional and relevant, lasts a minute or two, and leaves the interviewer with a clear sense of your trajectory toward banking.',
    key_points: [
      'Present → past → future structure',
      'Tight and relevant (~1–2 min), professional',
      'Leaves a clear sense of trajectory toward banking',
    ],
  },
  {
    id: 'ib_fit_story_03',
    topic: 'Your Story',
    difficulty: 2,
    question: 'Pick one experience on your resume and tell me about it in depth.',
    reference_answer:
      'A strong answer goes beyond what’s written: the context, what the candidate specifically did, the challenges, and the impact — ideally quantified. It should reveal transferable skills like analytical rigor, ownership, or working under pressure, and the candidate should be ready to go deeper on any technical or analytical work involved.',
    key_points: [
      'Go beyond the bullet: context, your actions, challenges, impact',
      'Quantify results where possible',
      'Surface transferable skills; be ready to go deeper',
    ],
  },
  {
    id: 'ib_fit_story_04',
    topic: 'Your Story',
    difficulty: 2,
    question: 'Why did you choose your major and your school?',
    reference_answer:
      'A strong answer frames the choices as deliberate and connected to the candidate’s interests and goals, even if the path wasn’t a straight line. It shows self-awareness and a sense of direction — for example, how a major built analytical skills relevant to finance — rather than sounding accidental or apologetic.',
    key_points: [
      'Frame choices as deliberate and goal-connected',
      'Show self-awareness, even if the path wasn’t linear',
      'Link the skills gained to finance / the role',
    ],
  },

  // ── Goals & Curveballs ─────────────────────────────────────────────────────────
  {
    id: 'ib_fit_goal_01',
    topic: 'Goals & Curveballs',
    difficulty: 1,
    question: 'What are you looking for in a job?',
    reference_answer:
      'A strong answer aligns the candidate’s wants with what banking actually delivers: a steep learning curve, high responsibility early, smart colleagues, and meaningful, challenging work. It should sound authentic and be consistent with the rest of the candidate’s story, avoiding red flags like emphasizing work-life balance or comfort.',
    key_points: [
      'Align wants with what banking actually offers',
      'Authentic and consistent with your broader story',
      'Avoid red flags (over-emphasizing balance/comfort)',
    ],
  },
  {
    id: 'ib_fit_goal_02',
    topic: 'Goals & Curveballs',
    difficulty: 2,
    question: 'Where do you see yourself in five years?',
    reference_answer:
      'A strong answer shows ambition and commitment to the path without sounding like you’re using the analyst role as a quick stepping stone. Expressing a desire to grow within banking, take on more responsibility, and become a trusted advisor works well; naming a vague exit too eagerly is a red flag. Show drive and a realistic sense of progression.',
    key_points: [
      'Ambition and commitment to the banking path',
      'Avoid signaling banking is just a quick stepping stone',
      'Realistic progression: more responsibility, advisory role',
    ],
  },
  {
    id: 'ib_fit_goal_03',
    topic: 'Goals & Curveballs',
    difficulty: 2,
    question: 'Why should we hire you?',
    reference_answer:
      'A strong answer is a confident, evidence-backed summary of fit: the relevant skills, the genuine motivation, and the cultural match, each supported by a quick proof point. It should directly address what the firm needs from an analyst — reliability, analytical ability, work ethic — and close with real enthusiasm for the role.',
    key_points: [
      'Confident summary of skills, motivation, and fit',
      'Back each claim with a quick proof point',
      'Map to what an analyst must deliver; close with enthusiasm',
    ],
  },
  {
    id: 'ib_fit_goal_04',
    topic: 'Goals & Curveballs',
    difficulty: 3,
    question: 'The hours in banking are brutal. How do you know you can handle them?',
    reference_answer:
      'A strong answer doesn’t dismiss the hours or pretend they’re easy — it shows clear-eyed awareness and points to concrete evidence of having thrived under sustained pressure before, like a demanding internship, sport, or course load alongside commitments. It conveys genuine motivation that makes the hours worth it and a realistic plan for sustaining energy, not bravado.',
    key_points: [
      'Acknowledge the reality honestly — no bravado',
      'Cite concrete prior experience thriving under pressure',
      'Show motivation that justifies the hours, plus a sustainable approach',
    ],
  },
  {
    id: 'ib_fit_why_04',
    topic: 'Why Banking',
    difficulty: 3,
    question: 'Why pursue banking now, rather than staying on your current path?',
    reference_answer:
      'A strong answer frames the switch as intentional progression, not escape. It connects what the candidate has done so far to skills and interests that banking builds on, articulates what specifically drew them to make the move now — a class, a project, an experience that crystallized it — and shows they understand what they’re giving up and why banking is worth it. It should feel like a logical next step, not a random pivot.',
    key_points: [
      'Frame as intentional progression, not escape',
      'A specific catalyst for the move now',
      'Show it’s a logical next step that builds on your path',
    ],
  },
  {
    id: 'ib_fit_firm_04',
    topic: 'Why This Firm',
    difficulty: 2,
    question: 'What do you know about our recent deals or news?',
    reference_answer:
      'A strong answer names one or two specific, reasonably recent transactions or developments the firm was involved in, briefly explains them, and connects them to why they’re interesting or what they reveal about the firm’s strengths. It signals genuine homework and real interest, far beyond generic praise, and ideally ties back to the group or work the candidate wants to do.',
    key_points: [
      'Cite one or two specific recent deals / developments',
      'Briefly explain and why they’re notable',
      'Tie back to your interest and the group you want',
    ],
  },
  {
    id: 'ib_fit_story_05',
    topic: 'Your Story',
    difficulty: 2,
    question: 'What class or experience first got you interested in finance?',
    reference_answer:
      'A strong answer pinpoints a specific, genuine moment — a class, an internship, a personal investing experience, a competition — and explains what about it sparked the interest and how that interest grew from there. Specificity and authenticity matter; it should feel like a real origin story that connects naturally to wanting to pursue banking now.',
    key_points: [
      'A specific, genuine origin moment',
      'What about it sparked the interest',
      'How it grew into pursuing banking',
    ],
  },
  {
    id: 'ib_fit_goal_05',
    topic: 'Goals & Curveballs',
    difficulty: 2,
    question: 'What questions do you have for me?',
    reference_answer:
      'A strong answer treats this as part of the evaluation, not a throwaway. The candidate asks one or two thoughtful, specific questions — about the interviewer’s own experience, the group’s deal flow, how analysts grow, or the culture — that show genuine curiosity and that they’ve done their homework. Avoid questions easily answered by the website, and never ask only about hours or pay.',
    key_points: [
      'Thoughtful, specific questions — not generic or website-answerable',
      'Good angles: interviewer’s experience, deal flow, development, culture',
      'Shows curiosity; don’t lead with hours/pay',
    ],
  },
  {
    id: 'ib_fit_goal_06',
    topic: 'Goals & Curveballs',
    difficulty: 3,
    question: 'Tell me something about you that’s not on your resume.',
    reference_answer:
      'A strong answer shares something genuine and memorable that adds dimension — an interest, a background detail, a pursuit that shows character, drive, or a unique perspective — while staying professional and ideally revealing a transferable trait like discipline or curiosity. It should make the candidate more relatable and human without being inappropriate or trivial.',
    key_points: [
      'Genuine, memorable, and professional',
      'Reveals a transferable trait (discipline, curiosity, drive)',
      'Adds dimension / makes you relatable',
    ],
  },
];

// Distinct topics in display order, for grouping the question list.
export const IB_FIT_TOPICS = [
  'Why Banking',
  'Why This Firm',
  'Your Story',
  'Goals & Curveballs',
];
