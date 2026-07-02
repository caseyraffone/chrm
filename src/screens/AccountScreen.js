import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../constants/theme';
import {
  getCurrentSession,
  isSupabaseConfigured,
  deleteCurrentAccount,
  signInWithEmail,
  signOut,
  supabase,
} from '../utils/supabase';
import { syncAllWithCloud, getDrills } from '../utils/storage';
import { reconcileCloudEntitlement } from '../utils/entitlements';

export default function AccountScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [session, setSession] = useState(null);
  const [drillCount, setDrillCount] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
    if (!isSupabaseConfigured || !supabase) return undefined;
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        handleSync();
      }
    });
    return () => data?.subscription?.unsubscribe();
  }, []);

  async function load() {
    const [currentSession, drills] = await Promise.all([
      getCurrentSession(),
      getDrills(),
    ]);
    setSession(currentSession);
    setDrillCount(drills.length);
  }

  async function handleSendMagicLink() {
    const normalized = email.trim().toLowerCase();
    if (!normalized || loading) return;
    setLoading(true);
    setStatus('');
    try {
      await signInWithEmail(normalized);
      setStatus('Check your email for the CHRM sign-in link.');
    } catch (error) {
      Alert.alert('Sign in failed', error.message || 'Could not send the magic link.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setLoading(true);
    setStatus('Syncing your reps...');
    try {
      const drills = await syncAllWithCloud();
      await reconcileCloudEntitlement();
      setDrillCount(drills.length);
      setStatus(`Synced ${drills.length} local/cloud reps.`);
      await load();
    } catch (error) {
      Alert.alert('Sync failed', error.message || 'Could not sync your progress.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOut();
      setSession(null);
      setStatus('Signed out. Your local reps are still on this device.');
    } catch (error) {
      Alert.alert('Sign out failed', error.message || 'Could not sign out.');
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteAccount() {
    if (!session?.user) {
      Alert.alert('Sign in required', 'Sign in before deleting a CHRM account.');
      return;
    }
    Alert.alert(
      'Delete account?',
      'This permanently deletes your CHRM account and cloud-synced reps. Reps stored locally on this device are not erased.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteCurrentAccount();
              setSession(null);
              setStatus('Account deleted. Local guest reps remain on this device.');
            } catch (error) {
              Alert.alert('Delete failed', error.message || 'Could not delete your account.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  const signedInEmail = session?.user?.email;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>ACCOUNT</Text>
        <Text style={styles.title}>Sync CHRM</Text>
        <Text style={styles.subtitle}>
          Sign in to carry your reps between iPhone and web. Guest practice still works.
        </Text>
      </View>

      {!isSupabaseConfigured ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Supabase is not configured yet</Text>
          <Text style={styles.cardText}>
            Add SUPABASE_URL and SUPABASE_ANON_KEY to `.env`, then run the SQL in
            `supabase/schema.sql`.
          </Text>
        </View>
      ) : signedInEmail ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SIGNED IN AS</Text>
          <Text style={styles.cardTitle}>{signedInEmail}</Text>
          <Text style={styles.cardText}>
            {drillCount} reps are available locally. Sync now to merge local guest reps
            with your cloud account.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabled]}
            onPress={handleSync}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>SYNC PROGRESS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSignOut}>
            <Text style={styles.secondaryButtonText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in with email</Text>
          <Text style={styles.cardText}>
            We will send a magic link. After sign-in, CHRM can upload existing guest
            reps into your account.
          </Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.primaryButton, (!email.trim() || loading) && styles.disabled]}
            onPress={handleSendMagicLink}
            disabled={!email.trim() || loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>SEND MAGIC LINK</Text>
          </TouchableOpacity>
        </View>
      )}

      {!!status && <Text style={styles.status}>{status}</Text>}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>COMMERCIAL FOUNDATION</Text>
        <Text style={styles.sectionText}>
          Next layer: use this same Supabase user id as the RevenueCat app user id so
          web Stripe and iOS purchases unlock the same Pro entitlement.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.deleteButton, (!session?.user || loading) && styles.disabled]}
        onPress={handleDeleteAccount}
        disabled={!session?.user || loading}
      >
        <Text style={styles.deleteText}>Delete account</Text>
      </TouchableOpacity>
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
  header: { marginBottom: spacing.xl },
  backButton: { paddingVertical: spacing.xs },
  backText: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
  titleBlock: { marginBottom: spacing.xl },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 42,
    color: colors.text,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.md,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  primaryButtonText: {
    fontFamily: fonts.bodyBold,
    color: colors.surface,
    fontSize: 13,
    letterSpacing: 1.2,
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 14,
  },
  disabled: { opacity: 0.45 },
  status: {
    fontFamily: fonts.bodyMedium,
    color: colors.accent,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    marginTop: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  sectionText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  deleteButton: { marginTop: 'auto', paddingVertical: spacing.lg },
  deleteText: {
    fontFamily: fonts.bodyMedium,
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
