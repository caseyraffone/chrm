// ─── IB Behavioral question bank ───────────────────────────────────────────────
//
// Curated behavioral (STAR) prompts for IB recruiting. These are graded against
// the STAR method by getFeedback() with category 'Behavioral' — there is no single
// canonical answer because the story is personal, so entries carry no reference
// answer. `prompt_tip` is coaching shown nowhere in grading; it documents what a
// strong story should surface for each prompt.
//
// difficulty: 1 = Foundational (free), 2 = Intermediate (Pro), 3 = Advanced (Pro)

export const IB_BEHAVIORAL_BANK = [
  // ── Leadership ─────────────────────────────────────────────────────────────────
  {
    id: 'ib_beh_lead_01',
    topic: 'Leadership',
    difficulty: 1,
    question: 'Tell me about a time you led a team.',
    prompt_tip: 'Set the stakes, then spend most of the answer on what YOU specifically did to lead, and end with a concrete result.',
  },
  {
    id: 'ib_beh_lead_02',
    topic: 'Leadership',
    difficulty: 2,
    question: 'Describe a time you motivated others to reach a goal they were struggling with.',
    prompt_tip: 'Show how you diagnosed the blocker and the specific actions you took to re-energize the group, with a measurable outcome.',
  },
  {
    id: 'ib_beh_lead_03',
    topic: 'Leadership',
    difficulty: 3,
    question: 'Tell me about a time you had to lead without any formal authority.',
    prompt_tip: 'Emphasize influence, buy-in, and credibility rather than position — exactly the skill a junior banker needs.',
  },

  // ── Teamwork ───────────────────────────────────────────────────────────────────
  {
    id: 'ib_beh_team_01',
    topic: 'Teamwork',
    difficulty: 1,
    question: 'Tell me about a time you worked effectively as part of a team.',
    prompt_tip: 'Be specific about your individual contribution — “we” is fine for context but the Action should be “I”.',
  },
  {
    id: 'ib_beh_team_02',
    topic: 'Teamwork',
    difficulty: 2,
    question: 'Describe a conflict you had with a teammate and how you resolved it.',
    prompt_tip: 'Stay professional, avoid blame, and focus on the steps you took to reach a resolution and what you learned.',
  },
  {
    id: 'ib_beh_team_03',
    topic: 'Teamwork',
    difficulty: 2,
    question: 'Tell me about a time you had to work with a difficult person.',
    prompt_tip: 'Show empathy and adaptability — how you adjusted your approach to still deliver, not how you “won”.',
  },

  // ── Failure & Resilience ───────────────────────────────────────────────────────
  {
    id: 'ib_beh_fail_01',
    topic: 'Failure & Resilience',
    difficulty: 1,
    question: 'Tell me about a time you failed.',
    prompt_tip: 'Pick a real failure, own it without excuses, and spend the back half on what you changed afterward.',
  },
  {
    id: 'ib_beh_fail_02',
    topic: 'Failure & Resilience',
    difficulty: 2,
    question: 'Describe a mistake you made and what you learned from it.',
    prompt_tip: 'Show accountability and a concrete behavioral change — interviewers want growth, not a humblebrag.',
  },
  {
    id: 'ib_beh_fail_03',
    topic: 'Failure & Resilience',
    difficulty: 3,
    question: 'Tell me about a time you received tough or critical feedback.',
    prompt_tip: 'Demonstrate coachability: how you took it in, acted on it, and improved — the single most valued analyst trait.',
  },

  // ── Drive & Achievement ────────────────────────────────────────────────────────
  {
    id: 'ib_beh_drive_01',
    topic: 'Drive & Achievement',
    difficulty: 1,
    question: 'Tell me about your proudest accomplishment.',
    prompt_tip: 'Choose something that shows initiative and effort; quantify the result and explain why it mattered to you.',
  },
  {
    id: 'ib_beh_drive_02',
    topic: 'Drive & Achievement',
    difficulty: 2,
    question: 'Describe a time you went above and beyond what was expected.',
    prompt_tip: 'Highlight self-direction and ownership — work ethic is the trait this question is really testing for banking.',
  },
  {
    id: 'ib_beh_drive_03',
    topic: 'Drive & Achievement',
    difficulty: 2,
    question: 'Tell me about a time you managed multiple competing priorities under a tight deadline.',
    prompt_tip: 'Show how you prioritized, communicated trade-offs, and still delivered — proof you can handle deal-team pressure.',
  },
  {
    id: 'ib_beh_drive_04',
    topic: 'Drive & Achievement',
    difficulty: 3,
    question: 'Tell me about a time you persuaded someone to adopt your point of view.',
    prompt_tip: 'Lead with how you understood their position, then the evidence and approach you used to win them over.',
  },

  // ── Self-Awareness ─────────────────────────────────────────────────────────────
  {
    id: 'ib_beh_self_01',
    topic: 'Self-Awareness',
    difficulty: 1,
    question: 'What is your greatest strength, and can you give an example?',
    prompt_tip: 'Pick a strength relevant to banking and prove it with a brief STAR example rather than just asserting it.',
  },
  {
    id: 'ib_beh_self_02',
    topic: 'Self-Awareness',
    difficulty: 1,
    question: 'What is your greatest weakness?',
    prompt_tip: 'Name a genuine weakness, then show the concrete steps you are taking to manage it — avoid clichés and fake weaknesses.',
  },
  {
    id: 'ib_beh_self_03',
    topic: 'Self-Awareness',
    difficulty: 2,
    question: 'Tell me about a time you had to learn something difficult very quickly.',
    prompt_tip: 'Show your learning process and how you applied it — analysts get thrown into the deep end constantly.',
  },
  {
    id: 'ib_beh_self_04',
    topic: 'Self-Awareness',
    difficulty: 1,
    question: 'What motivates you?',
    prompt_tip: 'Be authentic and tie it to drivers that fit the job — growth, mastery, impact — backed by a quick concrete example.',
  },

  // ── Leadership / Teamwork / Drive / Failure (deeper) ─────────────────────────────
  {
    id: 'ib_beh_lead_04',
    topic: 'Leadership',
    difficulty: 3,
    question: 'Tell me about a time you developed or mentored someone else.',
    prompt_tip: 'Show that you can lift others, not just perform yourself — frame the actions you took and their growth as the Result.',
  },
  {
    id: 'ib_beh_team_04',
    topic: 'Teamwork',
    difficulty: 2,
    question: 'Tell me about a time a teammate dropped the ball and you had to step up.',
    prompt_tip: 'Stay generous about the teammate; focus on how you covered the gap and protected the outcome without making it about blame.',
  },
  {
    id: 'ib_beh_fail_04',
    topic: 'Failure & Resilience',
    difficulty: 2,
    question: 'Tell me about a high-pressure deadline that did not go as planned.',
    prompt_tip: 'Show composure under pressure: what broke, how you triaged it in the moment, and what you changed afterward.',
  },
  {
    id: 'ib_beh_drive_05',
    topic: 'Drive & Achievement',
    difficulty: 2,
    question: 'Tell me about an ambitious goal you set for yourself and how you pursued it.',
    prompt_tip: 'Quantify the goal and the outcome; emphasize the self-driven plan and persistence, which is exactly what banking selects for.',
  },

  // ── Ethics & Judgment ────────────────────────────────────────────────────────────
  {
    id: 'ib_beh_eth_01',
    topic: 'Ethics & Judgment',
    difficulty: 2,
    question: 'Tell me about a time you faced an ethical dilemma.',
    prompt_tip: 'Show a clear sense of right and wrong, the trade-off you weighed, and that you did the right thing even when it was costly.',
  },
  {
    id: 'ib_beh_eth_02',
    topic: 'Ethics & Judgment',
    difficulty: 3,
    question: 'Tell me about a time you disagreed with a decision made by someone in authority.',
    prompt_tip: 'Demonstrate respectful pushback: how you raised it with evidence, and how you handled the outcome whether or not you prevailed.',
  },
  {
    id: 'ib_beh_eth_03',
    topic: 'Ethics & Judgment',
    difficulty: 2,
    question: 'Tell me about a time you had to make a decision without all the information you wanted.',
    prompt_tip: 'Show structured judgment under uncertainty: how you used what you had, made the call, and owned the result.',
  },
];

// Distinct topics in display order, for grouping the question list.
export const IB_BEHAVIORAL_TOPICS = [
  'Leadership',
  'Teamwork',
  'Failure & Resilience',
  'Drive & Achievement',
  'Self-Awareness',
  'Ethics & Judgment',
];
