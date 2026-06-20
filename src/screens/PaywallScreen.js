import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { syncSubscriptionStatus } from '../utils/purchases';

const FEATURES = [
  {
    title: 'Unlimited Drills',
    description: 'No daily limits. Practice as much as you want.',
  },
  {
    title: 'Company Prep Kits',
    description: 'AI-generated intel and training plans for any firm.',
  },
  {
    title: 'AI Mock Interviews',
    description: 'Live voice simulation with full debrief scorecard.',
  },
];

export default function PaywallScreen({ route, navigation }) {
  const { message = null } = route.params ?? {};
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    if (loading) return;
    setLoading(true);
    try {
      const result = await RevenueCatUI.presentPaywall();
      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        await syncSubscriptionStatus();
        navigation.goBack();
      }
    } catch (error) {
      console.error('[Paywall] presentPaywall error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    if (loading) return;
    setLoading(true);
    try {
      await RevenueCatUI.presentCustomerCenter();
      // Sync in case a restore happened inside Customer Center
      await syncSubscriptionStatus();
    } catch (error) {
      console.error('[Paywall] presentCustomerCenter error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Dismiss */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>

        {/* Title block */}
        <View style={styles.titleBlock}>
          {message ? (
            <Text style={styles.contextMessage}>{message}</Text>
          ) : null}
          <Text style={styles.title}>Unlock{'\n'}CHRM Pro</Text>
        </View>

        {/* Feature cards */}
        <View style={styles.featuresBlock}>
          {FEATURES.map((feature, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureCardAccent} />
              <View style={styles.featureCardContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingBlock}>
          <TouchableOpacity
            style={styles.monthlyButton}
            onPress={handlePurchase}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.monthlyButtonText}>$7.99 / month</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.annualButton}
            onPress={handlePurchase}
            activeOpacity={0.85}
            disabled={loading}
          >
            <View style={styles.annualButtonInner}>
              <Text style={styles.annualButtonText}>$59.99 / year</Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>SAVE 36%</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            activeOpacity={0.7}
          >
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>
        </View>

        {/* Maybe later */}
        <TouchableOpacity
          style={styles.maybeLaterButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.maybeLaterText}>Maybe later</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: 60,
  },
  dismissButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingLeft: spacing.md,
    marginBottom: spacing.lg,
  },
  dismissText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textMuted,
  },
  titleBlock: {
    marginBottom: spacing.xl,
  },
  contextMessage: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.accent,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 52,
    color: colors.text,
    lineHeight: 52,
    letterSpacing: -2,
  },
  featuresBlock: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  featureCardAccent: {
    width: 3,
    backgroundColor: colors.accent,
  },
  featureCardContent: {
    flex: 1,
    padding: spacing.md,
  },
  featureTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 14,
    color: colors.text,
    marginBottom: 3,
  },
  featureDescription: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  pricingBlock: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  monthlyButton: {
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  monthlyButtonText: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: '#F2F1EE',
    letterSpacing: 0.5,
  },
  annualButton: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.text,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  annualButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  annualButtonText: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text,
    letterSpacing: 0.5,
  },
  savingsBadge: {
    backgroundColor: colors.accentDim,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(23, 71, 212, 0.25)',
  },
  savingsText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 1.5,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  restoreText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  maybeLaterButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  maybeLaterText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
});
