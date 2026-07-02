import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { transcribeAudio, generateQuestions } from '../utils/api';
import { getCachedQuestions, setCachedQuestions } from '../utils/storage';
import {
  requestRecordingPermission,
  startRecording as startRecorder,
  stopRecording as stopRecorder,
  cleanupRecording,
} from '../utils/recorder';
import ProcessingOverlay from '../components/ProcessingOverlay';

const QUICKFIRE_ROLE = 'quickfire_general';
const QUICKFIRE_CATEGORY = 'Quick Fire';
const COUNTDOWN_START = 60;

export default function QuickFireScreen({ navigation }) {
  const [questions, setQuestions] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Refs for use inside intervals/closures
  const countdownRef = useRef(null);
  const elapsedRef = useRef(null);
  const recordingRef = useRef(null);
  const isRecordingRef = useRef(false);
  const elapsedSecondsRef = useRef(0);
  const questionRef = useRef(null);
  const questionsRef = useRef(null);
  const questionIndexRef = useRef(0);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowLoop = useRef(null);

  // Sync refs with state
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { questionIndexRef.current = questionIndex; }, [questionIndex]);
  useEffect(() => {
    if (questions) questionRef.current = questions[questionIndex];
  }, [questions, questionIndex]);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
    return () => {
      clearCountdown();
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (glowLoop.current) glowLoop.current.stop();
      cleanupRecording(recordingRef.current);
    };
  }, []);

  // Start/reset countdown whenever question changes or questions first load
  useEffect(() => {
    if (!questions) return;
    startCountdown();
    return () => clearCountdown();
  }, [questions, questionIndex]);

  function clearCountdown() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }

  function startCountdown() {
    clearCountdown();
    setCountdown(COUNTDOWN_START);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdown();
          if (isRecordingRef.current) {
            handleAutoStop();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function loadQuestions() {
    try {
      setLoadingQuestions(true);
      let qs = await getCachedQuestions(QUICKFIRE_ROLE, QUICKFIRE_CATEGORY);
      if (!qs) {
        qs = await generateQuestions(QUICKFIRE_ROLE, QUICKFIRE_CATEGORY);
        await setCachedQuestions(QUICKFIRE_ROLE, QUICKFIRE_CATEGORY, qs);
      }
      const randomStart = Math.floor(Math.random() * qs.length);
      setQuestionIndex(randomStart);
      questionIndexRef.current = randomStart;
      questionsRef.current = qs;
      setQuestions(qs);
    } catch (err) {
      console.error('QuickFire question load error:', err);
      Alert.alert('Error', 'Could not load prompts. Please try again.', [
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoadingQuestions(false);
    }
  }

  function skipQuestion() {
    if (isRecording) return;
    setQuestionIndex((i) => (i + 1) % questions.length);
  }

  // Called from countdown interval (uses refs only — avoids stale closures)
  async function handleAutoStop() {
    const rec = recordingRef.current;
    if (!rec) return;
    try {
      stopGlow();
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsProcessing(true);

      const audio = await stopRecorder(rec);
      recordingRef.current = null;

      const transcript = await transcribeAudio(audio);
      navigation.navigate('Feedback', {
        category: QUICKFIRE_CATEGORY,
        role: null,
        questions: questionsRef.current,
        question: questionRef.current,
        transcript,
        duration: elapsedSecondsRef.current,
      });
    } catch (err) {
      console.error('Auto-stop error:', err);
      setIsProcessing(false);
      Alert.alert('Error', 'Could not process your recording. Please try again.');
    }
  }

  function startGlow() {
    glowLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 800, useNativeDriver: false }),
      ])
    );
    glowLoop.current.start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }

  function stopGlow() {
    if (glowLoop.current) glowLoop.current.stop();
    Animated.timing(glowAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }

  async function startRecording() {
    try {
      const { granted } = await requestRecordingPermission();
      if (!granted) {
        Alert.alert(
          'Microphone Access Required',
          'CHRM needs microphone access to record your answers. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            ...(Platform.OS === 'web'
              ? []
              : [{ text: 'Open Settings', onPress: () => Linking.openSettings() }]),
          ]
        );
        return;
      }

      const rec = await startRecorder();

      recordingRef.current = rec;
      setIsRecording(true);
      isRecordingRef.current = true;
      setElapsedSeconds(0);
      elapsedSecondsRef.current = 0;

      elapsedRef.current = setInterval(() => {
        setElapsedSeconds((s) => {
          elapsedSecondsRef.current = s + 1;
          return s + 1;
        });
      }, 1000);

      startGlow();
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Could not start recording. Please try again.');
    }
  }

  async function stopRecording() {
    const rec = recordingRef.current;
    if (!rec) return;
    try {
      stopGlow();
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsProcessing(true);

      const audio = await stopRecorder(rec);
      recordingRef.current = null;

      const transcript = await transcribeAudio(audio);
      navigation.navigate('Feedback', {
        category: QUICKFIRE_CATEGORY,
        role: null,
        questions,
        question: questions[questionIndex],
        transcript,
        duration: elapsedSeconds,
      });
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setIsProcessing(false);
      Alert.alert('Error', 'Could not process your recording. Please try again.');
    }
  }

  function handleRecordPress() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function formatCountdown(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function formatElapsed(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  const glowRadius = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });

  const countdownColor = countdown <= 10 ? colors.error : colors.accent;

  if (loadingQuestions || !questions) {
    return (
      <View style={styles.container}>
        <ProcessingOverlay visible={true} message="Loading prompts..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={skipQuestion}
          style={styles.skipButton}
          disabled={isRecording}
        >
          <Text style={[styles.skipIcon, isRecording && styles.skipIconDisabled]}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Countdown */}
      <View style={styles.countdownContainer}>
        <Text style={[styles.countdownNumber, { color: countdownColor }]}>
          {formatCountdown(countdown)}
        </Text>
        <Text style={styles.countdownLabel}>REMAINING</Text>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionPrompt}>PROMPT</Text>
        <Text style={styles.questionText}>{questions[questionIndex]}</Text>
      </View>

      {/* Recording Area */}
      <View style={styles.recordingArea}>
        <Text style={[styles.timer, isRecording && styles.timerActive]}>
          {isRecording ? formatElapsed(elapsedSeconds) : 'TAP TO RECORD'}
        </Text>

        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>REC</Text>
          </View>
        )}

        <Animated.View
          style={[
            styles.glowRing,
            { shadowRadius: glowRadius, shadowOpacity: glowOpacity },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={handleRecordPress}
              activeOpacity={0.85}
              disabled={isProcessing || countdown === 0}
            >
              <View
                style={[
                  styles.recordButtonInner,
                  isRecording && styles.recordButtonInnerActive,
                ]}
              />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <Text style={styles.recordHint}>
          {countdown === 0
            ? 'Time up'
            : isRecording
            ? 'Tap to stop'
            : 'Tap to start · auto-submits at 0:00'}
        </Text>
      </View>

      <ProcessingOverlay visible={isProcessing} message="Transcribing your answer..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  backButton: { paddingVertical: spacing.xs, width: 60 },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted },
  repCount: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, letterSpacing: 1 },
  countdownBlock: { alignItems: 'center', marginBottom: spacing.sm },
  countdown: { fontFamily: fonts.display, fontSize: 80, color: colors.accent, lineHeight: 72, letterSpacing: -4 },
  countdownLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 3, marginTop: 4 },
  countdownUrgent: { color: colors.error },
  questionBlock: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  questionPrompt: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 3, marginBottom: spacing.sm },
  questionText: { fontFamily: fonts.display, fontSize: 22, color: colors.text, lineHeight: 30, letterSpacing: -0.3 },
  recordingArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60, gap: spacing.xl },
  timerLabel: { fontFamily: fonts.display, fontSize: 14, color: colors.textMuted, letterSpacing: 4 },
  timerLabelActive: { color: colors.accent, fontSize: 28 },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
  recordingText: { fontFamily: fonts.body, fontSize: 11, color: colors.error, letterSpacing: 2 },
  glowRing: { shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 }, borderRadius: 65 },
  recordButton: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6 },
  recordButtonActive: { backgroundColor: colors.accent },
  recordButtonInner: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F2F1EE' },
  recordButtonInnerActive: { width: 30, height: 30, borderRadius: 6, backgroundColor: '#F2F1EE' },
  recordHint: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, textAlign: 'center', letterSpacing: 0.5 },
  skipButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  skipText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  // aliases for existing JSX refs
  counter: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, letterSpacing: 1 },
  countdownContainer: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.sm },
  countdownNumber: { fontFamily: fonts.display, fontSize: 72, lineHeight: 76, letterSpacing: -4 },
  questionContainer: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  questionPrompt: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 3, marginBottom: spacing.sm },
  timer: { fontFamily: fonts.display, fontSize: 14, color: colors.textMuted, letterSpacing: 4, marginBottom: spacing.sm },
  timerActive: { color: colors.accent, fontSize: 32 },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  skipIcon: { fontSize: 24, color: colors.textMuted, lineHeight: 28 },
  skipIconDisabled: { color: colors.border },
});
