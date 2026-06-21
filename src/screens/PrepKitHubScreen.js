import React, { useState, useEffect, useCallback } from 'react';
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
import { getPrepKitProgress, getSubscriptionStatus, getPrepKitVisited, markPrepKitVisited } from '../utils/storage';

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

  // First-visit redirect: show Company Intelligence before Training Hub
  useEffect(() => {
    async function checkFirstVisit() {
      const visited = await getPrepKitVisited(company, role);
      if (!visited) {
        await markPrepKitVisited(company, role);
        navigation.replace('PrepKit', { company, role, kit });
      }
    }
    checkFirstVisit();
  }, []);

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
  content: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 80 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  headerRight: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  intelButton: { paddingVertical: spacing.xs },
  intelText: { fontFamily: fonts.body, fontSize: 13, color: colors.accent },
  mockButton: { paddingVertical: spacing.xs },
  mockText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  kitHeader: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  companyName: { fontFamily: fonts.display, fontSize: 32, color: colors.text, letterSpacing: -1, lineHeight: 34, marginBottom: 4 },
  roleText: { fontFamily: fonts.body, fontSize: 13, color: colors.accent },
  statsRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statNumber: { fontFamily: fonts.display, fontSize: 22, color: colors.text, lineHeight: 24 },
  statLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 1, marginTop: 2, textAlign: 'center' },
  progressBarTrack: { height: 4, backgroundColor: colors.border, marginHorizontal: spacing.lg, borderRadius: 2, marginBottom: spacing.lg, overflow: 'hidden' },
  progressBarFill: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },
  todayCard: { marginHorizontal: spacing.lg, backgroundColor: colors.text, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg },
  todayLabel: { fontFamily: fonts.body, fontSize: 10, color: '#444', letterSpacing: 2, marginBottom: 6 },
  todayFocus: { fontFamily: fonts.displayMedium, fontSize: 15, color: '#F2F1EE', marginBottom: 4 },
  todayRemaining: { fontFamily: fonts.body, fontSize: 12, color: '#555', marginBottom: spacing.md },
  startDayBtn: { backgroundColor: 'rgba(23,71,212,0.2)', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  startDayText: { fontFamily: fonts.displayMedium, fontSize: 14, color: '#6AABFF', letterSpacing: 1 },
  allDoneCard: { marginHorizontal: spacing.lg, backgroundColor: colors.accentDim, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(23,71,212,0.2)' },
  allDoneText: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.text, marginBottom: 4 },
  allDoneSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  tabBar: { flexDirection: 'row', paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.md },
  tab: { paddingVertical: spacing.sm, marginRight: spacing.lg, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted },
  tabTextActive: { color: colors.accent, fontFamily: fonts.bodyMedium },
  questionList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  questionRow: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  questionText: { fontFamily: fonts.body, fontSize: 13, color: colors.text, flex: 1, lineHeight: 20 },
  questionScore: { fontFamily: fonts.display, fontSize: 18, marginLeft: spacing.md },
  questionScoreEmpty: { fontFamily: fonts.body, fontSize: 16, color: colors.textMuted, marginLeft: spacing.md },
});
