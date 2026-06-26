import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { getPrepKit } from '../utils/storage';
import ProcessingOverlay from '../components/ProcessingOverlay';

const MIX_OPTIONS = [
  { key: 'Behavioral', label: 'Behavioral', hint: 'STAR-method competency questions' },
  { key: 'Company', label: 'Company-specific', hint: 'Motivation & fit for this firm' },
  { key: 'Technical', label: 'Technical', hint: 'Role-relevant knowledge' },
];

const COUNT_OPTIONS = [3, 5, 7];

export default function HireVueSetupScreen({ navigation }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [mix, setMix] = useState(['Behavioral', 'Company', 'Technical']);
  const [count, setCount] = useState(5);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);

  const canStart = company.trim().length >= 2 && mix.length > 0;

  function toggleMix(key) {
    setMix((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  }

  async function handleBegin() {
    if (!canStart) return;
    setLoading(true);
    const trimmedCompany = company.trim();
    const trimmedRole = role.trim();
    // Pull a saved prep kit for this company/role if one exists, so company &
    // technical questions can be made specific to the firm.
    const prepKit = await getPrepKit(trimmedCompany, trimmedRole);
    setLoading(false);
    navigation.replace('HireVueSimulation', {
      company: trimmedCompany,
      role: trimmedRole || null,
      mix,
      count,
      prepKit,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.eyebrow}>PREMIUM FEATURE</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>HireVue{'\n'}Simulation</Text>
        <Text style={styles.subtitle}>
          A one-way recorded interview, just like the real thing — read each question, get a short
          prep window, then record your answer against the clock. AI feedback after.
        </Text>

        {/* Company */}
        <Text style={styles.fieldLabel}>COMPANY</Text>
        <View style={[styles.inputContainer, focusedField === 'company' && styles.inputContainerFocused]}>
          <TextInput
            style={styles.input}
            value={company}
            onChangeText={setCompany}
            onFocus={() => setFocusedField('company')}
            onBlur={() => setFocusedField(null)}
            placeholder="e.g. JPMorgan, Goldman Sachs, Google..."
            placeholderTextColor={colors.textMuted}
            returnKeyType="next"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Role */}
        <Text style={styles.fieldLabel}>ROLE (OPTIONAL)</Text>
        <View style={[styles.inputContainer, focusedField === 'role' && styles.inputContainerFocused]}>
          <TextInput
            style={styles.input}
            value={role}
            onChangeText={setRole}
            onFocus={() => setFocusedField('role')}
            onBlur={() => setFocusedField(null)}
            placeholder="e.g. Investment Banking Analyst, SWE Intern..."
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        {/* Mix */}
        <Text style={styles.fieldLabel}>WHAT TO INCLUDE</Text>
        <View style={styles.mixGroup}>
          {MIX_OPTIONS.map((opt) => {
            const active = mix.includes(opt.key);
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.mixRow, active && styles.mixRowActive]}
                onPress={() => toggleMix(opt.key)}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.mixLabel, active && styles.mixLabelActive]}>{opt.label}</Text>
                  <Text style={styles.mixHint}>{opt.hint}</Text>
                </View>
                <View style={[styles.checkbox, active && styles.checkboxActive]}>
                  {active && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Count */}
        <Text style={styles.fieldLabel}>NUMBER OF QUESTIONS</Text>
        <View style={styles.countRow}>
          {COUNT_OPTIONS.map((n) => {
            const active = count === n;
            return (
              <TouchableOpacity
                key={n}
                style={[styles.countChip, active && styles.countChipActive]}
                onPress={() => setCount(n)}
                activeOpacity={0.7}
              >
                <Text style={[styles.countChipText, active && styles.countChipTextActive]}>{n}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tips */}
        <View style={styles.tipsBlock}>
          <Text style={styles.tipsHeader}>BEFORE YOU BEGIN</Text>
          <Text style={styles.tipItem}>· Find a quiet space with good microphone access</Text>
          <Text style={styles.tipItem}>· You'll get 30s to prep, then recording starts automatically</Text>
          <Text style={styles.tipItem}>· One retake per question — treat it like the real thing</Text>
        </View>
      </ScrollView>

      {/* Begin button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.beginButton, !canStart && styles.beginButtonDisabled]}
          onPress={handleBegin}
          activeOpacity={canStart ? 0.85 : 1}
          disabled={!canStart}
        >
          <Text style={[styles.beginButtonText, !canStart && styles.beginButtonTextDisabled]}>
            BEGIN SIMULATION
          </Text>
        </TouchableOpacity>
      </View>

      <ProcessingOverlay visible={loading} message="Preparing your interview..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 40, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  eyebrow: { fontFamily: fonts.body, fontSize: 10, color: colors.accent, letterSpacing: 2 },
  title: { fontFamily: fonts.display, fontSize: 40, color: colors.text, letterSpacing: -1, lineHeight: 42, marginBottom: spacing.sm },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.xl },
  fieldLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 2.5, marginBottom: spacing.sm },
  inputContainer: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  inputContainerFocused: { borderColor: colors.accent },
  input: { fontFamily: fonts.body, fontSize: 14, color: colors.text, paddingVertical: spacing.md, minHeight: 50 },
  mixGroup: { gap: spacing.sm, marginBottom: spacing.lg },
  mixRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  mixRowActive: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  mixLabel: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.text, marginBottom: 2 },
  mixLabelActive: { color: colors.accent },
  mixHint: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted },
  checkbox: { width: 24, height: 24, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#F2F1EE', fontSize: 14, fontFamily: fonts.bodyBold },
  countRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  countChip: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  countChipActive: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  countChipText: { fontFamily: fonts.display, fontSize: 20, color: colors.textSecondary },
  countChipTextActive: { color: colors.accent },
  tipsBlock: { marginBottom: spacing.lg },
  tipsHeader: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.sm },
  tipItem: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 26 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg, paddingTop: spacing.sm },
  beginButton: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md + 2, alignItems: 'center' },
  beginButtonDisabled: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  beginButtonText: { fontFamily: fonts.display, fontSize: 16, color: '#F2F1EE', letterSpacing: 2 },
  beginButtonTextDisabled: { color: colors.textMuted },
});
