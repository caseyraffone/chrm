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

const hasOpenAI = !!OPENAI_API_KEY;
const hasAnthropic = !!ANTHROPIC_API_KEY;

const DRILL_CATEGORIES = [
  {
    name: 'Interview Prep',
    subtitle: 'Technical & behavioral — tailored to your target role',
    route: 'RoleSelection',
  },
  {
    name: 'Persuade & Present',
    subtitle: 'Pitch, defend, and deliver ideas with clarity',
    route: 'RoleSelection',
  },
  {
    name: 'Quick Fire',
    subtitle: 'Think fast — random prompts, timed pressure',
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

  async function handleCategoryPress(cat) {
    if (cat.route === 'QuickFire') {
      const status = await getSubscriptionStatus();
      if (status === 'free') {
        const count = await getDailyDrillCount();
        if (count >= FREE_DAILY_LIMIT) {
          navigation.navigate('Paywall', { message: "You've hit today's free limit." });
          return;
        }
      }
      navigation.navigate('QuickFire');
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Rep Counter */}
      <View style={styles.repBadge}>
        <Text style={styles.repNumber}>{repCount}</Text>
        <Text style={styles.repLabel}>DRILLS COMPLETED</Text>
      </View>

      {/* Logo & Tagline */}
      <View style={styles.hero}>
        <Pressable onPress={handleLogoTap} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.logo}>CHRM</Text>
        </Pressable>
        <Text style={styles.tagline}>Clear. Confident. Under Pressure.</Text>
      </View>

      {/* Drill Cards */}
      <ScrollView
        style={styles.cardsScroll}
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {DRILL_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.name}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleCategoryPress(cat)}
          >
            <Text style={styles.cardTitle}>{cat.name}</Text>
            <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
          </Pressable>
        ))}

        {/* Prep Kit Card */}
        <Pressable
          style={({ pressed }) => [styles.prepKitCard, pressed && styles.prepKitCardPressed]}
          onPress={handlePrepKitPress}
        >
          <View style={styles.prepKitInner}>
            <Text style={styles.prepKitTitle}>COMPANY PREP KIT</Text>
            <Text style={styles.prepKitSubtitle}>Deep intelligence on any firm. Custom training plan.</Text>
          </View>
        </Pressable>

        {/* History Link */}
        <Pressable
          style={({ pressed }) => [styles.historyButton, pressed && { opacity: 0.6 }]}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.historyButtonText}>VIEW HISTORY</Text>
        </Pressable>

        <Text style={styles.debugText}>
          API: {hasOpenAI && hasAnthropic ? 'connected' : `missing — OpenAI:${hasOpenAI} Anthropic:${hasAnthropic}`}
        </Text>
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
    fontFamily: fonts.header,
    fontSize: 36,
    color: colors.accent,
    lineHeight: 36,
  },
  repLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 22,
  },
  logo: {
    fontFamily: fonts.header,
    fontSize: 88,
    color: colors.text,
    lineHeight: 96,
    letterSpacing: 4,
    overflow: 'visible',
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  cardsScroll: {
    flex: 1,
  },
  cardsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  cardPressed: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  cardTitle: {
    fontFamily: fonts.header,
    fontSize: 28,
    color: colors.text,
    lineHeight: 30,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  prepKitCard: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  prepKitCardPressed: {
    shadowOpacity: 0.35,
    borderLeftWidth: 3,
  },
  prepKitInner: {
    padding: spacing.lg,
  },
  prepKitTitle: {
    fontFamily: fonts.header,
    fontSize: 28,
    color: colors.accent,
    lineHeight: 30,
    marginBottom: 4,
  },
  prepKitSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  historyButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  historyButtonText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  debugText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#444444',
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
});
