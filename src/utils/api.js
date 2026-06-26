import { OPENAI_API_KEY, ANTHROPIC_API_KEY } from '@env';

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
      prompt = `Generate 10 rapid-fire communication prompts. Mix of: explain a concept in 30 seconds, sell me something, defend a position, answer a curveball question. These should test quick thinking and verbal clarity, not domain knowledge. Return ONLY a valid JSON array of prompt strings, no explanation.`;
    } else if (category === 'Behavioral') {
      const roleContext = role && role.trim().length >= 3 ? ` Tailor a few of them to someone targeting a ${role} role, but keep most broadly applicable.` : '';
      prompt = `You are an interview coach. Generate 10 realistic behavioral interview questions that test the STAR method (Situation, Task, Action, Result). Cover a range of competencies: leadership, teamwork, conflict, failure, initiative, handling pressure, and ethics. These apply to almost any role.${roleContext} Order them from approachable to challenging. Return ONLY a valid JSON array of question strings, no explanation.`;
    } else if (category === 'Persuade & Present') {
      prompt = `You are a communication coach. Generate 10 realistic practice scenarios for someone preparing to ${role}. Focus on persuasion, clarity, and structured delivery. Order from foundational to high-pressure. Return ONLY a valid JSON array of scenario prompt strings, no explanation.`;
    } else {
      // Interview Prep (and fallback)
      const isVague = role.trim().length < 8;
      const vaguePrefix = isVague
        ? 'The user gave a broad description. Generate questions that cover a range of common roles within that area. '
        : '';
      prompt = `${vaguePrefix}You are a career coach specializing in ${role} recruiting. Generate 10 realistic practice questions for an interview at a ${role} position. Order them from foundational to advanced. Include a mix of technical and behavioral questions. Return ONLY a valid JSON array of question strings, no explanation.`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Question generation failed');
    }

    const data = await response.json();
    const raw = data.content[0].text.trim();

    // Strip markdown code blocks if present (```json ... ``` or ``` ... ```)
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const text = match ? match[1].trim() : raw;

    const questions = JSON.parse(text);

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

function parsePrepKitResponse(responseText) {
  console.log('[PrepKit] Raw response preview:', responseText.substring(0, 200));

  // Strip markdown code blocks if present
  responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  // Extract just the JSON object in case there's surrounding text
  const startIndex = responseText.indexOf('{');
  const endIndex = responseText.lastIndexOf('}');
  if (startIndex !== -1 && endIndex !== -1) {
    responseText = responseText.substring(startIndex, endIndex + 1);
  }

  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error('[PrepKit] JSON parse failed. Cleaned text preview:', responseText.substring(0, 200));
    throw new Error(`Failed to parse prep kit response: ${parseError.message}`);
  }
}

async function callPrepKitAPI(prompt, maxTokens) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Prep kit generation failed');
  }

  return response.json();
}

export async function generatePrepKit(company, role) {
  try {
    const prompt = buildPrepKitPrompt(company, role);

    let data = await callPrepKitAPI(prompt, 4096);

    // If the response was cut off, retry with a higher token limit
    if (data.stop_reason === 'max_tokens') {
      console.warn('[PrepKit] Response truncated at 4096 tokens — retrying with 8192');
      throw new Error('Prep kit response was too large. Trying again with higher limit...');
    }

    return parsePrepKitResponse(data.content[0].text.trim());
  } catch (error) {
    if (error.message.includes('Trying again with higher limit')) {
      // Retry once with 8192 tokens
      try {
        console.log('[PrepKit] Retrying with max_tokens=8192');
        const prompt = buildPrepKitPrompt(company, role);
        const data = await callPrepKitAPI(prompt, 8192);

        if (data.stop_reason === 'max_tokens') {
          throw new Error('Prep kit response was still too large even at maximum size. Try a more specific role.');
        }

        return parsePrepKitResponse(data.content[0].text.trim());
      } catch (retryError) {
        console.error('Prep kit retry error:', retryError);
        throw retryError;
      }
    }

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

  const systemPrompt = `You are conducting a realistic interview for a ${roleContext} position at ${company}. You have the following intelligence about this firm's interview style and likely questions: ${prepKitSummary}.

Conduct the interview naturally. Ask one question at a time. This is exchange ${exchangeCount + 1} of approximately 10. Listen carefully to the candidate's response and ask relevant follow-up questions when their answer is vague, incomplete, or when deeper probing would be realistic. Be professional but challenging.
${isNearEnd ? '\nYou are near the end of the interview. Begin to wrap up.' : ''}
${isFinalExchange ? '\nThis is the final exchange. Close with: "That\'s all I had for today. Do you have any questions for me?" and set is_closing to true.' : ''}

Return ONLY valid JSON: {"interviewer_line": "...", "internal_note": "...", "is_closing": false}
- interviewer_line: what you say out loud to the candidate
- internal_note: your private 1-sentence assessment of their last answer (empty string for the opening line)
- is_closing: set to true ONLY when delivering the final closing line`;

  const apiMessages = [{ role: 'user', content: 'Please begin the interview. Introduce yourself and ask your first question.' }];
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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Mock interview API call failed');
  }

  const data = await response.json();
  const raw = data.content[0].text.trim();
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = match ? match[1].trim() : raw;
  return JSON.parse(jsonText);
}

export async function generateMockInterviewDebrief(conversation, company, role) {
  const roleContext = role || 'the position';

  const transcriptLines = conversation.map((turn) => {
    if (turn.type === 'ai') return `INTERVIEWER: ${turn.line}`;
    return `CANDIDATE: ${turn.transcript}`;
  });
  const transcriptText = transcriptLines.join('\n\n');

  const notesText = conversation
    .filter((t) => t.type === 'ai' && t.note)
    .map((t) => `- ${t.note}`)
    .join('\n') || 'None';

  const userAnswers = conversation.filter((t) => t.type === 'user');
  const numAnswers = userAnswers.length;

  const prompt = `You analyzed a mock interview for a ${roleContext} position at ${company}.

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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Debrief generation failed');
  }

  const data = await response.json();
  const raw = data.content[0].text.trim();
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = match ? match[1].trim() : raw;
  return JSON.parse(jsonText);
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function getFeedback(transcript, question, category, role) {
  try {
    const roleContext = role ? ` targeting a ${role} role` : '';
    const isBehavioral = category === 'Behavioral';
    const behavioralRubric = isBehavioral
      ? ` This is a BEHAVIORAL question — judge it against the STAR method. A strong answer sets a clear Situation and Task, spends most of its time on specific Actions the speaker personally took, and ends with a concrete Result (ideally quantified). In your feedback, explicitly call out which STAR elements are present, weak, or missing.`
      : '';
    const prompt = `You are CHRM, an elite AI communication coach. Keep all feedback concise. Strengths: 1-2 sentences max. Areas to improve: 1-2 sentences max. Exemplary response: 3-4 sentences max. Total response should be under 200 words. Do not use emojis. Be direct and coach-like.${behavioralRubric} Analyze this spoken answer and return ONLY valid JSON — no markdown, no extra text.

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Feedback generation failed');
    }

    const data = await response.json();
    const raw = data.content[0].text.trim();
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const text = match ? match[1].trim() : raw;
    return JSON.parse(text);
  } catch (error) {
    console.error('Feedback error:', error);
    throw error;
  }
}

// ─── HireVue Simulation ─────────────────────────────────────────────────────────

// Generates the question set for a one-way HireVue-style digital interview.
// `mix` is an array of categories to include, e.g. ['Behavioral', 'Company', 'Technical'].
// When a saved prep kit is passed, its intel is used to make company/technical
// questions specific to the firm.
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

Generate exactly ${count} questions. Distribute them across these categories: ${mixList}.
- "Behavioral" questions test the STAR method and general competencies (apply to any role).
- "Company" questions test motivation and fit specific to ${company} — why this firm, knowledge of what they do, values alignment.
- "Technical" questions test role-relevant knowledge for a ${role || 'candidate'}.
Order from approachable to challenging.${kitContext}

Return ONLY a valid JSON array, no markdown, no extra text. Each element must be an object:
[{"question": "...", "category": "Behavioral"}, {"question": "...", "category": "Company"}]
The "category" value must be exactly one of: Behavioral, Company, Technical.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'HireVue question generation failed');
  }

  const data = await response.json();
  const raw = data.content[0].text.trim();
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = match ? match[1].trim() : raw;
  const questions = JSON.parse(text);

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Invalid HireVue questions format returned');
  }
  return questions;
}

// Produces an AI debrief for a completed HireVue simulation.
// `items` = [{ question, category, transcript }] in answered order.
// Returns an overall read plus per-question scoring and feedback.
export async function generateHireVueDebrief(company, role, items) {
  const roleContext = role ? `a ${role} position at ${company}` : `a role at ${company}`;
  const transcriptBlock = items
    .map(
      (it, i) =>
        `[Q${i + 1} · ${it.category}] ${it.question}\nANSWER: ${it.transcript || '(no answer recorded)'}`
    )
    .join('\n\n');

  const n = items.length;
  const prompt = `You are CHRM, an elite AI interview coach. You reviewed a candidate's recorded HireVue-style one-way interview for ${roleContext}. Behavioral answers should be judged against the STAR method (Situation, Task, Action, Result). Company answers should show genuine motivation and firm-specific knowledge. Technical answers should be accurate and well-structured. Be direct, honest, and concise.

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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'HireVue debrief generation failed');
  }

  const data = await response.json();
  const raw = data.content[0].text.trim();
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const text = match ? match[1].trim() : raw;
  return JSON.parse(text);
}
