import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { getPrepKitProgress, getSubscriptionStatus } from '../utils/storage';

const Q_TABS = [
  { key: 'technical', label: 'Technical' },
  { key: 'behavioral', label: 'Behavioral' },
  { key: 'fit_and_motivation', label: 'Fit' },
  { key: 'market_awareness', label: 'Market' },
];

const DAYS = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'];

export default function PrepKitHubScreen({ route, navigation }) {
  const { company, role, kit } = route.params;
  const [progress, setProgress] = useState({});
  const [activeTab, setActiveTab] = useState('technical');

  useFocusEffect(
    useCallback(() => {
      getPrepKitProgress(company, role).then(setProgress);
    }, [company, role])
  );

  // ── Stats ─────────────────────────────────────────────────────────────────

  const allQuestions = [
    ...(kit.likely_questions.technical || []),
    ...(kit.likely_questions.behavioral || []),
    ...(kit.likely_questions.fit_and_motivation || []),
    ...(kit.likely_questions.market_awareness || []),
  ];

  const totalQ = allQuestions.length;
  const attemptedQs = allQuestions.filter((q) => progress[q.question]);
  const attemptedCount = attemptedQs.length;
  const avgScore =
    attemptedCount > 0
      ? attemptedQs.reduce((s, q) => s + (progress[q.question]?.score || 0), 0) / attemptedCount
      : null;
  const completionPct = totalQ > 0 ? attemptedCount / totalQ : 0;

  // ── Day status ────────────────────────────────────────────────────────────

  const dayStatus = DAYS.map((dayKey, i) => {
    const day = kit.training_plan[dayKey];
    if (!day) return null;
    const complete = day.drill_questions.every((q) => !!progress[q]);
    return { dayKey, dayNum: i + 1, day, complete };
  }).filter(Boolean);

  const currentDayIndex = dayStatus.findIndex((d) => !d.complete);
  const allDaysComplete = currentDayIndex === -1;
  const currentDay = allDaysComplete ? null : dayStatus[currentDayIndex];

  // ── Navigation helpers ────────────────────────────────────────────────────

  const drillRole = [company, role].filter(Boolean).join(' — ');
  const hubReturn = { company, role };

  function drillQuestion(question) {
    navigation.navigate('Practice', {
      category: 'Interview Prep',
      role: drillRole,
      questions: [question],
      company,
      hubReturn,
    });
  }

  async function handleMockInterviewPress() {
    const status = await getSubscriptionStatus();
    if (status === 'free') {
      navigation.navigate('Paywall', { message: 'Mock Interviews are a Pro feature.' });
      return;
    }
    navigation.navigate('MockInterviewSetup', { company, role, kit });
  }

  function drillDay(day) {
    navigation.navigate('Practice', {
      category: 'Interview Prep',
      role: drillRole,
      questions: day.drill_questions,
      company,
      hubReturn,
    });
  }

  const tabQuestions = kit.likely_questions[activeTab] || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* ── Progress Overview ── */}
        <View style={styles.progressSection}>
          <Text style={styles.companyName}>{company}</Text>
          {role ? <Text style={styles.roleText}>{role}</Text> : null}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{attemptedCount}/{totalQ}</Text>
              <Text style={styles.statLabel}>PRACTICED</Text>
            </View>
            {avgScore !== null && (
              <View style={styles.stat}>
                <Text style={styles.statValue}>{avgScore.toFixed(1)}</Text>
                <Text style={styles.statLabel}>AVG SCORE</Text>
              </View>
            )}
            <View style={styles.stat}>
              <Text style={styles.statValue}>{Math.round(completionPct * 100)}%</Text>
              <Text style={styles.statLabel}>COMPLETE</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(Math.round(completionPct * 100), 100)}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Training Plan ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5-DAY PLAN</Text>

          {allDaysComplete ? (
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleMockInterviewPress}
              activeOpacity={0.85}
            >
              <View style={styles.continueBtnText}>
                <Text style={styles.continueBtnLabel}>TRAINING COMPLETE</Text>
                <Text style={styles.continueBtnTitle}>Start a mock interview?</Text>
              </View>
              <Text style={styles.continueBtnArrow}>›</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => drillDay(currentDay.day)}
              activeOpacity={0.85}
            >
              <View style={styles.continueBtnText}>
                <Text style={styles.continueBtnLabel}>NEXT UP</Text>
                <Text style={styles.continueBtnTitle}>CONTINUE DAY {currentDay.dayNum}</Text>
                <Text style={styles.continueBtnFocus}>{currentDay.day.focus}</Text>
              </View>
              <Text style={styles.continueBtnArrow}>›</Text>
            </TouchableOpacity>
          )}

          <View style={styles.dayList}>
            {dayStatus.map(({ dayNum, day, complete }) => (
              <TouchableOpacity
                key={dayNum}
                style={[styles.dayRow, complete && styles.dayRowComplete]}
                onPress={() => drillDay(day)}
                activeOpacity={0.7}
              >
                <View style={[styles.dayBadge, complete && styles.dayBadgeComplete]}>
                  <Text style={[styles.dayBadgeText, complete && styles.dayBadgeTextComplete]}>
                    {complete ? '✓' : dayNum}
                  </Text>
                </View>
                <View style={styles.dayInfo}>
                  <Text
                    style={[styles.dayFocus, complete && styles.dayFocusComplete]}
                    numberOfLines={1}
                  >
                    {day.focus}
                  </Text>
                  <Text style={styles.dayMeta}>
                    {day.drill_questions.length} questions{complete ? ' · done' : ''}
                  </Text>
                </View>
                <Text style={[styles.dayArrow, complete && styles.dayArrowComplete]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Question Bank ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ALL QUESTIONS</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabBar}
          >
            {Q_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {tabQuestions.map((item, i) => {
            const attempt = progress[item.question];
            return (
              <TouchableOpacity
                key={i}
                style={styles.qRow}
                onPress={() => drillQuestion(item.question)}
                activeOpacity={0.7}
              >
                <Text style={styles.qText}>{item.question}</Text>
                {attempt ? (
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>{attempt.score}/10</Text>
                  </View>
                ) : (
                  <Text style={styles.notAttempted}>Not attempted</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Footer ── */}
        <TouchableOpacity
          style={styles.intelLink}
          onPress={() => navigation.navigate('PrepKit', { company, role, kit })}
          activeOpacity={0.7}
        >
          <Text style={styles.intelLinkText}>View Company Intelligence →</Text>
        </TouchableOpacity>

        {/* ── Mock Interview CTA ── */}
        <View style={styles.mockSection}>
          <TouchableOpacity
            style={styles.mockCard}
            onPress={handleMockInterviewPress}
            activeOpacity={0.85}
          >
            <View style={styles.mockTopRow}>
              <View style={styles.mockBadge}>
                <Text style={styles.mockBadgeText}>BETA</Text>
              </View>
            </View>
            <Text style={styles.mockTitle}>START MOCK INTERVIEW</Text>
            <Text style={styles.mockSubtitle}>
              Live AI interview simulation — in beta, still improving.
            </Text>
            <Text style={styles.mockCta}>Begin simulation →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 80,
  },

  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  backBtn: { paddingVertical: spacing.xs },
  backText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
  },

  // Progress
  progressSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  companyName: {
    fontFamily: fonts.header,
    fontSize: 52,
    color: colors.text,
    lineHeight: 52,
    letterSpacing: 1,
  },
  roleText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.accent,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  stat: {},
  statValue: {
    fontFamily: fonts.header,
    fontSize: 36,
    color: colors.text,
    lineHeight: 36,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xl,
  },

  section: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2.5,
    marginBottom: spacing.md,
  },

  // Continue Day button
  continueBtn: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueBtnText: {
    flex: 1,
  },
  continueBtnLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  continueBtnTitle: {
    fontFamily: fonts.header,
    fontSize: 28,
    color: colors.text,
    letterSpacing: 1.5,
    lineHeight: 30,
  },
  continueBtnFocus: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  continueBtnArrow: {
    fontFamily: fonts.header,
    fontSize: 40,
    color: colors.accent,
    lineHeight: 44,
    marginLeft: spacing.md,
  },

  // Day rows
  dayList: {
    gap: spacing.xs + 2,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    gap: spacing.md,
  },
  dayRowComplete: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  dayBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeComplete: {
    backgroundColor: colors.border,
  },
  dayBadgeText: {
    fontFamily: fonts.header,
    fontSize: 18,
    color: colors.text,
    lineHeight: 20,
  },
  dayBadgeTextComplete: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 18,
  },
  dayInfo: { flex: 1 },
  dayFocus: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  dayFocusComplete: {
    color: colors.textMuted,
  },
  dayMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  dayArrow: {
    fontFamily: fonts.body,
    fontSize: 20,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  dayArrowComplete: {
    color: colors.textMuted,
  },

  // Tab bar
  tabBar: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  tab: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: colors.accent,
  },

  // Question rows
  qRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  qText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    flex: 1,
    lineHeight: 21,
  },
  scoreBadge: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  scoreBadgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.accent,
  },
  notAttempted: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    flexShrink: 0,
  },

  // Mock Interview CTA
  mockSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  mockCard: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  mockTopRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  mockBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  mockBadgeText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.text,
    letterSpacing: 1.5,
  },
  mockTitle: {
    fontFamily: fonts.header,
    fontSize: 32,
    color: colors.text,
    letterSpacing: 1.5,
    lineHeight: 34,
    marginBottom: spacing.xs,
  },
  mockSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  mockCta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.accent,
  },

  // Footer
  intelLink: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  intelLinkText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
});
