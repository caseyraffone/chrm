export const CATEGORIES = {
  INTERVIEW_PREP: 'Interview Prep',
  BEHAVIORAL: 'Behavioral',
  PERSUADE_PRESENT: 'Persuade & Present',
  QUICK_FIRE: 'Quick Fire',
};

export const CATEGORY_SUBTITLES = {
  'Interview Prep': 'Technical & behavioral — tailored to your target role',
  'Behavioral': 'STAR-method answers that work for any role',
  'Persuade & Present': 'Pitch, defend, and deliver ideas with clarity',
  'Quick Fire': 'Think fast — random prompts, timed pressure',
};

// Static behavioral bank — works instantly and offline. The Behavioral drill
// uses these immediately; role-tailored questions can still be generated via
// generateQuestions('Behavioral', role).
export const BEHAVIORAL_QUESTIONS = [
  'Tell me about yourself.',
  'Tell me about a time you faced a significant challenge and how you handled it.',
  'Describe a situation where you had to work with a difficult teammate.',
  'Tell me about a time you failed. What did you learn?',
  'Give an example of a goal you set and how you achieved it.',
  'Describe a time you had to lead a team or take initiative without being asked.',
  'Tell me about a time you had to meet a tight deadline under pressure.',
  'Describe a situation where you disagreed with a decision. What did you do?',
  'Tell me about a time you had to persuade someone to see things your way.',
  'Give an example of a time you made a mistake. How did you handle it?',
  'Describe a time you received tough feedback. How did you respond?',
  'Tell me about a time you went above and beyond what was expected.',
];
