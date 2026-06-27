// Validates every curated question bank for integrity. Run with:
//   node scripts/validateBanks.mjs
//
// Catches the failure modes that don't throw at runtime but quietly break the
// product: duplicate ids, an item whose topic isn't in its TOPICS list (it would
// never render), missing questions/reference fields, a bank with no free
// (difficulty 1) questions, or a declared topic with no questions.

const base = new URL('../src/data/', import.meta.url);
const url = (f) => new URL(f, base).href;

const banks = [];
async function add(file, itemsKey, topicsKey, kind) {
  const m = await import(url(file));
  banks.push({ name: `${file}:${itemsKey}`, items: m[itemsKey], topics: m[topicsKey], kind });
}

await add('ibTechnicalBank.js', 'IB_TECHNICAL_BANK', 'IB_TECHNICAL_TOPICS', 'ref');
await add('ibBehavioralBank.js', 'IB_BEHAVIORAL_BANK', 'IB_BEHAVIORAL_TOPICS', 'star');
await add('ibFitBank.js', 'IB_FIT_BANK', 'IB_FIT_TOPICS', 'ref');
await add('ibMarketsBank.js', 'IB_MARKETS_BANK', 'IB_MARKETS_TOPICS', 'ref');
await add('peBank.js', 'PE_LBO_BANK', 'PE_LBO_TOPICS', 'ref');
await add('peBank.js', 'PE_DEAL_BANK', 'PE_DEAL_TOPICS', 'ref');
await add('peBank.js', 'PE_TECHNICAL_BANK', 'PE_TECHNICAL_TOPICS', 'ref');
await add('peBank.js', 'PE_FIT_BANK', 'PE_FIT_TOPICS', 'ref');

const allIds = new Map();
let problems = 0;
const fail = (msg) => {
  console.log('  - ' + msg);
  problems++;
};

for (const b of banks) {
  const topicSet = new Set(b.topics);
  const seenTopics = new Set();
  let free = 0;
  for (const it of b.items) {
    if (allIds.has(it.id)) fail(`duplicate id ${it.id} (also in ${allIds.get(it.id)})`);
    allIds.set(it.id, b.name);
    if (!it.question || !it.question.trim()) fail(`missing question on ${it.id}`);
    if (![1, 2, 3].includes(it.difficulty)) fail(`bad difficulty on ${it.id}: ${it.difficulty}`);
    if (it.difficulty === 1) free++;
    if (!topicSet.has(it.topic)) fail(`orphan topic "${it.topic}" on ${it.id} (not in TOPICS — won't render)`);
    seenTopics.add(it.topic);
    if (b.kind === 'ref') {
      if (!it.reference_answer || !it.reference_answer.trim()) fail(`missing reference_answer on ${it.id}`);
      if (!Array.isArray(it.key_points) || it.key_points.length === 0) fail(`missing key_points on ${it.id}`);
    }
  }
  for (const t of b.topics) if (!seenTopics.has(t)) fail(`declared topic "${t}" has no questions in ${b.name}`);
  if (free === 0) fail(`${b.name} has no free (difficulty 1) question`);
  const dist = [1, 2, 3].map((d) => b.items.filter((i) => i.difficulty === d).length);
  console.log(`${b.name}: ${b.items.length} Qs | free/int/adv ${dist.join('/')} | ${b.topics.length} topics`);
}

console.log(`\nTotal curated questions: ${allIds.size}`);
if (problems === 0) {
  console.log('✅ All bank integrity checks passed.');
  process.exit(0);
} else {
  console.log(`❌ ${problems} problem(s) found.`);
  process.exit(1);
}
