import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { getFeedback, getResumeFeedback, getTechnicalFeedback } from '../utils/api';
import { saveDrill, savePrepKitQuestionAttempt, saveBankAttempt, getResume } from '../utils/storage';
import { track, EVENTS } from '../utils/analytics';
import { analyzeSpeech } from '../utils/speech';
import ProcessingOverlay from '../components/ProcessingOverlay';

const DEEP_DIVE_SHOWN_KEY = '@chrm_deep_dive_shown';

export default function FeedbackScreen({ route, navigation }) {
  const { category, role, questions, question, transcript, duration, company = null, isFirstDrill = false, hubReturn = null, referenceAnswer = null, keyPoints = null, bankItemId = null } = route.params;
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeepDiveCard, setShowDeepDiveCard] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  async function loadFeedback() {
    try {
      setLoading(true);
      let result;
      if (category === 'Resume Walkthrough') {
        const resumeText = await getResume();
        result = await getResumeFeedback(transcript, resumeText, role);
      } else if (referenceAnswer) {
        // Technical, Fit & Motivation, and Markets all grade against a reference
        // answer + key points. Behavioral has no reference and uses the STAR path.
        result = await getTechnicalFeedback(transcript, question, referenceAnswer, keyPoints, role);
      } else {
        result = await getFeedback(transcript, question, category, role);
      }
      setFeedback(result);

      // A non-answer (silence/dropped mic) shouldn't pollute history, progress,
      // or analytics with a fake score. Show the friendly prompt and stop here.
      if (result.insufficient) {
        setLoading(false);
        return;
      }

      if (hubReturn) {
        await savePrepKitQuestionAttempt(hubReturn.company, hubReturn.role, question, result.score);
      }

      // Record best-score progress for curated bank questions.
      if (bankItemId) {
        await saveBankAttempt(bankItemId, result.score);
      }

      if (isFirstDrill) {
        await AsyncStorage.setItem('@chrm_onboarding_completed', 'true');
        if (role) {
          const alreadyShown = await AsyncStorage.getItem(DEEP_DIVE_SHOWN_KEY);
          if (!alreadyShown) {
            setShowDeepDiveCard(true);
            await AsyncStorage.setItem(DEEP_DIVE_SHOWN_KEY, 'true');
          }
        }
      }

      // Save to history
      const drill = {
        id: Date.now().toString(),
        category,
        question,
        transcript,
        feedback: result,
        duration,
        date: new Date().toISOString(),
        score: result.score,
        company: company || null,
      };
      await saveDrill(drill);

      // PII-free funnel event — category/score/role only, never the transcript.
      track(EVENTS.DRILL_COMPLETED, {
        category,
        score: result.score,
        role: role || null,
        has_company: Boolean(company),
        is_first_drill: isFirstDrill,
      });
    } catch (err) {
      console.error('Feedback error:', err);
      setError(err.message || 'Could not generate feedback. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleGoAgain() {
    if (hubReturn) {
      // Pop Practice + Feedback to return to the existing PrepKitHub instance.
      // useFocusEffect there will reload progress automatically.
      navigation.pop(2);
      return;
    }
    if (category === 'Quick Fire') {
      navigation.navigate('QuickFire');
    } else {
      navigation.navigate('Practice', { category, role, questions, referenceAnswer, keyPoints, bankItemId });
    }
  }

  function getScoreColor(score) {
    if (score >= 8) return colors.success;
    if (score >= 5) return colors.text;
    return colors.error;
  }

  function getScoreLabel(score) {
    if (score >= 9) return 'ELITE';
    if (score >= 8) return 'STRONG';
    if (score >= 6) return 'SOLID';
    if (score >= 4) return 'DEVELOPING';
    return 'NEEDS WORK';
  }

  const scoreColor = feedback ? getScoreColor(feedback.score) : null;

  // "How you said it" metrics — only when we have a real, gradeable answer.
  const delivery = feedback && !feedback.insufficient ? analyzeSpeech(transcript, duration) : null;
  const toneColor = (tone) =>
    tone === 'good' ? colors.success : tone === 'bad' ? colors.error : colors.accent;

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFeedback}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLinkButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : feedback ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
              <Text style={styles.backText}>← Home</Text>
            </TouchableOpacity>
            <Text style={styles.categoryLabel}>{category.toUpperCase()}</Text>
          </View>

          {/* Score */}
          {feedback.insufficient ? (
            <View style={styles.scoreBlock}>
              <Text style={[styles.scoreNumber, { color: colors.textMuted }]}>—</Text>
              <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>NO ANSWER DETECTED</Text>
            </View>
          ) : (
            <View style={styles.scoreBlock}>
              <Text style={[styles.scoreNumber, { color: scoreColor }]}>{feedback.score}</Text>
              <Text style={styles.scoreSlash}>/10</Text>
              <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                {getScoreLabel(feedback.score)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Delivery — how you said it (pace + fillers), computed locally */}
          {delivery && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DELIVERY</Text>
              <View style={styles.deliveryRow}>
                <View style={styles.deliveryStat}>
                  <Text style={[styles.deliveryValue, { color: toneColor(delivery.paceTone) }]}>
                    {delivery.wpm}
                  </Text>
                  <Text style={styles.deliveryUnit}>words/min</Text>
                  <Text style={[styles.deliveryTag, { color: toneColor(delivery.paceTone) }]}>
                    {delivery.paceLabel}
                  </Text>
                </View>
                <View style={styles.deliveryStat}>
                  <Text style={[styles.deliveryValue, { color: toneColor(delivery.fillerTone) }]}>
                    {delivery.fillers}
                  </Text>
                  <Text style={styles.deliveryUnit}>filler words</Text>
                  <Text style={[styles.deliveryTag, { color: toneColor(delivery.fillerTone) }]}>
                    {delivery.fillers === 0 ? 'None — clean' : `${Math.round(delivery.fillerRate * 100)}% of words`}
                  </Text>
                </View>
                <View style={styles.deliveryStat}>
                  <Text style={styles.deliveryValue}>{delivery.durationSeconds}s</Text>
                  <Text style={styles.deliveryUnit}>spoken</Text>
                  <Text style={styles.deliveryTag}>{delivery.words} words</Text>
                </View>
              </View>
              <Text style={styles.deliveryTip}>{delivery.tip}</Text>
            </View>
          )}

          {/* Question */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>QUESTION</Text>
            <Text style={styles.questionText}>{question}</Text>
          </View>

          {/* What was strong */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHAT WORKED</Text>
            {feedback.strong.map((point, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={[styles.bulletDot, { color: colors.success }]}>✓</Text>
                <Text style={styles.bulletText}>{point}</Text>
              </View>
            ))}
          </View>

          {/* What to improve */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>IMPROVE</Text>
            {feedback.improve.map((point, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={[styles.bulletDot, { color: colors.accent }]}>→</Text>
                <Text style={styles.bulletText}>{point}</Text>
              </View>
            ))}
          </View>

          {/* Stronger version */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>STRONGER VERSION</Text>
            <View style={styles.strongerBox}>
              <Text style={styles.strongerText}>"{feedback.stronger_version}"</Text>
            </View>
          </View>

          {/* Transcript — collapsed by default; the feedback above is the point */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.transcriptToggle}
              onPress={() => setShowTranscript((v) => !v)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionLabel}>YOUR ANSWER</Text>
              <Text style={styles.transcriptChevron}>{showTranscript ? '−' : '+'}</Text>
            </TouchableOpacity>
            {showTranscript && <Text style={styles.transcriptText}>{transcript}</Text>}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.goAgainButton} onPress={handleGoAgain} activeOpacity={0.8}>
              <Text style={styles.goAgainText}>{hubReturn ? 'BACK TO TRAINING' : 'GO AGAIN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.8}
            >
              <Text style={styles.homeButtonText}>HOME</Text>
            </TouchableOpacity>
          </View>

          {/* Deep-dive Prep Kit CTA — first drill only */}
          {showDeepDiveCard && (
            <TouchableOpacity
              style={styles.deepDiveCard}
              onPress={() => navigation.navigate('PrepKitInput', { prefillRole: role })}
              activeOpacity={0.8}
            >
              <View style={styles.deepDiveCardInner}>
                <Text style={styles.deepDiveTitle}>Want to go deeper?</Text>
                <Text style={styles.deepDiveSubtitle}>
                  Generate a full Prep Kit for {role} — interview questions, company intel, and a 5-day training plan.
                </Text>
                <Text style={styles.deepDiveArrow}>→</Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : null}

      {/* Full-screen loading overlay — fades out when feedback is ready */}
      <ProcessingOverlay visible={loading} message="Analyzing your answer..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 80 : 56,
    paddingBottom: 60,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorEmoji: {
    fontSize: 36,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 20,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  retryButtonText: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: '#F2F1EE',
    letterSpacing: 1,
  },
  backLinkButton: {
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingVertical: spacing.xs,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  categoryLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 2,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  scoreNumber: {
    fontFamily: fonts.display,
    fontSize: 100,
    lineHeight: 104,
    letterSpacing: -4,
    includeFontPadding: false,
  },
  scoreSlash: {
    fontFamily: fonts.body,
    fontSize: 22,
    color: colors.textMuted,
    marginBottom: 8,
  },
  scoreLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    letterSpacing: 3,
    marginBottom: 14,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  deliveryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  deliveryStat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  deliveryValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
  },
  deliveryUnit: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  deliveryTag: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  deliveryTip: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  questionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  bulletDot: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    width: 20,
  },
  bulletText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  strongerBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.border,
  },
  strongerText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  transcriptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transcriptChevron: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  transcriptText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  deepDiveCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(23, 71, 212, 0.2)',
    backgroundColor: colors.accentDim,
  },
  deepDiveCardInner: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  deepDiveTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.text,
  },
  deepDiveSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  deepDiveArrow: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  goAgainButton: {
    backgroundColor: colors.text,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  goAgainText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: '#F2F1EE',
    letterSpacing: 2,
  },
  homeButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  homeButtonText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 2,
  },
});
