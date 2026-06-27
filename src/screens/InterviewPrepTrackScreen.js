import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { INDUSTRY_TRACKS } from '../data/interviewPrep';

export default function InterviewPrepTrackScreen({ route, navigation }) {
  const { industry, industryName } = route.params;
  const tracks = INDUSTRY_TRACKS[industry] || [];

  function handlePress(track) {
    if (track.status !== 'active') return;
    navigation.navigate('QuestionBank', {
      industry,
      industryName,
      track: track.key,
      trackName: track.name,
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.eyebrow}>{industryName.toUpperCase()}</Text>
        </View>

        <Text style={styles.title}>Choose a{'\n'}track</Text>
        <Text style={styles.subtitle}>Drill one area at a time, easiest questions first.</Text>

        {tracks.map((track) => {
          const active = track.status === 'active';
          return (
            <TouchableOpacity
              key={track.key}
              style={[styles.card, !active && styles.cardSoon]}
              onPress={() => handlePress(track)}
              activeOpacity={active ? 0.8 : 1}
              disabled={!active}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardTitle, !active && styles.cardTitleSoon]}>{track.name}</Text>
                  {!active && (
                    <View style={styles.soonBadge}>
                      <Text style={styles.soonBadgeText}>SOON</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardBlurb}>{track.blurb}</Text>
              </View>
              {active && <Text style={styles.cardArrow}>›</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 60, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  eyebrow: { fontFamily: fonts.body, fontSize: 10, color: colors.accent, letterSpacing: 2 },
  title: { fontFamily: fonts.display, fontSize: 40, color: colors.text, letterSpacing: -1, lineHeight: 42, marginBottom: spacing.sm },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.xl },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.sm },
  cardSoon: { backgroundColor: colors.surfaceElevated, opacity: 0.7 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 2 },
  cardTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.text },
  cardTitleSoon: { color: colors.textSecondary },
  cardBlurb: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  soonBadge: { backgroundColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 1 },
  soonBadgeText: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.textSecondary, letterSpacing: 1 },
  cardArrow: { fontSize: 22, color: colors.textMuted, marginLeft: 8 },
});
