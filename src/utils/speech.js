// ─── Speaking-delivery analytics ────────────────────────────────────────────────
//
// Pure functions (no RN/network deps, fully unit-testable) that turn a transcript
// + spoken duration into delivery metrics — pace and filler words — the kind of
// "how you said it" feedback that complements the AI's "what you said" grade.
// Computed locally from data we already have, so it costs nothing extra.

// Common spoken fillers. Multi-word phrases are checked first so "you know" isn't
// double-counted as "know". "like" and "so" are included but only counted as
// standalone filler words, not inside other words.
const FILLER_PATTERNS = [
  'you know',
  'kind of',
  'sort of',
  'i mean',
  'um',
  'uh',
  'uhh',
  'umm',
  'er',
  'ah',
  'like',
  'basically',
  'actually',
  'literally',
  'honestly',
  'right',
];

export function countWords(transcript) {
  return (transcript || '').trim().split(/\s+/).filter(Boolean).length;
}

// Counts filler occurrences as whole words/phrases, case-insensitive.
export function countFillers(transcript) {
  const text = (transcript || '').toLowerCase();
  let total = 0;
  const breakdown = {};
  for (const phrase of FILLER_PATTERNS) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'g');
    const matches = text.match(re);
    if (matches && matches.length) {
      total += matches.length;
      breakdown[phrase] = matches.length;
    }
  }
  return { total, breakdown };
}

// Pace bands tuned for interview speaking. ~120-160 wpm reads as composed and
// clear; much slower drags, much faster reads as rushed/nervous.
function paceLabel(wpm) {
  if (wpm < 100) return { label: 'A bit slow', tone: 'warn' };
  if (wpm <= 165) return { label: 'Great pace', tone: 'good' };
  if (wpm <= 195) return { label: 'A little fast', tone: 'warn' };
  return { label: 'Rushed', tone: 'bad' };
}

// Returns null when there isn't enough signal to be meaningful (too short),
// so callers can simply hide the delivery card in that case.
export function analyzeSpeech(transcript, durationSeconds) {
  const words = countWords(transcript);
  if (words < 12 || !durationSeconds || durationSeconds < 5) return null;

  const wpm = Math.round(words / (durationSeconds / 60));
  const { total: fillers, breakdown } = countFillers(transcript);
  const fillerRate = words > 0 ? fillers / words : 0;
  const pace = paceLabel(wpm);

  // A single, concrete delivery tip prioritizing the bigger issue.
  let tip;
  if (fillerRate > 0.06) {
    const top = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0];
    tip = `Filler words are creeping in${top ? ` ("${top[0]}" ${top[1]}x)` : ''} — pause silently instead.`;
  } else if (pace.tone !== 'good') {
    tip =
      wpm > 165
        ? 'Slow down a touch and let key points land — you sound rushed.'
        : 'Pick up the energy slightly; a brisker pace reads as more confident.';
  } else {
    tip = 'Clear, composed delivery — keep it up.';
  }

  return {
    words,
    durationSeconds: Math.round(durationSeconds),
    wpm,
    fillers,
    fillerRate,
    fillerBreakdown: breakdown,
    paceLabel: pace.label,
    paceTone: pace.tone,
    fillerTone: fillerRate > 0.06 ? 'bad' : fillerRate > 0.03 ? 'warn' : 'good',
    tip,
  };
}
