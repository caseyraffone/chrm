import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { FINANCE_INDUSTRIES } from '../data/interviewPrep';

export default function InterviewPrepIndustryScreen({ navigation }) {
  function handlePress(industry) {
    if (industry.status !== 'active') return;
    navigation.navigate('InterviewPrepTrack', { industry: industry.key, industryName: industry.name });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.eyebrow}>INTERVIEW PREP</Text>
        </View>

        <Text style={styles.title}>Pick your{'\n'}vertical</Text>
        <Text style={styles.subtitle}>
          Curated, industry-standard question banks — the ones everyone drills.
        </Text>

        {FINANCE_INDUSTRIES.map((ind) => {
          const active = ind.status === 'active';
          return (
            <TouchableOpacity
              key={ind.key}
              style={[styles.card, !active && styles.cardSoon]}
              onPress={() => handlePress(ind)}
              activeOpacity={active ? 0.8 : 1}
              disabled={!active}
            >
              <View style={{ flex: 1 }}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardTitle, !active && styles.cardTitleSoon]}>{ind.name}</Text>
                  {!active && (
                    <View style={styles.soonBadge}>
                      <Text style={styles.soonBadgeText}>SOON</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardBlurb}>{ind.blurb}</Text>
              </View>
              {active && <Text style={styles.cardArrow}>›</Text>}
            </TouchableOpacity>
          );
        })}

        {/* Legacy free-text generator for anything not yet curated */}
        <TouchableOpacity
          style={styles.otherCard}
          onPress={() => navigation.navigate('RoleSelection', { category: 'Interview Prep' })}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.otherTitle}>Other role</Text>
            <Text style={styles.otherBlurb}>Enter any role — AI generates a custom question set</Text>
          </View>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>
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
  otherCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.text, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.md },
  otherTitle: { fontFamily: fonts.display, fontSize: 15, color: '#F2F1EE', marginBottom: 2 },
  otherBlurb: { fontFamily: fonts.body, fontSize: 11, color: 'rgba(242,241,238,0.6)' },
});
