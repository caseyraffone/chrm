import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fonts } from '../constants/theme';

// Light/editorial loading overlay — matches the app's warm off-white theme.

export default function ProcessingOverlay({ visible, message = 'Analyzing your answer...' }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.5)).current;
  const pulseLoop = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();

      pulseLoop.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.7,
              duration: 1400,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(ringOpacity, {
              toValue: 0,
              duration: 1400,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 0.5,
              duration: 1400,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.current.start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        if (pulseLoop.current) pulseLoop.current.stop();
        scaleAnim.setValue(1);
        ringOpacity.setValue(0.5);
      });
    }

    return () => {
      if (pulseLoop.current) pulseLoop.current.stop();
    };
  }, [visible]);

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.center}>
        {/* Pulsing blue ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            { transform: [{ scale: scaleAnim }], opacity: ringOpacity },
          ]}
        />

        {/* CHRM Logo */}
        <Text style={styles.logo}>CHRM</Text>

        {/* Status text */}
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.accentGlow,
  },
  logo: {
    fontFamily: fonts.header,
    fontSize: 72,
    color: colors.accent,
    letterSpacing: 4,
    lineHeight: 72,
    zIndex: 1,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 24,
    letterSpacing: 0.5,
    zIndex: 1,
  },
});
