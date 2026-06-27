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

  // ── Accounting (expanded) ──────────────────────────────────────────────────────
  {
    id: 'ib_acct_07',
    topic: 'Accounting',
    difficulty: 1,
    question: 'What is the difference between revenue and net income?',
    reference_answer:
      'Revenue is the top line — the total dollars a company brings in from selling its goods or services before any costs. Net income is the bottom line — what’s left after subtracting all costs, including cost of goods sold, operating expenses, interest, and taxes. Revenue measures scale; net income measures actual profitability.',
    key_points: [
      'Revenue: top line, total sales before costs',
      'Net income: bottom line, after all costs/interest/taxes',
      'Revenue = scale, net income = profitability',
    ],
  },
  {
    id: 'ib_acct_08',
    topic: 'Accounting',
    difficulty: 1,
    question: 'What is EBITDA and why do bankers use it?',
    reference_answer:
      'EBITDA is earnings before interest, taxes, depreciation, and amortization. You usually get it by taking operating income (EBIT) and adding back D&A. Bankers like it as a rough proxy for operating cash flow that strips out capital structure (interest), tax regimes, and non-cash accounting choices (D&A), which makes it useful for comparing companies on an apples-to-apples basis.',
    key_points: [
      'Earnings before interest, taxes, depreciation, amortization',
      'EBIT + D&A',
      'Proxy for operating cash flow, capital-structure neutral',
      'Lets you compare companies with different financing/taxes',
    ],
  },
  {
    id: 'ib_acct_09',
    topic: 'Accounting',
    difficulty: 1,
    question: 'How do EBIT, EBITDA, and net income relate to each other?',
    reference_answer:
      'Start with EBITDA, subtract depreciation and amortization to get EBIT (operating income). From EBIT, subtract interest expense and taxes to get net income. So EBITDA is the most “pre-everything” measure, EBIT adds back the cost of using assets over time, and net income is what’s actually left for shareholders.',
    key_points: [
      'EBITDA − D&A = EBIT',
      'EBIT − interest − taxes = net income',
      'EBITDA is most pre-everything; net income is to shareholders',
    ],
  },
  {
    id: 'ib_acct_10',
    topic: 'Accounting',
    difficulty: 1,
    question: 'What is working capital?',
    reference_answer:
      'Working capital is current assets minus current liabilities. Operationally, bankers usually focus on non-cash working capital — things like accounts receivable and inventory minus accounts payable — because that’s the capital tied up in running the day-to-day business. Positive and growing working capital generally consumes cash.',
    key_points: [
      'Current assets − current liabilities',
      'Operating focus: AR + inventory − AP (ex-cash, ex-debt)',
      'A build in working capital uses cash',
    ],
  },
  {
    id: 'ib_acct_11',
    topic: 'Accounting',
    difficulty: 2,
    question: 'If working capital increases, what happens to cash flow?',
    reference_answer:
      'An increase in net working capital is a use of cash, so cash flow goes down. Intuitively, if receivables or inventory grow you’ve tied up cash in customers who haven’t paid or goods you haven’t sold. The reverse is also true: a decrease in working capital, like stretching payables, frees up cash.',
    key_points: [
      'Increase in working capital = use of cash (cash flow down)',
      'AR/inventory builds tie up cash',
      'Decrease in working capital frees up cash',
    ],
  },
  {
    id: 'ib_acct_12',
    topic: 'Accounting',
    difficulty: 2,
    question: 'What is deferred revenue and how is it different from accounts receivable?',
    reference_answer:
      'Deferred revenue is cash a company has collected for goods or services it hasn’t yet delivered, so it sits as a liability until it’s earned. Accounts receivable is the opposite — the company has delivered and earned the revenue but hasn’t yet been paid, so it’s an asset. One is paid-but-not-earned, the other is earned-but-not-paid.',
    key_points: [
      'Deferred revenue: cash received, not yet earned → liability',
      'Accounts receivable: earned, not yet collected → asset',
      'Paid-not-earned vs earned-not-paid',
    ],
  },
  {
    id: 'ib_acct_13',
    topic: 'Accounting',
    difficulty: 2,
    question: 'What is goodwill and when is it created?',
    reference_answer:
      'Goodwill is an intangible asset created in an acquisition when the buyer pays more than the fair value of the target’s identifiable net assets. It captures things like brand, customer relationships, and synergies that aren’t separately recorded. Goodwill isn’t amortized but is tested annually for impairment, and a write-down hits the income statement.',
    key_points: [
      'Created in M&A: purchase price > fair value of net identifiable assets',
      'Captures brand, relationships, synergies',
      'Not amortized; tested for impairment, write-downs hit the IS',
    ],
  },
  {
    id: 'ib_acct_14',
    topic: 'Accounting',
    difficulty: 2,
    question: 'What is the difference between LIFO and FIFO?',
    reference_answer:
      'FIFO, first-in-first-out, assumes the oldest inventory is sold first; LIFO, last-in-first-out, assumes the newest is sold first. In a period of rising prices, LIFO records higher cost of goods sold, which lowers reported profit and taxes, while FIFO shows higher profit and a higher inventory balance. It’s a cost-flow assumption, not necessarily the physical flow.',
    key_points: [
      'FIFO: oldest inventory sold first; LIFO: newest first',
      'Rising prices → LIFO higher COGS, lower profit & taxes',
      'FIFO → higher profit, higher ending inventory',
    ],
  },
  {
    id: 'ib_acct_15',
    topic: 'Accounting',
    difficulty: 2,
    question: 'Can a company with positive net income still go bankrupt?',
    reference_answer:
      'Yes. Net income is an accrual accounting figure and doesn’t equal cash. A company can be profitable on paper but run out of cash if its receivables aren’t collected, it’s burning cash on inventory or capex, or it can’t refinance maturing debt. Bankruptcy is ultimately about liquidity and the ability to meet obligations, not reported profit.',
    key_points: [
      'Net income ≠ cash (accrual accounting)',
      'Profitable but illiquid: uncollected AR, capex, working capital',
      'Bankruptcy is a liquidity/obligation problem, not a profit one',
    ],
  },
  {
    id: 'ib_acct_16',
    topic: 'Accounting',
    difficulty: 3,
    question: 'How does stock-based compensation flow through the three statements?',
    reference_answer:
      'On the income statement, stock-based comp is an operating expense that reduces pre-tax income and net income. On the cash flow statement, because it’s non-cash, you add it back to net income in operating activities, so it doesn’t reduce cash. On the balance sheet, cash is unchanged, retained earnings fall via lower net income, but additional paid-in capital rises by the same amount, so equity and the balance sheet stay balanced.',
    key_points: [
      'IS: operating expense, lowers net income',
      'CFS: non-cash, added back in operating activities',
      'BS: cash flat; retained earnings down, APIC up; balances',
    ],
  },
  {
    id: 'ib_acct_17',
    topic: 'Accounting',
    difficulty: 3,
    question: 'A customer prepays $120 for a one-year subscription. Walk through the statements at sale and after one month.',
    reference_answer:
      'At the sale: no income statement impact because nothing is earned yet. On the cash flow statement cash rises $120; on the balance sheet cash is up $120 and deferred revenue, a liability, is up $120, so it balances. After one month: the company earns $10 of revenue, so net income rises $10 (ignoring costs/taxes); on the balance sheet deferred revenue falls $10 and retained earnings rise $10, so it stays balanced with no further cash movement.',
    key_points: [
      'At sale: no IS impact; cash +120, deferred revenue +120',
      'After 1 month: recognize $10 revenue → net income +10',
      'Deferred revenue −10, retained earnings +10; balances, no new cash',
    ],
  },
  {
    id: 'ib_acct_18',
    topic: 'Accounting',
    difficulty: 3,
    question: 'What is a deferred tax liability and why does it arise?',
    reference_answer:
      'A deferred tax liability arises when a company pays less in cash taxes now than its book tax expense implies, creating a future obligation to pay more. The classic cause is using accelerated depreciation for tax purposes but straight-line for books, so taxable income is lower early on. The gap reverses over time as the timing difference unwinds.',
    key_points: [
      'Book tax expense > cash taxes paid now → future obligation',
      'Common cause: accelerated tax depreciation vs straight-line book',
      'Temporary timing difference that reverses over time',
    ],
  },

  // ── Valuation (expanded) ───────────────────────────────────────────────────────
  {
    id: 'ib_val_10',
    topic: 'Valuation',
    difficulty: 1,
    question: 'How do you select comparable companies?',
    reference_answer:
      'You screen for companies similar to the target along the dimensions that drive valuation: industry and business model, size (revenue or market cap), growth profile, margins, and geography. The tighter the comp set the better, even if it means fewer names. You then pull their trading multiples and apply the relevant ones to the target.',
    key_points: [
      'Same industry / business model',
      'Similar size, growth, margins, geography',
      'Tighter set is better; apply their multiples to the target',
    ],
  },
  {
    id: 'ib_val_11',
    topic: 'Valuation',
    difficulty: 2,
    question: 'How do you select precedent transactions?',
    reference_answer:
      'You look for past M&A deals involving similar companies — similar industry, size, and business model — and ideally recent ones so the multiples reflect comparable market conditions. You also consider deal type, like strategic versus financial buyer, and whether it was a control transaction. Then you use the multiples actually paid as a benchmark, remembering they include a control premium.',
    key_points: [
      'Similar industry, size, business model',
      'Recent deals → comparable market conditions',
      'Consider buyer type / control; multiples include a premium',
    ],
  },
  {
    id: 'ib_val_12',
    topic: 'Valuation',
    difficulty: 2,
    question: 'What is a control premium?',
    reference_answer:
      'A control premium is the extra amount an acquirer pays above a company’s current trading price to gain control of it. It reflects the value of being able to direct strategy, realize synergies, and control cash flows. It’s why precedent transaction multiples, which come from completed acquisitions, generally run higher than public trading comps.',
    key_points: [
      'Premium over market price to acquire control',
      'Reflects control of strategy, synergies, cash flows',
      'Why precedents > trading comps',
    ],
  },
  {
    id: 'ib_val_13',
    topic: 'Valuation',
    difficulty: 1,
    question: 'What is a football field chart?',
    reference_answer:
      'A football field is a bar chart that shows the valuation range a company commands under each methodology — comparable companies, precedent transactions, DCF, and sometimes an LBO or 52-week trading range — stacked side by side. It lets you see where the methods overlap and triangulate a defensible value range rather than a single point.',
    key_points: [
      'Bar chart of valuation ranges per methodology',
      'Shows comps, precedents, DCF, LBO/52-week side by side',
      'Used to triangulate a value range',
    ],
  },
  {
    id: 'ib_val_14',
    topic: 'Valuation',
    difficulty: 2,
    question: 'What is a sum-of-the-parts valuation and when would you use it?',
    reference_answer:
      'A sum-of-the-parts values each business segment separately — often using different multiples or DCFs appropriate to each — and adds them up, then adjusts for corporate-level items and net debt. You use it for conglomerates or diversified companies whose segments have very different growth and risk profiles, where a single blended multiple would be misleading.',
    key_points: [
      'Value each segment separately, then sum',
      'Use segment-appropriate multiples / DCFs',
      'Best for conglomerates / diversified businesses',
    ],
  },
  {
    id: 'ib_val_15',
    topic: 'Valuation',
    difficulty: 2,
    question: 'What are the main weaknesses of relying on comparable companies?',
    reference_answer:
      'No two companies are truly identical, so differences in growth, margins, and risk distort the comparison. Multiples reflect current market sentiment, which can be irrationally high or low. Truly comparable public companies may be scarce, and accounting differences can make the multiples less comparable than they look. That’s why you triangulate with a DCF and precedents.',
    key_points: [
      'No perfect comps — growth/margin/risk differences',
      'Reflects current sentiment, can be mispriced',
      'Scarce comps, accounting differences; triangulate',
    ],
  },
  {
    id: 'ib_val_16',
    topic: 'Valuation',
    difficulty: 2,
    question: 'What is a liquidity or private-company discount?',
    reference_answer:
      'It’s a reduction in value applied to a private company because its shares can’t be easily bought or sold. Investors demand compensation for that illiquidity and for the typically thinner financial disclosure, so a private business usually trades at a discount to an otherwise comparable public one — often roughly in the 10–30% range depending on the situation.',
    key_points: [
      'Discount for shares that can’t be easily traded',
      'Compensates for illiquidity and thinner disclosure',
      'Private trades below comparable public company',
    ],
  },
  {
    id: 'ib_val_17',
    topic: 'Valuation',
    difficulty: 3,
    question: 'How would you value a private company?',
    reference_answer:
      'You use the same core methods — public comps, precedent transactions, and a DCF — but with adjustments. You apply a private-company or illiquidity discount, you can’t use a market cap so you build up equity value from enterprise value, and you may need to normalize the financials for owner-specific or non-recurring items. Data is harder to get, so estimates carry more uncertainty.',
    key_points: [
      'Same methods: comps, precedents, DCF',
      'Apply illiquidity/private discount; no market cap',
      'Normalize financials; more estimation uncertainty',
    ],
  },
  {
    id: 'ib_val_18',
    topic: 'Valuation',
    difficulty: 3,
    question: 'How would you value a company with negative EBITDA?',
    reference_answer:
      'EBITDA multiples don’t work, so you move down the income statement to revenue multiples like EV/Revenue, or use forward multiples on a year when the company is expected to be profitable. A DCF still works because it can model the path to positive cash flow. For early-stage or high-growth names, you might also lean on metrics like users, ARR, or unit economics.',
    key_points: [
      'EV/EBITDA breaks down → use EV/Revenue or forward multiples',
      'DCF still works (models path to profitability)',
      'Sector-specific metrics: ARR, users, unit economics',
    ],
  },

  // ── Enterprise Value (expanded) ────────────────────────────────────────────────
  {
    id: 'ib_ev_01',
    topic: 'Enterprise Value',
    difficulty: 2,
    question: 'Besides debt and cash, what else goes into the enterprise value bridge?',
    reference_answer:
      'Beyond adding debt and subtracting cash, you add preferred stock and noncontrolling (minority) interest because they’re claims of other capital providers. You also add other debt-like items such as capital and operating lease liabilities, unfunded pension obligations, and sometimes outstanding earn-outs. The goal is to capture every claim on the business beyond common equity.',
    key_points: [
      'Add preferred stock and minority/noncontrolling interest',
      'Add debt-like items: leases, unfunded pensions, earn-outs',
      'Capture all claims beyond common equity',
    ],
  },
  {
    id: 'ib_ev_02',
    topic: 'Enterprise Value',
    difficulty: 3,
    question: 'A company issues $100 of new equity for cash. What happens to its enterprise value?',
    reference_answer:
      'Enterprise value is unchanged. Equity value rises by $100 from the new shares, but cash also rises by $100, and since EV subtracts cash the two effects cancel. That makes sense because the core operating business hasn’t changed — only the balance sheet did. This is exactly why EV is capital-structure neutral.',
    key_points: [
      'EV unchanged',
      'Equity value +100, cash +100 cancel out',
      'Operations unchanged → EV is capital-structure neutral',
    ],
  },
  {
    id: 'ib_ev_03',
    topic: 'Enterprise Value',
    difficulty: 3,
    question: 'A company uses $50 of cash to pay down $50 of debt. What happens to enterprise value?',
    reference_answer:
      'Enterprise value is unchanged. Debt falls by $50, which lowers EV, but cash also falls by $50, and since you subtract cash, removing it raises EV by the same $50 — they offset. Equity value is also unchanged. Again, nothing happened to the operating business, just the capital structure, so EV stays flat.',
    key_points: [
      'EV unchanged',
      'Debt −50 lowers EV; cash −50 raises EV; they offset',
      'Equity value unchanged; only capital structure moved',
    ],
  },
  {
    id: 'ib_ev_04',
    topic: 'Enterprise Value',
    difficulty: 2,
    question: 'Why is minority interest added to enterprise value?',
    reference_answer:
      'When a company owns more than 50% of a subsidiary, it consolidates 100% of that subsidiary’s financials — including its full EBITDA — even though it doesn’t own all of it. Minority interest represents the portion it doesn’t own. You add it to EV so the numerator and the consolidated metric in the denominator are consistent.',
    key_points: [
      'Majority-owned subs are 100% consolidated (full EBITDA)',
      'Minority interest = the portion not owned',
      'Added to EV for numerator/denominator consistency',
    ],
  },
  {
    id: 'ib_ev_05',
    topic: 'Enterprise Value',
    difficulty: 2,
    question: 'Can enterprise value be lower than equity value? When?',
    reference_answer:
      'Yes — when a company has more cash than debt, a net cash position. Since EV is equity value plus net debt, a negative net debt makes EV smaller than equity value. You see this with cash-rich, low-debt businesses like some mature tech companies.',
    key_points: [
      'Yes, when the company is net cash (cash > debt)',
      'EV = equity value + net debt; negative net debt lowers EV',
      'Common in cash-rich, low-leverage companies',
    ],
  },
  {
    id: 'ib_ev_06',
    topic: 'Enterprise Value',
    difficulty: 3,
    question: 'Can enterprise value ever be negative? What would that mean?',
    reference_answer:
      'In theory yes, if a company’s cash exceeds its market cap plus its debt and other claims. It would imply the market is valuing the operating business at less than zero, which usually signals deep distress, expected cash burn, or a market dislocation. It’s rare and typically a sign something is wrong or mispriced.',
    key_points: [
      'Possible if cash > equity value + debt',
      'Implies the market values operations below zero',
      'Signals distress, cash burn, or mispricing — rare',
    ],
  },

  // ── Multiples (expanded) ───────────────────────────────────────────────────────
  {
    id: 'ib_mult_01',
    topic: 'Multiples',
    difficulty: 1,
    question: 'What is a valuation multiple, conceptually?',
    reference_answer:
      'A multiple expresses a company’s value as a ratio to some financial metric — like EV to EBITDA or price to earnings. It’s a shorthand for how much investors will pay per dollar of that metric. It lets you compare companies of different sizes on a standardized basis and quickly apply one company’s pricing to another.',
    key_points: [
      'Value expressed as a ratio to a financial metric',
      'Price paid per dollar of EBITDA, earnings, revenue, etc.',
      'Standardizes comparison across company sizes',
    ],
  },
  {
    id: 'ib_mult_02',
    topic: 'Multiples',
    difficulty: 2,
    question: 'When would you use EV/EBIT instead of EV/EBITDA?',
    reference_answer:
      'EV/EBIT is useful when depreciation and amortization are economically meaningful and you don’t want to ignore the cost of using up assets — for example, capital-intensive industries where capex roughly tracks D&A. EBITDA flatters asset-heavy businesses by ignoring that real cost, so EV/EBIT gives a more conservative, capex-aware comparison.',
    key_points: [
      'EV/EBIT keeps D&A in — accounts for asset consumption',
      'Better for capital-intensive businesses',
      'EBITDA can flatter asset-heavy companies',
    ],
  },
  {
    id: 'ib_mult_03',
    topic: 'Multiples',
    difficulty: 2,
    question: 'When would you use EV/Revenue?',
    reference_answer:
      'You use EV/Revenue when earnings or EBITDA are negative or not meaningful — common for early-stage, high-growth, or turnaround companies. Revenue is almost always positive and harder to manipulate, so it gives a usable benchmark when profit-based multiples break down, though it ignores profitability entirely so it’s a blunt tool.',
    key_points: [
      'Used when EBITDA/earnings are negative or not meaningful',
      'Common for high-growth / early-stage / turnaround names',
      'Ignores profitability — a blunt measure',
    ],
  },
  {
    id: 'ib_mult_04',
    topic: 'Multiples',
    difficulty: 2,
    question: 'Why do you pair EV with EBITDA but equity value with net income?',
    reference_answer:
      'The numerator and denominator have to represent the same capital providers. EBITDA is pre-interest, so it belongs to both debt and equity holders, which matches enterprise value. Net income is after interest, so it belongs only to equity holders, which matches equity value or market cap. Mixing them — like EV over net income — would be inconsistent.',
    key_points: [
      'Numerator and denominator must match the same capital providers',
      'EBITDA is pre-interest → matches EV (all capital)',
      'Net income is post-interest → matches equity value',
    ],
  },
  {
    id: 'ib_mult_05',
    topic: 'Multiples',
    difficulty: 2,
    question: 'What is the PEG ratio and what does it tell you?',
    reference_answer:
      'PEG is the P/E ratio divided by the earnings growth rate. It adjusts the P/E for growth, so it helps compare companies growing at different speeds. A PEG around 1 is often viewed as fairly valued, below 1 as potentially cheap relative to growth, and above 1 as expensive — though it’s a rough heuristic, not a precise rule.',
    key_points: [
      'PEG = P/E ÷ earnings growth rate',
      'Adjusts P/E for differences in growth',
      '~1 fairly valued, <1 cheaper, >1 pricier (rough rule)',
    ],
  },
  {
    id: 'ib_mult_06',
    topic: 'Multiples',
    difficulty: 1,
    question: 'What is the difference between trailing and forward multiples?',
    reference_answer:
      'A trailing multiple uses the last twelve months of actual results, while a forward multiple uses projected results for the next period. Forward multiples are usually lower for a growing company because the denominator is expected to be bigger. Bankers often emphasize forward multiples since valuation is about the future, but trailing ones are based on real, reported numbers.',
    key_points: [
      'Trailing: last twelve months actuals',
      'Forward: projected next-period figures',
      'Forward usually lower for growers; reflects the future',
    ],
  },
  {
    id: 'ib_mult_07',
    topic: 'Multiples',
    difficulty: 1,
    question: 'Why might one company trade at a higher multiple than its peers?',
    reference_answer:
      'Usually because the market expects faster growth, sees lower risk or more durable earnings, or values a stronger competitive position, better margins, or management. Capital structure, scarcity value, and market sentiment can also play a role. A higher multiple is the market saying it will pay more per dollar of earnings or EBITDA today for what it expects tomorrow.',
    key_points: [
      'Higher expected growth',
      'Lower risk / more durable earnings / better margins',
      'Competitive position, sentiment, scarcity',
    ],
  },
  {
    id: 'ib_mult_08',
    topic: 'Multiples',
    difficulty: 3,
    question: 'Why do you use P/E and P/B for banks instead of EV/EBITDA?',
    reference_answer:
      'For banks and most financial institutions, debt is effectively raw material rather than financing, and interest is a core part of operations, so enterprise value and EBITDA aren’t meaningful — you can’t cleanly separate operating from financing. Instead you use equity-based multiples like price-to-earnings and price-to-book, since book value of equity and net income are the relevant drivers of a bank’s value.',
    key_points: [
      'For banks, debt is raw material; interest is operating',
      'EV/EBITDA isn’t meaningful for financials',
      'Use equity multiples: P/E and P/B (book value driven)',
    ],
  },

  // ── DCF (expanded) ─────────────────────────────────────────────────────────────
  {
    id: 'ib_dcf_07',
    topic: 'DCF',
    difficulty: 3,
    question: 'What is the difference between FCFF and FCFE?',
    reference_answer:
      'Free cash flow to the firm is unlevered — it’s before interest and available to all capital providers, so you discount it at WACC to get enterprise value. Free cash flow to equity is levered — it’s after interest and mandatory debt payments, so it belongs only to equity holders, and you discount it at the cost of equity to get equity value directly. FCFF is the standard in a DCF.',
    key_points: [
      'FCFF: unlevered, pre-interest → discount at WACC → EV',
      'FCFE: levered, post-interest/debt → cost of equity → equity value',
      'FCFF is the DCF standard',
    ],
  },
  {
    id: 'ib_dcf_08',
    topic: 'DCF',
    difficulty: 1,
    question: 'If WACC goes up, what happens to the DCF value, and why?',
    reference_answer:
      'The value goes down. WACC is the discount rate, so a higher rate discounts future cash flows more heavily and shrinks their present value, including the terminal value. Intuitively, a higher cost of capital means investors demand more return, so they’ll pay less today for the same future cash flows.',
    key_points: [
      'Higher WACC → lower DCF value',
      'Bigger discount rate shrinks PV of future cash flows + TV',
      'Investors demand more return, pay less today',
    ],
  },
  {
    id: 'ib_dcf_09',
    topic: 'DCF',
    difficulty: 2,
    question: 'What is a reasonable terminal growth rate, and why does it matter so much?',
    reference_answer:
      'A reasonable perpetuity growth rate is modest — typically around the long-term rate of inflation or GDP growth, often roughly 2–3%, and never above the economy’s long-run growth, or the company would eventually become larger than the economy. It matters enormously because in the Gordon growth formula the value is highly sensitive to the spread between WACC and g, so small changes swing the valuation a lot.',
    key_points: [
      'Modest: ~inflation/GDP, often 2–3%',
      'Never exceed long-run economic growth',
      'Value is very sensitive to the WACC − g spread',
    ],
  },
  {
    id: 'ib_dcf_10',
    topic: 'DCF',
    difficulty: 2,
    question: 'What portion of a DCF value typically comes from the terminal value?',
    reference_answer:
      'Often a large majority — frequently 60% to 80% of the total enterprise value sits in the terminal value. That’s because the explicit forecast only covers five to ten years while the terminal value captures everything beyond. It’s also why interviewers probe terminal value assumptions hard, and why you sanity-check it against an implied exit multiple.',
    key_points: [
      'Typically ~60–80% of total value',
      'Explicit period is short; TV captures everything after',
      'Sanity-check TV against an implied exit multiple',
    ],
  },
  {
    id: 'ib_dcf_11',
    topic: 'DCF',
    difficulty: 3,
    question: 'What is the mid-year convention and why use it?',
    reference_answer:
      'The mid-year convention assumes cash flows arrive evenly through the year — effectively at the midpoint — rather than all at year-end, so you discount each year using a half-period adjustment. It’s more realistic because companies generate cash continuously, and it raises the present value slightly versus assuming a lump sum at year-end.',
    key_points: [
      'Assumes cash flows arrive mid-year, not at year-end',
      'More realistic — cash is generated continuously',
      'Modestly increases present value',
    ],
  },
  {
    id: 'ib_dcf_12',
    topic: 'DCF',
    difficulty: 2,
    question: 'How do you calculate the cost of equity?',
    reference_answer:
      'The standard approach is the capital asset pricing model: cost of equity equals the risk-free rate plus beta times the equity risk premium. The risk-free rate is usually a long-dated government bond yield, beta measures the stock’s sensitivity to the market, and the equity risk premium is the extra return investors demand for holding equities over the risk-free asset.',
    key_points: [
      'CAPM: cost of equity = rf + β × equity risk premium',
      'Risk-free rate from long-dated government bond',
      'Beta = sensitivity to the market; ERP = excess return for equities',
    ],
  },
  {
    id: 'ib_dcf_13',
    topic: 'DCF',
    difficulty: 3,
    question: 'What is beta, and what is the difference between levered and unlevered beta?',
    reference_answer:
      'Beta measures how much a stock moves relative to the overall market — a beta of 1 moves with the market, above 1 is more volatile. Levered (equity) beta reflects both business risk and the company’s financial leverage. Unlevered (asset) beta strips out the effect of debt to isolate pure business risk. In practice you unlever peer betas, take a median, then relever at the target’s capital structure.',
    key_points: [
      'Beta = sensitivity of the stock to the market',
      'Levered beta includes financial leverage; unlevered strips debt out',
      'Unlever peers → median → relever at target’s structure',
    ],
  },
  {
    id: 'ib_dcf_14',
    topic: 'DCF',
    difficulty: 2,
    question: 'If a company has no debt, what is its WACC?',
    reference_answer:
      'With no debt, WACC simply equals the cost of equity, because there’s no debt weighting or after-tax cost of debt to blend in. The entire capital structure is equity, so the blended cost of capital collapses to the return equity investors require.',
    key_points: [
      'No debt → WACC = cost of equity',
      'No debt weight or after-tax cost of debt to blend',
      'All-equity firm: WACC is just the required equity return',
    ],
  },
  {
    id: 'ib_dcf_15',
    topic: 'DCF',
    difficulty: 2,
    question: 'What are the main weaknesses of a DCF?',
    reference_answer:
      'A DCF is extremely sensitive to assumptions — small changes in WACC, the terminal growth rate, or the projections can swing the value dramatically. So much of the value sits in a hard-to-pin-down terminal value, and forecasting cash flows years out is inherently uncertain. The output is only as good as the inputs, which is why you triangulate with comps and precedents.',
    key_points: [
      'Highly sensitive to WACC, g, and projections',
      'Most value sits in an uncertain terminal value',
      'Garbage in, garbage out — triangulate with other methods',
    ],
  },
  {
    id: 'ib_dcf_16',
    topic: 'DCF',
    difficulty: 3,
    question: 'How would you build a DCF for a high-growth company that isn’t yet profitable?',
    reference_answer:
      'You extend the explicit forecast period long enough for the company to mature into profitability and stable margins — often ten years or more — modeling the path from cash burn to positive free cash flow. You take terminal value only once growth and margins normalize. Because the assumptions are so uncertain, you lean heavily on scenario analysis and cross-check against revenue multiples.',
    key_points: [
      'Longer explicit period until margins/growth normalize',
      'Model the path from cash burn to positive FCF',
      'Take TV only at maturity; use scenarios and EV/Revenue checks',
    ],
  },

  // ── LBO (expanded) ─────────────────────────────────────────────────────────────
  {
    id: 'ib_lbo_06',
    topic: 'LBO',
    difficulty: 3,
    question: 'Walk me through a simple paper LBO.',
    reference_answer:
      'Start with entry: take EBITDA times an entry multiple to get enterprise value, then split it into debt and equity — say 60% debt, 40% equity, so the equity check is 40% of EV. Over the hold, grow EBITDA and use free cash flow to pay down debt. At exit, apply an exit multiple to the higher EBITDA to get a new enterprise value, subtract the remaining debt to get exit equity, then compare exit equity to the initial equity to get MOIC, and annualize it for IRR.',
    key_points: [
      'Entry: EBITDA × entry multiple = EV; split into debt + equity check',
      'Hold: grow EBITDA, pay down debt with free cash flow',
      'Exit: EBITDA × exit multiple − remaining debt = exit equity',
      'MOIC = exit equity / entry equity; annualize for IRR',
    ],
  },
  {
    id: 'ib_lbo_07',
    topic: 'LBO',
    difficulty: 2,
    question: 'What does a typical LBO capital structure look like?',
    reference_answer:
      'Roughly half to two-thirds of the purchase is funded with debt and the rest with sponsor equity, though it varies with market conditions. The debt is layered by seniority: senior secured term loans and revolvers first, then subordinated or mezzanine debt and high-yield bonds, which are riskier and carry higher interest. Senior debt is cheapest and gets paid first; junior tranches cost more.',
    key_points: [
      'Roughly 50–65% debt, rest sponsor equity (market dependent)',
      'Layered: senior secured (loans/revolver), then sub/mezz/high-yield',
      'Senior is cheapest and paid first; junior costs more',
    ],
  },
  {
    id: 'ib_lbo_08',
    topic: 'LBO',
    difficulty: 1,
    question: 'What returns do private equity firms typically target?',
    reference_answer:
      'Sponsors generally aim for an IRR in the low-to-mid 20s percent and a multiple of invested capital around 2 to 3 times over a typical three-to-five-year hold. The exact bar depends on fund strategy and market conditions, but roughly a 20%-plus IRR is the classic benchmark.',
    key_points: [
      'IRR target roughly low-to-mid 20s percent',
      'MOIC around 2–3x',
      'Over a ~3–5 year hold',
    ],
  },
  {
    id: 'ib_lbo_09',
    topic: 'LBO',
    difficulty: 3,
    question: 'What is a dividend recapitalization and why would a sponsor do one?',
    reference_answer:
      'A dividend recap is when the portfolio company raises new debt and uses the proceeds to pay a dividend to its private equity owners. It lets the sponsor pull cash out and lock in some return before exiting, boosting IRR by returning capital earlier. The trade-off is it adds leverage and risk to the company without improving operations.',
    key_points: [
      'Raise new debt to pay a dividend to the sponsor',
      'Returns capital early → boosts IRR before exit',
      'Trade-off: more leverage/risk, no operational improvement',
    ],
  },
  {
    id: 'ib_lbo_10',
    topic: 'LBO',
    difficulty: 2,
    question: 'What is the difference between senior debt and subordinated/mezzanine debt?',
    reference_answer:
      'Senior debt sits at the top of the capital structure, is usually secured by assets, and gets repaid first in a default, so it carries the lowest interest rate. Subordinated or mezzanine debt ranks below it, is typically unsecured, and gets paid only after senior lenders, so it’s riskier and carries a higher rate — sometimes with equity-like features like warrants.',
    key_points: [
      'Senior: top of structure, secured, paid first, lowest rate',
      'Sub/mezz: ranks lower, unsecured, paid later, higher rate',
      'Mezzanine may include equity kickers like warrants',
    ],
  },
  {
    id: 'ib_lbo_11',
    topic: 'LBO',
    difficulty: 2,
    question: 'If the entry and exit multiples are the same, where do returns come from?',
    reference_answer:
      'With no multiple expansion, returns come entirely from EBITDA growth and debt paydown. As the company grows EBITDA, enterprise value rises even at a flat multiple, and as free cash flow pays down debt, a larger share of that enterprise value accrues to equity. So operational improvement and deleveraging are the two levers.',
    key_points: [
      'No multiple expansion → returns from EBITDA growth + debt paydown',
      'EBITDA growth lifts EV at a constant multiple',
      'Deleveraging shifts more EV to equity',
    ],
  },
  {
    id: 'ib_lbo_12',
    topic: 'LBO',
    difficulty: 2,
    question: 'Why isn’t more leverage always better in an LBO?',
    reference_answer:
      'More debt amplifies equity returns when things go well, but it also raises interest and mandatory payments, leaving less cushion if cash flow disappoints. Too much leverage increases the risk of breaching covenants or defaulting, can starve the business of cash for investment, and lenders won’t provide it past a point. There’s an optimal level that balances return and risk.',
    key_points: [
      'Leverage amplifies returns but also risk',
      'Higher interest/mandatory payments shrink the cushion',
      'Default/covenant risk; lenders cap it; balance return vs risk',
    ],
  },
  {
    id: 'ib_lbo_13',
    topic: 'LBO',
    difficulty: 2,
    question: 'What are the sources and uses in an LBO?',
    reference_answer:
      'Sources are where the money to fund the deal comes from — the various debt tranches, sponsor equity, and any cash from the balance sheet. Uses are where it goes — primarily the purchase of equity, refinancing or repaying existing debt, and transaction fees and expenses. The two sides must balance: total sources equal total uses.',
    key_points: [
      'Sources: debt tranches, sponsor equity, balance-sheet cash',
      'Uses: purchase equity, refinance existing debt, fees',
      'Sources must equal uses',
    ],
  },
  {
    id: 'ib_lbo_14',
    topic: 'LBO',
    difficulty: 3,
    question: 'What is a management rollover and why does it matter?',
    reference_answer:
      'A management rollover is when the existing management team reinvests some of their proceeds into the new deal rather than cashing out entirely, so they own equity alongside the sponsor. It reduces the sponsor’s equity check and, more importantly, aligns management’s incentives with creating value, since they share in the upside they help generate.',
    key_points: [
      'Management reinvests proceeds into the new equity',
      'Reduces the sponsor’s required equity check',
      'Aligns incentives — management shares in the upside',
    ],
  },
  {
    id: 'ib_lbo_15',
    topic: 'LBO',
    difficulty: 2,
    question: 'How can you roughly estimate IRR from a MOIC and a holding period?',
    reference_answer:
      'You can use rule-of-thumb benchmarks: a 2x over three years is about a 26% IRR, 2x over five years is about 15%, and 3x over five years is about 25%. A handy approximation is the rule of 72 — a 2x roughly means your money doubles, so 72 divided by the hold gives the IRR. For precision you’d annualize: MOIC to the power of one-over-years, minus one.',
    key_points: [
      'Benchmarks: 2x/3yr ≈ 26%, 2x/5yr ≈ 15%, 3x/5yr ≈ 25%',
      'Rule of 72 for doublings',
      'Exact: MOIC^(1/years) − 1',
    ],
  },

  // ── M&A (expanded) ─────────────────────────────────────────────────────────────
  {
    id: 'ib_ma_04',
    topic: 'M&A',
    difficulty: 3,
    question: 'What is the difference between an asset sale and a stock sale?',
    reference_answer:
      'In a stock sale the buyer purchases the target’s equity and takes the company as-is, including its liabilities, and the existing tax basis carries over. In an asset sale the buyer cherry-picks specific assets and liabilities, can often step up the tax basis of those assets to depreciate them, and avoids unwanted liabilities. Buyers usually prefer asset sales for the tax step-up and liability protection; sellers usually prefer stock sales.',
    key_points: [
      'Stock sale: buy equity, inherit liabilities, carryover basis',
      'Asset sale: pick assets/liabilities, step up tax basis',
      'Buyers prefer asset (step-up, protection); sellers prefer stock',
    ],
  },
  {
    id: 'ib_ma_05',
    topic: 'M&A',
    difficulty: 2,
    question: 'What are synergies, and which type is more credible?',
    reference_answer:
      'Synergies are the added value from combining two companies. Cost synergies come from eliminating duplicate functions, facilities, and overhead, and are generally more credible and achievable because they’re within management’s control. Revenue synergies come from cross-selling or expanded reach and are harder to realize and easier to overstate, so the market discounts them more heavily.',
    key_points: [
      'Cost synergies: cut duplicate costs/overhead — more credible',
      'Revenue synergies: cross-sell/reach — harder, often overstated',
      'Markets trust cost synergies more',
    ],
  },
  {
    id: 'ib_ma_06',
    topic: 'M&A',
    difficulty: 1,
    question: 'What is the difference between a strategic buyer and a financial buyer?',
    reference_answer:
      'A strategic buyer is an operating company in the same or an adjacent industry that acquires for strategic reasons and can realize synergies, so it can often pay more. A financial buyer, like a private equity firm, buys to generate a financial return, usually with leverage, and is more disciplined on price since the deal has to clear a return hurdle.',
    key_points: [
      'Strategic: operating company, buys for synergies, can pay more',
      'Financial: PE/sponsor, buys for returns, uses leverage',
      'Financial buyers are more price-disciplined (return hurdle)',
    ],
  },
  {
    id: 'ib_ma_07',
    topic: 'M&A',
    difficulty: 2,
    question: 'Walk me through the main steps of a sell-side M&A process.',
    reference_answer:
      'The banker prepares marketing materials — a teaser and a confidential information memorandum — and builds a buyer list. Interested parties sign NDAs, receive the CIM, and submit initial indications of interest. Selected bidders get management presentations and data-room access for due diligence, then submit final bids. The seller negotiates the purchase agreement with the winner, signs, and works to closing, including any regulatory approvals.',
    key_points: [
      'Prep: teaser, CIM, buyer list',
      'NDAs → initial indications of interest',
      'Management meetings, data room/diligence → final bids',
      'Negotiate purchase agreement → sign → close',
    ],
  },
  {
    id: 'ib_ma_08',
    topic: 'M&A',
    difficulty: 1,
    question: 'What is due diligence in M&A?',
    reference_answer:
      'Due diligence is the buyer’s deep investigation of the target before committing — verifying the financials, contracts, customers, legal and tax matters, operations, and potential liabilities. The goal is to confirm the company is what it claims to be, uncover risks, and inform the price and the terms of the purchase agreement.',
    key_points: [
      'Buyer’s deep pre-deal investigation of the target',
      'Covers financials, legal, tax, contracts, operations, liabilities',
      'Confirms value, surfaces risks, shapes price and terms',
    ],
  },
  {
    id: 'ib_ma_09',
    topic: 'M&A',
    difficulty: 2,
    question: 'How does the way a deal is financed affect accretion/dilution?',
    reference_answer:
      'Cash deals are usually accretive when the after-tax interest income forgone, or interest cost on new debt, is cheaper than the earnings being acquired. Debt deals depend on the interest rate versus the target’s earnings yield. Stock deals depend on the relative P/E multiples — issuing higher-multiple stock to buy lower-multiple earnings is accretive. Generally cash and debt are more often accretive than stock because equity is the most expensive financing.',
    key_points: [
      'Cash/debt: compare financing cost to acquired earnings',
      'Stock: compare relative P/E multiples',
      'Equity is the most expensive financing — stock dilutes more often',
    ],
  },
  {
    id: 'ib_ma_10',
    topic: 'M&A',
    difficulty: 2,
    question: 'What are the trade-offs between paying with cash versus stock?',
    reference_answer:
      'Cash gives the seller certainty and is often accretive for the buyer, but it uses up balance-sheet capacity and puts all the post-deal risk on the acquirer. Stock shares the risk and reward of the combined company with the seller and preserves cash, but it dilutes existing shareholders and signals the acquirer may think its shares are fully or overvalued. The choice depends on relative valuations, balance-sheet strength, and risk appetite.',
    key_points: [
      'Cash: certain for seller, often accretive, uses capacity, buyer bears risk',
      'Stock: shares risk/reward, preserves cash, dilutes, can signal overvaluation',
      'Depends on relative valuation, balance sheet, risk appetite',
    ],
  },
  {
    id: 'ib_ma_11',
    topic: 'M&A',
    difficulty: 2,
    question: 'How is goodwill created in an acquisition?',
    reference_answer:
      'When a buyer acquires a target, it records the target’s identifiable assets and liabilities at fair value. Goodwill is the plug — the excess of the purchase price (equity purchase price) over the fair value of the net identifiable assets acquired. It represents the premium paid for things like brand, workforce, and expected synergies that aren’t separately recognized.',
    key_points: [
      'Record target net assets at fair value',
      'Goodwill = purchase price − fair value of net identifiable assets',
      'Captures premium for brand, workforce, synergies',
    ],
  },
  {
    id: 'ib_ma_12',
    topic: 'M&A',
    difficulty: 3,
    question: 'What is a hostile takeover and what are common defenses?',
    reference_answer:
      'A hostile takeover is when an acquirer pursues a target against the wishes of its board, often via a tender offer directly to shareholders or a proxy fight. Common defenses include a poison pill that lets other shareholders buy discounted stock to dilute the raider, staggered boards that slow control changes, white knights — a friendlier alternative buyer — and golden parachutes. These tactics buy the board time and leverage to negotiate.',
    key_points: [
      'Acquisition against the target board’s wishes (tender offer/proxy fight)',
      'Poison pill dilutes the raider',
      'Staggered board, white knight, golden parachutes',
    ],
  },
  {
    id: 'ib_ma_13',
    topic: 'M&A',
    difficulty: 2,
    question: 'Why do many M&A deals fail to create value?',
    reference_answer:
      'Common reasons are overpaying — especially when synergies are overestimated to justify the price — and underestimating how hard integration is, including culture clashes and customer or employee attrition. Distraction of management, debt taken on to fund the deal, and a flawed strategic rationale also contribute. Studies consistently show a large share of deals don’t earn back their premium.',
    key_points: [
      'Overpaying / overestimated synergies',
      'Integration and culture challenges, attrition',
      'Distraction, deal debt, weak strategic rationale',
    ],
  },

  // ── Financial Modeling ─────────────────────────────────────────────────────────
  {
    id: 'ib_model_01',
    topic: 'Financial Modeling',
    difficulty: 1,
    question: 'What are the key drivers you’d use to build a revenue projection?',
    reference_answer:
      'The cleanest approach is to break revenue into a price times volume build — units sold times average price — or for a subscription business, customers times average revenue per customer. You can also grow off a base rate tied to market growth or historical trends. The goal is to tie revenue to real operational drivers rather than a single assumed growth percentage.',
    key_points: [
      'Price × volume (units × ASP) or customers × ARPU',
      'Tie to market growth / operational drivers',
      'Avoid a single hard-coded growth rate',
    ],
  },
  {
    id: 'ib_model_02',
    topic: 'Financial Modeling',
    difficulty: 2,
    question: 'How would you project a company’s operating expenses?',
    reference_answer:
      'You separate costs into variable and fixed. Variable costs, like cost of goods sold, are usually modeled as a percentage of revenue based on historical margins. Fixed or semi-fixed costs, like overhead and rent, grow more slowly — often with inflation or a step function as the company scales. The result should reflect operating leverage as revenue grows.',
    key_points: [
      'Split variable vs fixed costs',
      'Variable: % of revenue from historical margins',
      'Fixed/SG&A: grow with inflation/steps; shows operating leverage',
    ],
  },
  {
    id: 'ib_model_03',
    topic: 'Financial Modeling',
    difficulty: 3,
    question: 'What causes a circular reference in a financial model, and how do you handle it?',
    reference_answer:
      'The classic circularity is interest expense: interest depends on the debt balance, which depends on cash flow, which depends on net income, which depends on interest expense — a loop. You handle it either by enabling iterative calculation in the model, or by adding a circularity switch that breaks the loop, or by calculating interest on the beginning-of-period balance to avoid the circular dependency entirely.',
    key_points: [
      'Interest ↔ debt ↔ cash flow ↔ net income loop',
      'Fix via iterative calculation or a circularity switch',
      'Or use beginning-of-period debt balance for interest',
    ],
  },
  {
    id: 'ib_model_04',
    topic: 'Financial Modeling',
    difficulty: 3,
    question: 'How does a debt schedule with a cash sweep work?',
    reference_answer:
      'A debt schedule tracks each tranche’s beginning balance, mandatory amortization, optional prepayment, and ending balance, and feeds interest expense back to the income statement. A cash sweep takes the excess free cash flow after mandatory payments and uses it to prepay debt, usually in order of seniority. It’s central to an LBO because that automatic paydown drives deleveraging and equity returns.',
    key_points: [
      'Tracks beginning balance, amortization, prepayment, ending balance',
      'Feeds interest expense back to the IS',
      'Cash sweep prepays debt with excess FCF, by seniority → deleveraging',
    ],
  },
  {
    id: 'ib_model_05',
    topic: 'Financial Modeling',
    difficulty: 1,
    question: 'What is the difference between sensitivity analysis and scenario analysis?',
    reference_answer:
      'Sensitivity analysis flexes one or two variables at a time — like WACC and terminal growth — to see how the output moves, often shown as a data table. Scenario analysis changes a whole consistent set of assumptions together to represent a base, upside, and downside case. Sensitivity isolates individual drivers; scenarios tell coherent stories about the future.',
    key_points: [
      'Sensitivity: flex one or two variables (data table)',
      'Scenario: change a coherent set of assumptions together',
      'Sensitivity isolates drivers; scenarios are full cases',
    ],
  },
  {
    id: 'ib_model_06',
    topic: 'Financial Modeling',
    difficulty: 2,
    question: 'How do you make sure a three-statement model is built correctly?',
    reference_answer:
      'The single biggest check is that the balance sheet balances every period — assets equal liabilities plus equity — and you build a check row that flags any imbalance. You also confirm the cash flow statement’s ending cash ties to the balance sheet cash line, that net income flows consistently, and you sanity-check margins, growth, and ratios against history and peers for reasonableness.',
    key_points: [
      'Balance sheet must balance every period (build a check row)',
      'CFS ending cash ties to BS cash; net income flows through',
      'Sanity-check margins/growth/ratios vs history and peers',
    ],
  },
  {
    id: 'ib_model_07',
    topic: 'Financial Modeling',
    difficulty: 2,
    question: 'What is normalized or run-rate EBITDA, and why adjust for it?',
    reference_answer:
      'Normalized EBITDA strips out one-time, non-recurring, or non-operating items — like litigation settlements, restructuring charges, or owner perks in a private company — to show the true ongoing earning power of the business. Run-rate annualizes recent performance to reflect the current level. Buyers and lenders care because valuation and leverage should be based on sustainable, recurring EBITDA, not distorted reported figures.',
    key_points: [
      'Strip out one-time / non-recurring / non-operating items',
      'Run-rate annualizes current performance',
      'Reflects sustainable earning power for valuation and leverage',
    ],
  },

  // ── Markets & Economy ──────────────────────────────────────────────────────────
  {
    id: 'ib_macro_01',
    topic: 'Markets & Economy',
    difficulty: 1,
    question: 'What is the relationship between bond prices and interest rates?',
    reference_answer:
      'They move inversely. When interest rates rise, newly issued bonds pay more, so existing bonds with lower coupons become less attractive and their prices fall; when rates fall, existing higher-coupon bonds become more valuable and their prices rise. The longer the bond’s maturity, the more sensitive its price is to rate changes — that’s duration.',
    key_points: [
      'Inverse relationship: rates up → prices down, rates down → prices up',
      'Existing coupons reprice against new issuance',
      'Longer maturity = more price sensitivity (duration)',
    ],
  },
  {
    id: 'ib_macro_02',
    topic: 'Markets & Economy',
    difficulty: 2,
    question: 'What is the yield curve, and what does an inverted curve signal?',
    reference_answer:
      'The yield curve plots government bond yields across maturities. Normally it slopes upward because investors demand more yield to lock up money longer. An inverted curve — short-term yields above long-term ones — means investors expect rates and growth to fall, and it has historically been a reliable warning sign of a coming recession.',
    key_points: [
      'Plots yields across maturities; normally upward sloping',
      'Inverted = short rates above long rates',
      'Signals expected rate cuts/slowing growth — recession indicator',
    ],
  },
  {
    id: 'ib_macro_03',
    topic: 'Markets & Economy',
    difficulty: 2,
    question: 'How do changes in interest rates affect equity valuations?',
    reference_answer:
      'Higher rates raise the discount rate applied to future cash flows, which lowers the present value of stocks — hitting high-growth companies hardest because more of their value is far in the future. Higher rates also raise borrowing costs and can slow the economy and earnings. Lower rates do the reverse, generally supporting higher valuations. Rates are a key input to the cost of equity and WACC.',
    key_points: [
      'Higher rates → higher discount rate → lower PV of future cash flows',
      'Hurts long-duration/growth stocks most',
      'Also raises borrowing costs, can slow earnings; rates drive WACC',
    ],
  },
  {
    id: 'ib_macro_04',
    topic: 'Markets & Economy',
    difficulty: 1,
    question: 'What does the Federal Reserve do, and how does it influence the economy?',
    reference_answer:
      'The Fed is the U.S. central bank with a dual mandate of stable prices and maximum employment. Its main tool is setting the federal funds rate, which ripples through borrowing costs across the economy. Raising rates cools inflation and growth; cutting rates stimulates borrowing and spending. It also uses balance-sheet operations like buying or selling bonds.',
    key_points: [
      'U.S. central bank; dual mandate: stable prices + employment',
      'Main tool: the federal funds rate',
      'Hikes cool inflation; cuts stimulate; also uses balance sheet',
    ],
  },
  {
    id: 'ib_macro_05',
    topic: 'Markets & Economy',
    difficulty: 1,
    question: 'What is inflation and how is it measured?',
    reference_answer:
      'Inflation is the rate at which the general price level of goods and services rises over time, eroding purchasing power. It’s most commonly measured by the Consumer Price Index, which tracks a basket of consumer goods, and by the PCE index, which the Fed favors. Central banks typically target around 2% annual inflation.',
    key_points: [
      'Rising general price level, erodes purchasing power',
      'Measured via CPI; PCE is the Fed’s preferred gauge',
      'Typical central-bank target ~2%',
    ],
  },
  {
    id: 'ib_macro_06',
    topic: 'Markets & Economy',
    difficulty: 1,
    question: 'What market figures should you know walking into an interview?',
    reference_answer:
      'You should know roughly where the major equity indices are — the S&P 500 and Dow — the 10-year Treasury yield, the fed funds rate, the price of oil, and major currency levels. More important than exact numbers is knowing the direction and the why: what the Fed is doing, where inflation is, and one or two major market stories of the moment. It shows you actually follow markets.',
    key_points: [
      'S&P 500/Dow level, 10-year yield, fed funds rate, oil, key FX',
      'Know direction and the “why,” not just exact figures',
      'Have a current market story or two ready',
    ],
  },
  {
    id: 'ib_macro_07',
    topic: 'Markets & Economy',
    difficulty: 3,
    question: 'How would rising interest rates affect LBO and M&A activity?',
    reference_answer:
      'Higher rates make debt more expensive and harder to obtain, which raises the cost of LBOs, lowers the leverage sponsors can use, and pressures the prices they can pay — so buyout activity tends to slow. M&A overall can cool as financing costs rise and valuations come under pressure, though strategic deals funded with cash or stock are less affected. Cheap debt fuels deal activity; expensive debt dampens it.',
    key_points: [
      'Higher rates → costlier/scarcer debt → lower leverage, lower prices',
      'Buyout activity slows; financing-dependent deals hit hardest',
      'Strategic cash/stock deals less affected',
    ],
  },
  {
    id: 'ib_macro_08',
    topic: 'Markets & Economy',
    difficulty: 2,
    question: 'What is the difference between fiscal and monetary policy?',
    reference_answer:
      'Monetary policy is run by the central bank and works through interest rates and the money supply to manage inflation and growth. Fiscal policy is run by the government through taxation and spending decisions. Monetary policy adjusts the cost and availability of money; fiscal policy directly injects or withdraws demand through budgets. They can reinforce or work against each other.',
    key_points: [
      'Monetary: central bank, interest rates & money supply',
      'Fiscal: government, taxes & spending',
      'Both manage the economy; can reinforce or conflict',
    ],
  },
  {
    id: 'ib_macro_09',
    topic: 'Markets & Economy',
    difficulty: 3,
    question: 'What is quantitative easing?',
    reference_answer:
      'Quantitative easing is when a central bank buys large amounts of longer-term bonds and other assets to inject money into the financial system once short-term rates are already near zero. It pushes down longer-term yields, raises asset prices, and encourages lending and risk-taking to stimulate the economy. Quantitative tightening is the reverse — shrinking the balance sheet.',
    key_points: [
      'Central bank buys long-term assets to inject liquidity',
      'Used when short-term rates are near zero',
      'Lowers long yields, lifts asset prices; QT is the reverse',
    ],
  },

  // ── Brain Teasers ──────────────────────────────────────────────────────────────
  {
    id: 'ib_bt_01',
    topic: 'Brain Teasers',
    difficulty: 2,
    question: 'How would you estimate the number of gas stations in the United States?',
    reference_answer:
      'The point is structured reasoning, not the exact answer. Start with about 330 million people, roughly 200 million drivers or about 250 million cars. Assume a car fills up about once a week, so maybe 250 million fill-ups a week. A station might serve some hundreds of cars a day. Work the math to a few hundred thousand stations — the real figure is around 115,000–150,000, so state your assumptions clearly and sanity-check the order of magnitude.',
    key_points: [
      'Show structured top-down reasoning, state assumptions',
      'Anchor on population → cars → fill-ups → station throughput',
      'Sanity-check the order of magnitude (actual ~115–150k)',
    ],
  },
  {
    id: 'ib_bt_02',
    topic: 'Brain Teasers',
    difficulty: 1,
    question: 'What is the sum of all integers from 1 to 100?',
    reference_answer:
      'It’s 5,050. The trick is to pair the numbers: 1 plus 100, 2 plus 99, and so on, gives 50 pairs each summing to 101, so 50 times 101 equals 5,050. The general formula is n times n-plus-one over two.',
    key_points: [
      'Answer: 5,050',
      'Pair 1+100, 2+99 … = 50 pairs of 101',
      'Formula: n(n+1)/2',
    ],
  },
  {
    id: 'ib_bt_03',
    topic: 'Brain Teasers',
    difficulty: 2,
    question: 'A bat and a ball cost $1.10 together. The bat costs $1.00 more than the ball. How much is the ball?',
    reference_answer:
      'The ball costs 5 cents, not 10. If the ball is x, the bat is x plus $1.00, and together they’re 2x plus $1.00 equals $1.10, so 2x is $0.10 and x is $0.05. The intuitive answer of 10 cents is wrong because it would make the bat $1.10 and the total $1.20.',
    key_points: [
      'Answer: $0.05 (the ball)',
      'Set up: x + (x + 1.00) = 1.10 → 2x = 0.10',
      'The intuitive $0.10 is the trap',
    ],
  },
  {
    id: 'ib_bt_04',
    topic: 'Brain Teasers',
    difficulty: 2,
    question: 'What is the angle between the hour and minute hands of a clock at 3:15?',
    reference_answer:
      'It’s 7.5 degrees. The minute hand at 15 minutes points exactly at the 3, at 90 degrees. The hour hand isn’t at 3 anymore — it’s moved a quarter of the way toward 4. Each hour is 30 degrees, so a quarter is 7.5 degrees past the 3, putting the hour hand at 97.5 degrees. The difference is 7.5 degrees.',
    key_points: [
      'Answer: 7.5 degrees',
      'Minute hand at 3 = 90°; hour hand has moved ¼ of 30° past 3',
      'Hour hand at 97.5°, difference = 7.5°',
    ],
  },
  {
    id: 'ib_bt_05',
    topic: 'Brain Teasers',
    difficulty: 2,
    question: 'You have a 3-gallon and a 5-gallon jug. How do you measure exactly 4 gallons?',
    reference_answer:
      'Fill the 5-gallon jug, then pour from it into the 3-gallon jug until the small one is full, leaving 2 gallons in the big jug. Empty the 3-gallon jug, pour those 2 gallons into it, then refill the 5-gallon jug. Now pour from the 5 into the 3-gallon jug, which only needs 1 more gallon to fill — leaving exactly 4 gallons in the 5-gallon jug.',
    key_points: [
      'Fill 5, pour into 3 → 2 left in the 5',
      'Empty 3, move the 2 over, refill the 5',
      'Top off the 3 (needs 1) → 4 left in the 5',
    ],
  },
  {
    id: 'ib_bt_06',
    topic: 'Brain Teasers',
    difficulty: 2,
    question: 'You flip a fair coin twice. What is the probability of getting at least one heads?',
    reference_answer:
      'It’s 3 out of 4, or 75%. The easiest way is the complement: the only way to get no heads is two tails, which has a probability of one-half times one-half, or one-quarter. So at least one heads is one minus one-quarter, which is three-quarters.',
    key_points: [
      'Answer: 3/4 (75%)',
      'Use the complement: P(no heads) = ½ × ½ = ¼',
      '1 − ¼ = ¾',
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
  'Financial Modeling',
  'Markets & Economy',
  'Brain Teasers',
];
