import React, { useState, useEffect, useRef } from 'react';
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
import { generateHireVueQuestions, transcribeAudio } from '../utils/api';
import { saveHireVueSession } from '../utils/storage';
import {
  requestRecordingPermission,
  startRecording as startRecorder,
  stopRecording as stopRecorder,
  cleanupRecording as cleanupRecorder,
} from '../utils/recorder';
import ProcessingOverlay from '../components/ProcessingOverlay';

const PREP_SECONDS = 30;
const ANSWER_SECONDS = 120;
const MAX_RETAKES = 1;

// phase: 'prep' → 'recording' → 'review' → (next) … → 'processing'
export default function HireVueSimulationScreen({ route, navigation }) {
  const { company, role, mix, count, prepKit } = route.params;

  const [questions, setQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('prep');
  const [prepCountdown, setPrepCountdown] = useState(PREP_SECONDS);
  const [answerCountdown, setAnswerCountdown] = useState(ANSWER_SECONDS);
  const [retakesUsed, setRetakesUsed] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Refs (timers / closures)
  const mountedRef = useRef(true);
  const phaseRef = useRef('prep');
  const indexRef = useRef(0);
  const questionsRef = useRef(null);
  const recordingRef = useRef(null);
  const prepTimerRef = useRef(null);
  const answerTimerRef = useRef(null);
  const elapsedRef = useRef(0);
  const pendingRef = useRef(null); // { audio, duration } awaiting submit/retake
  const answersRef = useRef([]); // [{ question, category, audio, duration }]
  const permissionGrantedRef = useRef(false);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowLoop = useRef(null);

  function setPhaseSafe(p) {
    if (!mountedRef.current) return;
    phaseRef.current = p;
    setPhase(p);
  }

  // ── Mount / unmount ───────────────────────────────────────────────────────────
  useEffect(() => {
    loadQuestions();
    return () => {
      mountedRef.current = false;
      clearTimers();
      if (glowLoop.current) glowLoop.current.stop();
      cleanupRecording();
    };
  }, []);

  function clearTimers() {
    if (prepTimerRef.current) {
      clearInterval(prepTimerRef.current);
      prepTimerRef.current = null;
    }
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current);
      answerTimerRef.current = null;
    }
  }

  async function cleanupRecording() {
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (rec) {
      await cleanupRecorder(rec);
    }
  }

  async function loadQuestions() {
    try {
      setLoadingQuestions(true);
      setLoadError(false);
      const qs = await generateHireVueQuestions(company, role, mix, count, prepKit);
      if (!mountedRef.current) return;
      questionsRef.current = qs;
      setQuestions(qs);
      setLoadingQuestions(false);
      // Ask for the mic up front so the permission prompt doesn't interrupt the
      // prep countdown on the first question.
      const ok = await ensureMicPermission();
      if (!ok || !mountedRef.current) return;
      startPrep();
    } catch (err) {
      console.error('HireVue question load error:', err);
      if (mountedRef.current) {
        setLoadingQuestions(false);
        setLoadError(true);
      }
    }
  }

  // ── Prep phase ────────────────────────────────────────────────────────────────
  function startPrep() {
    clearTimers();
    setPhaseSafe('prep');
    setPrepCountdown(PREP_SECONDS);
    prepTimerRef.current = setInterval(() => {
      setPrepCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current);
          prepTimerRef.current = null;
          beginRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function skipPrep() {
    if (phaseRef.current !== 'prep') return;
    clearTimers();
    beginRecording();
  }

  // ── Recording phase ───────────────────────────────────────────────────────────
  async function ensureMicPermission() {
    if (permissionGrantedRef.current) return true;
    const { granted } = await requestRecordingPermission();
    if (!granted) {
      Alert.alert(
        'Microphone Access Required',
        'CHRM needs microphone access to record your answers. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => navigation.goBack() },
          ...(Platform.OS === 'web'
            ? []
            : [{ text: 'Open Settings', onPress: () => Linking.openSettings() }]),
        ]
      );
      return false;
    }
    permissionGrantedRef.current = true;
    return true;
  }

  async function beginRecording() {
    try {
      const ok = await ensureMicPermission();
      if (!ok || !mountedRef.current) return;

      const recording = await startRecorder();
      recordingRef.current = recording;

      setPhaseSafe('recording');
      elapsedRef.current = 0;
      setAnswerCountdown(ANSWER_SECONDS);
      startGlow();

      answerTimerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setAnswerCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(answerTimerRef.current);
            answerTimerRef.current = null;
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
      clearTimers();
      const duration = elapsedRef.current;
      const audio = await stopRecorder(rec);
      recordingRef.current = null;
      pendingRef.current = { audio, duration };
      setPhaseSafe('review');
    } catch (err) {
      console.error('Failed to stop recording:', err);
      Alert.alert('Error', 'Could not save your recording. Please try again.');
    }
  }

  // ── Review phase actions ──────────────────────────────────────────────────────
  function handleRetake() {
    if (retakesUsed >= MAX_RETAKES) return;
    setRetakesUsed((r) => r + 1);
    pendingRef.current = null;
    beginRecording();
  }

  function handleSubmit() {
    const qs = questionsRef.current;
    const i = indexRef.current;
    const current = qs[i];
    answersRef.current.push({
      question: current.question,
      category: current.category || 'Behavioral',
      audio: pendingRef.current?.audio || null,
      duration: pendingRef.current?.duration || 0,
    });
    pendingRef.current = null;

    if (i < qs.length - 1) {
      const next = i + 1;
      indexRef.current = next;
      setIndex(next);
      setRetakesUsed(0);
      startPrep();
    } else {
      finish();
    }
  }

  // ── Finish: transcribe everything + AI debrief ────────────────────────────────
  async function finish() {
    setPhaseSafe('processing');
    setProcessing(true);
    try {
      const answers = answersRef.current;
      // Transcribe all recordings in parallel.
      const transcripts = await Promise.all(
        answers.map(async (a) => {
          if (!a.audio) return '';
          try {
            return await transcribeAudio(a.audio);
          } catch (e) {
            console.error('Transcription failed for one answer:', e);
            return '';
          }
        })
      );

      const items = answers.map((a, i) => ({
        question: a.question,
        category: a.category,
        transcript: transcripts[i],
        duration: a.duration,
      }));

      await saveHireVueSession({
        id: Date.now().toString(),
        company,
        role,
        date: new Date().toISOString(),
        items,
      });

      navigation.replace('HireVueDebrief', { company, role, items });
    } catch (err) {
      console.error('HireVue finish error:', err);
      if (mountedRef.current) {
        setProcessing(false);
        Alert.alert('Error', 'Could not process your interview. Please try again.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    }
  }

  function confirmExit() {
    Alert.alert('End Simulation?', 'Your progress in this interview will be lost.', [
      { text: 'Keep Going', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  }

  // ── Animations ────────────────────────────────────────────────────────────────
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

  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  const glowRadius = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });

  // ── Render: loading / error ───────────────────────────────────────────────────
  if (loadingQuestions) {
    return (
      <View style={styles.container}>
        <ProcessingOverlay visible={true} message="Building your interview..." />
      </View>
    );
  }

  if (loadError || !questions) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorTitle}>Couldn't build the interview</Text>
        <Text style={styles.errorText}>Check your connection and try again.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadQuestions} activeOpacity={0.85}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[index];
  const isPrep = phase === 'prep';
  const isRecording = phase === 'recording';
  const isReview = phase === 'review';
  const canRetake = retakesUsed < MAX_RETAKES;
  const prepUrgent = prepCountdown <= 5;
  const answerUrgent = answerCountdown <= 10;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.endBtn} onPress={confirmExit} activeOpacity={0.7}>
          <Text style={styles.endBtnText}>End</Text>
        </TouchableOpacity>
        <Text style={styles.companyText} numberOfLines={1}>
          {company}
          {role ? ` · ${role}` : ''}
        </Text>
        <View style={styles.qBadge}>
          <Text style={styles.qBadgeText}>
            {index + 1}/{questions.length}
          </Text>
        </View>
      </View>

      {/* Category + question */}
      <View style={styles.questionBlock}>
        <Text style={styles.categoryTag}>{(currentQuestion.category || 'Behavioral').toUpperCase()}</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      {/* Center area changes by phase */}
      <View style={styles.center}>
        {isPrep && (
          <>
            <Text style={styles.phaseLabel}>PREP TIME</Text>
            <Text style={[styles.bigCountdown, prepUrgent && { color: colors.error }]}>
              {formatTime(prepCountdown)}
            </Text>
            <Text style={styles.phaseHint}>Recording starts automatically</Text>
            <TouchableOpacity style={styles.skipPrepBtn} onPress={skipPrep} activeOpacity={0.8}>
              <Text style={styles.skipPrepText}>I'm ready — start now</Text>
            </TouchableOpacity>
          </>
        )}

        {isRecording && (
          <>
            <View style={styles.recIndicator}>
              <View style={styles.recDot} />
              <Text style={styles.recText}>RECORDING</Text>
            </View>
            <Text style={[styles.bigCountdown, answerUrgent && { color: colors.error }]}>
              {formatTime(answerCountdown)}
            </Text>
            <Animated.View style={[styles.glowRing, { shadowRadius: glowRadius, shadowOpacity: glowOpacity }]}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity style={styles.recordButton} onPress={stopRecording} activeOpacity={0.85}>
                  <View style={styles.recordButtonInner} />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
            <Text style={styles.phaseHint}>Tap to submit · auto-submits at 0:00</Text>
          </>
        )}

        {isReview && (
          <View style={styles.reviewBlock}>
            <Text style={styles.reviewCheck}>✓</Text>
            <Text style={styles.reviewTitle}>Answer captured</Text>
            <Text style={styles.reviewSub}>
              {canRetake
                ? 'You can re-record once, or continue to the next question.'
                : 'No retakes left — continue to the next question.'}
            </Text>
            {canRetake && (
              <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake} activeOpacity={0.85}>
                <Text style={styles.retakeBtnText}>↺  RE-RECORD ({MAX_RETAKES - retakesUsed} LEFT)</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>
                {index < questions.length - 1 ? 'NEXT QUESTION →' : 'FINISH & GET FEEDBACK →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ProcessingOverlay visible={processing} message="Scoring your interview..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 56 : 36 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorTitle: { fontFamily: fonts.displayMedium, fontSize: 20, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  errorText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  retryButton: { backgroundColor: colors.accent, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, borderRadius: radius.md, marginBottom: spacing.md },
  retryButtonText: { fontFamily: fonts.displayMedium, fontSize: 15, color: '#F2F1EE', letterSpacing: 1 },
  backLink: { paddingVertical: spacing.sm },
  backLinkText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  endBtn: { paddingVertical: spacing.xs, width: 48 },
  endBtnText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  companyText: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, letterSpacing: 0.5, flex: 1, textAlign: 'center' },
  qBadge: { backgroundColor: colors.accentDim, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3, width: 48, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(23,71,212,0.2)' },
  qBadgeText: { fontFamily: fonts.displayMedium, fontSize: 13, color: colors.accent, letterSpacing: 0.5 },

  questionBlock: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  categoryTag: { fontFamily: fonts.body, fontSize: 10, color: colors.accent, letterSpacing: 2.5, marginBottom: spacing.sm },
  questionText: { fontFamily: fonts.display, fontSize: 24, color: colors.text, lineHeight: 32, letterSpacing: -0.3 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, paddingBottom: 40, gap: spacing.md },
  phaseLabel: { fontFamily: fonts.body, fontSize: 10, color: colors.textMuted, letterSpacing: 3 },
  bigCountdown: { fontFamily: fonts.display, fontSize: 72, color: colors.accent, lineHeight: 76, letterSpacing: -3 },
  phaseHint: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, textAlign: 'center', letterSpacing: 0.5 },
  skipPrepBtn: { marginTop: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.full, borderWidth: 1, borderColor: colors.accent },
  skipPrepText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.accent },

  recIndicator: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error },
  recText: { fontFamily: fonts.body, fontSize: 11, color: colors.error, letterSpacing: 2 },
  glowRing: { shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 }, borderRadius: 65, marginTop: spacing.sm },
  recordButton: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6 },
  recordButtonInner: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#F2F1EE' },

  reviewBlock: { alignItems: 'center', gap: spacing.sm, width: '100%' },
  reviewCheck: { fontFamily: fonts.display, fontSize: 44, color: colors.success, lineHeight: 48 },
  reviewTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.text },
  reviewSub: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md, paddingHorizontal: spacing.lg },
  retakeBtn: { width: '100%', paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  retakeBtnText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary, letterSpacing: 1 },
  submitBtn: { width: '100%', paddingVertical: spacing.md + 2, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center' },
  submitBtnText: { fontFamily: fonts.display, fontSize: 15, color: '#F2F1EE', letterSpacing: 1.5 },
});
