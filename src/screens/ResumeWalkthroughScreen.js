import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { extractResumeTextFromPdf } from '../utils/api';
import ProcessingOverlay from '../components/ProcessingOverlay';
import {
  getResume,
  saveResume,
  getSubscriptionStatus,
  getDailyDrillCount,
  FREE_DAILY_LIMIT,
} from '../utils/storage';

export const RESUME_PROMPT =
  'Walk me through your resume. Start from the top and tell your story in about 60–90 seconds.';

export default function ResumeWalkthroughScreen({ navigation }) {
  const [resume, setResume] = useState('');
  const [role, setRole] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const saved = await getResume();
        if (saved) setResume(saved);
      })();
    }, [])
  );

  const canProceed = resume.trim().length >= 40;
  const roleParam = role.trim() || null;

  async function handleUploadPdf() {
    // Loaded lazily so the screen still works on dev builds that don't include
    // these native modules — the rest of the app boots fine and only this button
    // degrades gracefully.
    let DocumentPicker;
    let File;
    try {
      DocumentPicker = require('expo-document-picker');
      ({ File } = require('expo-file-system'));
    } catch (e) {
      Alert.alert(
        'PDF upload unavailable',
        'PDF upload needs the latest build of the app. For now, paste your resume text below instead.'
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      setUploading(true);
      const base64 = await new File(result.assets[0].uri).base64();
      const text = await extractResumeTextFromPdf(base64);
      setResume(text);
      await saveResume(text);
    } catch (err) {
      console.error('PDF upload error:', err);
      Alert.alert('Upload failed', 'Could not read that PDF. Try again, or paste your resume text instead.');
    } finally {
      setUploading(false);
    }
  }

  async function isDailyLimitReached() {
    const status = await getSubscriptionStatus();
    if (status === 'free') {
      const count = await getDailyDrillCount();
      return count >= FREE_DAILY_LIMIT;
    }
    return false;
  }

  async function handlePractice() {
    if (!canProceed) return;
    await saveResume(resume.trim());
    if (await isDailyLimitReached()) {
      navigation.navigate('Paywall', { message: "You've hit today's free limit." });
      return;
    }
    navigation.navigate('Practice', {
      category: 'Resume Walkthrough',
      role: roleParam,
      questions: [RESUME_PROMPT],
    });
  }

  async function handleImprove() {
    if (!canProceed) return;
    await saveResume(resume.trim());
    const status = await getSubscriptionStatus();
    if (status === 'free') {
      navigation.navigate('Paywall', { message: 'Resume Improver is a Pro feature.' });
      return;
    }
    navigation.navigate('ResumeImprover', { resumeText: resume.trim(), role: roleParam });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Resume{'\n'}Walkthrough</Text>
        <Text style={styles.subtitle}>
          The opener in almost every interview is "walk me through your resume." Paste yours, then
          practice telling your story out loud — you'll get AI feedback on flow, the "why," and
          tightness.
        </Text>

        {/* Target role */}
        <Text style={styles.fieldLabel}>TARGET ROLE (OPTIONAL)</Text>
        <View style={[styles.inputContainer, focusedField === 'role' && styles.inputContainerFocused]}>
          <TextInput
            style={styles.input}
            value={role}
            onChangeText={setRole}
            onFocus={() => setFocusedField('role')}
            onBlur={() => setFocusedField(null)}
            placeholder="e.g. Investment Banking Analyst"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>

        {/* Resume paste / upload */}
        <View style={styles.resumeLabelRow}>
          <Text style={styles.fieldLabel}>YOUR RESUME</Text>
          <TouchableOpacity onPress={handleUploadPdf} style={styles.uploadButton} activeOpacity={0.7}>
            <Text style={styles.uploadButtonText}>Upload PDF</Text>
          </TouchableOpacity>
        </View>
        <View
          style={[
            styles.resumeContainer,
            focusedField === 'resume' && styles.inputContainerFocused,
          ]}
        >
          <TextInput
            style={styles.resumeInput}
            value={resume}
            onChangeText={setResume}
            onFocus={() => setFocusedField('resume')}
            onBlur={() => setFocusedField(null)}
            placeholder="Paste your resume text here — education, experience bullets, skills…"
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />
        </View>
        <Text style={styles.hint}>
          Tip: paste the whole thing or upload your PDF — the more detail, the sharper the feedback.
        </Text>
      </ScrollView>

      {/* Footer actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, !canProceed && styles.buttonDisabled]}
          onPress={handlePractice}
          activeOpacity={canProceed ? 0.85 : 1}
          disabled={!canProceed}
        >
          <Text style={[styles.primaryButtonText, !canProceed && styles.buttonTextDisabled]}>
            PRACTICE WALKTHROUGH
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, !canProceed && styles.buttonDisabled]}
          onPress={handleImprove}
          activeOpacity={canProceed ? 0.85 : 1}
          disabled={!canProceed}
        >
          <Text style={styles.secondaryButtonText}>Improve my resume</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ProcessingOverlay visible={uploading} message="Reading your resume..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 24, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  title: { fontFamily: fonts.display, fontSize: 40, color: colors.text, letterSpacing: -1, lineHeight: 42, marginBottom: spacing.sm },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.xl },
  fieldLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 2.5, marginBottom: spacing.sm },
  resumeLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  uploadButton: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.accent, marginBottom: spacing.sm },
  uploadButtonText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.accent },
  inputContainer: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  inputContainerFocused: { borderColor: colors.accent },
  input: { fontFamily: fonts.body, fontSize: 14, color: colors.text, paddingVertical: spacing.md, minHeight: 50 },
  resumeContainer: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.sm },
  resumeInput: { fontFamily: fonts.body, fontSize: 14, color: colors.text, minHeight: 220, lineHeight: 20 },
  hint: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, lineHeight: 16, marginBottom: spacing.lg },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg, paddingTop: spacing.sm, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  primaryButton: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: spacing.md + 2, alignItems: 'center' },
  primaryButtonText: { fontFamily: fonts.display, fontSize: 16, color: '#F2F1EE', letterSpacing: 2 },
  secondaryButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.border },
  secondaryButtonText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  proBadge: { backgroundColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 1 },
  proBadgeText: { fontFamily: fonts.bodyBold, fontSize: 9, color: '#F2F1EE', letterSpacing: 1 },
  buttonDisabled: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  buttonTextDisabled: { color: colors.textMuted },
});
