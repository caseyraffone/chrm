import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SectionList,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import {
  getSubscriptionStatus,
  getDailyDrillCount,
  FREE_DAILY_LIMIT,
} from '../utils/storage';
import {
  IB_TECHNICAL_BANK,
  IB_TECHNICAL_TOPICS,
  DIFFICULTY_LABELS,
} from '../data/ibTechnicalBank';
import { IB_BEHAVIORAL_BANK, IB_BEHAVIORAL_TOPICS } from '../data/ibBehavioralBank';
import { IB_FIT_BANK, IB_FIT_TOPICS } from '../data/ibFitBank';
import { IB_MARKETS_BANK, IB_MARKETS_TOPICS } from '../data/ibMarketsBank';
import {
  PE_LBO_BANK,
  PE_LBO_TOPICS,
  PE_DEAL_BANK,
  PE_DEAL_TOPICS,
  PE_TECHNICAL_BANK,
  PE_TECHNICAL_TOPICS,
  PE_FIT_BANK,
  PE_FIT_TOPICS,
} from '../data/peBank';

const FILTERS = [
  { key: 0, label: 'All' },
  { key: 1, label: 'Foundational' },
  { key: 2, label: 'Intermediate' },
  { key: 3, label: 'Advanced' },
];

// How each track is graded. Behavioral runs through the STAR path (getFeedback);
// the rest grade against their reference answer via getTechnicalFeedback. The
// value is the `category` passed through to Practice/Feedback.
const TRACK_CATEGORY = {
  Technical: 'Technical',
  Behavioral: 'Behavioral',
  Fit: 'Fit & Motivation',
  Markets: 'Markets',
  LBO: 'LBO',
  Deal: 'Deal Sense',
};

// Difficulty 1 (Foundational) is free; 2 and 3 are Pro.
function isLocked(difficulty, isPro) {
  return difficulty > 1 && !isPro;
}

function getBank(industry, track) {
  if (industry === 'IB') {
    switch (track) {
      case 'Technical':
        return { items: IB_TECHNICAL_BANK, topics: IB_TECHNICAL_TOPICS };
      case 'Behavioral':
        return { items: IB_BEHAVIORAL_BANK, topics: IB_BEHAVIORAL_TOPICS };
      case 'Fit':
        return { items: IB_FIT_BANK, topics: IB_FIT_TOPICS };
      case 'Markets':
        return { items: IB_MARKETS_BANK, topics: IB_MARKETS_TOPICS };
      default:
        return { items: [], topics: [] };
    }
  }
  if (industry === 'PE') {
    switch (track) {
      case 'LBO':
        return { items: PE_LBO_BANK, topics: PE_LBO_TOPICS };
      case 'Deal':
        return { items: PE_DEAL_BANK, topics: PE_DEAL_TOPICS };
      case 'Technical':
        return { items: PE_TECHNICAL_BANK, topics: PE_TECHNICAL_TOPICS };
      case 'Fit':
        return { items: PE_FIT_BANK, topics: PE_FIT_TOPICS };
      default:
        return { items: [], topics: [] };
    }
  }
  return { items: [], topics: [] };
}

export default function QuestionBankScreen({ route, navigation }) {
  const { industry, industryName, track, trackName } = route.params;
  const { items, topics } = getBank(industry, track);

  const [isPro, setIsPro] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const status = await getSubscriptionStatus();
        setIsPro(status === 'pro');
      })();
    }, [])
  );

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    return topics
      .map((topic) => {
        const data = items
          .filter((it) => it.topic === topic)
          .filter((it) => filter === 0 || it.difficulty === filter)
          .filter((it) => !q || it.question.toLowerCase().includes(q) || it.topic.toLowerCase().includes(q))
          .sort((a, b) => a.difficulty - b.difficulty); // easiest first
        return { title: topic, data };
      })
      .filter((s) => s.data.length > 0);
  }, [items, topics, search, filter]);

  async function handleSelect(item) {
    if (isLocked(item.difficulty, isPro)) {
      navigation.navigate('Paywall', {
        message: `${DIFFICULTY_LABELS[item.difficulty]} questions are a Pro feature.`,
      });
      return;
    }
    // Foundational (free) still counts against the daily limit.
    if (!isPro) {
      const count = await getDailyDrillCount();
      if (count >= FREE_DAILY_LIMIT) {
        navigation.navigate('Paywall', { message: "You've hit today's free limit." });
        return;
      }
    }
    // Behavioral grades via STAR (no reference); other tracks grade against the
    // bank's reference answer and key points.
    const usesStar = track === 'Behavioral';
    navigation.navigate('Practice', {
      category: TRACK_CATEGORY[track] || 'Technical',
      role: industryName,
      questions: [item.question],
      referenceAnswer: usesStar ? null : item.reference_answer,
      keyPoints: usesStar ? null : item.key_points,
    });
  }

  function renderItem({ item }) {
    const locked = isLocked(item.difficulty, isPro);
    return (
      <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)} activeOpacity={0.7}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowText, locked && styles.rowTextLocked]} numberOfLines={2}>
            {item.question}
          </Text>
          <View style={styles.rowMeta}>
            <View style={[styles.diffPill, styles[`diff${item.difficulty}`]]}>
              <Text style={[styles.diffPillText, styles[`diffText${item.difficulty}`]]}>
                {DIFFICULTY_LABELS[item.difficulty]}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.rowIcon}>{locked ? '🔒' : '›'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>{industryName.toUpperCase()} · {trackName.toUpperCase()}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search questions…"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Difficulty filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!isPro && (
        <Text style={styles.freeNote}>Foundational is free · Intermediate & Advanced unlock with Pro</Text>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>No questions match.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  eyebrow: { fontFamily: fonts.body, fontSize: 10, color: colors.accent, letterSpacing: 1.5 },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text, paddingVertical: spacing.sm + 2 },
  clearSearch: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, paddingHorizontal: spacing.xs },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  filterChipActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  filterChipText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  filterChipTextActive: { color: colors.accent, fontFamily: fonts.bodyMedium },
  freeNote: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionHeader: { fontFamily: fonts.displayMedium, fontSize: 13, color: colors.textMuted, letterSpacing: 1, marginTop: spacing.lg, marginBottom: spacing.sm, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  rowText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: spacing.xs },
  rowTextLocked: { color: colors.textSecondary },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  diffPill: { borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 1 },
  diff1: { backgroundColor: 'rgba(26,128,71,0.1)' },
  diff2: { backgroundColor: 'rgba(23,71,212,0.1)' },
  diff3: { backgroundColor: 'rgba(214,40,40,0.1)' },
  diffPillText: { fontFamily: fonts.bodyBold, fontSize: 9, letterSpacing: 0.5 },
  diffText1: { color: colors.success },
  diffText2: { color: colors.accent },
  diffText3: { color: colors.error },
  rowIcon: { fontSize: 16, color: colors.textMuted, marginLeft: spacing.sm },
  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },
});
