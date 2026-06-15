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
import { generateMockInterviewDebrief } from '../utils/api';
import ProcessingOverlay from '../components/ProcessingOverlay';

const FILLERS = ['um', 'uh', 'hmm', 'like', 'you know', 'kind of', 'sort of', 'basically', 'literally'];

function countFillerWords(conversation) {
  const userText = conversation
    .filter((t) => t.type === 'user')
    .map((t) => t.transcript || '')
    .join(' ')
    .toLowerCase();

  let total = 0;
  const counts = {};
  for (const filler of FILLERS) {
    const regex = new RegExp(`\\b${filler.replace(' ', '\\s+')}\\b`, 'gi');
    const matches = userText.match(regex) || [];
    if (matches.length > 0) {
      counts[filler] = matches.length;
      total += matches.length;
    }
  }
  return { total, counts };
}

function scoreColor(score) {
  if (score >= 7) return colors.success;
  if (score >= 5) return '#F59E0B';
  return colors.error;
}

function ConfidenceCurve({ scores }) {
  if (!scores || scores.length === 0) return null;
  const max = 10;
  const barWidth = Math.min(44, Math.floor((300 - (scores.length - 1) * 6) / scores.length));

  return (
    <View style={curveStyles.container}>
      <View style={curveStyles.bars}>
        {scores.map((score, i) => (
          <View key={i} style={[curveStyles.barCol, { width: barWidth }]}>
            <Text style={curveStyles.scoreLabel}>{score}</Text>
            <View style={curveStyles.barTrack}>
              <View
                style={[
                  curveStyles.bar,
                  {
                    height: Math.max(4, (score / max) * 72),
                    backgroundColor: scoreColor(score),
                  },
                ]}
              />
            </View>
            <Text style={curveStyles.qLabel}>Q{i + 1}</Text>
          </View>
        ))}
      </View>
      <View style={curveStyles.legend}>
        <View style={curveStyles.legendItem}>
          <View style={[curveStyles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={curveStyles.legendText}>Strong (7+)</Text>
        </View>
        <View style={curveStyles.legendItem}>
          <View style={[curveStyles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={curveStyles.legendText}>Solid (5-6)</Text>
        </View>
        <View style={curveStyles.legendItem}>
          <View style={[curveStyles.legendDot, { backgroundColor: colors.error }]} />
          <Text style={curveStyles.legendText}>Weak (&lt;5)</Text>
        </View>
      </View>
    </View>
  );
}

const curveStyles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 96,
    marginBottom: spacing.sm,
  },
  barCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  scoreLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 2,
  },
  barTrack: {
    justifyContent: 'flex-end',
    height: 72,
  },
  bar: {
    borderRadius: 3,
    width: '100%',
    minWidth: 8,
  },
  qLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 3,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
  },
});

export default function MockInterviewDebriefScreen({ route, navigation }) {
  const { company, role, kit, conversation } = route.params;
  const [debrief, setDebrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fillerData = countFillerWords(conversation);
  const userAnswers = conversation.filter((t) => t.type === 'user');

  useEffect(() => {
    async function loadDebrief() {
      try {
        const result = await generateMockInterviewDebrief(conversation, company, role);
        setDebrief(result);
      } catch (err) {
        console.error('Debrief generation failed:', err);
        setError('Could not generate your debrief. You can still review the full transcript.');
      } finally {
        setLoading(false);
      }
    }
    loadDebrief();
  }, []);

  const overallScore = debrief?.overall_score ?? null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>DEBRIEF</Text>
          <View style={{ width: 52 }} />
        </View>

        {/* Company label */}
        <Text style={styles.companyLabel}>
          {company}{role ? ` · ${role}` : ''}
        </Text>

        {/* Overall Score */}
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreEyebrow}>OVERALL PERFORMANCE</Text>
          {overallScore !== null ? (
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreBig, { color: scoreColor(overallScore) }]}>
                {overallScore}
              </Text>
              <Text style={styles.scoreOutOf}>/10</Text>
            </View>
          ) : (
            <Text style={styles.scorePlaceholder}>—</Text>
          )}
          <Text style={styles.exchangeCount}>{userAnswers.length} answers given</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {debrief && (
          <>
            {/* Strongest Answer */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>STRONGEST ANSWER</Text>
              <View style={[styles.answerCard, styles.strongCard]}>
                <Text style={styles.answerCardLabel}>Q{(debrief.strongest_exchange_index ?? 0) + 1}</Text>
                <Text style={styles.answerQuote}>"{debrief.strongest_quote}"</Text>
                <Text style={styles.answerReason}>{debrief.strongest_reason}</Text>
              </View>
            </View>

            {/* Weakest Answer */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>WEAKEST ANSWER</Text>
              <View style={[styles.answerCard, styles.weakCard]}>
                <Text style={styles.answerCardLabel}>Q{(debrief.weakest_exchange_index ?? 0) + 1}</Text>
                <Text style={styles.answerQuote}>"{debrief.weakest_quote}"</Text>
                <Text style={styles.answerSuggestion}>{debrief.weakest_suggestion}</Text>
              </View>
            </View>

            {/* Confidence Curve */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>CONFIDENCE CURVE</Text>
              <View style={styles.sectionCard}>
                <ConfidenceCurve scores={debrief.per_exchange_scores} />
              </View>
            </View>
          </>
        )}

        {/* Filler Words */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FILLER WORDS</Text>
          <View style={styles.sectionCard}>
            <View style={styles.fillerRow}>
              <View style={styles.fillerCountBlock}>
                <Text style={[styles.fillerCount, { color: fillerData.total > 15 ? colors.error : fillerData.total > 7 ? '#F59E0B' : colors.success }]}>
                  {fillerData.total}
                </Text>
                <Text style={styles.fillerCountLabel}>total detected</Text>
              </View>
              <View style={styles.fillerBreakdown}>
                {Object.entries(fillerData.counts).map(([word, count]) => (
                  <View key={word} style={styles.fillerChip}>
                    <Text style={styles.fillerChipText}>"{word}" ×{count}</Text>
                  </View>
                ))}
                {Object.keys(fillerData.counts).length === 0 && (
                  <Text style={styles.fillerNone}>None detected — great job!</Text>
                )}
              </View>
            </View>
            <Text style={styles.fillerNote}>Based on approximate keyword matching across all answers.</Text>
          </View>
        </View>

        {/* Work On */}
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

        {/* Full Transcript CTA */}
        <TouchableOpacity
          style={styles.transcriptButton}
          onPress={() => navigation.navigate('MockInterviewTranscript', { conversation })}
          activeOpacity={0.8}
        >
          <Text style={styles.transcriptButtonText}>REVIEW FULL TRANSCRIPT</Text>
          <Text style={styles.transcriptButtonSub}>Includes AI's private notes on each answer</Text>
        </TouchableOpacity>
      </ScrollView>

      <ProcessingOverlay visible={loading} message="Analyzing your performance..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: { flex: 1 },
  content: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  doneButton: { paddingVertical: spacing.xs, width: 52 },
  doneText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontFamily: fonts.header,
    fontSize: 18,
    color: colors.text,
    letterSpacing: 2,
  },
  companyLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.xl,
  },
  scoreBlock: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scoreEyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2.5,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  scoreBig: {
    fontFamily: fonts.header,
    fontSize: 96,
    lineHeight: 96,
  },
  scoreOutOf: {
    fontFamily: fonts.header,
    fontSize: 32,
    color: colors.textMuted,
    marginBottom: 10,
  },
  scorePlaceholder: {
    fontFamily: fonts.header,
    fontSize: 96,
    color: colors.textMuted,
    lineHeight: 96,
  },
  exchangeCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  errorBanner: {
    backgroundColor: 'rgba(255,59,48,0.08)',
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 2,
    borderLeftColor: colors.error,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2.5,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  answerCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  strongCard: {
    backgroundColor: 'rgba(0,200,81,0.06)',
    borderColor: 'rgba(0,200,81,0.25)',
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  weakCard: {
    backgroundColor: 'rgba(255,59,48,0.06)',
    borderColor: 'rgba(255,59,48,0.2)',
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  answerCardLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  answerQuote: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  answerReason: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.success,
    lineHeight: 20,
  },
  answerSuggestion: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    lineHeight: 20,
  },
  fillerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  fillerCountBlock: {
    alignItems: 'center',
    minWidth: 56,
  },
  fillerCount: {
    fontFamily: fonts.header,
    fontSize: 48,
    lineHeight: 48,
  },
  fillerCountLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  fillerBreakdown: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: 4,
  },
  fillerChip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fillerChipText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  fillerNone: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.success,
  },
  fillerNote: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  workRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  workRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  workNumber: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.sm,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  workNumberText: {
    fontFamily: fonts.header,
    fontSize: 16,
    color: colors.accent,
    lineHeight: 18,
  },
  workText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 21,
  },
  transcriptButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  transcriptButtonText: {
    fontFamily: fonts.header,
    fontSize: 16,
    color: colors.accent,
    letterSpacing: 2,
    marginBottom: 4,
  },
  transcriptButtonSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
