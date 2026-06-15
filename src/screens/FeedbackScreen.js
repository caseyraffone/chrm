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
import { getFeedback } from '../utils/api';
import { saveDrill, savePrepKitQuestionAttempt } from '../utils/storage';
import ProcessingOverlay from '../components/ProcessingOverlay';

const DEEP_DIVE_SHOWN_KEY = '@chrm_deep_dive_shown';

export default function FeedbackScreen({ route, navigation }) {
  const { category, role, questions, question, transcript, duration, company = null, isFirstDrill = false, hubReturn = null } = route.params;
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showDeepDiveCard, setShowDeepDiveCard] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  async function loadFeedback() {
    try {
      setLoading(true);
      const result = await getFeedback(transcript, question, category, role);
      setFeedback(result);

      if (hubReturn) {
        await savePrepKitQuestionAttempt(hubReturn.company, hubReturn.role, question, result.score);
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
      navigation.navigate('Practice', { category, role, questions });
    }
  }

  function getScoreColor(score) {
    if (score >= 8) return colors.success;
    if (score >= 6) return colors.accent;
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
          <View style={styles.scoreBlock}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{feedback.score}</Text>
            <Text style={styles.scoreSlash}>/10</Text>
            <Text style={[styles.scoreLabel, { color: scoreColor }]}>
              {getScoreLabel(feedback.score)}
            </Text>
          </View>

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

          {/* Transcript */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOUR ANSWER</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
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
  loadingText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.lg,
  },
  loadingSubtext: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontFamily: fonts.bodyBold,
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
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  retryButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
    letterSpacing: 1,
  },
  backLinkButton: {
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
  },
  categoryLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
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
    fontFamily: fonts.header,
    fontSize: 96,
    lineHeight: 104,
  },
  scoreSlash: {
    fontFamily: fonts.header,
    fontSize: 36,
    color: colors.textMuted,
    marginBottom: 8,
  },
  scoreLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 14,
    marginLeft: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2.5,
    marginBottom: spacing.sm,
  },
  questionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
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
    fontSize: 15,
    lineHeight: 22,
    width: 20,
  },
  bulletText: {
    fontFamily: fonts.body,
    fontSize: 14,
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
  },
  strongerText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  transcriptText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Deep-dive CTA card
  deepDiveCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    backgroundColor: colors.accentDim,
  },
  deepDiveCardInner: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  deepDiveTitle: {
    fontFamily: fonts.bodyBold,
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
    backgroundColor: colors.accent,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  goAgainText: {
    fontFamily: fonts.header,
    fontSize: 22,
    color: colors.text,
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
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
});
