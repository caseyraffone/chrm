import { Platform } from 'react-native';
import { API_BASE_URL } from '@env';

// ─── Transport: backend-only for production ───────────────────────────────────
//
// Every AI call routes through the CHRM backend (see /server) so the OpenAI /
// Anthropic keys never ship in the client. Set API_BASE_URL to a local backend
// for development, or let it default to the production Vercel backend.

const API_BASE = (API_BASE_URL || 'https://chrm-two.vercel.app').replace(/\/$/, '');

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

function normalizeFeedbackResult(result, { maxStrong = 2, maxImprove = 2 } = {}) {
  if (!result || typeof result !== 'object') return result;
  if (result.score != null) result.score = normalizeScore(result.score);
  if (Array.isArray(result.strong)) result.strong = result.strong.slice(0, maxStrong);
  if (Array.isArray(result.improve)) result.improve = result.improve.slice(0, maxImprove);
  return result;
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

    const response = await fetchWithTimeout(`${API_BASE}/api/transcribe`, { method: 'POST', body: formData }, 60000);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Transcription failed');
    return data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

// ─── Question generation ──────────────────────────────────────────────────────

export async function generateQuestions(role, category) {
  try {
    const { questions } = await postJson('/api/questions', { role, category });
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

export async function generatePrepKit(company, role) {
  try {
    return await postJson('/api/prep-kit', { company, role });
  } catch (error) {
    console.error('Prep kit error:', error);
    throw error;
  }
}

// ─── Mock Interview ───────────────────────────────────────────────────────────

export async function getMockInterviewTurn(conversation, prepKit, company, role, exchangeCount) {
  return postJson('/api/mock-turn', { conversation, prepKit, company, role, exchangeCount });
}

export async function generateMockInterviewDebrief(conversation, company, role) {
  const result = await postJson('/api/mock-debrief', { conversation, company, role });
  if (result && result.overall_score != null) result.overall_score = normalizeScore(result.overall_score);
  return result;
}

// ─── Feedback (Interview Prep / Behavioral / Quick Fire / Persuade) ─────────────

export async function getFeedback(transcript, question, category, role) {
  try {
    if (isInsufficientAnswer(transcript)) return insufficientResult(question);
    const result = await postJson('/api/feedback', { transcript, question, category, role });
    return normalizeFeedbackResult(result);
  } catch (error) {
    console.error('Feedback error:', error);
    throw error;
  }
}

// ─── Technical grading (Interview Prep / Fit / Markets / PE banks) ───────────────

export async function getTechnicalFeedback(transcript, question, referenceAnswer, keyPoints, role) {
  try {
    if (isInsufficientAnswer(transcript)) return insufficientResult(question);
    const result = await postJson('/api/technical-feedback', { transcript, question, referenceAnswer, keyPoints, role });
    return normalizeFeedbackResult(result);
  } catch (error) {
    console.error('Technical feedback error:', error);
    throw error;
  }
}

// ─── Resume Walkthrough + Improver ──────────────────────────────────────────────

export async function getResumeFeedback(transcript, resumeText, role) {
  try {
    if (isInsufficientAnswer(transcript)) return insufficientResult('Walk me through your resume');
    const result = await postJson('/api/resume-feedback', { transcript, resumeText, role });
    return normalizeFeedbackResult(result);
  } catch (error) {
    console.error('Resume feedback error:', error);
    throw error;
  }
}

export async function extractResumeTextFromPdf(base64Pdf) {
  const { text } = await postJson('/api/resume-extract', { base64Pdf });
  return text;
}

export async function improveResume(resumeText, role) {
  return postJson('/api/resume-improve', { resumeText, role });
}

// ─── HireVue Simulation ─────────────────────────────────────────────────────────

export async function generateHireVueQuestions(company, role, mix, count, prepKit = null) {
  const { questions } = await postJson('/api/hirevue-questions', { company, role, mix, count, prepKit });
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Invalid HireVue questions format returned');
  }
  return questions;
}

export async function generateHireVueDebrief(company, role, items) {
  const result = await postJson('/api/hirevue-debrief', { company, role, items });
  if (result && result.overall_score != null) result.overall_score = normalizeScore(result.overall_score);
  if (Array.isArray(result?.per_question)) {
    result.per_question = result.per_question.map((q) => ({ ...q, score: normalizeScore(q.score) }));
  }
  return result;
}
