// Prompt builders ported from the app's src/utils/api.js so all prompt
// construction lives server-side. Each helper returns the pieces needed for an
// Anthropic Messages API call (a user prompt, or a { system, messages } pair).

export function buildQuestionsPrompt(role, category) {
  if (category === 'Quick Fire') {
    return `Generate 10 rapid-fire communication prompts. Mix of: explain a concept in 30 seconds, sell me something, defend a position, answer a curveball question. These should test quick thinking and verbal clarity, not domain knowledge. Return ONLY a valid JSON array of prompt strings, no explanation.`;
  }
  if (category === 'Behavioral') {
    const roleContext =
      role && role.trim().length >= 3
        ? ` Tailor a few of them to someone targeting a ${role} role, but keep most broadly applicable.`
        : '';
    return `You are an interview coach. Generate 10 realistic behavioral interview questions that test the STAR method (Situation, Task, Action, Result). Cover a range of competencies: leadership, teamwork, conflict, failure, initiative, handling pressure, and ethics. These apply to almost any role.${roleContext} Order them from approachable to challenging. Return ONLY a valid JSON array of question strings, no explanation.`;
  }
  if (category === 'Persuade & Present') {
    return `You are a communication coach. Generate 10 realistic practice scenarios for someone preparing to ${role}. Focus on persuasion, clarity, and structured delivery. Order from foundational to high-pressure. Return ONLY a valid JSON array of scenario prompt strings, no explanation.`;
  }
  // Interview Prep (and fallback)
  const isVague = role.trim().length < 8;
  const vaguePrefix = isVague
    ? 'The user gave a broad description. Generate questions that cover a range of common roles within that area. '
    : '';
  return `${vaguePrefix}You are a career coach specializing in ${role} recruiting. Generate 10 realistic practice questions for an interview at a ${role} position. Order them from foundational to advanced. Include a mix of technical and behavioral questions. Return ONLY a valid JSON array of question strings, no explanation.`;
}

export function buildPrepKitPrompt(company, role) {
  const roleContext = role ? `a ${role} position at ${company}` : `a role at ${company}`;
  return `You are an elite career intelligence analyst. Generate a comprehensive interview prep kit for someone interviewing for ${roleContext}.

Return a valid JSON object with this exact structure:
{
  "company_overview": {
    "what_they_do": "2-3 sentence description of the firm and their strategy",
    "key_differentiators": ["3-4 things that make this firm different from competitors"],
    "culture_signals": ["4-5 specific culture values or traits the firm emphasizes"],
    "interview_style": "1-2 sentences on what their interview process is typically like"
  },
  "likely_questions": {
    "technical": [
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."},
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."},
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."},
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."},
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."}
    ],
    "behavioral": [
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."},
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."},
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."},
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."}
    ],
    "fit_and_motivation": [
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."},
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."},
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."}
    ],
    "market_awareness": [
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."},
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."},
      {"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."}
    ]
  },
  "talking_points": ["4 key facts or angles to weave into answers naturally"],
  "red_flags": ["3 things that would signal poor fit for this firm"],
  "training_plan": {
    "day_1": {"focus": "...", "drill_questions": ["question 1", "question 2"]},
    "day_2": {"focus": "...", "drill_questions": ["question 1", "question 2"]},
    "day_3": {"focus": "...", "drill_questions": ["question 1", "question 2"]},
    "day_4": {"focus": "...", "drill_questions": ["question 1", "question 2"]},
    "day_5": {"focus": "Full mock — mix of all categories", "drill_questions": ["question 1", "question 2", "question 3"]}
  }
}

Be specific to this exact firm. Do not give generic advice. Reference the firm's actual strategy, values, deal activity, and positioning. Keep each field concise — one sentence per field where possible.

CRITICAL: Return ONLY the raw JSON object. Do not wrap it in markdown code blocks. Do not include any text before or after the JSON. Do not use \`\`\`json formatting. Start your response with { and end with }.`;
}

export function buildFeedbackPrompt(transcript, question, category, role) {
  const roleContext = role ? ` targeting a ${role} role` : '';
  const isBehavioral = category === 'Behavioral';
  const behavioralRubric = isBehavioral
    ? ` This is a BEHAVIORAL question — judge it against the STAR method. A strong answer sets a clear Situation and Task, spends most of its time on specific Actions the speaker personally took, and ends with a concrete Result (ideally quantified). In your feedback, explicitly call out which STAR elements are present, weak, or missing.`
    : '';
  return `You are CHRM, an elite AI communication coach. Keep all feedback concise. Strengths: 1-2 sentences max. Areas to improve: 1-2 sentences max. Exemplary response: 3-4 sentences max. Total response should be under 200 words. Do not use emojis. Be direct and coach-like.${behavioralRubric} Analyze this spoken answer and return ONLY valid JSON — no markdown, no extra text.

Category: ${category}${roleContext}
Question: "${question}"
Answer transcript: "${transcript}"

Return exactly this JSON structure:
{
  "score": <number 1-10>,
  "strong": ["<1-2 sentence observation>", "<1-2 sentence observation>"],
  "improve": ["<1-2 sentence observation>", "<1-2 sentence observation>"],
  "stronger_version": "<3-4 sentence spoken-sounding model answer>"
}

Rules:
- Be direct and honest. Score fairly — 10 is exceptional, 5 is average, below 4 is needs significant work.`;
}

export function buildMockTurn(conversation, prepKit, company, role, exchangeCount) {
  const roleContext = role || 'the open position';
  const prepKitSummary = JSON.stringify({
    interview_style: prepKit?.company_overview?.interview_style,
    culture_signals: prepKit?.company_overview?.culture_signals,
    likely_questions: prepKit?.likely_questions,
  });

  const isNearEnd = exchangeCount >= 8;
  const isFinalExchange = exchangeCount >= 9;

  const system = `You are conducting a realistic interview for a ${roleContext} position at ${company}. You have the following intelligence about this firm's interview style and likely questions: ${prepKitSummary}.

Conduct the interview naturally. Ask one question at a time. This is exchange ${exchangeCount + 1} of approximately 10. Listen carefully to the candidate's response and ask relevant follow-up questions when their answer is vague, incomplete, or when deeper probing would be realistic. Be professional but challenging.
${isNearEnd ? '\nYou are near the end of the interview. Begin to wrap up.' : ''}
${isFinalExchange ? '\nThis is the final exchange. Close with: "That\'s all I had for today. Do you have any questions for me?" and set is_closing to true.' : ''}

Return ONLY valid JSON: {"interviewer_line": "...", "internal_note": "...", "is_closing": false}
- interviewer_line: what you say out loud to the candidate
- internal_note: your private 1-sentence assessment of their last answer (empty string for the opening line)
- is_closing: set to true ONLY when delivering the final closing line`;

  const messages = [
    { role: 'user', content: 'Please begin the interview. Introduce yourself and ask your first question.' },
  ];
  for (const turn of conversation || []) {
    if (turn.type === 'ai') {
      messages.push({
        role: 'assistant',
        content: JSON.stringify({ interviewer_line: turn.line, internal_note: turn.note || '', is_closing: false }),
      });
    } else {
      messages.push({ role: 'user', content: turn.transcript });
    }
  }
  return { system, messages };
}

export function buildMockDebriefPrompt(conversation, company, role) {
  const roleContext = role || 'the position';
  const transcriptText = (conversation || [])
    .map((turn) => (turn.type === 'ai' ? `INTERVIEWER: ${turn.line}` : `CANDIDATE: ${turn.transcript}`))
    .join('\n\n');
  const notesText =
    (conversation || [])
      .filter((t) => t.type === 'ai' && t.note)
      .map((t) => `- ${t.note}`)
      .join('\n') || 'None';
  const numAnswers = (conversation || []).filter((t) => t.type === 'user').length;

  return `You analyzed a mock interview for a ${roleContext} position at ${company}.

FULL INTERVIEW TRANSCRIPT:
${transcriptText}

INTERVIEWER'S PRIVATE NOTES (for reference):
${notesText}

Analyze the candidate's performance and return ONLY valid JSON:
{
  "overall_score": <number 1-10>,
  "strongest_exchange_index": <0-based index into the ${numAnswers} candidate answers>,
  "strongest_quote": "<verbatim quote from their best answer, max 25 words>",
  "strongest_reason": "<one sentence: why this was their best moment>",
  "weakest_exchange_index": <0-based index into the ${numAnswers} candidate answers>,
  "weakest_quote": "<verbatim quote from their weakest answer, max 25 words>",
  "weakest_suggestion": "<one specific actionable improvement for this answer>",
  "per_exchange_scores": [<score 1-10 for each of the ${numAnswers} candidate answers, in order>],
  "work_on": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}`;
}

export function buildHireVueQuestionsPrompt(company, role, mix, count, prepKit = null) {
  const roleContext = role ? `a ${role} position at ${company}` : `a role at ${company}`;
  const mixList = mix && mix.length ? mix.join(', ') : 'Behavioral, Company, Technical';

  let kitContext = '';
  if (prepKit) {
    const kitData = {
      interview_style: prepKit.company_overview?.interview_style,
      culture_signals: prepKit.company_overview?.culture_signals,
      likely_questions: prepKit.likely_questions,
    };
    kitContext = `\n\nUse this intelligence about the firm to make Company and Technical questions specific and realistic: ${JSON.stringify(kitData)}`;
  }

  return `You are designing a HireVue-style one-way digital interview for someone interviewing for ${roleContext}. In a HireVue interview the candidate reads each question on screen and records a short spoken answer with no live interviewer.

Generate exactly ${count} questions. Distribute them across these categories: ${mixList}.
- "Behavioral" questions test the STAR method and general competencies (apply to any role).
- "Company" questions test motivation and fit specific to ${company} — why this firm, knowledge of what they do, values alignment.
- "Technical" questions test role-relevant knowledge for a ${role || 'candidate'}.
Order from approachable to challenging.${kitContext}

Return ONLY a valid JSON array, no markdown, no extra text. Each element must be an object:
[{"question": "...", "category": "Behavioral"}, {"question": "...", "category": "Company"}]
The "category" value must be exactly one of: Behavioral, Company, Technical.`;
}

export function buildHireVueDebriefPrompt(company, role, items) {
  const roleContext = role ? `a ${role} position at ${company}` : `a role at ${company}`;
  const transcriptBlock = (items || [])
    .map((it, i) => `[Q${i + 1} · ${it.category}] ${it.question}\nANSWER: ${it.transcript || '(no answer recorded)'}`)
    .join('\n\n');
  const n = (items || []).length;

  return `You are CHRM, an elite AI interview coach. You reviewed a candidate's recorded HireVue-style one-way interview for ${roleContext}. Behavioral answers should be judged against the STAR method (Situation, Task, Action, Result). Company answers should show genuine motivation and firm-specific knowledge. Technical answers should be accurate and well-structured. Be direct, honest, and concise.

THE INTERVIEW (${n} questions):
${transcriptBlock}

Return ONLY valid JSON — no markdown, no extra text — with this exact structure:
{
  "overall_score": <number 1-10>,
  "summary": "<2-3 sentence overall read of the candidate's performance>",
  "strongest_index": <0-based index of their best answer>,
  "weakest_index": <0-based index of their weakest answer>,
  "per_question": [
    {"score": <1-10>, "strong": "<1 sentence on what worked>", "improve": "<1 sentence on the single highest-impact fix>"}
  ],
  "work_on": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}

"per_question" must have exactly ${n} elements, in the same order as the questions above. Score fairly — 10 is exceptional, 5 is average, below 4 needs significant work.`;
}

// Calibrated grading scale shared by the bank/resume graders so a "7" means the
// same thing across every mode (matches the client's direct-path rubric).
const SCORING_RUBRIC = `Use this calibrated 1-10 scale consistently:
- 9-10: Exceptional — accurate, complete, well-structured, confidently delivered.
- 7-8: Strong — mostly complete and correct, minor gaps.
- 5-6: Average — gets the gist but vague, partial, or loosely structured.
- 3-4: Weak — meaningful errors, missing core content, or rambling.
- 1-2: Poor — largely incorrect, off-topic, or not substantive.
Grade the answer AS DELIVERED, not its potential. Be fair but do not inflate.`;

// Grades a spoken answer against a canonical reference answer + key points
// (Interview Prep Technical, Fit, Markets, and PE banks).
export function buildTechnicalFeedbackPrompt(transcript, question, referenceAnswer, keyPoints, role) {
  const target = role ? ` The candidate is recruiting for a ${role} role.` : '';
  const points = (keyPoints || []).map((p) => `- ${p}`).join('\n');
  return `You are CHRM, an elite technical interview coach for finance recruiting.${target} Grade the candidate's SPOKEN answer against the canonical answer. Reward accuracy and hitting the key points; penalize errors, vagueness, and missing core concepts. No emojis. Keep the output tight enough for a phone screen: exactly 2 strengths, exactly 2 improvements, and one concise model answer.

${SCORING_RUBRIC}

QUESTION: "${question}"

CANONICAL REFERENCE ANSWER:
${referenceAnswer}

KEY POINTS AN INTERVIEWER LISTENS FOR:
${points}

CANDIDATE'S SPOKEN ANSWER:
"${transcript}"

Return ONLY valid JSON:
{
  "score": <1-10>,
  "strong": ["<highest-impact thing they got right, 1 sentence>", "<second-highest-impact thing they got right, 1 sentence>"],
  "improve": ["<highest-impact fix, 1 sentence>", "<second-highest-impact fix, 1 sentence>"],
  "stronger_version": "<a tight, correct model answer to say out loud in 3-5 sentences>"
}`;
}

// Grades a spoken "walk me through your resume" narrative against the resume.
export function buildResumeFeedbackPrompt(transcript, resumeText, role) {
  const target = role ? ` The candidate is recruiting for a ${role} role.` : '';
  return `You are CHRM, an elite communication coach for finance recruiting. The candidate is practicing "Walk me through your resume" — a single continuous 60-90 second spoken narrative, NOT a Q&A.${target}

${SCORING_RUBRIC}

Grade against their resume: a clear story arc, smooth transitions, a consistent "why this path / why finance" thread, conciseness, specificity and impact over duties, and a strong landing toward the target role. Reward connecting the dots; penalize listing bullets, rambling, or starting too far back. No emojis.

RESUME:
"""
${resumeText || '(No resume provided.)'}
"""

SPOKEN WALKTHROUGH:
"${transcript}"

Return ONLY valid JSON:
{
  "score": <1-10>,
  "strong": ["<observation>", "<observation>"],
  "improve": ["<observation>", "<observation>"],
  "stronger_version": "<a model 60-90 second walkthrough grounded in THIS resume, natural spoken aloud>"
}`;
}

// Premium resume rewrite for finance recruiting.
export function buildResumeImprovePrompt(resumeText, role) {
  const target = role ? `a ${role} role` : 'finance recruiting';
  return `You are an elite resume coach for finance recruiting (IB/PE/consulting). Improve this resume for ${target}. Rewrite weak bullets to lead with a strong action verb and quantified impact, tighten language, and surface gaps a recruiter would notice.

RESUME:
"""
${resumeText}
"""

Return ONLY valid JSON:
{
  "overall": ["<2-4 high-level observations about positioning>"],
  "improved_bullets": [{"original": "<weak bullet>", "improved": "<stronger rewrite>", "why": "<1 sentence>"}],
  "gaps": ["<2-4 specific things missing for ${target}>"]
}
Include 4-7 of the highest-impact rewrites. Keep every field concise.`;
}

// Messages payload (with a PDF document block) for extracting resume text.
export function buildResumeExtractMessages(base64Pdf) {
  return [
    {
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Pdf } },
        { type: 'text', text: 'Extract the full text of this resume as clean plain text. Preserve structure (sections, titles, bullets), but add no commentary or markdown. Return only the resume text.' },
      ],
    },
  ];
}
