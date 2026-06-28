import { Platform } from 'react-native';
import { API_BASE_URL, OPENAI_API_KEY, ANTHROPIC_API_KEY } from '@env';

// ─── Transport: backend if configured, otherwise direct ─────────────────────────
//
// If API_BASE_URL is set in .env, every AI call routes through the CHRM backend
// (see /server) so the OpenAI/Anthropic keys never ship in the client. If it is
// NOT set, the app falls back to calling the providers directly with the keys in
// .env — so the app works with or without a deployed backend, and becomes
// "backend-ready" the moment you set API_BASE_URL.
//
// On a physical device, API_BASE_URL must be your machine's LAN IP, not localhost.

const API_BASE = API_BASE_URL ? API_BASE_URL.replace(/\/$/, '') : null;
const USE_BACKEND = !!API_BASE;

async function postJson(path, body) {
  const res = await fetchWithTimeout(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request to ${path} failed (${res.status})`);
  return data;
}

// ─── Shared grading infrastructure (used by the direct path) ────────────────────

const CLAUDE_MODEL = 'claude-sonnet-4-6';
// Faster, cheaper model for the latency-sensitive single-answer grading path
// (the "Analyzing your answer..." wait after every drill). Grading against a
// fixed rubric / reference answer is well within Haiku's range; the heavier
// generative work (questions, prep kit, mock interview, debriefs) stays on Sonnet.
const FEEDBACK_MODEL = 'claude-haiku-4-5';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const SCORING_RUBRIC = `Use this calibrated 1-10 scale and apply it consistently:
- 9-10: Exceptional — accurate, complete, well-structured, and confidently delivered.
- 7-8: Strong — mostly complete and correct, with minor gaps or polish to tighten.
- 5-6: Average — gets the general idea but is vague, partially incomplete, or loosely structured.
- 3-4: Weak — meaningful errors, missing core content, or rambling.
- 1-2: Poor — largely incorrect, off-topic, or not a substantive answer.
Grade the answer AS ACTUALLY DELIVERED, not its potential. Be fair but do not inflate; most real practice answers land in the 4-7 range.`;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Hard ceiling on every network call. Without this a stalled request (flaky
// review networks, slow provider) leaves the UI spinning on "Building your
// drill..." forever — which is exactly how the iPad reviewer saw a broken,
// never-resolving state. AbortController turns a hang into a clean, catchable
// error the screens can surface and offer a retry on.
const REQUEST_TIMEOUT_MS = 45000;

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The request timed out. Check your connection and try again.');
    }
    // fetch rejects with a generic "Network request failed" when offline.
    throw new Error('Network error. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}

function wordCount(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}

// Too thin to grade (silence / dropped mic). Shared by both transports so a
// non-answer never produces a hallucinated score.
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

function normalizeScore(score) {
  const n = Math.round(Number(score));
  if (!Number.isFinite(n)) return 5;
  return Math.max(1, Math.min(10, n));
}

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
  if (start !== -1 && end !== -1 && end > start) text = text.substring(start, end + 1);
  return JSON.parse(text);
}

// Single Claude call with one automatic retry on transient (429/5xx/network)
// failures. `model` lets callers pick a faster model for the grading path.
async function callClaude({ system, messages, maxTokens = 1024, model = CLAUDE_MODEL }) {
  // Direct path requires a baked-in key. If the build shipped without one (and
  // no backend is configured), fail loud and clear rather than firing a request
  // with `x-api-key: undefined` that returns a cryptic 401.
  if (!ANTHROPIC_API_KEY) {
    throw new Error('AI service is not configured. Please update to the latest version or try again later.');
  }
  const body = { model, max_tokens: maxTokens, messages };
  if (system) body.system = system;
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetchWithTimeout(ANTHROPIC_URL, {
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

const textOf = (data) => (data.content?.[0]?.text || '').trim();
async function callClaudeJson(opts) {
  return parseJsonLoose(textOf(await callClaude(opts)));
}

function categoryGuidance(category) {
  switch (category) {
    case 'Behavioral':
      return 'This is a BEHAVIORAL question — grade it against the STAR method. A strong answer sets a clear Situation and Task, spends most of its time on the specific Actions the speaker personally took, and ends with a concrete, ideally quantified Result. Call out which STAR elements are present, weak, or missing.';
    case 'Quick Fire':
      return 'This is a QUICK FIRE prompt — the candidate had only seconds to think. Reward fast, clear, confident, well-structured thinking and a decisive point of view; penalize rambling, filler, and hedging. Composure and clarity under time pressure matter more than domain depth.';
    case 'Persuade & Present':
      return 'This is a PERSUASION / PRESENTATION scenario — grade for a clear up-front thesis, structured supporting points, audience awareness, and a confident close. Penalize a buried point or trailing off.';
    case 'Interview Prep':
      return 'This is a general interview question — grade for substance, logical structure, relevance to the role, and confident, concise delivery.';
    default:
      return 'Grade for substance, structure, clarity, and confident delivery.';
  }
}

// ─── Transcription ────────────────────────────────────────────────────────────

export async function transcribeAudio(audioUri) {
  try {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const blob = await fetch(audioUri).then((r) => r.blob());
      formData.append('file', blob, 'recording.webm');
    } else {
      formData.append('file', { uri: audioUri, type: 'audio/m4a', name: 'recording.m4a' });
    }

    if (USE_BACKEND) {
      const response = await fetchWithTimeout(`${API_BASE}/api/transcribe`, { method: 'POST', body: formData }, 60000);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Transcription failed');
      return data.text;
    }

    if (!OPENAI_API_KEY) {
      throw new Error('Transcription service is not configured. Please update to the latest version or try again later.');
    }
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    const response = await fetchWithTimeout('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'multipart/form-data' },
      body: formData,
    }, 60000);
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
    let questions;
    if (USE_BACKEND) {
      ({ questions } = await postJson('/api/questions', { role, category }));
    } else {
      questions = await directGenerateQuestions(role, category);
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format returned');
    }
    return questions;
  } catch (error) {
    console.error('Question generation error:', error);
    throw error;
  }
}

async function directGenerateQuestions(role, category) {
  let prompt;
  if (category === 'Quick Fire') {
    prompt = `Generate 10 rapid-fire communication prompts that test quick thinking and verbal clarity under time pressure — NOT domain knowledge. Mix: explain a concept simply in 30 seconds, sell or pitch something, take and defend a position, and handle a curveball. One crisp sentence each, concrete and varied (no near-duplicates), ordered approachable to spicy. Return ONLY a valid JSON array of strings.`;
  } else if (category === 'Behavioral') {
    const roleContext =
      role && role.trim().length >= 3
        ? ` Tailor two or three to someone targeting a ${role} role, keep the rest broadly applicable.`
        : '';
    prompt = `You are an experienced interview coach. Generate 10 realistic behavioral interview questions testing the STAR method. Cover a spread of competencies: leadership, teamwork, conflict, failure, initiative, pressure, ethics, influence — no two on the same competency.${roleContext} Phrase them as a real interviewer would, ordered approachable to challenging. Return ONLY a valid JSON array of strings.`;
  } else if (category === 'Persuade & Present') {
    prompt = `You are a communication coach. Generate 10 realistic practice scenarios for someone preparing to ${role}. Each should force a clear thesis, structured points, and a confident close. Vary audience and stakes, one sentence each, no near-duplicates, ordered foundational to high-pressure. Return ONLY a valid JSON array of strings.`;
  } else {
    const isVague = role.trim().length < 8;
    const vaguePrefix = isVague ? 'The user gave a broad description, so cover a range of common roles within that area. ' : '';
    prompt = `${vaguePrefix}You are a career coach who specializes in ${role} recruiting and knows exactly what these interviews test. Generate 10 realistic, high-quality practice questions a candidate would genuinely face for a ${role} position. Include a deliberate mix of technical/role-specific, behavioral, and fit/motivation questions. Specific, no near-duplicates, ordered foundational to advanced. Return ONLY a valid JSON array of strings.`;
  }
  return callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 1024 });
}

// ─── Prep Kit ─────────────────────────────────────────────────────────────────

function buildPrepKitPrompt(company, role) {
  const roleContext = role ? `a ${role} position at ${company}` : `a role at ${company}`;
  return `You are an elite career intelligence analyst. Generate a comprehensive, firm-specific interview prep kit for someone interviewing for ${roleContext}.

Return a valid JSON object with this exact structure:
{
  "company_overview": {
    "what_they_do": "2-3 sentence description of the firm and their strategy",
    "key_differentiators": ["3-4 things that make this firm different"],
    "culture_signals": ["4-5 specific culture values or traits"],
    "interview_style": "1-2 sentences on their interview process"
  },
  "likely_questions": {
    "technical": [{"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."}],
    "behavioral": [{"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."}],
    "fit_and_motivation": [{"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."}],
    "market_awareness": [{"question": "...", "why_they_ask": "...", "strong_answer_hits": "..."}]
  },
  "talking_points": ["4 key facts or angles to weave in"],
  "red_flags": ["3 things that signal poor fit"],
  "training_plan": {
    "day_1": {"focus": "...", "drill_questions": ["q1", "q2"]},
    "day_2": {"focus": "...", "drill_questions": ["q1", "q2"]},
    "day_3": {"focus": "...", "drill_questions": ["q1", "q2"]},
    "day_4": {"focus": "...", "drill_questions": ["q1", "q2"]},
    "day_5": {"focus": "Full mock", "drill_questions": ["q1", "q2", "q3"]}
  }
}
Provide 5 technical, 4 behavioral, 3 fit_and_motivation, 3 market_awareness questions. Be specific to this exact firm — reference real strategy, values, and positioning. CRITICAL: return ONLY the raw JSON object, starting with { and ending with }.`;
}

export async function generatePrepKit(company, role) {
  try {
    if (USE_BACKEND) return await postJson('/api/prep-kit', { company, role });
    const prompt = buildPrepKitPrompt(company, role);
    let data = await callClaude({ messages: [{ role: 'user', content: prompt }], maxTokens: 4096 });
    if (data.stop_reason === 'max_tokens') {
      data = await callClaude({ messages: [{ role: 'user', content: prompt }], maxTokens: 8192 });
      if (data.stop_reason === 'max_tokens') {
        throw new Error('Prep kit response was too large. Try a more specific role.');
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
  if (USE_BACKEND) return postJson('/api/mock-turn', { conversation, prepKit, company, role, exchangeCount });
  return directMockTurn(conversation, prepKit, company, role, exchangeCount);
}

async function directMockTurn(conversation, prepKit, company, role, exchangeCount) {
  const roleContext = role || 'the open position';
  const prepKitSummary = JSON.stringify({
    interview_style: prepKit?.company_overview?.interview_style,
    culture_signals: prepKit?.company_overview?.culture_signals,
    likely_questions: prepKit?.likely_questions,
  });
  const isNearEnd = exchangeCount >= 8;
  const isFinalExchange = exchangeCount >= 9;
  const systemPrompt = `You are a sharp, experienced interviewer conducting a realistic interview for a ${roleContext} position at ${company}. Firm intel: ${prepKitSummary}.

Conduct it like a real human interviewer, not a quiz bot: ask ONE question at a time, keep lines natural and concise, briefly introduce yourself first (exchange ${exchangeCount + 1} of ~10). When an answer is vague or interesting, ask a pointed follow-up (roughly one follow-up per two new questions). Move across fit, behavioral, and role-relevant questions using the intel. Professional but challenging; do not coach mid-interview.${isNearEnd ? '\nYou are near the end — start to wrap up.' : ''}${isFinalExchange ? '\nThis is the final exchange. Close with: "That\'s all I had for today. Do you have any questions for me?" and set is_closing to true.' : ''}

Return ONLY valid JSON: {"interviewer_line": "...", "internal_note": "...", "is_closing": false}`;
  const apiMessages = [{ role: 'user', content: 'Please begin the interview. Introduce yourself and ask your first question.' }];
  for (const turn of conversation) {
    if (turn.type === 'ai') {
      apiMessages.push({ role: 'assistant', content: JSON.stringify({ interviewer_line: turn.line, internal_note: turn.note || '', is_closing: false }) });
    } else {
      apiMessages.push({ role: 'user', content: turn.transcript });
    }
  }
  return callClaudeJson({ system: systemPrompt, messages: apiMessages, maxTokens: 1024 });
}

export async function generateMockInterviewDebrief(conversation, company, role) {
  let result;
  if (USE_BACKEND) result = await postJson('/api/mock-debrief', { conversation, company, role });
  else result = await directMockDebrief(conversation, company, role);
  if (result && result.overall_score != null) result.overall_score = normalizeScore(result.overall_score);
  return result;
}

async function directMockDebrief(conversation, company, role) {
  const roleContext = role || 'the position';
  const transcriptText = conversation
    .map((t) => (t.type === 'ai' ? `INTERVIEWER: ${t.line}` : `CANDIDATE: ${t.transcript}`))
    .join('\n\n');
  const notesText =
    conversation.filter((t) => t.type === 'ai' && t.note).map((t) => `- ${t.note}`).join('\n') || 'None';
  const numAnswers = conversation.filter((t) => t.type === 'user').length;
  const prompt = `You are CHRM, an elite interview coach. You analyzed a mock interview for a ${roleContext} position at ${company}. Be direct, specific, and honest.

${SCORING_RUBRIC}

FULL TRANSCRIPT:
${transcriptText}

INTERVIEWER'S PRIVATE NOTES:
${notesText}

Judge each candidate answer on substance, structure (STAR for behavioral), relevance, and confident delivery. Return ONLY valid JSON:
{
  "overall_score": <1-10>,
  "strongest_exchange_index": <0-based index into the ${numAnswers} answers>,
  "strongest_quote": "<verbatim, max 25 words>",
  "strongest_reason": "<one sentence>",
  "weakest_exchange_index": <0-based index>,
  "weakest_quote": "<verbatim, max 25 words>",
  "weakest_suggestion": "<one actionable improvement>",
  "per_exchange_scores": [<score 1-10 for each of the ${numAnswers} answers, in order>],
  "work_on": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}`;
  return callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 1024 });
}

// ─── Feedback (Interview Prep / Behavioral / Quick Fire / Persuade) ─────────────

export async function getFeedback(transcript, question, category, role) {
  try {
    if (isInsufficientAnswer(transcript)) return insufficientResult(question);
    let result;
    if (USE_BACKEND) result = await postJson('/api/feedback', { transcript, question, category, role });
    else result = await directFeedback(transcript, question, category, role);
    result.score = normalizeScore(result.score);
    return result;
  } catch (error) {
    console.error('Feedback error:', error);
    throw error;
  }
}

async function directFeedback(transcript, question, category, role) {
  const roleContext = role ? ` The candidate is targeting a ${role} role.` : '';
  const prompt = `You are CHRM, an elite AI communication coach. Be direct, honest, and coach-like — no emojis. ${categoryGuidance(category)}${roleContext}

${SCORING_RUBRIC}

Keep it concise: each "strong"/"improve" item is 1-2 sentences; the exemplary answer is 3-4 sentences and should sound natural spoken aloud. Return ONLY valid JSON.

Category: ${category}
Question: "${question}"
Answer transcript: "${transcript}"

{
  "score": <1-10>,
  "strong": ["<observation>", "<observation>"],
  "improve": ["<observation>", "<observation>"],
  "stronger_version": "<3-4 sentence spoken-sounding model answer>"
}`;
  return callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 900, model: FEEDBACK_MODEL });
}

// ─── Technical grading (Interview Prep / Fit / Markets / PE banks) ───────────────

export async function getTechnicalFeedback(transcript, question, referenceAnswer, keyPoints, role) {
  try {
    if (isInsufficientAnswer(transcript)) return insufficientResult(question);
    let result;
    if (USE_BACKEND) {
      result = await postJson('/api/technical-feedback', { transcript, question, referenceAnswer, keyPoints, role });
    } else {
      result = await directTechnicalFeedback(transcript, question, referenceAnswer, keyPoints, role);
    }
    result.score = normalizeScore(result.score);
    return result;
  } catch (error) {
    console.error('Technical feedback error:', error);
    throw error;
  }
}

async function directTechnicalFeedback(transcript, question, referenceAnswer, keyPoints, role) {
  const target = role ? ` The candidate is recruiting for a ${role} role.` : '';
  const points = (keyPoints || []).map((p) => `- ${p}`).join('\n');
  const prompt = `You are CHRM, an elite technical interview coach for finance recruiting.${target} Grade the candidate's SPOKEN answer against the canonical answer. Reward accuracy and hitting the key points; penalize errors, vagueness, and missing core concepts. No emojis.

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
  "strong": ["<what was correct / hit, 1-2 sentences each>"],
  "improve": ["<what was missed or wrong, 1-2 sentences each>"],
  "stronger_version": "<a tight, correct model answer to say out loud>"
}`;
  return callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 1024, model: FEEDBACK_MODEL });
}

// ─── Resume Walkthrough + Improver ──────────────────────────────────────────────

export async function getResumeFeedback(transcript, resumeText, role) {
  try {
    if (isInsufficientAnswer(transcript)) return insufficientResult('Walk me through your resume');
    let result;
    if (USE_BACKEND) result = await postJson('/api/resume-feedback', { transcript, resumeText, role });
    else result = await directResumeFeedback(transcript, resumeText, role);
    result.score = normalizeScore(result.score);
    return result;
  } catch (error) {
    console.error('Resume feedback error:', error);
    throw error;
  }
}

async function directResumeFeedback(transcript, resumeText, role) {
  const target = role ? ` The candidate is recruiting for a ${role} role.` : '';
  const prompt = `You are CHRM, an elite communication coach for finance recruiting. The candidate is practicing "Walk me through your resume" — a single continuous 60-90 second spoken narrative, NOT a Q&A.${target}

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
  return callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 1024, model: FEEDBACK_MODEL });
}

export async function extractResumeTextFromPdf(base64Pdf) {
  if (USE_BACKEND) {
    const { text } = await postJson('/api/resume-extract', { base64Pdf });
    return text;
  }
  const data = await callClaude({
    maxTokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Pdf } },
          { type: 'text', text: 'Extract the full text of this resume as clean plain text. Preserve structure (sections, titles, bullets), but add no commentary or markdown. Return only the resume text.' },
        ],
      },
    ],
  });
  return textOf(data);
}

export async function improveResume(resumeText, role) {
  if (USE_BACKEND) return postJson('/api/resume-improve', { resumeText, role });
  const target = role ? `a ${role} role` : 'finance recruiting';
  const prompt = `You are an elite resume coach for finance recruiting (IB/PE/consulting). Improve this resume for ${target}. Rewrite weak bullets to lead with a strong action verb and quantified impact, tighten language, and surface gaps a recruiter would notice.

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
  return callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 2048 });
}

// ─── HireVue Simulation ─────────────────────────────────────────────────────────

export async function generateHireVueQuestions(company, role, mix, count, prepKit = null) {
  let questions;
  if (USE_BACKEND) {
    ({ questions } = await postJson('/api/hirevue-questions', { company, role, mix, count, prepKit }));
  } else {
    questions = await directHireVueQuestions(company, role, mix, count, prepKit);
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Invalid HireVue questions format returned');
  }
  return questions;
}

async function directHireVueQuestions(company, role, mix, count, prepKit) {
  const roleContext = role ? `a ${role} position at ${company}` : `a role at ${company}`;
  const mixList = mix && mix.length ? mix.join(', ') : 'Behavioral, Company, Technical';
  let kitContext = '';
  if (prepKit) {
    const kitData = {
      interview_style: prepKit.company_overview?.interview_style,
      culture_signals: prepKit.company_overview?.culture_signals,
      likely_questions: prepKit.likely_questions,
    };
    kitContext = `\n\nUse this firm intelligence to make Company and Technical questions specific: ${JSON.stringify(kitData)}`;
  }
  const prompt = `You are designing a HireVue-style one-way digital interview for ${roleContext}. The candidate reads each question and records a short spoken answer with no live interviewer.

Generate exactly ${count} questions across these categories: ${mixList}.
- "Behavioral": STAR competencies (any role).
- "Company": motivation and fit specific to ${company}.
- "Technical": role-relevant knowledge for a ${role || 'candidate'}.
Realistic and specific, no near-duplicates, ordered approachable to challenging.${kitContext}

Return ONLY a valid JSON array of objects:
[{"question": "...", "category": "Behavioral"}]
"category" must be exactly one of: Behavioral, Company, Technical.`;
  return callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 1500 });
}

export async function generateHireVueDebrief(company, role, items) {
  let result;
  if (USE_BACKEND) result = await postJson('/api/hirevue-debrief', { company, role, items });
  else result = await directHireVueDebrief(company, role, items);
  if (result && result.overall_score != null) result.overall_score = normalizeScore(result.overall_score);
  if (Array.isArray(result?.per_question)) {
    result.per_question = result.per_question.map((q) => ({ ...q, score: normalizeScore(q.score) }));
  }
  return result;
}

async function directHireVueDebrief(company, role, items) {
  const roleContext = role ? `a ${role} position at ${company}` : `a role at ${company}`;
  const transcriptBlock = items
    .map((it, i) => `[Q${i + 1} · ${it.category}] ${it.question}\nANSWER: ${it.transcript || '(no answer recorded)'}`)
    .join('\n\n');
  const n = items.length;
  const prompt = `You are CHRM, an elite AI interview coach. You reviewed a recorded HireVue-style one-way interview for ${roleContext}. Grade each answer by category: Behavioral against STAR; Company on genuine motivation and firm knowledge; Technical on accuracy and structure. Missing/empty answers score low. Be direct and concise.

${SCORING_RUBRIC}

THE INTERVIEW (${n} questions):
${transcriptBlock}

Return ONLY valid JSON:
{
  "overall_score": <1-10>,
  "summary": "<2-3 sentence overall read>",
  "strongest_index": <0-based>,
  "weakest_index": <0-based>,
  "per_question": [{"score": <1-10>, "strong": "<1 sentence>", "improve": "<1 sentence>"}],
  "work_on": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}
"per_question" must have exactly ${n} elements in order.`;
  return callClaudeJson({ messages: [{ role: 'user', content: prompt }], maxTokens: 2048 });
}
