// ─── Private Equity question banks ──────────────────────────────────────────────
//
// Curated PE recruiting banks, written in our own words. Four tracks: LBO &
// Modeling, Deal Sense, Technical, and Fit. Every entry carries a reference
// answer + key points and is graded by getTechnicalFeedback() against that
// framework (PE recruiting has recognizable strong answers, so none use the
// behavioral STAR path).
//
// difficulty: 1 = Foundational (free), 2 = Intermediate (Pro), 3 = Advanced (Pro)

// ── LBO & Modeling ───────────────────────────────────────────────────────────────
export const PE_LBO_BANK = [
  {
    id: 'pe_lbo_01',
    topic: 'LBO Mechanics',
    difficulty: 1,
    question: 'What is a leveraged buyout?',
    reference_answer:
      'A leveraged buyout is the acquisition of a company using a significant amount of borrowed money alongside a smaller slug of equity from the sponsor. The acquired company’s own cash flows service and pay down that debt over a three-to-seven-year hold, and at exit the firm sells the business. Returns are driven by debt paydown, EBITDA growth, and any multiple expansion.',
    key_points: [
      'Acquire mostly with debt, smaller sponsor equity check',
      'Target’s cash flows pay down the debt over a 3–7 year hold',
      'Returns from debt paydown, EBITDA growth, multiple expansion',
    ],
  },
  {
    id: 'pe_lbo_02',
    topic: 'LBO Mechanics',
    difficulty: 2,
    question: 'Why does using leverage increase equity returns?',
    reference_answer:
      'Leverage means the sponsor puts in less equity for the same enterprise value, so any value created accrues to a smaller equity base, amplifying the percentage return. Debt is also cheaper than equity and its interest is tax-deductible. As the company’s cash flow pays down debt over the hold, equity value builds even if enterprise value is flat. The flip side is that leverage magnifies losses and risk too.',
    key_points: [
      'Smaller equity base → value creation amplified',
      'Debt is cheaper than equity; interest is tax-deductible',
      'Debt paydown builds equity value; risk is magnified too',
    ],
  },
  {
    id: 'pe_lbo_03',
    topic: 'Returns Math',
    difficulty: 2,
    question: 'What are the three main drivers of returns in an LBO?',
    reference_answer:
      'Debt paydown — using the company’s free cash flow to reduce debt so equity grows; EBITDA growth — increasing earnings through revenue growth or margin improvement; and multiple expansion — exiting at a higher valuation multiple than the entry. Debt paydown and EBITDA growth are the most controllable, while multiple expansion is more market-dependent and shouldn’t be relied on.',
    key_points: [
      'Debt paydown / deleveraging',
      'EBITDA growth (revenue or margins)',
      'Multiple expansion (less controllable, don’t rely on it)',
    ],
  },
  {
    id: 'pe_lbo_04',
    topic: 'Returns Math',
    difficulty: 2,
    question: 'What is the difference between IRR and MOIC, and why care about both?',
    reference_answer:
      'MOIC is total cash returned divided by cash invested — a simple multiple that ignores time. IRR is the annualized, time-weighted rate of return. You care about both because they can tell different stories: a 3x over seven years has a lower IRR than a 2x over three years. MOIC shows the absolute magnitude of the win; IRR shows how efficiently it was earned over time.',
    key_points: [
      'MOIC: cash out / cash in, time-insensitive',
      'IRR: annualized, time-weighted',
      'A faster, smaller multiple can beat a slower, bigger one on IRR',
    ],
  },
  {
    id: 'pe_lbo_05',
    topic: 'Paper LBO',
    difficulty: 3,
    question: 'Walk me through a simple paper LBO.',
    reference_answer:
      'At entry, take EBITDA times the entry multiple for enterprise value, then split it into debt and the sponsor’s equity check — say 60% debt, 40% equity. Over the hold, grow EBITDA and use free cash flow to pay down debt. At exit, apply an exit multiple to the higher EBITDA for a new enterprise value, subtract the remaining debt to get exit equity, then divide exit equity by the entry equity for MOIC and annualize it for IRR.',
    key_points: [
      'Entry: EBITDA × entry multiple = EV; split into debt + equity check',
      'Hold: grow EBITDA, pay down debt with free cash flow',
      'Exit: EBITDA × exit multiple − remaining debt = exit equity',
      'MOIC = exit equity / entry equity; annualize → IRR',
    ],
  },
  {
    id: 'pe_lbo_06',
    topic: 'Paper LBO',
    difficulty: 3,
    question: 'A company is bought for 10x EBITDA with 50% debt and sold in 5 years at 10x with no debt paydown but EBITDA up 50%. Roughly what’s the MOIC?',
    reference_answer:
      'Say entry EBITDA is 100, so entry EV is 1,000, with 500 of debt and 500 of equity. EBITDA grows 50% to 150, so exit EV at 10x is 1,500. With no debt paydown, debt is still 500, so exit equity is 1,000. That’s 1,000 over the 500 invested — about a 2x MOIC, which over five years is roughly a 15% IRR. The point is showing the bridge from EBITDA growth to equity value cleanly.',
    key_points: [
      'Entry: EV 1,000, debt 500, equity 500',
      'Exit: EBITDA 150 × 10x = 1,500 EV, debt 500 → equity 1,000',
      '≈ 2x MOIC over 5 years ≈ ~15% IRR',
    ],
  },
  {
    id: 'pe_lbo_07',
    topic: 'LBO Mechanics',
    difficulty: 2,
    question: 'What makes a company a good LBO candidate?',
    reference_answer:
      'Stable, predictable cash flows to service debt; low capital expenditure needs so cash is free to pay down debt; strong, defensible margins; a solid asset base or recurring revenue to support borrowing; a reasonable entry valuation; and clear paths to improve the business operationally or grow it. A strong management team and a viable exit also matter.',
    key_points: [
      'Stable, predictable cash flows; low capex',
      'Strong margins, recurring revenue / asset base for debt',
      'Reasonable entry price, improvement levers, viable exit',
    ],
  },
  {
    id: 'pe_lbo_08',
    topic: 'Returns Math',
    difficulty: 2,
    question: 'What return targets do PE firms typically have?',
    reference_answer:
      'Sponsors generally target an IRR in the low-to-mid 20s percent and a MOIC of roughly 2 to 3 times over a typical three-to-five-year hold. The exact hurdle depends on fund strategy, deal risk, and market conditions, but around a 20%-plus IRR is the classic benchmark a deal needs to clear to be worth doing.',
    key_points: [
      'IRR target ~low-to-mid 20s percent',
      'MOIC ~2–3x',
      'Over a ~3–5 year hold; varies with strategy and risk',
    ],
  },
  {
    id: 'pe_lbo_09',
    topic: 'LBO Mechanics',
    difficulty: 3,
    question: 'What does a typical LBO capital structure look like?',
    reference_answer:
      'Roughly half to two-thirds of the purchase is funded with debt and the rest with sponsor equity, depending on market conditions. The debt is layered by seniority — senior secured term loans and a revolver first, then subordinated, mezzanine, or high-yield debt that’s riskier and carries higher rates. Senior debt is cheapest and is repaid first; junior tranches cost more and absorb losses sooner.',
    key_points: [
      '~50–65% debt, rest sponsor equity (market-dependent)',
      'Layered: senior secured (loans/revolver) → sub/mezz/high-yield',
      'Senior is cheapest, paid first; junior costs more',
    ],
  },
  {
    id: 'pe_lbo_10',
    topic: 'Returns Math',
    difficulty: 3,
    question: 'If you could only improve one thing to boost LBO returns, what would you focus on?',
    reference_answer:
      'A strong answer argues for EBITDA growth — ideally through durable revenue growth and margin expansion — because it’s the most controllable, compounding, and exit-multiple-friendly driver, and it doesn’t rely on cheap debt or a market re-rating. Leverage and multiple expansion help but add risk or depend on the market; operational EBITDA growth creates real, defensible value. A thoughtful answer acknowledges the trade-offs.',
    key_points: [
      'EBITDA growth: most controllable and compounding',
      'Doesn’t rely on cheap debt or a market re-rating',
      'Acknowledge leverage / multiple expansion trade-offs',
    ],
  },
];
export const PE_LBO_TOPICS = ['LBO Mechanics', 'Returns Math', 'Paper LBO'];

// ── Deal Sense ───────────────────────────────────────────────────────────────────
export const PE_DEAL_BANK = [
  {
    id: 'pe_deal_01',
    topic: 'Investment Judgment',
    difficulty: 2,
    question: 'What makes a good investment?',
    reference_answer:
      'A strong answer goes beyond cheapness: a good business with durable competitive advantages and predictable cash flows, bought at a reasonable price, with a clear path to create value — operational improvement, growth, or strategic repositioning — and a realistic exit. It weighs the risk-adjusted return and the margin of safety, not just the upside. Price and quality together, with a thesis for how value is created.',
    key_points: [
      'Quality business: moat, predictable cash flows',
      'Reasonable entry price + a clear value-creation path',
      'Risk-adjusted return, margin of safety, realistic exit',
    ],
  },
  {
    id: 'pe_deal_02',
    topic: 'Investment Judgment',
    difficulty: 2,
    question: 'How would you evaluate whether to invest in a company?',
    reference_answer:
      'A strong answer lays out a structured process: understand the business and industry, assess the durability of its competitive position and cash flows, dig into the financials and the quality of earnings, form a view on the valuation and returns under realistic assumptions, identify the key risks and how to mitigate them, and define the value-creation plan and exit. The conclusion is a risk-adjusted judgment, not just a model output.',
    key_points: [
      'Understand business, industry, competitive position',
      'Quality of earnings, valuation, returns under realistic cases',
      'Key risks + mitigants, value-creation plan, exit',
    ],
  },
  {
    id: 'pe_deal_03',
    topic: 'Value Creation',
    difficulty: 2,
    question: 'How do PE firms create value beyond financial engineering?',
    reference_answer:
      'Operationally: driving revenue growth, improving margins through cost discipline and efficiency, professionalizing management and systems, pursuing add-on acquisitions to build scale, optimizing pricing, and improving working capital and capital allocation. The best firms increasingly compete on this operational value creation rather than just leverage and multiple arbitrage, because durable EBITDA growth is what survives at exit.',
    key_points: [
      'Revenue growth and margin/cost improvement',
      'Professionalize management; add-on acquisitions (buy-and-build)',
      'Pricing, working capital, capital allocation — durable EBITDA growth',
    ],
  },
  {
    id: 'pe_deal_04',
    topic: 'Value Creation',
    difficulty: 3,
    question: 'What is a buy-and-build (add-on) strategy and why does it work?',
    reference_answer:
      'A buy-and-build uses a platform company to acquire smaller add-ons in the same or adjacent space. It works through multiple arbitrage — small companies are typically bought at lower multiples than the larger combined entity commands — plus synergies, scale advantages, and faster growth. The combined business is worth more per dollar of EBITDA at exit, and it deploys capital efficiently. The risk is integration and overpaying for add-ons.',
    key_points: [
      'Platform acquires smaller add-ons in/adjacent to its space',
      'Multiple arbitrage (small bought cheap, big sells dear) + synergies/scale',
      'Risk: integration complexity and overpaying',
    ],
  },
  {
    id: 'pe_deal_05',
    topic: 'Diligence',
    difficulty: 2,
    question: 'What would you focus on in due diligence for a potential deal?',
    reference_answer:
      'Confirm the quality and sustainability of earnings — recurring vs one-time, customer concentration, churn; validate the market size and competitive dynamics; stress-test the financial projections and the assumptions behind them; assess management quality; identify legal, tax, and operational risks; and pressure-test the value-creation thesis and the downside case. The aim is to confirm the thesis and surface anything that would break it.',
    key_points: [
      'Quality/sustainability of earnings, customer concentration, churn',
      'Market and competitive validation; stress-test projections',
      'Management, legal/tax/operational risk, downside case',
    ],
  },
  {
    id: 'pe_deal_06',
    topic: 'Diligence',
    difficulty: 3,
    question: 'What is quality of earnings and why does it matter in a deal?',
    reference_answer:
      'Quality of earnings analysis digs into whether reported EBITDA is real, recurring, and sustainable — stripping out one-time items, non-operating gains, aggressive accounting, and owner perks, while normalizing for run-rate performance. It matters because the purchase price is usually a multiple of EBITDA, so an overstated EBITDA means overpaying. It’s a core part of diligence and often a dedicated workstream.',
    key_points: [
      'Tests whether EBITDA is real, recurring, sustainable',
      'Strips one-time/non-operating/aggressive items; normalizes run-rate',
      'Price is a multiple of EBITDA — overstated EBITDA = overpaying',
    ],
  },
  {
    id: 'pe_deal_07',
    topic: 'Investment Judgment',
    difficulty: 3,
    question: 'You like a company but it’s expensive. How do you think about that?',
    reference_answer:
      'A strong answer recognizes that price is central to returns: a great company can be a poor investment if you overpay, because the entry multiple caps your upside and raises the bar for the thesis. You’d ask whether the quality and growth justify the multiple, whether there’s still a path to your return target under realistic assumptions, and whether you have a differentiated angle. Discipline on price is what separates good sponsors.',
    key_points: [
      'Price caps returns — a great company can be a bad deal if overpaid',
      'Does quality/growth justify the multiple and still hit the return target?',
      'Need a differentiated angle; price discipline matters',
    ],
  },
  {
    id: 'pe_deal_08',
    topic: 'Value Creation',
    difficulty: 2,
    question: 'How do PE firms think about the exit when they buy a company?',
    reference_answer:
      'They underwrite the exit at entry — you only make money when you sell. They consider the likely buyers (a strategic, another sponsor via a secondary buyout, or a public listing), what the business needs to look like to be attractive to them, the realistic exit multiple, and the timing. Having a credible exit path is part of the original thesis, not an afterthought.',
    key_points: [
      'Underwrite the exit at entry — returns are realized on sale',
      'Likely buyers: strategic, secondary buyout, or IPO',
      'Target exit multiple, timing, and what the business must become',
    ],
  },
];
export const PE_DEAL_TOPICS = ['Investment Judgment', 'Value Creation', 'Diligence'];

// ── Technical (PE-flavored core) ─────────────────────────────────────────────────
export const PE_TECHNICAL_BANK = [
  {
    id: 'pe_tech_01',
    topic: 'Valuation',
    difficulty: 1,
    question: 'What are the main ways to value a company?',
    reference_answer:
      'Comparable companies analysis and precedent transactions for relative valuation using multiples, and a discounted cash flow for intrinsic value. In PE you also lean heavily on an LBO analysis — backing into the price you can pay to hit your return target — which often sets a ceiling on what a financial sponsor will bid. You triangulate across these methods.',
    key_points: [
      'Comps, precedent transactions, DCF',
      'LBO analysis: price you can pay for a target return (sponsor ceiling)',
      'Triangulate across methods',
    ],
  },
  {
    id: 'pe_tech_02',
    topic: 'Valuation',
    difficulty: 2,
    question: 'How does an LBO analysis work as a valuation method?',
    reference_answer:
      'Instead of valuing the business directly, you fix your required return — say a 20%-plus IRR — and your assumptions about leverage, EBITDA growth, and exit multiple, then solve for the maximum entry price that still delivers that return. That price is what a financial sponsor can afford to pay, so an LBO analysis effectively sets a floor on valuation and a ceiling on a sponsor’s bid.',
    key_points: [
      'Fix the target return, solve for the max entry price',
      'Inputs: leverage, EBITDA growth, exit multiple',
      'Sets the price a sponsor can pay — a valuation floor/bid ceiling',
    ],
  },
  {
    id: 'pe_tech_03',
    topic: 'Valuation',
    difficulty: 2,
    question: 'Why do PE firms focus so much on cash flow?',
    reference_answer:
      'Because cash flow, not accounting earnings, is what services and pays down the debt that makes an LBO work. Predictable free cash flow determines how much leverage a company can carry and how quickly equity builds through deleveraging. So PE diligence centers on the durability and conversion of cash flow — EBITDA less capex, working capital needs, and taxes.',
    key_points: [
      'Cash flow services and pays down LBO debt',
      'Determines debt capacity and the pace of deleveraging',
      'Focus on FCF conversion: EBITDA − capex, working capital, taxes',
    ],
  },
  {
    id: 'pe_tech_04',
    topic: 'Accounting',
    difficulty: 1,
    question: 'How do the three financial statements connect?',
    reference_answer:
      'Net income from the income statement flows to the top of the cash flow statement and into retained earnings on the balance sheet. The cash flow statement adjusts net income for non-cash items and working capital changes across operating, investing, and financing to get the change in cash, and its ending cash becomes the balance sheet cash line. D&A, capex, and working capital tie the statements together.',
    key_points: [
      'Net income → CFS top and retained earnings',
      'CFS ending cash → balance sheet cash',
      'D&A, capex, working capital link the statements',
    ],
  },
  {
    id: 'pe_tech_05',
    topic: 'Credit',
    difficulty: 2,
    question: 'What is the leverage ratio and how much debt can a company support?',
    reference_answer:
      'The leverage ratio is total debt to EBITDA — how many turns of earnings the company borrows. How much it can support depends on the stability and predictability of its cash flows, its capex needs, the industry, and credit market conditions; a stable, asset-rich business can carry more. Typical buyouts run roughly four to six times EBITDA, but it flexes with the environment.',
    key_points: [
      'Leverage ratio = total debt / EBITDA (turns)',
      'Capacity depends on cash-flow stability, capex, industry, credit markets',
      'Typically ~4–6x in a buyout',
    ],
  },
  {
    id: 'pe_tech_06',
    topic: 'Credit',
    difficulty: 3,
    question: 'What is the difference between a term loan, a revolver, and high-yield bonds in a deal?',
    reference_answer:
      'A term loan is senior secured debt with a set repayment schedule, usually the cheapest and paid first. A revolver is a flexible line of credit the company can draw and repay for working capital needs. High-yield bonds are riskier, typically unsecured or subordinated, with higher fixed coupons and fewer maintenance covenants, sitting below the loans in priority. Together they form the layered LBO debt stack.',
    key_points: [
      'Term loan: senior secured, scheduled repayment, cheapest',
      'Revolver: flexible line for working capital',
      'High-yield bonds: riskier, junior, higher coupon, fewer covenants',
    ],
  },
  {
    id: 'pe_tech_07',
    topic: 'Accounting',
    difficulty: 2,
    question: 'Why might EBITDA overstate a company’s true cash generation?',
    reference_answer:
      'EBITDA adds back depreciation and amortization, but for a capital-intensive business real capex is an ongoing cash cost, so EBITDA can flatter cash generation. It also ignores changes in working capital, cash taxes, and interest. That’s why PE firms look at EBITDA less capex and free cash flow conversion, and why quality-of-earnings work normalizes EBITDA before applying a multiple.',
    key_points: [
      'Adds back D&A but real capex is a recurring cash cost',
      'Ignores working capital, cash taxes, interest',
      'PE looks at EBITDA − capex and FCF conversion',
    ],
  },
  {
    id: 'pe_tech_08',
    topic: 'Valuation',
    difficulty: 3,
    question: 'Two companies have the same EBITDA — why might one support a higher purchase multiple?',
    reference_answer:
      'Because multiple reflects quality and risk, not just current EBITDA. Higher growth, more recurring or contracted revenue, stronger and more durable margins, lower capex intensity, customer diversification, and a defensible competitive position all justify a higher multiple. A sponsor will also pay up where there’s a clearer value-creation path and a more certain exit. Same EBITDA, very different quality of that EBITDA.',
    key_points: [
      'Multiple reflects growth, durability, and risk — not just EBITDA level',
      'Recurring revenue, strong margins, low capex, diversification',
      'Clearer value-creation path and exit justify paying up',
    ],
  },
];
export const PE_TECHNICAL_TOPICS = ['Valuation', 'Accounting', 'Credit'];

// ── Fit (PE) ─────────────────────────────────────────────────────────────────────
export const PE_FIT_BANK = [
  {
    id: 'pe_fit_01',
    topic: 'Why PE',
    difficulty: 1,
    question: 'Why private equity?',
    reference_answer:
      'A strong answer connects a genuine interest in investing and building businesses to what PE uniquely offers: taking an ownership stake, thinking like a long-term investor rather than an advisor, getting close to operations and value creation, and being accountable for returns. It should be specific and personal — ideally tied to deal or investing experience — and avoid clichés like prestige or pay.',
    key_points: [
      'Genuine interest in investing and ownership, not advising',
      'Drawn to value creation, operations, accountability for returns',
      'Specific and personal; avoid prestige/pay clichés',
    ],
  },
  {
    id: 'pe_fit_02',
    topic: 'Why PE',
    difficulty: 2,
    question: 'Why private equity and not stay in investment banking?',
    reference_answer:
      'A strong answer shows the candidate understands the difference: banking advises on transactions, while PE takes ownership, lives with the investment decision, and is judged on returns over years. They should express a real preference for the investor mindset — having a view, being accountable, and being involved in value creation — while speaking positively about the skills banking gave them rather than disparaging it.',
    key_points: [
      'Understand advisor (banking) vs owner/investor (PE)',
      'Prefer accountability for the decision and returns over time',
      'Frame banking positively as the foundation',
    ],
  },
  {
    id: 'pe_fit_03',
    topic: 'Why This Firm',
    difficulty: 2,
    question: 'Why our firm specifically?',
    reference_answer:
      'A strong answer gives firm-specific reasons that don’t transfer to a competitor: the firm’s strategy, sector or stage focus, deal style, value-creation approach, fund size, culture, and — most powerfully — people the candidate has spoken with or specific deals they admire. It ties those specifics back to the candidate’s own interests and the kind of investing they want to do.',
    key_points: [
      'Firm-specific: strategy, sector/stage, deal style, value-creation model',
      'Reference specific deals and people you’ve spoken with',
      'Tie back to the investing you want to do',
    ],
  },
  {
    id: 'pe_fit_04',
    topic: 'Why This Firm',
    difficulty: 2,
    question: 'What kind of deals or sectors are you most interested in, and why?',
    reference_answer:
      'A strong answer shows a genuine, reasoned preference — a sector, stage, or deal type — grounded in the candidate’s experience or a thesis about where value can be created, while remaining flexible. It signals they’ve thought about investing seriously rather than just chasing any PE seat, and ideally aligns with the firm’s focus.',
    key_points: [
      'A genuine, reasoned preference (sector / stage / deal type)',
      'Grounded in experience or a value-creation thesis',
      'Show flexibility; ideally align with the firm’s focus',
    ],
  },
  {
    id: 'pe_fit_05',
    topic: 'Your Story',
    difficulty: 1,
    question: 'Walk me through your resume.',
    reference_answer:
      'A strong walkthrough is a concise two-to-three-minute narrative, not a line-by-line read. It moves logically through experiences, connecting them so each step builds toward wanting to invest, highlights the deal or analytical work most relevant to PE, and lands on why private equity and why now. It should show increasing exposure to and conviction about investing.',
    key_points: [
      'Concise narrative (~2–3 min), logical thread',
      'Highlight deal/analytical work relevant to PE',
      'Land on “why PE, why now” with growing investing conviction',
    ],
  },
  {
    id: 'pe_fit_06',
    topic: 'Your Story',
    difficulty: 2,
    question: 'Tell me about a deal or company you found interesting and why.',
    reference_answer:
      'A strong answer picks a specific deal or company, explains the business and the situation concisely, and then offers a real investor point of view — why it’s attractive or not, the value-creation angle, the key risks, and what the return might look like. It demonstrates the candidate can think like an investor, not just recite facts, which is exactly what PE interviews probe.',
    key_points: [
      'Specific deal/company, concisely framed',
      'Investor POV: attractiveness, value-creation angle, risks',
      'Think like an investor, not recite facts',
    ],
  },
  {
    id: 'pe_fit_07',
    topic: 'Why PE',
    difficulty: 3,
    question: 'Where do you see yourself long term in this industry?',
    reference_answer:
      'A strong answer shows genuine commitment to investing as a career — growing from executing deals toward leading them, building sector expertise, and developing real judgment as an investor — rather than treating PE as a stepping stone. It conveys ambition and a long-term mindset that fits an industry where careers and funds play out over many years.',
    key_points: [
      'Commitment to investing as a long-term career',
      'Progression: from executing deals toward leading them / judgment',
      'Long-term mindset that fits the industry, not a stepping stone',
    ],
  },
];
export const PE_FIT_TOPICS = ['Why PE', 'Why This Firm', 'Your Story'];
