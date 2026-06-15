import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import {
  getSubscriptionStatus,
  setSubscriptionStatus,
  getDailyDrillCount,
  resetDailyDrillCount,
  FREE_DAILY_LIMIT,
} from '../utils/storage';

export default function DevSettingsScreen({ navigation }) {
  const [subscription, setSubscription] = useState('free');
  const [dailyCount, setDailyCount] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [status, count] = await Promise.all([
      getSubscriptionStatus(),
      getDailyDrillCount(),
    ]);
    setSubscription(status);
    setDailyCount(count);
  }

  async function handleSetSubscription(status) {
    await setSubscriptionStatus(status);
    setSubscription(status);
  }

  async function handleResetDrillCount() {
    await resetDailyDrillCount();
    setDailyCount(0);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>DEV ONLY</Text>
        <Text style={styles.title}>DEV SETTINGS</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SUBSCRIPTION STATUS</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleOption, subscription === 'free' && styles.toggleOptionActive]}
            onPress={() => handleSetSubscription('free')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, subscription === 'free' && styles.toggleTextActive]}>
              FREE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, subscription === 'pro' && styles.toggleOptionActive]}
            onPress={() => handleSetSubscription('pro')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, subscription === 'pro' && styles.toggleTextActive]}>
              PRO
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>DAILY DRILLS</Text>
        <View style={styles.countRow}>
          <View>
            <Text style={styles.countValue}>{dailyCount} / {FREE_DAILY_LIMIT}</Text>
            <Text style={styles.countSub}>used today (free limit: {FREE_DAILY_LIMIT})</Text>
          </View>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetDrillCount}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: { paddingVertical: spacing.xs },
  backText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
  },
  titleBlock: {
    marginBottom: spacing.xl,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.error,
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.header,
    fontSize: 52,
    color: colors.text,
    lineHeight: 52,
    letterSpacing: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2.5,
    marginBottom: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleOptionActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  toggleText: {
    fontFamily: fonts.header,
    fontSize: 22,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  toggleTextActive: {
    color: colors.accent,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countValue: {
    fontFamily: fonts.header,
    fontSize: 32,
    color: colors.text,
    lineHeight: 34,
  },
  countSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  resetButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
