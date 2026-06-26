// Web build of the live Mock Interview screen.
//
// The native screen drives realtime voice through `react-native-webrtc` +
// `react-native-incall-manager`, neither of which exists on web (browsers ship
// their own WebRTC). It also calls `registerGlobals()` at module load, which
// would crash the web bundle at boot — so web resolves this placeholder
// instead (Metro picks `.web.js` over `.js`).
//
// Full parity TODO: reimplement the realtime interview using the browser's
// native RTCPeerConnection + getUserMedia, fetching the OpenAI ephemeral token
// from our backend (never the raw API key) and connecting straight to the
// OpenAI Realtime API. The conversation/debrief flow can then be shared with
// the native screen.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';

export default function MockInterviewScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Live Mock Interview</Text>
        <Text style={styles.body}>
          The realtime voice interview is coming to the web app. For now, run a
          live Mock Interview in the CHRM mobile app — everything else works
          here in your browser.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    maxWidth: 440,
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: '#F2F1EE',
    letterSpacing: 0.5,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : null),
  },
});
