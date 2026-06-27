// Tests for the speaking-delivery analytics. Run with:
//   node --test test/speech.test.mjs

import { test } from 'node:test';
import assert from 'node:assert';

const { analyzeSpeech, countWords, countFillers } = await import('../src/utils/speech.js');

test('countWords counts whitespace-separated tokens', () => {
  assert.strictEqual(countWords('hello there world'), 3);
  assert.strictEqual(countWords('   '), 0);
  assert.strictEqual(countWords(''), 0);
});

test('countFillers finds whole-word and phrase fillers, not substrings', () => {
  const { total, breakdown } = countFillers('Um, I basically, you know, like really liked it');
  assert.ok(total >= 4, `expected >=4 fillers, got ${total}`);
  assert.strictEqual(breakdown['you know'], 1);
  assert.strictEqual(breakdown['um'], 1);
  // "liked" must NOT be counted as the filler "like"
  assert.strictEqual(breakdown['like'], 1);
});

test('analyzeSpeech returns null for too-short input', () => {
  assert.strictEqual(analyzeSpeech('too short', 30), null); // <12 words
  assert.strictEqual(analyzeSpeech('a b c d e f g h i j k l m', 2), null); // <5s
});

test('analyzeSpeech computes wpm and a pace label', () => {
  // 150 words over 60s = 150 wpm → "Great pace"
  const words = Array.from({ length: 150 }, () => 'word').join(' ');
  const r = analyzeSpeech(words, 60);
  assert.strictEqual(r.wpm, 150);
  assert.strictEqual(r.paceLabel, 'Great pace');
  assert.strictEqual(r.paceTone, 'good');
});

test('analyzeSpeech flags a rushed pace', () => {
  // 240 words over 60s = 240 wpm → "Rushed"
  const words = Array.from({ length: 240 }, () => 'word').join(' ');
  const r = analyzeSpeech(words, 60);
  assert.strictEqual(r.paceLabel, 'Rushed');
  assert.ok(/slow down/i.test(r.tip));
});

test('analyzeSpeech flags heavy filler use with a concrete tip', () => {
  // 20 words, several fillers → fillerRate > 6%
  const r = analyzeSpeech('um um um like like you know the answer is basically yes and uh that is it ok', 20);
  assert.ok(r.fillers >= 5, `expected fillers>=5, got ${r.fillers}`);
  assert.strictEqual(r.fillerTone, 'bad');
  assert.ok(/filler/i.test(r.tip));
});
