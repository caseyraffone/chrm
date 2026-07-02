import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts as useBebasNeue, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  useFonts as useDMSans,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  useFonts as useSpaceGrotesk,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

import HomeScreen from './src/screens/HomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import QuickFireScreen from './src/screens/QuickFireScreen';
import PrepKitInputScreen from './src/screens/PrepKitInputScreen';
import PrepKitScreen from './src/screens/PrepKitScreen';
import PrepKitHubScreen from './src/screens/PrepKitHubScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import MockInterviewSetupScreen from './src/screens/MockInterviewSetupScreen';
import MockInterviewScreen from './src/screens/MockInterviewScreen';
import MockInterviewDebriefScreen from './src/screens/MockInterviewDebriefScreen';
import MockInterviewTranscriptScreen from './src/screens/MockInterviewTranscriptScreen';
import HireVueSetupScreen from './src/screens/HireVueSetupScreen';
import HireVueSimulationScreen from './src/screens/HireVueSimulationScreen';
import HireVueDebriefScreen from './src/screens/HireVueDebriefScreen';
import ResumeWalkthroughScreen from './src/screens/ResumeWalkthroughScreen';
import ResumeImproverScreen from './src/screens/ResumeImproverScreen';
import InterviewPrepIndustryScreen from './src/screens/InterviewPrepIndustryScreen';
import InterviewPrepTrackScreen from './src/screens/InterviewPrepTrackScreen';
import QuestionBankScreen from './src/screens/QuestionBankScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import DevSettingsScreen from './src/screens/DevSettingsScreen';
import AccountScreen from './src/screens/AccountScreen';
import { colors } from './src/constants/theme';
import { getOnboardingCompleted, syncAllWithCloud } from './src/utils/storage';
import {
  initializePurchases,
  syncSubscriptionStatus,
  addSubscriptionListener,
  linkUser,
  unlinkUser,
} from './src/utils/purchases';
import { reconcileCloudEntitlement } from './src/utils/entitlements';
import { initAnalytics, track, identify, EVENTS } from './src/utils/analytics';
import { isSupabaseConfigured, supabase } from './src/utils/supabase';

const Stack = createNativeStackNavigator();

export default function App() {
  const [bebasLoaded] = useBebasNeue({ BebasNeue_400Regular });
  const [dmLoaded] = useDMSans({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold });
  const [sgLoaded] = useSpaceGrotesk({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });
  const fontsLoaded = bebasLoaded && dmLoaded && sgLoaded;

  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    // Initialize RevenueCat before anything else, then sync entitlement status
    // into AsyncStorage so gating logic has an up-to-date value on first load.
    initializePurchases();
    // Sync entitlement, then tag the analytics profile with subscription status.
    syncSubscriptionStatus().then((isPro) =>
      identify({ subscription_status: isPro ? 'pro' : 'free' })
    );

    // Fire up analytics (no-ops without a key) and log the session open.
    initAnalytics().then(() => track(EVENTS.APP_OPENED));

    // Keep AsyncStorage in sync whenever RevenueCat detects a status change
    // (renewal, cancellation, billing retry, etc.) during the app session.
    const removeListener = addSubscriptionListener();
    let authSubscription;

    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          syncAllWithCloud().catch((error) => {
            console.warn('Cloud sync after sign-in failed:', error.message);
          });
          // Tie RevenueCat to the account, then pull the account-level
          // entitlement so a purchase from any platform unlocks Pro here.
          linkUser(session.user.id).catch(() => {});
          reconcileCloudEntitlement().catch(() => {});
        } else {
          unlinkUser().catch(() => {});
        }
      });
      authSubscription = data?.subscription;
    }

    // Returning from Stripe Checkout on web: the entitlement webhook may lag the
    // redirect by a second or two, so poll a few times, then clean the URL.
    if (
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      window.location?.search?.includes('checkout=success')
    ) {
      let tries = 0;
      const poll = async () => {
        const isPro = await reconcileCloudEntitlement().catch(() => false);
        tries += 1;
        if (!isPro && tries < 6) {
          setTimeout(poll, 2000);
        } else if (typeof window.history?.replaceState === 'function') {
          window.history.replaceState({}, '', window.location.pathname);
        }
      };
      poll();
    }

    getOnboardingCompleted().then((completed) => {
      setInitialRoute(completed ? 'Home' : 'Onboarding');
    });

    return () => {
      removeListener();
      authSubscription?.unsubscribe();
    };
  }, []);

  if (!fontsLoaded || !initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="InterviewPrepIndustry" component={InterviewPrepIndustryScreen} />
        <Stack.Screen name="InterviewPrepTrack" component={InterviewPrepTrackScreen} />
        <Stack.Screen name="QuestionBank" component={QuestionBankScreen} />
        <Stack.Screen name="Practice" component={PracticeScreen} />
        <Stack.Screen name="QuickFire" component={QuickFireScreen} />
        <Stack.Screen name="PrepKitInput" component={PrepKitInputScreen} />
        <Stack.Screen name="PrepKit" component={PrepKitScreen} />
        <Stack.Screen name="PrepKitHub" component={PrepKitHubScreen} />
        <Stack.Screen
          name="Feedback"
          component={FeedbackScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="MockInterviewSetup" component={MockInterviewSetupScreen} />
        <Stack.Screen
          name="MockInterview"
          component={MockInterviewScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="MockInterviewDebrief"
          component={MockInterviewDebriefScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="MockInterviewTranscript" component={MockInterviewTranscriptScreen} />
        <Stack.Screen name="ResumeWalkthrough" component={ResumeWalkthroughScreen} />
        <Stack.Screen name="ResumeImprover" component={ResumeImproverScreen} />
        <Stack.Screen name="HireVueSetup" component={HireVueSetupScreen} />
        <Stack.Screen
          name="HireVueSimulation"
          component={HireVueSimulationScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="HireVueDebrief"
          component={HireVueDebriefScreen}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="DevSettings" component={DevSettingsScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
