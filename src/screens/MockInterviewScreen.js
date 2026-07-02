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
import * as Speech from 'expo-speech';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { getMockInterviewTurn, transcribeAudio } from '../utils/api';
import { saveMockInterview } from '../utils/storage';
import {
  requestRecordingPermission,
  startRecording as startRecorder,
  stopRecording as stopRecorder,
  cleanupRecording as cleanupRecorder,
} from '../utils/recorder';
import ProcessingOverlay from '../components/ProcessingOverlay';

// Turn-based voice interview: the interviewer speaks a question (expo-speech),
// the candidate records a spoken answer, it's transcribed via the
// backend, and the next turn is generated. Works on web and native with no
// native-only modules — replaces the old realtime WebRTC implementation.

const MAX_ANSWER_SECONDS = 120;
const MAX_EXCHANGES = 10;

// ─── Waveform visualizer ──────────────────────────────────────────────────────

const BAR_HEIGHTS = [12, 18, 26, 36, 44, 50, 44, 36, 26, 18, 12];

function AudioWaveform({ active, color }) {
  const anims = useRef(BAR_HEIGHTS.map(() => new Animated.Value(0.18))).current;
  const loopsRef = useRef([]);

  useEffect(() => {
    loopsRef.current.forEach((l) => l.stop());
    loopsRef.current = [];

    if (active) {
      loopsRef.current = anims.map((anim, i) => {
        const dur = 220 + (i % 4) * 65;
        const peak = 0.45 + ((i * 7 + 3) % 5) * 0.11;
        const trough = 0.08 + (i % 3) * 0.09;
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: peak, duration: dur, useNativeDriver: true }),
            Animated.timing(anim, { toValue: trough, duration: dur, useNativeDriver: true }),
          ])
        );
        loop.start();
        return loop;
      });
    } else {
      anims.forEach((anim) =>
        Animated.timing(anim, { toValue: 0.18, duration: 350, useNativeDriver: true }).start()
      );
    }

    return () => loopsRef.current.forEach((l) => l.stop());
  }, [active]);

  return (
    <View style={waveStyles.row}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            waveStyles.bar,
            { height: BAR_HEIGHTS[i], backgroundColor: color, transform: [{ scaleY: anim }] },
          ]}
        />
      ))}
    </View>
  );
}

const waveStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 64 },
  bar: { width: 5, borderRadius: 3 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

// status: idle → thinking → ai_speaking → ready → recording → transcribing
//         → thinking → … → closing → ending
export default function MockInterviewScreen({ route, navigation }) {
  const { company, role, kit } = route.params;

  const [status, setStatus] = useState('idle');
  const [questionNum, setQuestionNum] = useState(0);
  const [answerCountdown, setAnswerCountdown] = useState(MAX_ANSWER_SECONDS);

  const conversationRef = useRef([]);
  const exchangeCountRef = useRef(0);
  const mountedRef = useRef(true);
  const statusRef = useRef('idle');
  const recordingRef = useRef(null);
  const answerTimerRef = useRef(null);
  const elapsedRef = useRef(0);
  const permissionGrantedRef = useRef(false);

  function setStatusSafe(val) {
    if (!mountedRef.current) return;
    statusRef.current = val;
    setStatus(val);
  }

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearTimers();
      Speech.stop();
      cleanupRecording();
    };
  }, []);

  function clearTimers() {
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

  // ── Permissions ───────────────────────────────────────────────────────────────
  async function ensureMicPermission() {
    if (permissionGrantedRef.current) return true;
    const { granted } = await requestRecordingPermission();
    if (!granted) {
      Alert.alert(
        'Microphone Access Required',
        'CHRM needs microphone access to hear your answers. Please enable it in Settings.',
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

  // ── Start (user gesture — also unlocks web speech/mic) ──────────────────────────
  async function handleStart() {
    const ok = await ensureMicPermission();
    if (!ok || !mountedRef.current) return;
    setStatusSafe('thinking');
    nextAiTurn();
  }

  // ── Interviewer turn ────────────────────────────────────────────────────────────
  async function nextAiTurn() {
    try {
      const turn = await getMockInterviewTurn(
        conversationRef.current,
        kit,
        company,
        role,
        exchangeCountRef.current
      );
      if (!mountedRef.current) return;

      const line = turn.interviewer_line || '';
      conversationRef.current.push({
        type: 'ai',
        line,
        note: turn.internal_note || '',
        timestamp: Date.now(),
      });
      exchangeCountRef.current += 1;
      setQuestionNum((q) => q + 1);

      const isClosing = !!turn.is_closing || exchangeCountRef.current >= MAX_EXCHANGES;
      speakLine(line, isClosing);
    } catch (err) {
      console.error('Mock interview turn error:', err);
      if (mountedRef.current) {
        Alert.alert('Connection Problem', 'Could not reach the interview service. Please try again.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    }
  }

  function speakLine(line, isClosing) {
    setStatusSafe('ai_speaking');
    const finish = () => {
      if (!mountedRef.current) return;
      setStatusSafe(isClosing ? 'closing' : 'ready');
    };
    if (!line) {
      finish();
      return;
    }
    Speech.stop();
    Speech.speak(line, {
      rate: Platform.OS === 'ios' ? 0.5 : 1.0,
      onDone: finish,
      onStopped: finish,
      onError: finish,
    });
  }

  function skipSpeaking() {
    if (statusRef.current !== 'ai_speaking') return;
    Speech.stop();
    // onStopped fires finish(); guard in case it doesn't on some platforms.
  }

  // ── Candidate answer ────────────────────────────────────────────────────────────
  async function beginRecording() {
    try {
      const ok = await ensureMicPermission();
      if (!ok || !mountedRef.current) return;

      const recording = await startRecorder();
      recordingRef.current = recording;

      setStatusSafe('recording');
      elapsedRef.current = 0;
      setAnswerCountdown(MAX_ANSWER_SECONDS);

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
      clearTimers();
      const duration = elapsedRef.current;
      const audio = await stopRecorder(rec);
      recordingRef.current = null;

      setStatusSafe('transcribing');
      const transcript = await transcribeAudio(audio);
      if (!mountedRef.current) return;

      conversationRef.current.push({
        type: 'user',
        transcript: transcript || '',
        duration,
        timestamp: Date.now(),
      });

      setStatusSafe('thinking');
      nextAiTurn();
    } catch (err) {
      console.error('Failed to process answer:', err);
      if (mountedRef.current) {
        Alert.alert('Error', 'Could not process your answer. Please try again.', [
          { text: 'Retry', onPress: () => setStatusSafe('ready') },
        ]);
      }
    }
  }

  // ── End ─────────────────────────────────────────────────────────────────────────
  function confirmEnd() {
    Alert.alert('End Interview?', "You'll see your full debrief and performance analysis.", [
      { text: 'Keep Going', style: 'cancel' },
      { text: 'End Interview', style: 'destructive', onPress: endInterview },
    ]);
  }

  async function endInterview() {
    setStatusSafe('ending');
    Speech.stop();
    clearTimers();
    await cleanupRecording();
    const conv = conversationRef.current;
    try {
      await saveMockInterview({
        id: Date.now().toString(),
        company,
        role,
        conversation: conv,
        date: new Date().toISOString(),
      });
    } catch (_) {}
    if (!mountedRef.current) return;
    navigation.replace('MockInterviewDebrief', { company, role, kit, conversation: conv });
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  const isAiSpeaking = status === 'ai_speaking';
  const isRecording = status === 'recording';
  const waveActive = isAiSpeaking || isRecording;
  const waveColor = isAiSpeaking ? colors.accent : isRecording ? colors.error : colors.textMuted;

  const statusLabel =
    {
      idle: 'Ready when you are',
      thinking: 'Interviewer is thinking...',
      ai_speaking: 'Interviewer speaking...',
      ready: 'Your turn',
      recording: `Recording · ${answerCountdown}s left`,
      transcribing: 'Processing your answer...',
      closing: 'Interview complete',
      ending: 'Saving...',
    }[status] ?? '';

  return (
    <View style={styles.container}>
      <ProcessingOverlay
        visible={status === 'transcribing' || status === 'thinking'}
        message={status === 'transcribing' ? 'Processing your answer...' : 'Interviewer is thinking...'}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.endBtn} onPress={confirmEnd} activeOpacity={0.7}>
          <Text style={styles.endBtnText}>End</Text>
        </TouchableOpacity>

        <Text style={styles.companyText} numberOfLines={1}>
          {company}
          {role ? ` · ${role}` : ''}
        </Text>

        <View style={styles.qBadge}>
          <Text style={styles.qBadgeText}>Q{questionNum}</Text>
        </View>
      </View>

      {/* Center — waveform + status */}
      <View style={styles.center}>
        <AudioWaveform active={waveActive} color={waveColor} />
        <Text style={styles.statusLabel}>{statusLabel}</Text>
      </View>

      {/* Footer — context-dependent action */}
      <View style={styles.footer}>
        {status === 'idle' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleStart} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>START INTERVIEW</Text>
          </TouchableOpacity>
        )}

        {status === 'ai_speaking' && (
          <TouchableOpacity style={styles.ghostBtn} onPress={skipSpeaking} activeOpacity={0.7}>
            <Text style={styles.ghostBtnText}>Skip</Text>
          </TouchableOpacity>
        )}

        {status === 'ready' && (
          <TouchableOpacity style={styles.recordBtn} onPress={beginRecording} activeOpacity={0.85}>
            <Text style={styles.recordBtnText}>● ANSWER</Text>
          </TouchableOpacity>
        )}

        {status === 'recording' && (
          <TouchableOpacity style={styles.stopBtn} onPress={stopRecording} activeOpacity={0.85}>
            <Text style={styles.stopBtnText}>■ DONE</Text>
          </TouchableOpacity>
        )}

        {status === 'closing' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={endInterview} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>VIEW DEBRIEF →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 56 : 36 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  endBtn: { paddingVertical: spacing.xs, width: 44 },
  endBtnText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  companyText: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, letterSpacing: 0.5, flex: 1, textAlign: 'center' },
  qBadge: { backgroundColor: colors.accentDim, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3, width: 44, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(23,71,212,0.2)' },
  qBadgeText: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.accent, letterSpacing: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  statusLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, letterSpacing: 1.2 },
  footer: { paddingHorizontal: spacing.lg, paddingBottom: Platform.OS === 'ios' ? 48 : spacing.xl, paddingTop: spacing.md, alignItems: 'center', minHeight: 96, justifyContent: 'center' },
  primaryBtn: { backgroundColor: colors.text, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl },
  primaryBtnText: { fontFamily: fonts.display, fontSize: 18, color: '#F2F1EE', letterSpacing: 2 },
  recordBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl },
  recordBtnText: { fontFamily: fonts.display, fontSize: 18, color: '#FFFFFF', letterSpacing: 2 },
  stopBtn: { backgroundColor: colors.error, borderRadius: radius.full, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl },
  stopBtnText: { fontFamily: fonts.display, fontSize: 18, color: '#FFFFFF', letterSpacing: 2 },
  ghostBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xl },
  ghostBtnText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, letterSpacing: 1 },
});
