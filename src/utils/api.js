import { OPENAI_API_KEY, ANTHROPIC_API_KEY } from '@env';

// ─── Shared infrastructure ──────────────────────────────────────────────────────
//
// One model, one calibrated scoring scale, one robust request/parse path used by
// every grading and generation call. This is what makes scores mean the same
// thing across Interview Prep, Quick Fire, Behavioral, Technical, Resume, Mock
// Interview, and HireVue — and what keeps a flaky API response from throwing an
// error into the user's face.

const CLAUDE_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

// Calibrated 1-10 band, injected into every grading prompt so a "7" is a 7
// everywhere in the app.
const SCORING_RUBRIC = `Use this calibrated 1-10 scale and apply it consistently:
- 9-10: Exceptional — accurate, complete, well-structured, and confidently delivered. An interviewer would be impressed.
- 7-8: Strong — mostly complete and correct, with minor gaps or polish to tighten.
- 5-6: Average — gets the general idea but is vague, partially incomplete, or loosely structured.
- 3-4: Weak — meaningful errors, missing core content, or rambling; would concern an interviewer.
- 1-2: Poor — largely incorrect, off-topic, or not a substantive answer.
Grade the answer AS ACTUALLY DELIVERED, not its potential. Be fair but do not inflate; most real practice answers land in the 4-7 range.`;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function wordCount(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

// True when a transcript is too thin to grade meaningfully (silence, a dropped
// mic, or a few stray words). Lets us return honest feedback without spending an
// API call or hallucinating a score for a non-answer.
function isInsufficientAnswer(transcript) {
  return wordCount(transcript) < 5;
}

function insufficientResult(context) {
  return {
    score: 1,
    strong: ['You started the rep — showing up to practice is the habit that compounds.'],
    improve: [
      `We couldn't make out a substantive answer${context ? ` to "${context}"` : ''}. Find a quiet spot, hold the mic close, and speak for at least 20-30 seconds so we can actually grade you.`,
    ],
    stronger_version:
      'When you re-record: take a breath, restate the question in your own words, give a clear and structured answer, and finish on a concrete point.',
    insufficient: true,
  };
}

// Clamp any model-returned score to an integer 1-10.
function normalizeScore(score) {
  const n = Math.round(Number(score));
  if (!Number.isFinite(n)) return 5;
  return Math.max(1, Math.min(10, n));
}

// Tolerant JSON extraction: strips markdown fences and any chatter around the
// JSON, then parses the first complete object or array. Far less brittle than a
// bare JSON.parse on the raw model text.
function parseJsonLoose(raw) {
  let text = (raw || '').trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();

  const firstObj = text.indexOf('{');
  const firstArr = text.indexOf('[');
  let start = -1;
  let end = -1;
  if (firstArr !== -1 && (firstObj === -1 || firstArr < firstObj)) {
    start = firstArr;
    end = text.lastIndexOf(']');
  } else if (firstObj !== -1) {
    start = firstObj;
    end = text.lastIndexOf('}');
  }
  if (start !== -1 && end !== -1 && end > start) {
    text = text.substring(start, end + 1);
  }
  return JSON.parse(text);
}

// Single Claude call with one automatic retry on transient (429/5xx/network)
// failures. Returns the full response object (callers that need stop_reason can
// read it). Throws a clean Error on hard failures.
async function callClaude({ system, messages, maxTokens = 1024, temperature }) {
  const body = { model: CLAUDE_MODEL, max_tokens: maxTokens, messages };
  if (system) body.system = system;
  if (typeof temperature === 'number') body.temperature = temperature;

  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const message = err.error?.message || `Request failed (${response.status})`;
        if ((response.status === 429 || response.status >= 500) && attempt === 0) {
          lastError = new Error(message);
          await delay(900);
          continue;
        }
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        await delay(900);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function textOf(data) {
  return (data.content?.[0]?.text || '').trim();
}

// Convenience: call Claude and parse a JSON object/array from the reply.
async function callClaudeJson(opts) {
  const data = await callClaude(opts);
  return parseJsonLoose(textOf(data));
}

// ─── Transcription ────────────────────────────────────────────────────────────

export async function transcribeAudio(audioUri) {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Transcription failed');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

// ─── Question generation ──────────────────────────────────────────────────────

export async function generateQuestions(role, category) {
  try {
    let prompt;

    if (category === 'Quick Fire') {
      prompt = `Generate 10 rapid-fire communication prompts that test quick thinking and verbal clarity under time pressure — NOT domain knowledge. Mix these types: explain a concept simply in 30 seconds, sell or pitch something, take and defend a position, and handle a curveball. Keep each prompt to one crisp sentence, make them concrete and varied (no near-duplicates), and order from approachable to spicy. Return ONLY a valid JSON array of prompt strings, no markdown, no explanation.`;
    } else if (category === 'Behavioral') {
      const roleContext =
        role && role.trim().length >= 3
          ? ` Tailor two or three of them to someone targeting a ${role} role, but keep the rest broadly applicable.`
          : '';
      prompt = `You are an experienced interview coach. Generate 10 realistic behavioral interview questions that test the STAR method (Situation, Task, Action, Result). Cover a spread of competencies: leadership, teamwork, conflict, failure, initiative, handling pressure, ethics, and influence — no two questions should target the same competency.${roleContext} Phrase them the way a real interviewer speaks, and order them from approachable to challenging. Return ONLY a valid JSON array of question strings, no markdown, no explanation.`;
    } else if (category === 'Persuade & Present') {
      prompt = `You are a communication coach. Generate 10 realistic practice scenarios for someone preparing to ${role}. Each should force a clear thesis, structured supporting points, and a confident close. Vary the audience and stakes, keep each to one sentence, avoid near-duplicates, and order from foundational to high-pressure. Return ONLY a valid JSON array of scenario prompt strings, no markdown, no explanation.`;
    } else {
      // Interview Prep (custom role) and fallback.
      const isVague = role.trim().length < 8;
      const vaguePrefix = isVague
        ? 'The user gave a broad description, so cover a range of common roles within that area. '
        : '';
      prompt = `${vaguePrefix}You are a career coach who specializes in ${role} recruiting and knows exactly what these interviews actually test. Generate 10 realistic, high-quality practice questions a candidate would genuinely face when interviewing for a ${role} position. Include a deliberate mix of technical/role-specific questions, behavioral questions, and fit/motivation questions. Make them specific rather than generic, avoid near-duplicates, and order them from foundational to advanced. Return ONLY a valid JSON array of question strings, no markdown, no explanation.`;
    }

    const data = await callClaude({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 1024,
    });

    const questions = parseJsonLoose(textOf(data));
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format returned');
    }
    return questions;
  } catch (error) {
    console.error('Question generation error:', error);
    throw error;
  }
}

// ─── Prep Kit ─────────────────────────────────────────────────────────────────

function buildPrepKitPrompt(company, role) {
  const roleContext = role ? `a ${role} position at ${company}` : `a role at ${company}`;
  return `You are an elite career intelligence analyst. Generate a comprehensive, firm-specific interview prep kit for someone interviewing for ${roleContext}.

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

CRITICAL: Return ONLY the raw JSON object. Do not wrap it in markdown code blocks. Do not include any text before or after the JSON. Start your response with { and end with }.`;
}

export async function generatePrepKit(company, role) {
  const prompt = buildPrepKitPrompt(company, role);
  try {
    let data = await callClaude({ messages: [{ role: 'user', content: prompt }], maxTokens: 4096 });

    // If truncated, retry once at the higher limit before giving up.
    if (data.stop_reason === 'max_tokens') {
      console.warn('[PrepKit] Truncated at 4096 tokens — retrying at 8192');
      data = await callClaude({ messages: [{ role: 'user', content: prompt }], maxTokens: 8192 });
      if (data.stop_reason === 'max_tokens') {
        throw new Error('Prep kit response was too large even at maximum size. Try a more specific role.');
      }
    }

    return parseJsonLoose(textOf(data));
  } catch (error) {
    console.error('Prep kit error:', error);
    throw error;
  }
}

// ─── Mock Interview ───────────────────────────────────────────────────────────

export async function getMockInterviewTurn(conversation, prepKit, company, role, exchangeCount) {
  const roleContext = role || 'the open position';
  const prepKitSummary = JSON.stringify({
    interview_style: prepKit.company_overview?.interview_style,
    culture_signals: prepKit.company_overview?.culture_signals,
    likely_questions: prepKit.likely_questions,
  });

  const isNearEnd = exchangeCount >= 8;
  const isFinalExchange = exchangeCount >= 9;

  const systemPrompt = `You are a sharp, experienced interviewer conducting a realistic interview for a ${roleContext} position at ${company}. You have this intelligence about the firm's interview style and likely questions: ${prepKitSummary}.

Conduct it like a real human interviewer, not a quiz bot:
- Ask ONE question at a time and keep your spoken lines natural and concise.
- This is exchange ${exchangeCount + 1} of approximately 10. Open by briefly introducing yourself.
- Actually listen: when an answer is vague, incomplete, or interesting, ask a pointed follow-up instead of marching to the next topic. Aim for roughly one follow-up for every two new questions.
- Move across question types over the interview — fit/motivation, behavioral, and role-relevant/technical — drawing on the firm intelligence above.
- Stay professional but appropriately challenging; don't coach or give feedback mid-interview.
${isNearEnd ? '\nYou are near the end — start to wrap up.' : ''}
${isFinalExchange ? '\nThis is the final exchange. Close with: "That\'s all I had for today. Do you have any questions for me?" and set is_closing to true.' : ''}

Return ONLY valid JSON: {"interviewer_line": "...", "internal_note": "...", "is_closing": false}
- interviewer_line: what you say out loud to the candidate
- internal_note: your private 1-sentence assessment of their last answer (empty string for the opening line)
- is_closing: true ONLY when delivering the final closing line`;

  const apiMessages = [
    { role: 'user', content: 'Please begin the interview. Introduce yourself and ask your first question.' },
  ];
  for (const turn of conversation) {
    if (turn.type === 'ai') {
      apiMessages.push({
        role: 'assistant',
        content: JSON.stringify({ interviewer_line: turn.line, internal_note: turn.note || '', is_closing: false }),
      });
    } else {
      apiMessages.push({ role: 'user', content: turn.transcript });
    }
  }

  return callClaudeJson({ system: systemPrompt, messages: apiMessages, maxTokens: 1024 });
}

export async function generateMockInterviewDebrief(conversation, company, role) {
  const roleContext = role || 'the position';

  const transcriptText = conversation
    .map((turn) => (turn.type === 'ai' ? `INTERVIEWER: ${turn.line}` : `CANDIDATE: ${turn.transcript}`))
    .join('\n\n');

  const notesText =
    conversation
      .filter((t) => t.type === 'ai' && t.note)
      .map((t) => `- ${t.note}`)
      .join('\n') || 'None';

  const numAnswers = conversation.filter((t) => t.type === 'user').length;

  const prompt = `You are CHRM, an elite interview coach. You analyzed a mock interview for a ${roleContext} position at ${company}. Be direct, specific, and honest — vague praise helps no one.

${SCORING_RUBRIC}

FULL INTERVIEW TRANSCRIPT:
${transcriptText}

INTERVIEWER'S PRIVATE NOTES (for reference):
${notesText}

Judge each candidate answer on substance, structure (e.g. STAR for behavioral), relevance to the role, and confident, concise delivery. Return ONLY valid JSON:
{
  "overall_score": <number 1-10>,
  "strongest_exchange_index": <0-based index into the ${numAnswers} candidate answers>,
  "strongest_quote": "<verbatim quote from their best answer, max 25 words>",
  "strongest_reason": "<one sentence: why this was their best moment>",
  "weakest_exchange_index": <0-based index into the ${numAnswers} candidate answers>,
  "weakest_quote": "<verbatim quote from their weakest answer, max 25 words>",
  "weakest_suggestion": "<one specific, actionable improvement for this answer>",
  "per_exchange_scores": [<score 1-10 for each of the ${numAnswers} candidate answers, in order>],
  "work_on": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
}`;

  const result = await callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 1024 });
  if (result && result.overall_score != null) result.overall_score = normalizeScore(result.overall_score);
  return result;
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

// Per-category grading guidance so each free mode is judged on what actually
// matters for it, while all share the same calibrated score band.
function categoryGuidance(category) {
  switch (category) {
    case 'Behavioral':
      return 'This is a BEHAVIORAL question — grade it against the STAR method. A strong answer sets a clear Situation and Task, spends most of its time on the specific Actions the speaker personally took, and ends with a concrete, ideally quantified Result. Explicitly call out which STAR elements are present, weak, or missing.';
    case 'Quick Fire':
      return 'This is a QUICK FIRE prompt — the candidate had only seconds to think. Reward fast, clear, confident, well-structured thinking and a decisive point of view; penalize rambling, filler words, and hedging. Composure and clarity under time pressure matter more than domain depth.';
    case 'Persuade & Present':
      return 'This is a PERSUASION / PRESENTATION scenario — grade for a clear up-front thesis, structured supporting points, audience awareness, and a confident close or call to action. Penalize a buried point, weak structure, or trailing off without landing it.';
    case 'Interview Prep':
      return 'This is a general interview question — grade for substance, logical structure, relevance to the role, and confident, concise delivery.';
    default:
      return 'Grade for substance, structure, clarity, and confident delivery.';
  }
}

export async function getFeedback(transcript, question, category, role) {
  try {
    if (isInsufficientAnswer(transcript)) return insufficientResult(question);

    const roleContext = role ? ` The candidate is targeting a ${role} role.` : '';
    const prompt = `You are CHRM, an elite AI communication coach. Be direct, honest, and coach-like — no emojis, no fluff. ${categoryGuidance(category)}${roleContext}

${SCORING_RUBRIC}

Keep it concise: each "strong" and "improve" item is 1-2 sentences; the exemplary answer is 3-4 sentences and should sound natural spoken aloud. Analyze this spoken answer and return ONLY valid JSON — no markdown, no extra text.

Category: ${category}
Question: "${question}"
Answer transcript: "${transcript}"

Return exactly this JSON structure:
{
  "score": <number 1-10>,
  "strong": ["<observation>", "<observation>"],
  "improve": ["<observation>", "<observation>"],
  "stronger_version": "<3-4 sentence spoken-sounding model answer>"
}`;

    const result = await callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 900 });
    result.score = normalizeScore(result.score);
    return result;
  } catch (error) {
    console.error('Feedback error:', error);
    throw error;
  }
}

// ─── Technical grading (Interview Prep / Fit / Markets banks) ────────────────────

// Grades a spoken answer against a canonical reference answer and the key points
// an interviewer listens for. Same return shape as getFeedback so it reuses
// FeedbackScreen.
export async function getTechnicalFeedback(transcript, question, referenceAnswer, keyPoints, role) {
  try {
    if (isInsufficientAnswer(transcript)) return insufficientResult(question);

    const target = role ? ` The candidate is recruiting for a ${role} role.` : '';
    const points = (keyPoints || []).map((p) => `- ${p}`).join('\n');
    const prompt = `You are CHRM, an elite technical interview coach for finance recruiting.${target} You are grading a candidate's SPOKEN answer against the canonical answer below. Reward accuracy and hitting the key points; penalize errors, vagueness, and missing core concepts. A confident, correct, well-structured answer scores high; a hand-wavy or wrong one scores low. Be direct — no emojis.

${SCORING_RUBRIC}

QUESTION: "${question}"

CANONICAL REFERENCE ANSWER:
${referenceAnswer}

KEY POINTS AN INTERVIEWER LISTENS FOR:
${points}

CANDIDATE'S SPOKEN ANSWER (transcript):
"${transcript}"

Return ONLY valid JSON — no markdown, no extra text:
{
  "score": <number 1-10>,
  "strong": ["<key points they hit / what was correct, 1-2 sentences each>"],
  "improve": ["<key points missed or stated incorrectly, 1-2 sentences each>"],
  "stronger_version": "<a tight, correct model answer they could say out loud>"
}`;

    const result = await callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 1024 });
    result.score = normalizeScore(result.score);
    return result;
  } catch (error) {
    console.error('Technical feedback error:', error);
    throw error;
  }
}

// ─── Resume Walkthrough ─────────────────────────────────────────────────────────

// Grades a spoken "walk me through your resume" / "tell me about yourself" answer
// against the resume. Same return shape as getFeedback.
export async function getResumeFeedback(transcript, resumeText, role) {
  try {
    if (isInsufficientAnswer(transcript)) return insufficientResult('Walk me through your resume');

    const target = role ? ` The candidate is recruiting for a ${role} role.` : '';
    const prompt = `You are CHRM, an elite communication coach for finance recruiting. The candidate is practicing the opener "Walk me through your resume" / "Tell me about yourself" — a single continuous 60-90 second spoken narrative, NOT a Q&A.${target}

${SCORING_RUBRIC}

Grade the spoken walkthrough against their resume. Judge: a clear story arc (logical chronological or thematic flow), smooth transitions, a consistent "why this path / why finance" thread, conciseness (~60-90 seconds), specificity and impact over duties, and a strong landing that points at the target role. Reward a narrative that connects the dots; penalize listing bullets, rambling, or starting too far back. Be direct — no emojis.

RESUME:
"""
${resumeText || '(No resume provided.)'}
"""

SPOKEN WALKTHROUGH (transcript):
"${transcript}"

Return ONLY valid JSON — no markdown, no extra text:
{
  "score": <number 1-10>,
  "strong": ["<1-2 sentence observation>", "<1-2 sentence observation>"],
  "improve": ["<1-2 sentence observation>", "<1-2 sentence observation>"],
  "stronger_version": "<a model 60-90 second walkthrough script, grounded in THIS resume, written to sound natural spoken aloud>"
}`;

    const result = await callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 1024 });
    result.score = normalizeScore(result.score);
    return result;
  } catch (error) {
    console.error('Resume feedback error:', error);
    throw error;
  }
}

// Extracts clean plain-text resume content from an uploaded PDF (base64).
export async function extractResumeTextFromPdf(base64Pdf) {
  const data = await callClaude({
    maxTokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64Pdf },
          },
          {
            type: 'text',
            text: 'Extract the full text of this resume as clean plain text. Preserve the structure (sections, role titles, and bullet points), but do not add commentary, headers, or markdown formatting. Return only the resume text.',
          },
        ],
      },
    ],
  });
  return textOf(data);
}

// Premium: rewrites resume bullets for finance recruiting and flags gaps.
export async function improveResume(resumeText, role) {
  const target = role ? `a ${role} role` : 'finance recruiting';
  const prompt = `You are an elite resume coach for finance recruiting (IB/PE/consulting). Improve this resume for ${target}. Rewrite weak bullets to lead with a strong action verb and quantified impact (numbers, scale, outcome), tighten language, and surface gaps a recruiter would notice.

RESUME:
"""
${resumeText}
"""

Return ONLY valid JSON — no markdown, no extra text:
{
  "overall": ["<2-4 high-level observations about the resume's positioning>"],
  "improved_bullets": [
    {"original": "<a weak bullet from the resume>", "improved": "<stronger rewrite, action + quantified impact>", "why": "<1 sentence on what changed and why>"}
  ],
  "gaps": ["<2-4 specific things missing or worth adding for ${target}>"]
}

Include 4-7 of the highest-impact bullet rewrites. Keep every field concise.`;

  return callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 2048 });
}

// ─── HireVue Simulation ─────────────────────────────────────────────────────────

// Generates the question set for a one-way HireVue-style digital interview.
// `mix` is an array of categories, e.g. ['Behavioral', 'Company', 'Technical'].
export async function generateHireVueQuestions(company, role, mix, count, prepKit = null) {
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

  const prompt = `You are designing a HireVue-style one-way digital interview for someone interviewing for ${roleContext}. In a HireVue interview the candidate reads each question on screen and records a short spoken answer with no live interviewer.

Generate exactly ${count} questions, distributed across these categories: ${mixList}.
- "Behavioral" questions test the STAR method and general competencies (apply to any role).
- "Company" questions test motivation and fit specific to ${company} — why this firm, knowledge of what they do, values alignment.
- "Technical" questions test role-relevant knowledge for a ${role || 'candidate'}.
Make them realistic and specific, avoid near-duplicates, and order from approachable to challenging.${kitContext}

Return ONLY a valid JSON array, no markdown, no extra text. Each element must be an object:
[{"question": "...", "category": "Behavioral"}, {"question": "...", "category": "Company"}]
The "category" value must be exactly one of: Behavioral, Company, Technical.`;

  const questions = await callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 1500 });
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Invalid HireVue questions format returned');
  }
  return questions;
}

// Produces an AI debrief for a completed HireVue simulation.
// `items` = [{ question, category, transcript }] in answered order.
export async function generateHireVueDebrief(company, role, items) {
  const roleContext = role ? `a ${role} position at ${company}` : `a role at ${company}`;
  const transcriptBlock = items
    .map((it, i) => `[Q${i + 1} · ${it.category}] ${it.question}\nANSWER: ${it.transcript || '(no answer recorded)'}`)
    .join('\n\n');

  const n = items.length;
  const prompt = `You are CHRM, an elite AI interview coach. You reviewed a candidate's recorded HireVue-style one-way interview for ${roleContext}. Grade each answer by its category: Behavioral against the STAR method (Situation, Task, Action, Result); Company answers on genuine motivation and firm-specific knowledge; Technical answers on accuracy and structure. If an answer is missing or empty, score it low and say so. Be direct, honest, and concise.

${SCORING_RUBRIC}

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

"per_question" must have exactly ${n} elements, in the same order as the questions above.`;

  const result = await callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 2048 });
  if (result && result.overall_score != null) result.overall_score = normalizeScore(result.overall_score);
  if (Array.isArray(result?.per_question)) {
    result.per_question = result.per_question.map((q) => ({ ...q, score: normalizeScore(q.score) }));
  }
  return result;
}
