import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { generatePrepKit } from '../utils/api';
import { savePrepKit, clearPrepKit } from '../utils/storage';
import ProcessingOverlay from '../components/ProcessingOverlay';

// Category accent colors for question cards
const Q_COLORS = {
  technical: '#3B82F6',
  behavioral: '#14B8A6',
  fit_and_motivation: '#22C55E',
  market_awareness: '#A855F7',
};

const Q_TABS = [
  { key: 'technical', label: 'Technical' },
  { key: 'behavioral', label: 'Behavioral' },
  { key: 'fit_and_motivation', label: 'Fit' },
  { key: 'market_awareness', label: 'Market' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <View style={sectionStyles.wrapper}>
      <TouchableOpacity
        style={sectionStyles.header}
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.7}
      >
        <Text style={sectionStyles.title}>{title}</Text>
        <Text style={sectionStyles.chevron}>{expanded ? '↑' : '↓'}</Text>
      </TouchableOpacity>
      {expanded && <View style={sectionStyles.body}>{children}</View>}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  wrapper: { marginBottom: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { fontFamily: fonts.displayMedium, fontSize: 13, color: colors.accent, letterSpacing: 1.5 },
  chevron: { fontFamily: fonts.body, fontSize: 16, color: colors.textMuted },
  body: {},
});

function BulletList({ items, color = colors.textSecondary }) {
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={bulletStyles.row}>
          <Text style={[bulletStyles.dot, { color }]}>•</Text>
          <Text style={bulletStyles.text}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const bulletStyles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: spacing.xs + 2, gap: spacing.sm },
  dot: { fontSize: 14, lineHeight: 22, width: 14 },
  text: { fontFamily: fonts.body, fontSize: 13, color: colors.text, flex: 1, lineHeight: 22 },
});

function CultureChip({ label }) {
  return (
    <View style={chipStyles.chip}>
      <Text style={chipStyles.text}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: { backgroundColor: colors.surface, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 5, borderWidth: 1, borderColor: colors.border },
  text: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});

function QuestionCard({ item, accentColor, onPress }) {
  return (
    <TouchableOpacity
      style={[questionCardStyles.card, { borderLeftColor: accentColor }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={questionCardStyles.question}>{item.question}</Text>
      <Text style={questionCardStyles.whyLabel}>WHY THEY ASK</Text>
      <Text style={questionCardStyles.why}>{item.why_they_ask}</Text>
      <Text style={questionCardStyles.hitsLabel}>STRONG ANSWER HITS</Text>
      <Text style={[questionCardStyles.hits, { color: accentColor }]}>{item.strong_answer_hits}</Text>
      <Text style={questionCardStyles.drillCta}>Tap to drill this question →</Text>
    </TouchableOpacity>
  );
}

const questionCardStyles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderWidth: 1, borderColor: colors.border },
  question: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: spacing.sm },
  whyLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted, letterSpacing: 2, marginBottom: 3 },
  why: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: spacing.sm },
  hitsLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted, letterSpacing: 2, marginBottom: 3 },
  hits: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 19, marginBottom: spacing.sm },
  drillCta: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 },
});

function DayCard({ dayKey, dayNum, day, onStart }) {
  return (
    <View style={dayCardStyles.card}>
      <View style={dayCardStyles.header}>
        <View style={dayCardStyles.dayBadge}>
          <Text style={dayCardStyles.dayNumber}>{dayNum}</Text>
        </View>
        <Text style={dayCardStyles.focus} numberOfLines={2}>{day.focus}</Text>
      </View>
      <View style={dayCardStyles.questions}>
        {day.drill_questions.map((q, i) => (
          <View key={i} style={dayCardStyles.qRow}>
            <Text style={dayCardStyles.qDot}>·</Text>
            <Text style={dayCardStyles.qText}>{q}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={dayCardStyles.startButton} onPress={onStart} activeOpacity={0.8}>
        <Text style={dayCardStyles.startText}>START DAY {dayNum}</Text>
      </TouchableOpacity>
    </View>
  );
}

const dayCardStyles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  dayBadge: { backgroundColor: colors.accent, borderRadius: radius.sm, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  dayNumber: { fontFamily: fonts.display, fontSize: 18, color: '#F2F1EE', lineHeight: 22 },
  focus: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text, flex: 1, lineHeight: 20, paddingTop: 2 },
  questions: { marginBottom: spacing.md },
  qRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  qDot: { fontFamily: fonts.body, fontSize: 18, color: colors.textMuted, lineHeight: 20, width: 12 },
  qText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  startButton: { backgroundColor: colors.accentDim, borderRadius: radius.sm, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(23,71,212,0.2)' },
  startText: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.accent, letterSpacing: 1.5 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function PrepKitScreen({ route, navigation }) {
  const { company, role, kit: initialKit } = route.params;
  const [kit, setKit] = useState(initialKit);
  const [activeTab, setActiveTab] = useState('technical');
  const [regenerating, setRegenerating] = useState(false);

  const roleDisplay = role ? role : null;

  function navigateToDrill(questions) {
    const drillRole = [company, role].filter(Boolean).join(' — ');
    navigation.navigate('Practice', {
      category: 'Interview Prep',
      role: drillRole,
      questions,
      company,
      hubReturn: { company, role },
    });
  }

  function handleQuestionPress(item) {
    navigateToDrill([item.question]);
  }

  function handleStartDay(day) {
    navigateToDrill(day.drill_questions);
  }

  async function handleRegenerate() {
    Alert.alert(
      'Regenerate Prep Kit?',
      'This will fetch fresh intelligence from Claude. The current kit will be replaced.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            setRegenerating(true);
            try {
              await clearPrepKit(company, role);
              const newKit = await generatePrepKit(company, role);
              await savePrepKit(company, role, newKit);
              setKit(newKit);
            } catch (err) {
              Alert.alert('Error', 'Could not regenerate. Check your connection and try again.');
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  }

  const overview = kit.company_overview;
  const questions = kit.likely_questions;
  const trainingPlan = kit.training_plan;
  const days = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5'];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRegenerate} style={styles.regenButton}>
            <Text style={styles.regenText}>↺ Regenerate</Text>
          </TouchableOpacity>
        </View>

        {/* Kit Title */}
        <View style={styles.kitTitle}>
          <Text style={styles.companyName}>{company}</Text>
          {roleDisplay ? <Text style={styles.roleText}>{roleDisplay}</Text> : null}
        </View>

        {/* ── Company Intelligence ── */}
        <Section title="COMPANY INTELLIGENCE">
          <Text style={styles.paragraph}>{overview.what_they_do}</Text>

          <Text style={styles.subLabel}>KEY DIFFERENTIATORS</Text>
          <BulletList items={overview.key_differentiators} color={colors.accent} />

          <Text style={styles.subLabel}>CULTURE SIGNALS</Text>
          <View style={styles.chipsRow}>
            {overview.culture_signals.map((signal, i) => (
              <CultureChip key={i} label={signal} />
            ))}
          </View>

          <Text style={styles.subLabel}>INTERVIEW STYLE</Text>
          <Text style={styles.paragraph}>{overview.interview_style}</Text>
        </Section>

        {/* ── Likely Questions ── */}
        <Section title="LIKELY QUESTIONS">
          {/* Tab Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabBar}
            contentContainerStyle={styles.tabBarContent}
          >
            {Q_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && { borderBottomColor: Q_COLORS[tab.key], borderBottomWidth: 2 },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && { color: Q_COLORS[tab.key] },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Question Cards */}
          <View style={styles.questionList}>
            {(questions[activeTab] || []).map((item, i) => (
              <QuestionCard
                key={i}
                item={item}
                accentColor={Q_COLORS[activeTab]}
                onPress={() => handleQuestionPress(item)}
              />
            ))}
          </View>
        </Section>

        {/* ── Talking Points ── */}
        <Section title="TALKING POINTS">
          {kit.talking_points.map((point, i) => (
            <View key={i} style={styles.numberedRow}>
              <Text style={styles.numberedIndex}>{i + 1}</Text>
              <Text style={styles.numberedText}>{point}</Text>
            </View>
          ))}
        </Section>

        {/* ── Red Flags ── */}
        <Section title="RED FLAGS TO AVOID">
          {kit.red_flags.map((flag, i) => (
            <View key={i} style={styles.redFlagCard}>
              <Text style={styles.redFlagIcon}>⚠</Text>
              <Text style={styles.redFlagText}>{flag}</Text>
            </View>
          ))}
        </Section>

        {/* ── 5-Day Training Plan ── */}
        <Section title="5-DAY TRAINING PLAN">
          {days.map((key, i) => {
            const day = trainingPlan[key];
            if (!day) return null;
            return (
              <DayCard
                key={key}
                dayKey={key}
                dayNum={i + 1}
                day={day}
                onStart={() => handleStartDay(day)}
              />
            );
          })}
        </Section>

        {/* ── Training Hub link ── */}
        <TouchableOpacity
          style={styles.hubLink}
          onPress={() => navigation.navigate('PrepKitHub', { company, role, kit })}
          activeOpacity={0.7}
        >
          <Text style={styles.hubLinkText}>View Training Hub →</Text>
        </TouchableOpacity>

        {/* ── Mock Interview CTA ── */}
        <TouchableOpacity
          style={mockStyles.card}
          onPress={() => navigation.navigate('MockInterviewSetup', { company, role, kit })}
          activeOpacity={0.85}
        >
          <View style={mockStyles.topRow}>
            <View style={mockStyles.badge}>
              <Text style={mockStyles.badgeText}>PREMIUM</Text>
            </View>
          </View>
          <Text style={mockStyles.title}>START MOCK INTERVIEW</Text>
          <Text style={mockStyles.subtitle}>
            Live AI interview simulation based on this prep kit
          </Text>
          <Text style={mockStyles.cta}>Begin simulation →</Text>
        </TouchableOpacity>
      </ScrollView>

      <ProcessingOverlay visible={regenerating} message="Regenerating your prep kit..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 80, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  regenButton: { paddingVertical: spacing.xs },
  regenText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, letterSpacing: 0.3 },
  kitTitle: { marginBottom: spacing.xl },
  companyName: { fontFamily: fonts.display, fontSize: 44, color: colors.text, lineHeight: 44, letterSpacing: -1.5 },
  roleText: { fontFamily: fonts.body, fontSize: 14, color: colors.accent, marginTop: spacing.xs, letterSpacing: 0.3 },
  paragraph: { fontFamily: fonts.body, fontSize: 14, color: colors.text, lineHeight: 22, marginBottom: spacing.md },
  subLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted, letterSpacing: 2.5, marginBottom: spacing.sm, marginTop: spacing.sm },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  tabBar: { marginBottom: spacing.md },
  tabBarContent: { gap: spacing.lg, paddingBottom: spacing.sm },
  tab: { paddingVertical: spacing.xs, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textMuted, letterSpacing: 0.5 },
  questionList: {},
  numberedRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  numberedIndex: { fontFamily: fonts.display, fontSize: 22, color: colors.accent, lineHeight: 24, width: 24 },
  numberedText: { fontFamily: fonts.body, fontSize: 14, color: colors.text, flex: 1, lineHeight: 22 },
  redFlagCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: 'rgba(214,40,40,0.06)', borderRadius: radius.sm, borderLeftWidth: 2, borderLeftColor: colors.error, padding: spacing.md, marginBottom: spacing.sm },
  redFlagIcon: { fontSize: 14, color: colors.error, lineHeight: 22 },
  redFlagText: { fontFamily: fonts.body, fontSize: 13, color: colors.text, flex: 1, lineHeight: 21 },
  hubLink: { alignSelf: 'flex-start', paddingVertical: spacing.sm, marginBottom: spacing.lg },
  hubLinkText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.accent },
});

const mockStyles = StyleSheet.create({
  card: { backgroundColor: colors.accentDim, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: 'rgba(23,71,212,0.2)' },
  topRow: { flexDirection: 'row', marginBottom: spacing.sm },
  badge: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.body, fontSize: 10, color: '#F2F1EE', letterSpacing: 1.5 },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.text, letterSpacing: -0.5, lineHeight: 30, marginBottom: spacing.xs },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, lineHeight: 21, marginBottom: spacing.md },
  cta: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.accent },
});
