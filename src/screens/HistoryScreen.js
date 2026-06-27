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
import { getDrills } from '../utils/storage';
import ActivityCalendar from '../components/ActivityCalendar';

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(seconds) {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function getScoreColor(score) {
  if (score >= 8) return colors.success;
  if (score >= 5) return colors.text;
  return colors.error;
}

// Small category glyph for faster scanning of the drill list.
const CATEGORY_ICONS = {
  Technical: '📊',
  Behavioral: '💬',
  'Interview Prep': '🎯',
  'Quick Fire': '⚡',
  'Persuade & Present': '🎤',
  'Resume Walkthrough': '📄',
  'Fit & Motivation': '🧭',
  Markets: '📈',
  LBO: '💼',
  'Deal Sense': '💼',
};
function categoryIcon(category) {
  return CATEGORY_ICONS[category] || '🎤';
}

function dayKey(d) {
  return (d || '').slice(0, 10);
}

// Aggregate stats for the History summary header.
function computeStats(drills) {
  const scores = drills.map((d) => d.score).filter((s) => typeof s === 'number');
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const days = [...new Set(drills.map((d) => dayKey(d.date)).filter(Boolean))].sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const k of days) {
    if (prev) {
      const diff = (new Date(k) - new Date(prev)) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = k;
  }

  const weekAgo = Date.now() - 7 * 86400000;
  const thisWeek = drills.filter((d) => new Date(d.date).getTime() >= weekAgo).length;

  return { avg, bestStreak: best, thisWeek };
}

function StatsHeader({ drills }) {
  const { avg, bestStreak, thisWeek } = computeStats(drills);
  return (
    <View style={styles.statsRow}>
      <View style={styles.statTile}>
        <Text style={[styles.statValue, { color: getScoreColor(avg) }]}>{avg.toFixed(1)}</Text>
        <Text style={styles.statLabel}>AVG SCORE</Text>
      </View>
      <View style={styles.statTile}>
        <Text style={styles.statValue}>{bestStreak}</Text>
        <Text style={styles.statLabel}>BEST STREAK</Text>
      </View>
      <View style={styles.statTile}>
        <Text style={styles.statValue}>{thisWeek}</Text>
        <Text style={styles.statLabel}>THIS WEEK</Text>
      </View>
    </View>
  );
}

function DrillItem({ drill }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.drillItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.75}
    >
      {/* Row Summary */}
      <View style={styles.drillSummary}>
        <View style={styles.drillMeta}>
          <View style={styles.drillCategoryRow}>
            <Text style={styles.drillIcon}>{categoryIcon(drill.category)}</Text>
            <Text style={styles.drillCategory}>{drill.category}</Text>
            {drill.company ? (
              <View style={styles.companyTag}>
                <Text style={styles.companyTagText}>{drill.company}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.drillDate}>{formatDate(drill.date)}</Text>
        </View>
        <View style={styles.drillRight}>
          <Text style={[styles.drillScore, { color: getScoreColor(drill.score) }]}>
            {drill.score}
          </Text>
          <Text style={styles.drillScoreLabel}>/10</Text>
          <Text style={styles.expandIcon}>{expanded ? '↑' : '↓'}</Text>
        </View>
      </View>

      {/* Expanded Detail */}
      {expanded && (
        <View style={styles.drillDetail}>
          <View style={styles.divider} />

          <Text style={styles.detailLabel}>QUESTION</Text>
          <Text style={styles.detailQuestion}>{drill.question}</Text>

          {drill.feedback && (
            <>
              <Text style={styles.detailLabel}>WHAT WORKED</Text>
              {drill.feedback.strong.map((point, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={[styles.bulletDot, { color: colors.success }]}>✓</Text>
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}

              <Text style={styles.detailLabel}>IMPROVE</Text>
              {drill.feedback.improve.map((point, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={[styles.bulletDot, { color: colors.accent }]}>→</Text>
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}

              <Text style={styles.detailLabel}>STRONGER VERSION</Text>
              <View style={styles.strongerBox}>
                <Text style={styles.strongerText}>"{drill.feedback.stronger_version}"</Text>
              </View>
            </>
          )}

          {drill.duration && (
            <Text style={styles.durationText}>Duration: {formatDuration(drill.duration)}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function HistoryScreen({ navigation }) {
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        const data = await getDrills();
        setDrills(data);
        setLoading(false);
      })();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.drillCount}>{drills.length} DRILLS</Text>
      </View>

      <Text style={styles.title}>History</Text>

      {loading ? null : drills.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎤</Text>
          <Text style={styles.emptyTitle}>No drills yet</Text>
          <Text style={styles.emptySubtext}>
            Complete your first drill to see your history here.
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>START DRILLING</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <StatsHeader drills={drills} />
          <ActivityCalendar drills={drills} />
          {drills.map((drill) => (
            <DrillItem key={drill.id} drill={drill} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  drillCount: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, letterSpacing: 2 },
  title: { fontFamily: fonts.display, fontSize: 52, color: colors.text, paddingHorizontal: spacing.lg, marginBottom: spacing.lg, lineHeight: 56, letterSpacing: -2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyIcon: { fontSize: 36, marginBottom: spacing.md },
  emptyTitle: { fontFamily: fonts.displayMedium, fontSize: 20, color: colors.text, marginBottom: spacing.sm },
  emptySubtext: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  startButton: { backgroundColor: colors.text, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, borderRadius: radius.md },
  startButtonText: { fontFamily: fonts.display, fontSize: 16, color: '#F2F1EE', letterSpacing: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 60, gap: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  statTile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, alignItems: 'center' },
  statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.text, lineHeight: 28 },
  statLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted, letterSpacing: 1.5, marginTop: 4 },
  drillIcon: { fontSize: 14 },
  drillItem: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  drillSummary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drillMeta: { flex: 1 },
  drillCategoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap', marginBottom: 2 },
  drillCategory: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.text },
  companyTag: { backgroundColor: colors.accentDim, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(23,71,212,0.2)' },
  companyTagText: { fontFamily: fonts.body, fontSize: 10, color: colors.accent, letterSpacing: 0.3 },
  drillDate: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  drillRight: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  drillScore: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38 },
  drillScoreLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginBottom: 5 },
  expandIcon: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginLeft: spacing.sm, marginBottom: 3 },
  drillDetail: { marginTop: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: spacing.md },
  detailLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted, letterSpacing: 2.5, marginBottom: spacing.xs, marginTop: spacing.sm },
  detailQuestion: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.sm },
  bulletRow: { flexDirection: 'row', marginBottom: spacing.xs, gap: spacing.xs },
  bulletDot: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, width: 18 },
  bulletText: { fontFamily: fonts.body, fontSize: 13, color: colors.text, flex: 1, lineHeight: 20 },
  strongerBox: { backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.md, borderLeftWidth: 2, borderLeftColor: colors.accent, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  strongerText: { fontFamily: fonts.body, fontSize: 13, color: colors.text, lineHeight: 20, fontStyle: 'italic' },
  durationText: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
});
