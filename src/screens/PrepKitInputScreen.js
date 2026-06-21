import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { generatePrepKit } from '../utils/api';
import { savePrepKit, getPrepKit, getAllPrepKitMeta } from '../utils/storage';

const QUICK_PICKS = [
  'Goldman Sachs',
  'Blackstone',
  'McKinsey',
  'JP Morgan',
  'Bain',
  'Evercore',
];

const LOADING_MESSAGES = [
  (company) => `Researching ${company}...`,
  () => 'Analyzing firm strategy...',
  () => 'Identifying likely questions...',
  () => 'Building your training plan...',
];

function parseInput(input) {
  const trimmed = input.trim();
  const commaIdx = trimmed.indexOf(',');
  if (commaIdx === -1) return { company: trimmed, role: '' };
  return {
    company: trimmed.substring(0, commaIdx).trim(),
    role: trimmed.substring(commaIdx + 1).trim(),
  };
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function PrepKitInputScreen({ route, navigation }) {
  const prefillRole = route?.params?.prefillRole || '';
  const [input, setInput] = useState(prefillRole);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState(null);
  const [pastKits, setPastKits] = useState([]);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loadingIntervalRef = useRef(null);
  const pulseRef = useRef(null);

  const canGenerate = input.trim().length >= 5;
  const { company } = parseInput(input);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const meta = await getAllPrepKitMeta();
        setPastKits(meta);
      })();
    }, [])
  );

  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      if (pulseRef.current) pulseRef.current.stop();
    };
  }, []);

  function startLoadingAnimation() {
    setLoadingMsgIndex(0);
    loadingIntervalRef.current = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 9000);

    pulseRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulseRef.current.start();
  }

  function stopLoadingAnimation() {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    if (pulseRef.current) pulseRef.current.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }

  async function handleGenerate(forceRefresh = false) {
    const { company: c, role: r } = parseInput(input);
    setError(null);
    setLoading(true);
    startLoadingAnimation();

    try {
      let kit = null;

      if (!forceRefresh) {
        kit = await getPrepKit(c, r);
      }

      if (!kit) {
        kit = await generatePrepKit(c, r);
        await savePrepKit(c, r, kit);
      }

      stopLoadingAnimation();
      navigation.navigate('PrepKitHub', { company: c, role: r, kit });
    } catch (err) {
      stopLoadingAnimation();
      setError("Couldn't generate prep kit. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePastKitPress(meta) {
    try {
      const kit = await getPrepKit(meta.company, meta.role);
      if (kit) {
        navigation.navigate('PrepKitHub', { company: meta.company, role: meta.role, kit });
      } else {
        // Cache was cleared externally — regenerate
        setInput(`${meta.company}${meta.role ? `, ${meta.role}` : ''}`);
      }
    } catch {
      setInput(`${meta.company}${meta.role ? `, ${meta.role}` : ''}`);
    }
  }

  const loadingCompany = company || 'company';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingDot, { opacity: pulseAnim }]} />
          <Text style={styles.loadingTitle}>
            {LOADING_MESSAGES[loadingMsgIndex](loadingCompany)}
          </Text>
          <Text style={styles.loadingSubtext}>
            This may take a minute or two — we're building something thorough.
          </Text>
        </View>
      ) : (
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
            <Text style={styles.categoryLabel}>PREP KIT</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>WHO ARE YOU{'\n'}INTERVIEWING WITH?</Text>
          <Text style={styles.subtitle}>Company name + role. Be as specific as possible.</Text>

          {/* Input */}
          <View style={[styles.inputContainer, focused && styles.inputContainerFocused]}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={(t) => {
                setInput(t);
                setError(null);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="e.g. Star Mountain Capital, Direct Investing Analyst"
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => handleGenerate()} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Picks */}
          <Text style={styles.chipsLabel}>QUICK PICK</Text>
          <View style={styles.chipsGrid}>
            {QUICK_PICKS.map((chip) => (
              <TouchableOpacity
                key={chip}
                style={[styles.chip, input === chip && styles.chipActive]}
                onPress={() => {
                  setInput(chip);
                  setError(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, input === chip && styles.chipTextActive]}>
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generate Button */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.generateButton, !canGenerate && styles.generateButtonDisabled]}
              onPress={() => handleGenerate()}
              activeOpacity={canGenerate ? 0.8 : 1}
              disabled={!canGenerate}
            >
              <Text style={[styles.generateButtonText, !canGenerate && styles.generateButtonTextDisabled]}>
                GENERATE PREP KIT
              </Text>
            </TouchableOpacity>
          </View>

          {/* Past Kits */}
          {pastKits.length > 0 && (
            <View style={styles.pastKitsSection}>
              <Text style={styles.pastKitsLabel}>MY PREP KITS</Text>
              {pastKits.map((meta) => (
                <TouchableOpacity
                  key={meta.key}
                  style={styles.pastKitRow}
                  onPress={() => handlePastKitPress(meta)}
                  activeOpacity={0.75}
                >
                  <View style={styles.pastKitInfo}>
                    <Text style={styles.pastKitCompany}>{meta.company}</Text>
                    {meta.role ? <Text style={styles.pastKitRole}>{meta.role}</Text> : null}
                  </View>
                  <Text style={styles.pastKitDate}>{formatDate(meta.date)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 60 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  loadingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent, marginBottom: spacing.xl },
  loadingTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.text, textAlign: 'center', lineHeight: 30, marginBottom: spacing.sm },
  loadingSubtext: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  categoryLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.accent, letterSpacing: 2 },
  title: { fontFamily: fonts.display, fontSize: 34, color: colors.text, lineHeight: 38, letterSpacing: -0.5, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, paddingHorizontal: spacing.lg, marginBottom: spacing.xl, lineHeight: 20 },
  inputContainer: { marginHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  inputContainerFocused: { borderColor: colors.accent },
  input: { fontFamily: fonts.body, fontSize: 14, color: colors.text, paddingVertical: spacing.md, minHeight: 52 },
  errorBanner: { marginHorizontal: spacing.lg, marginBottom: spacing.md, backgroundColor: 'rgba(214,40,40,0.08)', borderRadius: radius.sm, borderWidth: 1, borderColor: colors.error, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  errorText: { fontFamily: fonts.body, fontSize: 13, color: colors.error, flex: 1, lineHeight: 18 },
  retryButton: { marginLeft: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.error },
  retryText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.error },
  chipsLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 2.5, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.xl },
  chip: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2 },
  chipActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  chipText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.accent, fontFamily: fonts.bodyMedium },
  actions: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  generateButton: { backgroundColor: colors.accent, paddingVertical: spacing.md + 2, borderRadius: radius.md, alignItems: 'center' },
  generateButtonDisabled: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  generateButtonText: { fontFamily: fonts.display, fontSize: 16, color: '#F2F1EE', letterSpacing: 2 },
  generateButtonTextDisabled: { color: colors.textMuted },
  pastKitsSection: { paddingHorizontal: spacing.lg },
  pastKitsLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 2.5, marginBottom: spacing.sm },
  pastKitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  pastKitInfo: { flex: 1 },
  pastKitCompany: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.text, marginBottom: 2 },
  pastKitRole: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
  pastKitDate: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginLeft: spacing.md },
});
