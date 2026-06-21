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
import { generateQuestions } from '../utils/api';
import {
  getCachedQuestions,
  setCachedQuestions,
  clearCachedQuestions,
  getSubscriptionStatus,
  getDailyDrillCount,
  FREE_DAILY_LIMIT,
} from '../utils/storage';
import ProcessingOverlay from '../components/ProcessingOverlay';

const CONFIG = {
  'Interview Prep': {
    title: "What's your\ntarget role?",
    subtitle: 'Be specific — the more detail, the better your questions.',
    placeholder: 'e.g. Private Credit at Ares, McKinsey Consultant, Meta PM...',
    chips: [
      'Investment Banking',
      'Private Equity / Credit',
      'Consulting',
      'Tech / Product',
      'Marketing',
      'General Business',
    ],
  },
  'Persuade & Present': {
    title: 'What are you\npreparing for?',
    subtitle: 'Be specific — the more detail, the better your scenarios.',
    placeholder:
      'e.g. Stock pitch to investment committee, sales presentation to client, defending a thesis to partners...',
    chips: [
      'Investment Committee Pitch',
      'Client Presentation',
      'Team Proposal',
      'Class Presentation',
      'Sales Pitch',
      'Executive Update',
    ],
  },
};

export default function RoleSelectionScreen({ route, navigation }) {
  const { category } = route.params;
  const config = CONFIG[category] ?? CONFIG['Interview Prep'];

  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(false);

  const canStart = role.trim().length >= 3;

  async function fetchAndNavigate(roleValue, forceRefresh = false) {
    const status = await getSubscriptionStatus();
    if (status === 'free') {
      const count = await getDailyDrillCount();
      if (count >= FREE_DAILY_LIMIT) {
        navigation.navigate('Paywall', { message: "You've hit today's free limit." });
        return;
      }
    }

    const trimmedRole = roleValue.trim();
    setError(null);
    setLoading(true);

    try {
      let questions = null;

      if (!forceRefresh) {
        questions = await getCachedQuestions(trimmedRole, category);
      }

      if (!questions) {
        questions = await generateQuestions(trimmedRole, category);
        await setCachedQuestions(trimmedRole, category, questions);
      }

      navigation.navigate('Practice', { category, role: trimmedRole, questions });
    } catch (err) {
      setError("Couldn't generate questions. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartDrill() {
    await fetchAndNavigate(role);
  }

  async function handleNewQuestions() {
    const trimmedRole = role.trim();
    await clearCachedQuestions(trimmedRole, category);
    await fetchAndNavigate(role, true);
  }

  function handleChipPress(chip) {
    setRole(chip);
    setError(null);
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
          <Text style={styles.categoryLabel}>{category.toUpperCase()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.subtitle}>{config.subtitle}</Text>

        {/* Text Input */}
        <View style={[styles.inputContainer, focused && styles.inputContainerFocused]}>
          <TextInput
            style={styles.input}
            value={role}
            onChangeText={(text) => {
              setRole(text);
              setError(null);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={config.placeholder}
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            autoCapitalize="words"
            autoCorrect={false}
            multiline={false}
          />
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleStartDrill} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick picks */}
        <Text style={styles.chipsLabel}>QUICK PICK</Text>
        <View style={styles.chipsGrid}>
          {config.chips.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, role === chip && styles.chipActive]}
              onPress={() => handleChipPress(chip)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, role === chip && styles.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.startButton, !canStart && styles.startButtonDisabled]}
            onPress={handleStartDrill}
            activeOpacity={canStart ? 0.8 : 1}
            disabled={!canStart}
          >
            <Text style={[styles.startButtonText, !canStart && styles.startButtonTextDisabled]}>
              START DRILL
            </Text>
          </TouchableOpacity>

          {canStart && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleNewQuestions}
              activeOpacity={0.7}
            >
              <Text style={styles.refreshText}>↺  New questions</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <ProcessingOverlay visible={loading} message="Building your drill..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  backButton: {
    paddingVertical: spacing.xs,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  categoryLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 2,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 44,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  inputContainer: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.accent,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  errorBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: 'rgba(214, 40, 40, 0.08)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    flex: 1,
    lineHeight: 18,
  },
  retryButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.error,
  },
  retryText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
  },
  chipsLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2.5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  chipActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.accent,
    fontFamily: fonts.bodyMedium,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  startButton: {
    backgroundColor: colors.text,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  startButtonText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: '#F2F1EE',
    letterSpacing: 2,
  },
  startButtonTextDisabled: {
    color: colors.textMuted,
  },
  refreshButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  refreshText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});
