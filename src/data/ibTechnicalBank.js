// ─── IB Technical question bank ────────────────────────────────────────────────
//
// Curated, canonical IB technical questions written in our own words (not copied
// from any commercial guide). Each entry carries a reference answer and the key
// points an interviewer listens for — the AI grades the spoken answer against
// these via getTechnicalFeedback().
//
// difficulty: 1 = Foundational (free), 2 = Intermediate (Pro), 3 = Advanced (Pro)

export const DIFFICULTY_LABELS = {
  1: 'Foundational',
  2: 'Intermediate',
  3: 'Advanced',
};

export const IB_TECHNICAL_BANK = [
  // ── Accounting ───────────────────────────────────────────────────────────────
  {
    id: 'ib_acct_01',
    topic: 'Accounting',
    difficulty: 1,
    question: 'Walk me through the three financial statements.',
    reference_answer:
      'The income statement shows revenue down to net income over a period. The balance sheet is a snapshot at a point in time where assets equal liabilities plus shareholders’ equity. The cash flow statement starts at net income and adjusts for non-cash items and changes in working capital across operating, investing, and financing activities to arrive at the actual change in cash.',
    key_points: [
      'Income statement: revenue → net income, over a period',
      'Balance sheet: assets = liabilities + equity, a snapshot',
      'Cash flow statement: net income → operating/investing/financing → change in cash',
    ],
  },
  {
    id: 'ib_acct_02',
    topic: 'Accounting',
    difficulty: 1,
    question: 'How do the three financial statements link together?',
    reference_answer:
      'Net income from the income statement flows to the top of the cash flow statement and into retained earnings on the balance sheet. The cash flow statement’s ending cash becomes the cash line on the balance sheet. Items like D&A, capex, and changes in working capital connect the income statement and balance sheet through the cash flow statement.',
    key_points: [
      'Net income → top of CFS and into retained earnings (equity)',
      'Ending cash on CFS → cash on balance sheet',
      'D&A, capex, working capital tie IS and BS via the CFS',
    ],
  },
  {
    id: 'ib_acct_03',
    topic: 'Accounting',
    difficulty: 2,
    question: 'If depreciation increases by $10, walk me through the three statements (40% tax rate).',
    reference_answer:
      'Income statement: pre-tax income falls $10, and at a 40% tax rate net income falls $6. Cash flow statement: net income is down $6, but you add back the $10 of non-cash depreciation, so cash rises $4. Balance sheet: cash is up $4 and PP&E is down $10, so assets fall $6; retained earnings fall $6 on the equity side, so the balance sheet balances.',
    key_points: [
      'IS: pre-tax −$10, net income −$6 at 40% tax',
      'CFS: net income −$6, add back +$10 depreciation, cash +$4',
      'BS: cash +$4, PP&E −$10 (assets −$6); retained earnings −$6; balances',
    ],
  },
  {
    id: 'ib_acct_04',
    topic: 'Accounting',
    difficulty: 2,
    question: 'A company buys $10 of inventory with cash. Walk me through the statements.',
    reference_answer:
      'There’s no income statement impact because nothing has been sold yet. On the cash flow statement, the increase in inventory is a use of cash in working capital, so cash falls $10. On the balance sheet, inventory rises $10 and cash falls $10, so total assets are unchanged and it balances.',
    key_points: [
      'IS: no impact (nothing sold yet)',
      'CFS: inventory build is a use of cash, cash −$10',
      'BS: inventory +$10, cash −$10, balances',
    ],
  },
  {
    id: 'ib_acct_05',
    topic: 'Accounting',
    difficulty: 1,
    question: 'Which of the three statements is the most important, and why?',
    reference_answer:
      'The cash flow statement is usually the answer because it shows how much actual cash the business generates. Net income includes non-cash items and accounting choices, but cash is what pays debt, funds investment, and returns capital — cash is king.',
    key_points: [
      'Cash flow statement',
      'Shows real cash generated, not accounting net income',
      'Cash pays debt, funds capex, returns capital',
    ],
  },
  {
    id: 'ib_acct_06',
    topic: 'Accounting',
    difficulty: 1,
    question: 'What is the difference between accrual and cash accounting?',
    reference_answer:
      'Accrual accounting records revenue when it’s earned and expenses when they’re incurred, regardless of when cash moves. Cash accounting records them only when cash actually changes hands. Most companies use accrual because it better matches revenue to the expenses that generated it.',
    key_points: [
      'Accrual: recognize when earned/incurred, not when cash moves',
      'Cash: recognize only when cash changes hands',
      'Accrual matches revenue with related expenses',
    ],
  },

  // ── Valuation ────────────────────────────────────────────────────────────────
  {
    id: 'ib_val_01',
    topic: 'Valuation',
    difficulty: 1,
    question: 'What are the main valuation methodologies?',
    reference_answer:
      'The three core methods are comparable companies analysis, precedent transactions analysis, and a discounted cash flow. Comps and precedents are relative valuation using multiples; the DCF is intrinsic valuation. You might also reference an LBO analysis as a floor valuation or a sum-of-the-parts.',
    key_points: [
      'Comparable companies (trading multiples)',
      'Precedent transactions (deal multiples)',
      'Discounted cash flow (intrinsic)',
      'Optional: LBO as a floor, sum-of-the-parts',
    ],
  },
  {
    id: 'ib_val_02',
    topic: 'Valuation',
    difficulty: 1,
    question: 'How are comparable companies and precedent transactions different?',
    reference_answer:
      'Comparable companies uses the current trading multiples of similar public companies, so there’s no control premium. Precedent transactions uses multiples actually paid in past M&A deals, which include a control premium and reflect market conditions at the time, so they can be dated.',
    key_points: [
      'Comps: current public trading multiples, no control premium',
      'Precedents: multiples paid in M&A deals, include control premium',
      'Precedents can be dated / market-condition dependent',
    ],
  },
  {
    id: 'ib_val_03',
    topic: 'Valuation',
    difficulty: 2,
    question: 'Which valuation methodologies tend to give the highest and lowest values?',
    reference_answer:
      'It depends on assumptions, but generally precedent transactions come in higher because they include a control premium. A DCF can be the highest or lowest depending on the assumptions you feed it. Comparable companies are often on the lower end since they lack a control premium. The honest answer is it depends and you should triangulate.',
    key_points: [
      'Precedents usually higher (control premium)',
      'DCF varies most — assumption-driven',
      'Comps often lower (no control premium)',
      '“It depends” / triangulate across methods',
    ],
  },
  {
    id: 'ib_val_04',
    topic: 'Enterprise Value',
    difficulty: 1,
    question: 'What is enterprise value and how do you calculate it?',
    reference_answer:
      'Enterprise value is the value of a company’s core operations to all capital providers. You take equity value (market cap) and add debt, preferred stock, and minority interest, then subtract cash and equivalents. It represents what it would effectively cost to acquire the whole business.',
    key_points: [
      'Value of core operations to all capital providers',
      'EV = equity value + debt + preferred + minority interest − cash',
      'Effective cost to acquire the business',
    ],
  },
  {
    id: 'ib_val_05',
    topic: 'Enterprise Value',
    difficulty: 1,
    question: 'What is the difference between enterprise value and equity value?',
    reference_answer:
      'Equity value is the value attributable to shareholders only. Enterprise value is the value to all stakeholders — debt and equity holders — so it’s capital-structure neutral. That’s why EV is better for comparing companies with different amounts of leverage.',
    key_points: [
      'Equity value: to shareholders only',
      'EV: to all capital providers (debt + equity)',
      'EV is capital-structure neutral → better for comparison',
    ],
  },
  {
    id: 'ib_val_06',
    topic: 'Enterprise Value',
    difficulty: 2,
    question: 'Why do you subtract cash when calculating enterprise value?',
    reference_answer:
      'Cash is a non-operating asset, and an acquirer could use the target’s cash to help pay for the purchase, effectively reducing the price. Subtracting cash leaves you with the value of the core operating business, which is what EV is meant to capture.',
    key_points: [
      'Cash is non-operating',
      'Acquirer can use target cash to fund the purchase',
      'EV should reflect core operating value',
    ],
  },
  {
    id: 'ib_val_07',
    topic: 'Enterprise Value',
    difficulty: 2,
    question: 'Why do you add debt when calculating enterprise value?',
    reference_answer:
      'When you acquire a company you generally assume its debt, so it’s a real cost of the acquisition. Debt holders are also claimants on the business. Adding debt makes EV reflect the value to all capital providers and keeps it capital-structure neutral.',
    key_points: [
      'Acquirer assumes the target’s debt',
      'Debt holders are claimants on the business',
      'Keeps EV capital-structure neutral',
    ],
  },
  {
    id: 'ib_val_08',
    topic: 'Multiples',
    difficulty: 2,
    question: 'When would you use EV/EBITDA versus P/E?',
    reference_answer:
      'EV/EBITDA is capital-structure neutral and ignores differences in leverage, taxes, and D&A, so it’s better for comparing companies with different financing. P/E is affected by capital structure and non-operating items, but it’s useful for financial institutions and when comparing equity returns to shareholders.',
    key_points: [
      'EV/EBITDA: capital-structure neutral, pre-leverage/tax/D&A',
      'P/E: affected by leverage, taxes, non-operating items',
      'Use EV multiples to compare across capital structures',
    ],
  },
  {
    id: 'ib_val_09',
    topic: 'Multiples',
    difficulty: 2,
    question: 'Two identical companies have different P/E multiples. Why?',
    reference_answer:
      'A higher P/E generally reflects higher expected growth, lower perceived risk, or differences in capital structure. The market is willing to pay more per dollar of current earnings when it expects those earnings to grow faster or be more stable. Sentiment and accounting differences can also play a role.',
    key_points: [
      'Higher growth expectations',
      'Lower risk / more stable earnings',
      'Capital structure and market sentiment',
    ],
  },

  // ── DCF ──────────────────────────────────────────────────────────────────────
  {
    id: 'ib_dcf_01',
    topic: 'DCF',
    difficulty: 2,
    question: 'Walk me through a DCF.',
    reference_answer:
      'You project unlevered free cash flow for five to ten years, discount each year back at WACC, and calculate a terminal value using either the perpetuity growth method or an exit multiple. You discount the terminal value back as well, sum the present values to get enterprise value, then bridge from enterprise value to equity value by subtracting net debt.',
    key_points: [
      'Project unlevered FCF (5–10 years)',
      'Discount at WACC',
      'Terminal value (perpetuity growth or exit multiple), discounted back',
      'Sum PVs → enterprise value → bridge to equity value',
    ],
  },
  {
    id: 'ib_dcf_02',
    topic: 'DCF',
    difficulty: 2,
    question: 'How do you calculate unlevered free cash flow?',
    reference_answer:
      'Start with EBIT, multiply by one minus the tax rate to get the after-tax operating profit (NOPAT), add back D&A, subtract capex, and subtract the increase in net working capital. It’s unlevered because it’s before the effect of interest, so it’s available to all capital providers.',
    key_points: [
      'EBIT × (1 − tax rate) = NOPAT',
      'Add back D&A',
      'Subtract capex',
      'Subtract increase in net working capital',
    ],
  },
  {
    id: 'ib_dcf_03',
    topic: 'DCF',
    difficulty: 2,
    question: 'What is WACC and how do you calculate it?',
    reference_answer:
      'WACC is the blended cost of a company’s capital, weighting the cost of equity and the after-tax cost of debt by their share of the capital structure. Cost of equity usually comes from CAPM: the risk-free rate plus beta times the equity risk premium. The cost of debt is after-tax because interest is tax-deductible.',
    key_points: [
      'Weighted cost of equity and after-tax cost of debt',
      'Weights by capital structure (E and D proportions)',
      'Cost of equity via CAPM: rf + β × ERP',
      'Cost of debt is after-tax (interest deductible)',
    ],
  },
  {
    id: 'ib_dcf_04',
    topic: 'DCF',
    difficulty: 2,
    question: 'What are the two ways to calculate terminal value?',
    reference_answer:
      'The perpetuity growth (Gordon growth) method grows the final year’s free cash flow at a modest long-term rate and divides by WACC minus that growth rate. The exit multiple method applies a valuation multiple, like EV/EBITDA, to the final year’s metric. In practice you often cross-check one against the other.',
    key_points: [
      'Perpetuity growth: FCF × (1+g) / (WACC − g)',
      'Exit multiple: terminal-year EBITDA × multiple',
      'Cross-check the two methods',
    ],
  },
  {
    id: 'ib_dcf_05',
    topic: 'DCF',
    difficulty: 2,
    question: 'What discount rate do you use for unlevered free cash flow, and why?',
    reference_answer:
      'You discount unlevered free cash flow at WACC. Because unlevered cash flow is available to all capital providers — both debt and equity — you have to use the blended cost of all that capital, which is WACC. The result is enterprise value.',
    key_points: [
      'WACC',
      'Unlevered FCF is available to all capital providers',
      'Discounting unlevered FCF at WACC yields enterprise value',
    ],
  },
  {
    id: 'ib_dcf_06',
    topic: 'DCF',
    difficulty: 3,
    question: 'Why use unlevered rather than levered free cash flow in a DCF?',
    reference_answer:
      'Unlevered free cash flow is independent of capital structure, so discounting it at WACC gives an enterprise value that’s comparable across companies regardless of leverage. Levered free cash flow is after interest and belongs only to equity holders, so you’d discount it at the cost of equity to get equity value directly. Unlevered is the standard because it isolates operating performance.',
    key_points: [
      'Unlevered is capital-structure neutral → discount at WACC → EV',
      'Levered is post-interest, equity-only → discount at cost of equity → equity value',
      'Unlevered isolates operating performance / comparability',
    ],
  },

  // ── LBO ──────────────────────────────────────────────────────────────────────
  {
    id: 'ib_lbo_01',
    topic: 'LBO',
    difficulty: 2,
    question: 'Walk me through an LBO.',
    reference_answer:
      'A private equity firm acquires a company using a large amount of debt and a smaller equity check. The company’s own cash flows are used to service and pay down that debt over a three-to-seven year hold. At exit, the firm sells the business, and returns are driven by debt paydown, EBITDA growth, and any multiple expansion.',
    key_points: [
      'Acquire mostly with debt, smaller equity check',
      'Use the company’s cash flows to pay down debt',
      '3–7 year hold, then exit',
      'Returns from debt paydown, EBITDA growth, multiple expansion',
    ],
  },
  {
    id: 'ib_lbo_02',
    topic: 'LBO',
    difficulty: 2,
    question: 'Why use debt in an LBO, and how does it boost returns?',
    reference_answer:
      'Debt is cheaper than equity and the interest is tax-deductible, so using more debt and less equity amplifies the return on the equity invested. As the company uses its cash flow to pay down debt, equity value builds even if the enterprise value stays flat. Leverage magnifies both gains and risk.',
    key_points: [
      'Debt is cheaper than equity; interest is tax-deductible',
      'Less equity in → leverage amplifies equity returns',
      'Debt paydown builds equity value over the hold',
    ],
  },
  {
    id: 'ib_lbo_03',
    topic: 'LBO',
    difficulty: 2,
    question: 'What makes a good LBO candidate?',
    reference_answer:
      'You want stable, predictable cash flows to service the debt, low capital expenditure needs, strong margins, and a solid asset base that can support borrowing. A reasonable entry valuation, a strong management team, and clear operational improvement or growth opportunities also help.',
    key_points: [
      'Stable, predictable cash flows',
      'Low capex needs, strong margins',
      'Asset base to support debt / collateral',
      'Reasonable entry price and improvement opportunities',
    ],
  },
  {
    id: 'ib_lbo_04',
    topic: 'LBO',
    difficulty: 2,
    question: 'What are the main drivers of returns in an LBO?',
    reference_answer:
      'There are three: paying down debt with the company’s cash flow so equity builds, growing EBITDA through revenue growth or margin improvement, and multiple expansion where you exit at a higher multiple than you entered. Debt paydown and EBITDA growth are the most controllable.',
    key_points: [
      'Debt paydown / deleveraging',
      'EBITDA growth (revenue or margins)',
      'Multiple expansion (exit higher than entry)',
    ],
  },
  {
    id: 'ib_lbo_05',
    topic: 'LBO',
    difficulty: 2,
    question: 'What is the difference between IRR and MOIC?',
    reference_answer:
      'MOIC, or multiple of invested capital, is just total cash returned divided by cash invested, and it ignores time. IRR is the annualized rate of return, so it accounts for how long it took to earn that money. A 3x MOIC over three years is a far better IRR than 3x over seven years.',
    key_points: [
      'MOIC: total cash out / cash in, time-insensitive',
      'IRR: annualized return, time-sensitive',
      'Same MOIC over a shorter hold = higher IRR',
    ],
  },

  // ── M&A ──────────────────────────────────────────────────────────────────────
  {
    id: 'ib_ma_01',
    topic: 'M&A',
    difficulty: 1,
    question: 'Why would one company acquire another?',
    reference_answer:
      'Common reasons include cost or revenue synergies, gaining market share, entering new products or geographies, acquiring talent or technology, vertical integration, defensive consolidation, or because the deal is accretive to earnings. Often it’s a combination, and the strategic rationale should outweigh the price paid.',
    key_points: [
      'Synergies (cost and/or revenue)',
      'Market share, new products/geographies',
      'Talent/technology, vertical integration',
      'Accretive to EPS / defensive',
    ],
  },
  {
    id: 'ib_ma_02',
    topic: 'M&A',
    difficulty: 2,
    question: 'What is accretion / dilution analysis?',
    reference_answer:
      'It compares the acquirer’s earnings per share before and after a deal. If pro forma EPS goes up the deal is accretive; if it goes down it’s dilutive. The result depends on how the deal is financed — cash, debt, or stock — and on the relative P/E multiples and the cost of that financing.',
    key_points: [
      'Compare acquirer EPS pre- vs post-deal',
      'Accretive = EPS up, dilutive = EPS down',
      'Driven by financing mix and relative P/E multiples',
    ],
  },
  {
    id: 'ib_ma_03',
    topic: 'M&A',
    difficulty: 3,
    question: 'In an all-stock deal, when is it accretive versus dilutive?',
    reference_answer:
      'In a pure stock deal, it’s accretive when the acquirer’s P/E is higher than the target’s effective P/E paid — equivalently, when the target’s earnings yield exceeds the acquirer’s. If the acquirer trades at 20x and buys a company at 15x with stock, it’s accretive; if it pays 25x, it’s dilutive because it’s issuing cheap-yielding shares to buy more expensive earnings.',
    key_points: [
      'Compare acquirer P/E vs target effective P/E paid',
      'Accretive if acquirer P/E > target P/E (target yield > acquirer yield)',
      'Issuing higher-multiple stock to buy lower-multiple earnings = accretive',
    ],
  },
];

// Distinct topics in display order, for grouping the question list.
export const IB_TECHNICAL_TOPICS = [
  'Accounting',
  'Valuation',
  'Enterprise Value',
  'Multiples',
  'DCF',
  'LBO',
  'M&A',
];
