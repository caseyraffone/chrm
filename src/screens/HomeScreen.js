import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { OPENAI_API_KEY, ANTHROPIC_API_KEY } from '@env';
import { colors, fonts, spacing, radius } from '../constants/theme';
import {
  getRepCount,
  getSubscriptionStatus,
  setSubscriptionStatus,
  getDailyDrillCount,
  FREE_DAILY_LIMIT,
} from '../utils/storage';
import { BEHAVIORAL_QUESTIONS } from '../utils/questions';

const hasOpenAI = !!OPENAI_API_KEY;
const hasAnthropic = !!ANTHROPIC_API_KEY;

const DRILL_CATEGORIES = [
  {
    name: 'Interview Prep',
    subtitle: 'Curated banks by finance vertical — IB technicals & more',
    route: 'InterviewPrep',
  },
  {
    name: 'Behavioral',
    subtitle: 'STAR-method answers that work for any role',
    route: 'Behavioral',
  },
  {
    name: 'Resume Walkthrough',
    subtitle: 'Nail the "walk me through your resume" opener',
    route: 'ResumeWalkthrough',
  },
  {
    name: 'Persuade & Present',
    subtitle: 'Pitch and defend ideas with clarity',
    route: 'RoleSelection',
  },
  {
    name: 'Quick Fire',
    subtitle: 'Random prompts, timed pressure',
    route: 'QuickFire',
  },
];

export default function HomeScreen({ navigation }) {
  const [repCount, setRepCount] = useState(0);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef(null);

  async function handleLogoTap() {
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => { logoTapCount.current = 0; }, 1500);

    if (logoTapCount.current >= 5) {
      logoTapCount.current = 0;
      clearTimeout(logoTapTimer.current);
      const current = await getSubscriptionStatus();
      const next = current === 'pro' ? 'free' : 'pro';
      Alert.alert(
        'Dev: Subscription',
        `Current status: ${current.toUpperCase()}\n\nSwitch to ${next.toUpperCase()}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: `Set ${next.toUpperCase()}`,
            onPress: async () => { await setSubscriptionStatus(next); },
          },
        ]
      );
    }
  }

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const count = await getRepCount();
        setRepCount(count);
      })();
    }, [])
  );

  async function isDailyLimitReached() {
    const status = await getSubscriptionStatus();
    if (status === 'free') {
      const count = await getDailyDrillCount();
      return count >= FREE_DAILY_LIMIT;
    }
    return false;
  }

  async function handleCategoryPress(cat) {
    if (cat.route === 'QuickFire') {
      if (await isDailyLimitReached()) {
        navigation.navigate('Paywall', { message: "You've hit today's free limit." });
        return;
      }
      navigation.navigate('QuickFire');
    } else if (cat.route === 'Behavioral') {
      if (await isDailyLimitReached()) {
        navigation.navigate('Paywall', { message: "You've hit today's free limit." });
        return;
      }
      navigation.navigate('Practice', {
        category: 'Behavioral',
        role: null,
        questions: BEHAVIORAL_QUESTIONS,
      });
    } else if (cat.route === 'ResumeWalkthrough') {
      navigation.navigate('ResumeWalkthrough');
    } else if (cat.route === 'InterviewPrep') {
      navigation.navigate('InterviewPrepIndustry');
    } else {
      navigation.navigate('RoleSelection', { category: cat.name });
    }
  }

  async function handlePrepKitPress() {
    const status = await getSubscriptionStatus();
    if (status === 'free') {
      navigation.navigate('Paywall', { message: 'Prep Kits are a Pro feature.' });
      return;
    }
    navigation.navigate('PrepKitInput');
  }

  async function handleHireVuePress() {
    const status = await getSubscriptionStatus();
    if (status === 'free') {
      navigation.navigate('Paywall', { message: 'HireVue Simulation is a Pro feature.' });
      return;
    }
    navigation.navigate('HireVueSetup');
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Rep Counter */}
      <View style={styles.repBadge}>
        <Text style={styles.repNumber}>{repCount}</Text>
        <Text style={styles.repLabel}>DRILLS DONE</Text>
      </View>

      {/* Logo & Tagline */}
      <View style={styles.hero}>
        <Pressable onPress={handleLogoTap}>
          <Text style={styles.logo}>CHRM</Text>
        </Pressable>
        <Text style={styles.tagline}>Clear. Confident. Under Pressure.</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Drill Cards */}
      <ScrollView
        style={styles.cardsScroll}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {DRILL_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.name}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => handleCategoryPress(cat)}
          >
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{cat.name}</Text>
                <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </View>
          </Pressable>
        ))}

        {/* HireVue Simulation Card */}
        <Pressable
          style={({ pressed }) => [styles.hireVueCard, pressed && styles.prepKitCardPressed]}
          onPress={handleHireVuePress}
        >
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.hireVueTitleRow}>
                <Text style={styles.hireVueTitle}>HireVue Simulation</Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.hireVueSubtitle}>
                One-way recorded interview, timed — then full AI feedback
              </Text>
            </View>
            <Text style={styles.hireVueArrow}>›</Text>
          </View>
        </Pressable>

        {/* Prep Kit Card */}
        <Pressable
          style={({ pressed }) => [styles.prepKitCard, pressed && styles.prepKitCardPressed]}
          onPress={handlePrepKitPress}
        >
          <View style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.prepKitTitle}>Company Prep Kit</Text>
              <Text style={styles.prepKitSubtitle}>Deep intel + custom training plan</Text>
            </View>
            <Text style={styles.prepKitArrow}>›</Text>
          </View>
        </Pressable>

        {/* History Link */}
        <Pressable
          style={({ pressed }) => [styles.historyButton, pressed && { opacity: 0.6 }]}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.historyButtonText}>VIEW HISTORY</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 80 : 56,
  },
  repBadge: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  repNumber: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.accent,
    lineHeight: 30,
  },
  repLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    marginTop: 2,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
    paddingBottom: 20,
  },
  logo: {
    fontFamily: fonts.header,
    fontSize: 80,
    color: colors.accent,
    letterSpacing: 3,
    lineHeight: 96,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    letterSpacing: 0.4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: 18,
  },
  cardsScroll: {
    flex: 1,
  },
  cardsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  cardArrow: {
    fontSize: 20,
    color: '#ddd',
    marginLeft: 8,
  },
  hireVueCard: {
    marginTop: 4,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    padding: spacing.lg,
  },
  hireVueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  hireVueTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: '#F2F1EE',
  },
  hireVueSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(242, 241, 238, 0.7)',
    lineHeight: 16,
  },
  hireVueArrow: {
    fontSize: 20,
    color: 'rgba(242, 241, 238, 0.6)',
    marginLeft: 8,
  },
  proBadge: {
    backgroundColor: 'rgba(242, 241, 238, 0.18)',
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  proBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: '#F2F1EE',
    letterSpacing: 1,
  },
  prepKitCard: {
    marginTop: 4,
    borderRadius: radius.md,
    backgroundColor: colors.text,
    padding: spacing.lg,
  },
  prepKitCardPressed: {
    opacity: 0.85,
  },
  prepKitTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: '#F2F1EE',
    marginBottom: 2,
  },
  prepKitSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#555555',
    lineHeight: 16,
  },
  prepKitArrow: {
    fontSize: 20,
    color: '#444444',
    marginLeft: 8,
  },
  historyButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  historyButtonText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  debugText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
