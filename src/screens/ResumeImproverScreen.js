import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { improveResume } from '../utils/api';
import { track, EVENTS } from '../utils/analytics';
import ProcessingOverlay from '../components/ProcessingOverlay';

export default function ResumeImproverScreen({ route, navigation }) {
  const { resumeText, role } = route.params;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadImprovements();
  }, []);

  async function loadImprovements() {
    try {
      setError(null);
      setLoading(true);
      const res = await improveResume(resumeText, role);
      setResult(res);
      track(EVENTS.RESUME_IMPROVED, { has_role: Boolean(role) });
    } catch (err) {
      console.error('Resume improver error:', err);
      setError('Could not generate improvements. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadImprovements} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : result ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.eyebrow}>RESUME IMPROVER</Text>
          </View>

          <Text style={styles.title}>Make it{'\n'}recruiter-ready</Text>

          {/* Overall */}
          {result.overall?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>POSITIONING</Text>
              <View style={styles.sectionCard}>
                {result.overall.map((point, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={[styles.bulletDot, { color: colors.accent }]}>→</Text>
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Improved bullets */}
          {result.improved_bullets?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>STRONGER BULLETS</Text>
              {result.improved_bullets.map((b, i) => (
                <View key={i} style={styles.bulletCard}>
                  <Text style={styles.beforeLabel}>BEFORE</Text>
                  <Text style={styles.beforeText}>{b.original}</Text>
                  <View style={styles.bulletDivider} />
                  <Text style={styles.afterLabel}>AFTER</Text>
                  <Text style={styles.afterText}>{b.improved}</Text>
                  {b.why ? <Text style={styles.whyText}>{b.why}</Text> : null}
                </View>
              ))}
            </View>
          )}

          {/* Gaps */}
          {result.gaps?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>WORTH ADDING</Text>
              <View style={styles.sectionCard}>
                {result.gaps.map((g, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={[styles.bulletDot, { color: colors.success }]}>+</Text>
                    <Text style={styles.bulletText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.doneButtonText}>DONE</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}

      <ProcessingOverlay visible={loading} message="Sharpening your resume..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 60, paddingHorizontal: spacing.lg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorTitle: { fontFamily: fonts.displayMedium, fontSize: 20, color: colors.text, marginBottom: spacing.sm },
  errorText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  retryButton: { backgroundColor: colors.accent, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, borderRadius: radius.md, marginBottom: spacing.md },
  retryButtonText: { fontFamily: fonts.displayMedium, fontSize: 15, color: '#F2F1EE', letterSpacing: 1 },
  backLink: { paddingVertical: spacing.sm },
  backLinkText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  eyebrow: { fontFamily: fonts.body, fontSize: 10, color: colors.accent, letterSpacing: 2 },
  title: { fontFamily: fonts.display, fontSize: 36, color: colors.text, letterSpacing: -1, lineHeight: 38, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted, letterSpacing: 3, marginBottom: spacing.md },
  sectionCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  bulletRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  bulletDot: { fontSize: 14, width: 18, lineHeight: 21 },
  bulletText: { fontFamily: fonts.body, fontSize: 13, color: colors.text, flex: 1, lineHeight: 21 },
  bulletCard: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  beforeLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.textMuted, letterSpacing: 2, marginBottom: 4 },
  beforeText: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 19, fontStyle: 'italic' },
  bulletDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  afterLabel: { fontFamily: fonts.body, fontSize: 9, color: colors.success, letterSpacing: 2, marginBottom: 4 },
  afterText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text, lineHeight: 19 },
  whyText: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, lineHeight: 17, marginTop: spacing.sm },
  doneButton: { backgroundColor: colors.text, borderRadius: radius.md, paddingVertical: spacing.md + 2, alignItems: 'center', marginTop: spacing.sm },
  doneButtonText: { fontFamily: fonts.display, fontSize: 15, color: '#F2F1EE', letterSpacing: 2 },
});
