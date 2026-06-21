import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { generateQuestions } from '../utils/api';
import { getCachedQuestions, setCachedQuestions } from '../utils/storage';
import ProcessingOverlay from '../components/ProcessingOverlay';

const SCREEN_WIDTH = Dimensions.get('window').width;

const INTENTS = [
  {
    id: 'interview',
    label: 'Upcoming interview',
    subtitle: "I have a specific role I'm targeting",
  },
  {
    id: 'sharpen',
    label: 'Sharpen my communication',
    subtitle: 'I want to get better at speaking under pressure',
  },
  {
    id: 'explore',
    label: 'Just exploring',
    subtitle: 'Show me what CHRM can do',
  },
];

const CHIPS = [
  'Investment Banking',
  'Private Equity / Credit',
  'Consulting',
  'Tech / Product',
  'Marketing',
  'General',
];

// Steps: 0 = Welcome, 1 = Intent, 2 = Role Input (interview only)
export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [roleInput, setRoleInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const containerOpacity = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(containerOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  function goToStep(nextStep) {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      slideAnim.setValue(SCREEN_WIDTH);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }

  async function handleSkip() {
    await AsyncStorage.setItem('@chrm_onboarding_completed', 'true');
    navigation.replace('Home');
  }

  async function handleSelectIntent(intent) {
    await AsyncStorage.setItem('@chrm_user_intent', intent.id);
    if (intent.id === 'interview') {
      goToStep(2);
    } else {
      await AsyncStorage.setItem('@chrm_onboarding_completed', 'true');
      navigation.replace('Home');
    }
  }

  async function handleContinueRole() {
    const role = roleInput.trim();
    if (role.length < 3) return;
    await AsyncStorage.setItem('@chrm_user_target_role', role);
    setIsGenerating(true);

    try {
      let questions = await getCachedQuestions(role, 'Interview Prep');
      if (!questions) {
        questions = await generateQuestions(role, 'Interview Prep');
        await setCachedQuestions(role, 'Interview Prep', questions);
      }
      navigation.replace('Practice', {
        category: 'Interview Prep',
        role,
        questions,
        isFirstDrill: true,
      });
    } catch (err) {
      setIsGenerating(false);
      Alert.alert('Error', 'Could not generate questions. Please try again.');
    }
  }

  const totalDots = step === 2 ? 3 : 2;
  const continueEnabled = roleInput.trim().length >= 3;

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <StatusBar barStyle="dark-content" />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Step content */}
      <Animated.View
        style={[styles.stepContent, { transform: [{ translateX: slideAnim }] }]}
      >
        {step === 0 && <WelcomeStep onGetStarted={() => goToStep(1)} />}
        {step === 1 && <IntentStep onSelect={handleSelectIntent} />}
        {step === 2 && (
          <RoleStep
            roleInput={roleInput}
            setRoleInput={setRoleInput}
            onContinue={handleContinueRole}
            continueEnabled={continueEnabled}
          />
        )}
      </Animated.View>

      {/* Progress dots */}
      <View style={styles.dotsRow} pointerEvents="none">
        {Array.from({ length: totalDots }).map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <ProcessingOverlay visible={isGenerating} message="Building your drill..." />
    </Animated.View>
  );
}

// ── Welcome ──────────────────────────────────────────────────────────────────

function WelcomeStep({ onGetStarted }) {
  return (
    <View style={styles.stepInner}>
      <View style={styles.welcomeCenter}>
        <Text style={styles.logo}>CHRM</Text>
        <Text style={styles.tagline}>Train how you communicate.</Text>
        <Text style={styles.subTagline}>Reps. Pressure. Feedback.</Text>
      </View>
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={onGetStarted}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>GET STARTED</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Intent ───────────────────────────────────────────────────────────────────

function IntentStep({ onSelect }) {
  return (
    <View style={styles.stepInner}>
      <Text style={styles.stepTitle}>WHAT BRINGS{'\n'}YOU HERE?</Text>
      <View style={styles.cards}>
        {INTENTS.map((intent) => (
          <TouchableOpacity
            key={intent.id}
            style={styles.card}
            onPress={() => onSelect(intent)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardLabel}>{intent.label}</Text>
            <Text style={styles.cardSubtitle}>{intent.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Role Input ────────────────────────────────────────────────────────────────

function RoleStep({ roleInput, setRoleInput, onContinue, continueEnabled }) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.roleScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>WHAT'S YOUR{'\n'}TARGET?</Text>
        <Text style={styles.stepSubtitle}>
          Be specific — the better the input, the better your practice.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Goldman Sachs IBD, McKinsey Consultant, Ares Private Credit..."
          placeholderTextColor={colors.textMuted}
          value={roleInput}
          onChangeText={setRoleInput}
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={continueEnabled ? onContinue : undefined}
        />

        <View style={styles.chipRow}>
          {CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, roleInput === chip && styles.chipSelected]}
              onPress={() => setRoleInput(chip)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, roleInput === chip && styles.chipTextSelected]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, !continueEnabled && styles.primaryBtnDisabled]}
          onPress={onContinue}
          disabled={!continueEnabled}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>CONTINUE</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: spacing.lg,
    zIndex: 10,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  stepContent: {
    flex: 1,
  },
  stepInner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
  },

  // Welcome
  welcomeCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logo: {
    fontFamily: fonts.header,
    fontSize: 96,
    color: colors.accent,
    letterSpacing: 4,
    lineHeight: 84,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subTagline: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 1,
  },

  // Intent & Role titles
  stepTitle: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 40,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  stepSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },

  // Intent cards
  cards: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },

  // Role scroll
  roleScroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 80,
  },

  // Input
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputFocused: {
    borderColor: colors.accent,
  },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.accent,
  },

  // Primary button
  primaryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md + 4,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.25,
  },
  primaryBtnText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: '#F2F1EE',
    letterSpacing: 2,
  },

  // Progress dots
  dotsRow: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 48 : 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.text,
  },
});
