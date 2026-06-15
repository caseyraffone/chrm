import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { RTCPeerConnection, mediaDevices, registerGlobals } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';
import { OPENAI_API_KEY } from '@env';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { saveMockInterview } from '../utils/storage';

// Register WebRTC globals (RTCPeerConnection, MediaStream, etc.) in the JS runtime
registerGlobals();

// ─── Constants ────────────────────────────────────────────────────────────────

const REALTIME_MODEL = 'gpt-4o-realtime-preview-2024-12-17';
const SESSIONS_URL = 'https://api.openai.com/v1/realtime/sessions';
const SDP_URL = `https://api.openai.com/v1/realtime?model=${REALTIME_MODEL}`;

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

// status: connecting → ready → ai_speaking → listening → user_speaking
//         → thinking → ai_speaking (loop) … → closing → ending

export default function MockInterviewScreen({ route, navigation }) {
  const { company, role, kit } = route.params;

  const [status, setStatus] = useState('connecting');
  const [questionNum, setQuestionNum] = useState(0);

  const pcRef = useRef(null);           // RTCPeerConnection
  const dcRef = useRef(null);           // RTCDataChannel for JSON events
  const localStreamRef = useRef(null);  // mic MediaStream
  const conversationRef = useRef([]);
  const mountedRef = useRef(true);
  const statusRef = useRef('connecting');
  const exchangeCountRef = useRef(0);
  const aiSpeakingRef = useRef(false);

  function setStatusSafe(val) {
    if (!mountedRef.current) return;
    statusRef.current = val;
    setStatus(val);
  }

  useEffect(() => {
    init();
    return () => {
      mountedRef.current = false;
      teardown();
    };
  }, []);

  // ── Init ────────────────────────────────────────────────────────────────────

  async function init() {
    try {
      // Route audio to the main speaker (not earpiece) and keep screen active
      InCallManager.start({ media: 'audio' });
      InCallManager.setSpeakerphoneOn(true);

      // Step 1: get a short-lived ephemeral key so the real API key never
      // leaves this device in the WebRTC handshake
      const tokenRes = await fetch(SESSIONS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: REALTIME_MODEL, voice: 'verse', speed: 1.08 }),
      });

      if (!tokenRes.ok) {
        throw new Error(`Ephemeral token request failed: ${tokenRes.status}`);
      }

      const tokenData = await tokenRes.json();
      const ephemeralKey = tokenData.client_secret.value;

      // Step 2: create peer connection (no ICE servers — direct to OpenAI)
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // Incoming audio from OpenAI plays automatically via the WebRTC stack —
      // no manual decoding, no WAV files, no expo-av playback needed.
      pc.ontrack = (event) => {
        console.log('[WebRTC] remote track received:', event.track.kind);
      };

      // Step 3: data channel for JSON control events (transcripts, VAD, errors)
      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;

      dc.onopen = () => {
        console.log('[DC] open — configuring session');
        dc.send(
          JSON.stringify({
            type: 'session.update',
            session: {
              instructions: buildSystemPrompt(),
              input_audio_transcription: { model: 'whisper-1' },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.45,
                prefix_padding_ms: 300,
                silence_duration_ms: 400,
              },
            },
          })
        );
        // Prompt the AI to open the interview
        dc.send(JSON.stringify({ type: 'response.create' }));
        setStatusSafe('ready');
      };

      dc.onmessage = (e) => {
        try {
          handleEvent(JSON.parse(e.data));
        } catch (err) {
          console.error('[DC] parse error:', err);
        }
      };

      dc.onerror = (err) => console.error('[DC] error:', err);

      // Step 4: capture mic and add audio track to the peer connection
      const stream = await mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));

      // Step 5: create SDP offer and set as local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Step 6: send offer SDP to OpenAI, get answer SDP back
      const sdpRes = await fetch(SDP_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      if (!sdpRes.ok) {
        throw new Error(`SDP exchange failed: ${sdpRes.status}`);
      }

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      console.log('[WebRTC] connection established');
    } catch (err) {
      console.error('[WebRTC] init error:', err);
      if (mountedRef.current) {
        Alert.alert(
          'Connection Failed',
          'Could not connect to the interview service. Check your internet connection and try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }
  }

  // ── System prompt ────────────────────────────────────────────────────────────

  function buildSystemPrompt() {
    const roleCtx = role || 'the open position';
    const kitData = {
      interview_style: kit.company_overview?.interview_style,
      culture_signals: kit.company_overview?.culture_signals,
      likely_questions: kit.likely_questions,
    };
    return (
      `You are conducting a realistic interview for a ${roleCtx} position at ${company}. ` +
      `You have the following intelligence about this firm: ${JSON.stringify(kitData)}. ` +
      `Conduct the interview naturally and conversationally. Ask one question at a time. ` +
      `Listen carefully and ask sharp follow-up questions when answers are vague or incomplete. ` +
      `Be professional but challenging. CRITICAL: Keep every response to 1-3 sentences maximum. ` +
      `Be conversational and direct. Do not give long monologues or explanations. ` +
      `Respond like a real person in a real interview — concise, natural, occasionally informal. ` +
      `Never lecture. Never summarize what the candidate just said back to them. ` +
      `After 8-10 exchanges, wrap up naturally: "That covers everything I had. Thanks for your time today."`
    );
  }

  // ── Data channel event handler ───────────────────────────────────────────────

  function handleEvent(ev) {
    switch (ev.type) {
      // AI started sending audio — update waveform
      case 'response.audio.delta':
        if (!aiSpeakingRef.current) {
          aiSpeakingRef.current = true;
          setStatusSafe('ai_speaking');
        }
        break;

      // AI finished its full response — capture transcript, update counter
      case 'response.audio_transcript.done':
        aiSpeakingRef.current = false;
        if (ev.transcript?.trim()) {
          conversationRef.current.push({
            type: 'ai',
            line: ev.transcript,
            timestamp: Date.now(),
          });
          exchangeCountRef.current += 1;
          setQuestionNum((q) => q + 1);

          const lower = ev.transcript.toLowerCase();
          const isClosing =
            lower.includes('that covers everything') ||
            lower.includes('thanks for your time') ||
            lower.includes('do you have any questions for me') ||
            exchangeCountRef.current >= 10;

          setStatusSafe(isClosing ? 'closing' : 'listening');
        }
        break;

      // User speech transcribed — add to conversation log
      case 'conversation.item.input_audio_transcription.completed':
        if (ev.transcript?.trim()) {
          conversationRef.current.push({
            type: 'user',
            transcript: ev.transcript,
            timestamp: Date.now(),
          });
        }
        break;

      case 'input_audio_buffer.speech_started':
        setStatusSafe('user_speaking');
        break;

      case 'input_audio_buffer.speech_stopped':
        setStatusSafe('thinking');
        break;

      case 'error':
        console.error('[Realtime] API error:', ev.error?.message);
        break;
    }
  }

  // ── End interview ────────────────────────────────────────────────────────────

  function confirmEnd() {
    Alert.alert('End Interview?', "You'll see your full debrief and performance analysis.", [
      { text: 'Keep Going', style: 'cancel' },
      { text: 'End Interview', style: 'destructive', onPress: endInterview },
    ]);
  }

  async function endInterview() {
    setStatusSafe('ending');
    await teardown();
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
    navigation.replace('MockInterviewDebrief', { company, role, kit, conversation: conv });
  }

  async function teardown() {
    InCallManager.stop();
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const isAiSpeaking = status === 'ai_speaking';
  const isUserSpeaking = status === 'user_speaking';
  const waveActive = isAiSpeaking || isUserSpeaking;
  const waveColor = isAiSpeaking ? colors.accent : isUserSpeaking ? '#ffffff' : colors.textMuted;

  const statusLabel = {
    connecting: 'Connecting...',
    ready: 'Starting...',
    ai_speaking: 'Interviewer speaking...',
    listening: 'Listening...',
    user_speaking: 'Listening...',
    thinking: 'Thinking...',
    closing: 'Interview complete',
    ending: 'Saving...',
    error: 'Connection error',
  }[status] ?? '';

  const footerHint =
    status === 'listening' || status === 'user_speaking'
      ? 'Speak naturally — no button needed'
      : status === 'ai_speaking'
      ? 'Interviewer is responding...'
      : status === 'thinking'
      ? 'Processing your answer...'
      : '';

  return (
    <View style={styles.container}>
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

      {/* Footer */}
      <View style={styles.footer}>
        {status === 'closing' ? (
          <TouchableOpacity style={styles.debriefBtn} onPress={endInterview} activeOpacity={0.85}>
            <Text style={styles.debriefBtnText}>VIEW DEBRIEF →</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.footerHint}>{footerHint}</Text>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  endBtn: {
    paddingVertical: spacing.xs,
    width: 44,
  },
  endBtnText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  companyText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  qBadge: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    width: 44,
    alignItems: 'center',
  },
  qBadgeText: {
    fontFamily: fonts.header,
    fontSize: 16,
    color: colors.accent,
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  statusLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 48 : spacing.xl,
    paddingTop: spacing.md,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  debriefBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  debriefBtnText: {
    fontFamily: fonts.header,
    fontSize: 20,
    color: colors.text,
    letterSpacing: 2,
  },
  footerHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
