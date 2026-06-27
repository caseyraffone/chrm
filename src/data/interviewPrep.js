// ─── Interview Prep structure ──────────────────────────────────────────────────
//
// Finance verticals and the tracks within each. Curated banks are added vertical
// by vertical; until a track has a curated bank it's marked 'soon'. The legacy
// free-text AI generator stays available under "Other role".

export const FINANCE_INDUSTRIES = [
  {
    key: 'IB',
    name: 'Investment Banking',
    blurb: 'Technicals, behaviorals, fit & markets',
    status: 'active',
  },
  { key: 'PE', name: 'Private Equity', blurb: 'LBOs, deal sense, fit', status: 'active' },
  { key: 'ST', name: 'Sales & Trading', blurb: 'Markets, products, brainteasers', status: 'soon' },
  { key: 'ER', name: 'Equity Research', blurb: 'Valuation, theses, modeling', status: 'soon' },
  { key: 'Consulting', name: 'Consulting', blurb: 'Case interviews, frameworks', status: 'soon' },
];

// Tracks per industry. 'active' tracks have a curated bank; 'soon' are queued.
export const INDUSTRY_TRACKS = {
  IB: [
    { key: 'Technical', name: 'Technical', blurb: 'Accounting, valuation, DCF, LBO, M&A', status: 'active' },
    { key: 'Behavioral', name: 'Behavioral', blurb: 'STAR stories & competencies', status: 'active' },
    { key: 'Fit', name: 'Fit & Motivation', blurb: 'Why banking, why this group', status: 'active' },
    { key: 'Markets', name: 'Markets', blurb: 'Markets awareness & a stock pitch', status: 'active' },
  ],
  PE: [
    { key: 'LBO', name: 'LBO & Modeling', blurb: 'LBO mechanics, returns math, paper LBO', status: 'active' },
    { key: 'Deal', name: 'Deal Sense', blurb: 'Investment judgment & value creation', status: 'active' },
    { key: 'Technical', name: 'Technical', blurb: 'Valuation, accounting & credit', status: 'active' },
    { key: 'Fit', name: 'Fit & Motivation', blurb: 'Why PE, why this firm', status: 'active' },
  ],
};
