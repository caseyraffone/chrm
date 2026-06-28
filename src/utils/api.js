import { Platform } from 'react-native';
import Constants from 'expo-constants';

// All AI calls go through the CHRM backend (see /server) so the OpenAI and
// Anthropic keys never ship in the client. The backend URL is injected via
// app.config.js (extra.API_BASE_URL ← process.env.API_BASE_URL), which works
// both locally (.env loaded by dotenv) and in CI/hosted builds (env var set in
// Netlify/Vercel settings). Falls back to localhost for local dev.
// On a physical device, use your machine's LAN IP instead of localhost.
const API_BASE = (
  Constants.expoConfig?.extra?.API_BASE_URL || 'http://localhost:8787'
).replace(/\/$/, '');

async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request to ${path} failed (${res.status})`);
  }
  return data;
}

// ─── Transcription ────────────────────────────────────────────────────────────

export async function transcribeAudio(audioUri) {
  try {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      // On web the recording is a blob URL — fetch it into a real Blob.
      const blob = await fetch(audioUri).then((r) => r.blob());
      formData.append('file', blob, 'recording.webm');
    } else {
      // React Native accepts a { uri, type, name } file descriptor.
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });
    }

    const response = await fetch(`${API_BASE}/api/transcribe`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Transcription failed');
    }
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
  return postJson('/api/mock-debrief', { conversation, company, role });
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function getFeedback(transcript, question, category, role) {
  try {
    return await postJson('/api/feedback', { transcript, question, category, role });
  } catch (error) {
    console.error('Feedback error:', error);
    throw error;
  }
}

// ─── HireVue Simulation ─────────────────────────────────────────────────────────

export async function generateHireVueQuestions(company, role, mix, count, prepKit = null) {
  const { questions } = await postJson('/api/hirevue-questions', {
    company,
    role,
    mix,
    count,
    prepKit,
  });
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Invalid HireVue questions format returned');
  }
  return questions;
}

export async function generateHireVueDebrief(company, role, items) {
  return postJson('/api/hirevue-debrief', { company, role, items });
}
