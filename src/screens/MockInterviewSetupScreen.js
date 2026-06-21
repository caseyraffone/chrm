import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';

const DETAIL_ROWS = [
  { label: 'Estimated duration', value: '10–15 minutes' },
  { label: 'Question exchanges', value: '8–10 questions' },
  { label: 'Format', value: 'Spoken answers, real-time AI voice' },
  { label: 'Powered by', value: 'OpenAI Realtime API + your prep kit' },
];

export default function MockInterviewSetupScreen({ route, navigation }) {
  const { company, role, kit } = route.params;

  function handleBegin() {
    navigation.replace('MockInterview', { company, role, kit });
  }

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
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>PREMIUM FEATURE</Text>
          <Text style={styles.title}>MOCK{'\n'}INTERVIEW</Text>
          <Text style={styles.subtitle}>
            {company}
            {role ? ` · ${role}` : ''}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            You'll have a live voice conversation with an AI interviewer trained on your{' '}
            <Text style={styles.descriptionBold}>{company}</Text> prep kit. The AI speaks, you
            speak — no tapping, no buttons. Just like the real thing.
          </Text>
        </View>

        {/* Detail rows */}
        <View style={styles.detailsCard}>
          {DETAIL_ROWS.map((row, i) => (
            <View
              key={i}
              style={[styles.detailRow, i < DETAIL_ROWS.length - 1 && styles.detailRowBorder]}
            >
              <View style={styles.detailTexts}>
                <Text style={styles.detailLabel}>{row.label.toUpperCase()}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsBlock}>
          <Text style={styles.tipsHeader}>BEFORE YOU BEGIN</Text>
          <Text style={styles.tipItem}>· Find a quiet space with good microphone access</Text>
          <Text style={styles.tipItem}>· Speak clearly and at a natural pace</Text>
          <Text style={styles.tipItem}>· Treat it like the real thing — no pausing to think</Text>
        </View>
      </ScrollView>

      {/* Begin Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.beginButton} onPress={handleBegin} activeOpacity={0.85}>
          <Text style={styles.beginButtonText}>BEGIN INTERVIEW</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>The AI will introduce itself and start immediately</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: spacing.lg, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  titleBlock: { marginBottom: spacing.xl },
  eyebrow: { fontFamily: fonts.body, fontSize: 10, color: colors.accent, letterSpacing: 2, marginBottom: 8 },
  title: { fontFamily: fonts.display, fontSize: 52, color: colors.text, lineHeight: 50, letterSpacing: -2, marginBottom: spacing.sm },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, letterSpacing: 0.3 },
  descriptionCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  descriptionText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 22 },
  descriptionBold: { fontFamily: fonts.bodyMedium, color: colors.text },
  detailsCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg, overflow: 'hidden' },
  detailRow: { paddingHorizontal: spacing.lg, paddingVertical: 12 },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  detailTexts: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 1.5 },
  detailValue: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },
  tipsBlock: { marginBottom: spacing.xl },
  tipsHeader: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.sm },
  tipItem: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 28 },
  beginButton: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md + 2, alignItems: 'center', marginTop: spacing.md },
  beginButtonText: { fontFamily: fonts.display, fontSize: 16, color: '#F2F1EE', letterSpacing: 2 },
});
