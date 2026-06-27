import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { generateHireVueDebrief } from '../utils/api';
import { track, EVENTS } from '../utils/analytics';
import ProcessingOverlay from '../components/ProcessingOverlay';

const FILLERS = ['um', 'uh', 'hmm', 'like', 'you know', 'kind of', 'sort of', 'basically', 'literally'];

function countFillerWords(items) {
  const text = items.map((it) => it.transcript || '').join(' ').toLowerCase();
  let total = 0;
  const counts = {};
  for (const filler of FILLERS) {
    const regex = new RegExp(`\\b${filler.replace(' ', '\\s+')}\\b`, 'gi');
    const matches = text.match(regex) || [];
    if (matches.length > 0) {
      counts[filler] = matches.length;
      total += matches.length;
    }
  }
  return { total, counts };
}

function ScoreBars({ scores }) {
  if (!scores || scores.length === 0) return null;
  const max = 10;
  const barWidth = Math.min(44, Math.floor((300 - (scores.length - 1) * 6) / scores.length));
  return (
    <View style={curveStyles.bars}>
      {scores.map((score, i) => (
        <View key={i} style={[curveStyles.barCol, { width: barWidth }]}>
          <Text style={curveStyles.scoreLabel}>{score}</Text>
          <View style={curveStyles.barTrack}>
            <View style={[curveStyles.bar, { height: Math.max(4, (score / max) * 72) }]} />
          </View>
          <Text style={curveStyles.qLabel}>Q{i + 1}</Text>
        </View>
      ))}
    </View>
  );
}

const curveStyles = StyleSheet.create({
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 96, paddingBottom: 20 },
  barCol: { alignItems: 'center', gap: 4 },
  scoreLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted },
  barTrack: { flex: 1, width: '100%', backgroundColor: colors.border, borderRadius: 3, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 3, backgroundColor: colors.accent },
  qLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted },
});

export default function HireVueDebriefScreen({ route, navigation }) {
  const { company, role, items } = route.params;
  const [debrief, setDebrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fillerData = countFillerWords(items);

  useEffect(() => {
    (async () => {
      try {
        const result = await generateHireVueDebrief(company, role, items);
        setDebrief(result);
        track(EVENTS.HIREVUE_COMPLETED, { score: result?.overall_score ?? null, questions: items?.length ?? null });
      } catch (err) {
        console.error('HireVue debrief failed:', err);
        setError('Could not generate your debrief. You can still review your answers below.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function scoreColor(score) {
    if (score >= 8) return colors.success;
    if (score >= 5) return colors.text;
    return colors.error;
  }

  const overallScore = debrief?.overall_score ?? null;
  const perQuestion = debrief?.per_question || [];
  const scores = perQuestion.map((p) => p.score);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>HIREVUE DEBRIEF</Text>
          <View style={{ width: 52 }} />
        </View>

        <Text style={styles.companyLabel}>
          {company}{role ? ` · ${role}` : ''}
        </Text>

        {/* Overall score */}
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreEyebrow}>OVERALL PERFORMANCE</Text>
          {overallScore !== null ? (
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreBig, { color: scoreColor(overallScore) }]}>{overallScore}</Text>
              <Text style={styles.scoreOutOf}>/10</Text>
            </View>
          ) : (
            <Text style={styles.scorePlaceholder}>—</Text>
          )}
          <Text style={styles.exchangeCount}>{items.length} questions answered</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {debrief?.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>THE READ</Text>
            <View style={styles.sectionCard}>
              <Text style={styles.summaryText}>{debrief.summary}</Text>
            </View>
          </View>
        )}

        {scores.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SCORE BY QUESTION</Text>
            <View style={styles.sectionCard}>
              <ScoreBars scores={scores} />
            </View>
          </View>
        )}

        {/* Per-question breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>QUESTION BREAKDOWN</Text>
          {items.map((it, i) => {
            const fb = perQuestion[i];
            const isOpen = expanded === i;
            const isStrongest = debrief?.strongest_index === i;
            const isWeakest = debrief?.weakest_index === i;
            return (
              <TouchableOpacity
                key={i}
                style={styles.qCard}
                onPress={() => setExpanded(isOpen ? null : i)}
                activeOpacity={0.8}
              >
                <View style={styles.qCardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.qCardTopRow}>
                      <Text style={styles.qCardTag}>{(it.category || 'Behavioral').toUpperCase()}</Text>
                      {isStrongest && <Text style={styles.bestTag}>BEST</Text>}
                      {isWeakest && <Text style={styles.worstTag}>FOCUS</Text>}
                    </View>
                    <Text style={styles.qCardQuestion} numberOfLines={isOpen ? undefined : 2}>
                      {it.question}
                    </Text>
                  </View>
                  {fb && (
                    <Text style={[styles.qCardScore, { color: scoreColor(fb.score) }]}>{fb.score}</Text>
                  )}
                </View>

                {isOpen && (
                  <View style={styles.qCardBody}>
                    {fb && (
                      <>
                        <View style={styles.fbRow}>
                          <Text style={[styles.fbDot, { color: colors.success }]}>✓</Text>
                          <Text style={styles.fbText}>{fb.strong}</Text>
                        </View>
                        <View style={styles.fbRow}>
                          <Text style={[styles.fbDot, { color: colors.accent }]}>→</Text>
                          <Text style={styles.fbText}>{fb.improve}</Text>
                        </View>
                      </>
                    )}
                    <Text style={styles.transcriptLabel}>YOUR ANSWER</Text>
                    <Text style={styles.transcriptText}>
                      {it.transcript ? it.transcript : '(No answer was recorded.)'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Filler words */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FILLER WORDS</Text>
          <View style={styles.sectionCard}>
            <View style={styles.fillerRow}>
              <View style={styles.fillerCountBlock}>
                <Text style={[styles.fillerCount, { color: colors.error }]}>{fillerData.total}</Text>
                <Text style={styles.fillerCountLabel}>total detected</Text>
              </View>
              <View style={styles.fillerBreakdown}>
                {Object.entries(fillerData.counts).map(([word, c]) => (
                  <View key={word} style={styles.fillerChip}>
                    <Text style={styles.fillerChipText}>"{word}" ×{c}</Text>
                  </View>
                ))}
                {Object.keys(fillerData.counts).length === 0 && (
                  <Text style={styles.fillerNone}>None detected — great job!</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Work on */}
        {debrief?.work_on && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>3 THINGS TO WORK ON</Text>
            <View style={styles.sectionCard}>
              {debrief.work_on.map((item, i) => (
                <View key={i} style={[styles.workRow, i < debrief.work_on.length - 1 && styles.workRowBorder]}>
                  <View style={styles.workNumber}>
                    <Text style={styles.workNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.workText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')} activeOpacity={0.85}>
          <Text style={styles.homeButtonText}>BACK TO HOME</Text>
        </TouchableOpacity>
      </ScrollView>

      <ProcessingOverlay visible={loading} message="Scoring your interview..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 80, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  doneButton: { paddingVertical: spacing.xs, width: 52 },
  doneText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  headerTitle: { fontFamily: fonts.displayMedium, fontSize: 13, color: colors.textMuted, letterSpacing: 2 },
  companyLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, letterSpacing: 1, marginBottom: spacing.xl },
  scoreBlock: { alignItems: 'center', marginBottom: spacing.xl, paddingBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  scoreEyebrow: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 2.5, marginBottom: spacing.sm },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  scoreBig: { fontFamily: fonts.display, fontSize: 96, lineHeight: 88, letterSpacing: -4 },
  scoreOutOf: { fontFamily: fonts.body, fontSize: 20, color: colors.textMuted, marginBottom: 6 },
  scorePlaceholder: { fontFamily: fonts.display, fontSize: 96, color: colors.textMuted, lineHeight: 88 },
  exchangeCount: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  errorBanner: { backgroundColor: 'rgba(214,40,40,0.06)', borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 2, borderLeftColor: colors.error },
  errorText: { fontFamily: fonts.body, fontSize: 13, color: colors.error, lineHeight: 20 },
  section: { marginBottom: spacing.xl },
  sectionLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted, letterSpacing: 3, marginBottom: spacing.md },
  sectionCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  summaryText: { fontFamily: fonts.body, fontSize: 14, color: colors.text, lineHeight: 22 },
  qCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  qCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  qCardTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  qCardTag: { fontFamily: fonts.body, fontSize: 9, color: colors.accent, letterSpacing: 1.5 },
  bestTag: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.success, letterSpacing: 1 },
  worstTag: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.error, letterSpacing: 1 },
  qCardQuestion: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text, lineHeight: 20 },
  qCardScore: { fontFamily: fonts.display, fontSize: 30, lineHeight: 32 },
  qCardBody: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  fbRow: { flexDirection: 'row', gap: spacing.sm },
  fbDot: { fontSize: 13, width: 16, lineHeight: 20 },
  fbText: { fontFamily: fonts.body, fontSize: 13, color: colors.text, flex: 1, lineHeight: 20 },
  transcriptLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted, letterSpacing: 2, marginTop: spacing.sm },
  transcriptText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  fillerRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  fillerCountBlock: { alignItems: 'center', minWidth: 56 },
  fillerCount: { fontFamily: fonts.display, fontSize: 24 },
  fillerCountLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  fillerBreakdown: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm, flex: 1 },
  fillerChip: { backgroundColor: 'rgba(214,40,40,0.06)', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(214,40,40,0.2)' },
  fillerChipText: { fontFamily: fonts.body, fontSize: 11, color: colors.error },
  fillerNone: { fontFamily: fonts.body, fontSize: 13, color: colors.success, marginTop: spacing.sm },
  workRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md },
  workRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  workNumber: { backgroundColor: colors.accentDim, borderRadius: radius.sm, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(23,71,212,0.2)' },
  workNumberText: { fontFamily: fonts.display, fontSize: 16, color: colors.accent, lineHeight: 18 },
  workText: { fontFamily: fonts.body, fontSize: 14, color: colors.text, flex: 1, lineHeight: 21 },
  homeButton: { backgroundColor: colors.text, borderRadius: radius.md, paddingVertical: spacing.md + 2, alignItems: 'center', marginTop: spacing.md },
  homeButtonText: { fontFamily: fonts.display, fontSize: 15, color: '#F2F1EE', letterSpacing: 2 },
});
