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
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Audio } from 'expo-av';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { transcribeAudio } from '../utils/api';
import ProcessingOverlay from '../components/ProcessingOverlay';

export default function PracticeScreen({ route, navigation }) {
  const { category, role, questions, company = null, isFirstDrill = false, hubReturn = null } = route.params;

  const [questionIndex, setQuestionIndex] = useState(
    () => Math.floor(Math.random() * questions.length)
  );
  const question = questions[questionIndex];

  const [browseVisible, setBrowseVisible] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(isFirstDrill);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const glowLoop = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (glowLoop.current) glowLoop.current.stop();
    };
  }, []);

  function skipQuestion() {
    if (isRecording) return;
    setQuestionIndex((i) => (i + 1) % questions.length);
  }

  function selectQuestion(index) {
    setQuestionIndex(index);
    setBrowseVisible(false);
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
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Microphone Access Required',
          'CHRM needs microphone access to record your answers. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(rec);
      setIsRecording(true);
      setElapsedSeconds(0);
      setBannerVisible(false);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);

      startGlow();
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Could not start recording. Please try again.');
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      stopGlow();
      if (timerRef.current) clearInterval(timerRef.current);

      setIsRecording(false);
      setIsProcessing(true);

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      setRecording(null);

      const transcript = await transcribeAudio(uri);

      navigation.navigate('Feedback', {
        category,
        role,
        questions,
        question,
        transcript,
        duration: elapsedSeconds,
        company,
        isFirstDrill,
        hubReturn,
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

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const glowRadius = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });
  const glowColor = '#1747D4';

  return (
    <View style={styles.container}>
      {/* First-drill banner */}
      {bannerVisible && (
        <View style={styles.firstDrillBanner}>
          <Text style={styles.firstDrillBannerText}>
            Your first rep — tap the mic when you're ready
          </Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.counter}>{questionIndex + 1} of {questions.length}</Text>

        <TouchableOpacity
          onPress={skipQuestion}
          style={styles.skipButton}
          disabled={isRecording}
        >
          <Text style={[styles.skipIcon, isRecording && styles.skipIconDisabled]}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionPrompt}>YOUR QUESTION</Text>
        <Text style={styles.questionText}>{question}</Text>

        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => setBrowseVisible(true)}
          disabled={isRecording}
        >
          <Text style={styles.browseButtonText}>Browse Questions</Text>
          <Text style={styles.browseChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Recording Area */}
      <View style={styles.recordingArea}>
        <Text style={[styles.timer, isRecording && styles.timerActive]}>
          {isRecording ? formatTime(elapsedSeconds) : 'TAP TO RECORD'}
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
              disabled={isProcessing}
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
          {isRecording ? 'Tap to stop' : 'Tap to start your answer'}
        </Text>
      </View>

      {/* Browse Questions Bottom Sheet */}
      <Modal
        visible={browseVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBrowseVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setBrowseVisible(false)}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Questions</Text>
            <Text style={styles.sheetSubtitle}>{category.toUpperCase()}</Text>
          </View>

          <FlatList
            data={questions}
            keyExtractor={(_, i) => String(i)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetList}
            renderItem={({ item, index }) => {
              const isSelected = index === questionIndex;
              return (
                <TouchableOpacity
                  style={[styles.sheetItem, isSelected && styles.sheetItemSelected]}
                  onPress={() => selectQuestion(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sheetItemNumber, isSelected && styles.sheetItemNumberSelected]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.sheetItemText, isSelected && styles.sheetItemTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      <ProcessingOverlay visible={isProcessing} message="Transcribing your answer..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    width: 80,
  },
  backText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  counter: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  skipButton: {
    width: 80,
    alignItems: 'flex-end',
    paddingVertical: spacing.xs,
  },
  skipIcon: {
    fontSize: 24,
    color: colors.textMuted,
    lineHeight: 28,
  },
  skipIconDisabled: {
    color: colors.border,
  },
  questionContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  questionPrompt: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  questionText: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  browseButtonText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.accent,
  },
  browseChevron: {
    fontSize: 16,
    color: colors.accent,
    lineHeight: 20,
  },
  recordingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  timer: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  timerActive: {
    color: colors.accent,
    fontSize: 32,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  recordingText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.error,
    letterSpacing: 2,
  },
  glowRing: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    borderRadius: 70,
    marginBottom: spacing.xl,
  },
  recordButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.accent,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  recordButtonActive: {
    backgroundColor: colors.accent,
  },
  recordButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F1EE',
  },
  recordButtonInnerActive: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F2F1EE',
  },
  recordHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },

  firstDrillBanner: {
    backgroundColor: colors.accentDim,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(23, 71, 212, 0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  firstDrillBannerText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.accent,
    textAlign: 'center',
  },

  // Bottom Sheet
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '72%',
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.5,
  },
  sheetSubtitle: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 2,
  },
  sheetList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetItemNumber: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textMuted,
    width: 24,
    lineHeight: 24,
  },
  sheetItemNumberSelected: {
    color: colors.accent,
  },
  sheetItemText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 21,
  },
  sheetItemTextSelected: {
    color: colors.text,
  },
});
