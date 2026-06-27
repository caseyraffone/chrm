// ─── IB Markets question bank ──────────────────────────────────────────────────
//
// Curated markets-awareness and stock-pitch prompts. These reward structure and
// substance over a single right answer, so each carries a model framework
// (reference_answer) and what an interviewer listens for (key_points). Graded via
// getTechnicalFeedback() against that framework. The candidate's specific views
// fill it in; the framework and reasoning quality are what get graded.
//
// difficulty: 1 = Foundational (free), 2 = Intermediate (Pro), 3 = Advanced (Pro)

export const IB_MARKETS_BANK = [
  // ── Markets Awareness ──────────────────────────────────────────────────────────
  {
    id: 'ib_mkt_aware_01',
    topic: 'Markets Awareness',
    difficulty: 1,
    question: 'What market figure have you been following, and why does it matter?',
    reference_answer:
      'A strong answer names a specific figure — say the 10-year Treasury yield, the fed funds rate, or a major index level — states roughly where it is and which direction it’s moving, and then explains the “so what”: how it affects valuations, deal activity, or the economy. The reasoning and connection to markets matter far more than reciting an exact number.',
    key_points: [
      'Name a specific figure and rough level/direction',
      'Explain the “so what” — impact on valuations/deals/economy',
      'Reasoning matters more than the exact number',
    ],
  },
  {
    id: 'ib_mkt_aware_02',
    topic: 'Markets Awareness',
    difficulty: 2,
    question: 'What is going on in the markets right now?',
    reference_answer:
      'A strong answer picks one or two coherent themes — for example the rate environment and what the Fed is doing, inflation, or a sector story — and explains them with cause and effect rather than listing headlines. It should connect the theme to implications for companies, valuations, or deal activity, showing the candidate processes markets rather than just consuming news.',
    key_points: [
      'Pick one or two coherent themes, not a headline dump',
      'Explain with cause and effect',
      'Connect to implications for valuations / deal activity',
    ],
  },
  {
    id: 'ib_mkt_aware_03',
    topic: 'Markets Awareness',
    difficulty: 2,
    question: 'Tell me about a recent deal or IPO you found interesting.',
    reference_answer:
      'A strong answer names a specific, reasonably recent transaction, summarizes the parties and rough size, and explains the strategic rationale — why the buyer wanted it or why the company went public — plus a point of view on whether it makes sense. It demonstrates the candidate follows transactions and can think like an advisor, not just recall a headline.',
    key_points: [
      'Specific, recent deal: parties and rough size',
      'Explain the strategic rationale',
      'Offer a point of view on whether it makes sense',
    ],
  },

  // ── Stock Pitch ────────────────────────────────────────────────────────────────
  {
    id: 'ib_mkt_pitch_01',
    topic: 'Stock Pitch',
    difficulty: 2,
    question: 'Pitch me a stock.',
    reference_answer:
      'A strong pitch is structured: a one-line recommendation (buy/long), a quick description of the business, then two or three specific reasons it’s mispriced or undervalued — for example a catalyst, a competitive advantage, or a valuation gap versus peers. It states the thesis, ideally a rough valuation or target, the key risks, and what would prove the thesis right or wrong. Conviction plus structure matters more than the specific name.',
    key_points: [
      'Clear recommendation + brief business description',
      '2–3 specific reasons: catalyst, moat, or valuation gap',
      'Valuation/target, key risks, and what proves you right',
    ],
  },
  {
    id: 'ib_mkt_pitch_02',
    topic: 'Stock Pitch',
    difficulty: 3,
    question: 'Pitch me a short.',
    reference_answer:
      'A strong short pitch mirrors a long but argues a company is overvalued or deteriorating: a clear thesis, then specific reasons — eroding fundamentals, an unsustainable valuation, accounting red flags, or a structural headwind — plus a catalyst that forces the market to reprice. It must address the unique risks of shorting, like unlimited downside, borrow costs, and timing, which makes it harder than a long.',
    key_points: [
      'Clear short thesis: overvalued or deteriorating',
      'Specific drivers: weak fundamentals, valuation, red flags, headwind',
      'Name a catalyst and address short-specific risks (timing, squeeze)',
    ],
  },
  {
    id: 'ib_mkt_pitch_03',
    topic: 'Stock Pitch',
    difficulty: 2,
    question: 'If you had a million dollars to invest today, what would you do with it?',
    reference_answer:
      'A strong answer shows a reasoned framework: thinking about goals, time horizon, and risk tolerance, then an asset allocation across equities, fixed income, and cash, with a rationale tied to the current environment. Naming a specific idea or two with a thesis is a plus. It reveals how the candidate thinks about risk and reward, not whether they pick a winner.',
    key_points: [
      'Framework: goals, time horizon, risk tolerance',
      'Allocation across asset classes with rationale',
      'Optional specific ideas; shows risk/reward thinking',
    ],
  },
  {
    id: 'ib_mkt_pitch_04',
    topic: 'Stock Pitch',
    difficulty: 3,
    question: 'How would you value a stock you like?',
    reference_answer:
      'A strong answer lays out a multi-method approach: relative valuation using peer multiples like EV/EBITDA or P/E, an intrinsic DCF based on the company’s cash flows and a sensible discount rate, and a cross-check against precedent deals. The candidate should explain which method they’d weight most for this business and why, and acknowledge the key assumptions that drive the answer.',
    key_points: [
      'Multi-method: comps, DCF, precedents',
      'Justify which method to weight for this business',
      'Acknowledge the key assumptions driving value',
    ],
  },

  // ── Macro Views ────────────────────────────────────────────────────────────────
  {
    id: 'ib_mkt_macro_01',
    topic: 'Macro Views',
    difficulty: 2,
    question: 'Where do you think interest rates are headed, and why?',
    reference_answer:
      'A strong answer takes a clear but humble view grounded in the drivers: the inflation trend, the labor market, and the Fed’s stated stance, then reasons to a direction. It should connect the call to implications — for bond prices, equity valuations, and deal activity — and acknowledge the uncertainty. The quality of the reasoning matters more than being right.',
    key_points: [
      'Clear view grounded in inflation, labor market, Fed stance',
      'Connect to implications for bonds, equities, deals',
      'Show reasoning and acknowledge uncertainty',
    ],
  },
  {
    id: 'ib_mkt_macro_02',
    topic: 'Macro Views',
    difficulty: 2,
    question: 'What is your outlook on the economy over the next year?',
    reference_answer:
      'A strong answer organizes around a few indicators — growth, inflation, employment, and rates — forms a balanced base case, and notes the key risks on either side. It avoids being either a permabull or permabear and ties the macro view back to what it would mean for markets and corporate activity, showing structured thinking rather than a guess.',
    key_points: [
      'Organize around growth, inflation, employment, rates',
      'Balanced base case with upside/downside risks',
      'Tie back to markets and corporate activity',
    ],
  },
  {
    id: 'ib_mkt_macro_03',
    topic: 'Macro Views',
    difficulty: 2,
    question: 'What is a sector you are bullish or bearish on, and why?',
    reference_answer:
      'A strong answer picks a sector, takes a clear stance, and supports it with two or three specific drivers — secular trends, regulation, the rate environment, supply and demand, or valuation. It should show genuine knowledge of the sector and acknowledge the main counterargument, demonstrating the candidate can build and defend a thesis.',
    key_points: [
      'Pick a sector and take a clear stance',
      '2–3 specific drivers: trends, regulation, rates, valuation',
      'Show real sector knowledge and address the counterargument',
    ],
  },
  {
    id: 'ib_mkt_aware_04',
    topic: 'Markets Awareness',
    difficulty: 1,
    question: 'Roughly where is the fed funds rate and the 10-year Treasury yield right now?',
    reference_answer:
      'A strong answer gives a reasonable current level for both, notes the recent direction, and — most importantly — explains why they matter: the fed funds rate is the Fed’s policy lever that ripples into all borrowing costs, and the 10-year is a benchmark that influences mortgages, corporate borrowing, and equity discount rates. Knowing the direction and the “so what” matters more than nailing the decimal.',
    key_points: [
      'Reasonable current level + recent direction for both',
      'Fed funds = policy lever; 10-year = benchmark for borrowing/discounting',
      'Direction and significance over exact decimals',
    ],
  },
  {
    id: 'ib_mkt_aware_05',
    topic: 'Markets Awareness',
    difficulty: 2,
    question: 'Tell me about a company in the news you’ve been following.',
    reference_answer:
      'A strong answer picks a specific company, summarizes the recent news or development, and offers a point of view on what it means — for the company’s strategy, valuation, or industry. It shows the candidate processes business news analytically rather than just consuming headlines, and ideally connects it to a broader theme.',
    key_points: [
      'Specific company + the recent development',
      'A point of view on what it means',
      'Analytical, connected to a broader theme — not just a headline',
    ],
  },
  {
    id: 'ib_mkt_pitch_05',
    topic: 'Stock Pitch',
    difficulty: 2,
    question: 'What’s your favorite company, and would you invest in it?',
    reference_answer:
      'A strong answer separates admiring a company from the investment decision: it explains what makes the business excellent — moat, growth, management — and then assesses whether the stock is actually a good buy at its current valuation. Recognizing that a great company can be a bad investment if it’s overpriced shows real investing judgment, which is what the question tests.',
    key_points: [
      'Distinguish a great business from a great stock',
      'Cover the business quality: moat, growth, management',
      'Assess valuation — great company can be a bad buy if overpriced',
    ],
  },
  {
    id: 'ib_mkt_pitch_06',
    topic: 'Stock Pitch',
    difficulty: 3,
    question: 'Walk me through your investment process — how do you decide what to buy?',
    reference_answer:
      'A strong answer lays out a repeatable framework: how the candidate generates ideas, the fundamental analysis they do — business quality, financials, competitive position — how they think about valuation and margin of safety, the risks they check, and what would make them sell. It shows disciplined, structured thinking rather than picking stocks on tips or hype.',
    key_points: [
      'Repeatable framework: idea generation → analysis → valuation',
      'Business quality, financials, competitive position, risks',
      'Margin of safety and a sell discipline',
    ],
  },
  {
    id: 'ib_mkt_macro_04',
    topic: 'Macro Views',
    difficulty: 3,
    question: 'What do you see as the biggest risk to markets right now?',
    reference_answer:
      'A strong answer names a specific, credible risk — for example the rate path, inflation reaccelerating, geopolitical tension, or a stretched valuation in part of the market — and explains the transmission mechanism: how it would actually hit earnings, valuations, or liquidity. It should be balanced, acknowledging uncertainty and that markets price in known risks, rather than doom-saying.',
    key_points: [
      'Name a specific, credible risk',
      'Explain the transmission: how it hits earnings/valuations/liquidity',
      'Balanced — acknowledge markets price in known risks',
    ],
  },
];

// Distinct topics in display order, for grouping the question list.
export const IB_MARKETS_TOPICS = [
  'Markets Awareness',
  'Stock Pitch',
  'Macro Views',
];
