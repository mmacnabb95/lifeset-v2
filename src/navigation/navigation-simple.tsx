import React, { useState, useEffect } from "react";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { doc, getDoc } from "firebase/firestore";
import { signIn, signUp } from "src/services/firebase/auth";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { getOnboardingStatus, setOnboardingCompleted } from "src/services/firebase/user";
import { useSubscription } from "src/hooks/useSubscription";
import { useMode } from "src/hooks/useMode";
import { useSelector } from "react-redux";
import { selectAuthInitialized } from "src/redux/features/auth/slice";
import { db } from "src/services/firebase/config";

// ⚠️ DEV BYPASS: Set to true to skip paywall AND onboarding during development
// IMPORTANT: Set back to false before submitting to App Store!
const DEV_BYPASS_PAYWALL = false; // PRODUCTION: Disabled
const DEV_BYPASS_ONBOARDING = false; // PRODUCTION: Disabled

// Import screens
import { HomeDashboard } from "src/pages/home/home-dashboard";
import { HabitsScreen } from "src/pages/habits/habits-screen";
import { AddHabitScreen } from "src/pages/habits/add-habit-screen";
import { AddGoalScreen } from "src/pages/habits/add-goal-screen";
import { SettingsScreen } from "src/pages/settings/settings-screen";
import PersonalDetailsSimpleScreen from "src/pages/settings/personal-details-simple";
import { JournalSimpleScreen } from "src/pages/journal/journal-simple";
import { WriteJournalSimpleScreen } from "src/pages/journal/write-journal-simple";
import { RecipeBrowserScreen } from "src/pages/nutrition/recipe-browser-screen";
import { RecipeDetailScreen } from "src/pages/nutrition/recipe-detail-screen";
import ExerciseDetailScreen from "src/pages/workouts/exercise-detail-screen";
import { WorkoutPlansScreen } from "src/pages/workouts/workout-plans-screen";
import WorkoutPlanDetailScreen from "src/pages/workouts/workout-plan-detail-screen";
import CreateWorkoutPlanScreen from "src/pages/workouts/create-workout-plan-screen";
import EditWorkoutPlanScreen from "src/pages/workouts/edit-workout-plan-screen";
import MeditationBrowserScreen from "src/pages/meditation/meditation-browser-screen";
import MeditationPlayerScreen from "src/pages/meditation/meditation-player-screen";
// Organisation screens
import { MembershipStatusScreen } from "src/pages/organisation/membership-status-screen";
import { PackBalanceScreen } from "src/pages/organisation/pack-balance-screen";
import { QRCodeScreen } from "src/pages/organisation/qr-code-screen";
import { MyOrganisationScreen } from "src/pages/organisation/my-organisation-screen";
import { JoinOrganisationScreen } from "src/pages/organisation/join-organisation-screen";
import { BookingsScreen } from "src/pages/organisation/bookings-screen";

// Import new screens
import { SimpleIntroScreen } from "src/pages/onboarding/SimpleIntroScreen";
import { GuidedOnboarding } from "src/pages/onboarding/GuidedOnboarding";
import { PaywallScreen } from "src/pages/paywall/paywall-screen";
import { PrivacyPolicyScreen } from "src/pages/legal/privacy-policy";
import { TermsOfServiceScreen } from "src/pages/legal/terms-of-service";
import { WelcomeScreen } from "src/pages/auth/welcome-screen";
import { SignUpScreen } from "src/pages/auth/signup-screen";
import { LoginScreen } from "src/pages/auth/login-screen";
import { JoinOrganisationAfterSignup } from "src/pages/auth/join-organisation-after-signup";

const Stack = createNativeStackNavigator();

// Onboarding wrapper screen - shows simple intro, then guided setup
const OnboardingScreen = ({ navigation }: any) => {
  const { userId } = useFirebaseUser();
  const { isConsumerMode, organisation, refetch: refetchMode } = useMode();
  const [showGuided, setShowGuided] = React.useState(false);
  const [showJoinOrganisation, setShowJoinOrganisation] = React.useState(false);
  const [hasCheckedJoin, setHasCheckedJoin] = React.useState(false);
  const [justJoinedOrganisation, setJustJoinedOrganisation] = React.useState(false);

  // Check if user just signed up and should see Join Organisation screen first
  React.useEffect(() => {
    const checkForJoinScreen = async () => {
      if (!userId) {
        setHasCheckedJoin(true);
        return;
      }

      try {
        // Check if user just signed up
        const justSignedUp = await AsyncStorage.getItem('justSignedUp');
        const hasCompletedOnboarding = await getOnboardingStatus(userId);
        
        // Show join screen if user just signed up and hasn't completed onboarding
        if (justSignedUp && !hasCompletedOnboarding) {
          console.log('📋 Onboarding: User just signed up, showing Join Organisation screen first');
          setShowJoinOrganisation(true);
          // Clear the flag so it doesn't show again
          await AsyncStorage.removeItem('justSignedUp');
        }
      } catch (error) {
        console.error('Error checking for join organisation screen:', error);
      } finally {
        setHasCheckedJoin(true);
      }
    };
    
    checkForJoinScreen();
  }, [userId]);

  // Show loading while checking
  if (!hasCheckedJoin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Show Join Organisation screen first if user just signed up
  if (showJoinOrganisation) {
    return (
      <JoinOrganisationAfterSignup
        navigation={navigation}
        route={{ params: { skipToOnboarding: true } }}
        onComplete={async () => {
          // Mark that user just joined organisation
          setJustJoinedOrganisation(true);
          // Refetch mode to ensure we have latest organisation status
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for Firestore
          await refetchMode();
          setShowJoinOrganisation(false);
          // Continue with onboarding - it will check isConsumerMode again
        }}
        onSkip={() => {
          setShowJoinOrganisation(false);
          // Continue with onboarding
        }}
      />
    );
  }

  const handleComplete = async () => {
    // Always navigate to paywall, even if completion fails
    // This handles cases where Firebase permissions fail in Expo Go
    try {
      if (userId && typeof userId === 'string') {
        try {
          await setOnboardingCompleted(userId);
        } catch (error) {
          console.error('Error completing onboarding (non-blocking):', error);
          // Continue anyway - this is expected in Expo Go
        }
      } else {
        console.log('No userId, skipping onboarding completion (dev mode)');
      }
    } catch (error) {
      console.error('Unexpected error in handleComplete:', error);
    } finally {
      // Check organisation status directly from Firestore if user just joined
      let hasOrganisation = organisation !== null;
      
      if (justJoinedOrganisation || !hasOrganisation) {
        // Double-check by reading user document directly (bypasses mode config call)
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Check for organisations array (new multi-org support) or legacy organisationId
            const hasOrgArray = userData?.organisations && Array.isArray(userData.organisations) && userData.organisations.length > 0;
            const hasActiveOrg = !!userData?.activeOrganisationId;
            const hasLegacyOrg = !!userData?.organisationId; // Backwards compatibility
            hasOrganisation = hasOrgArray || hasActiveOrg || hasLegacyOrg;
            console.log('Direct check - user has organisation:', {
              organisations: userData?.organisations,
              activeOrganisationId: userData?.activeOrganisationId,
              organisationId: userData?.organisationId,
              hasOrganisation
            });
          }
        } catch (error) {
          console.error('Error checking user document:', error);
        }
      }
      
      console.log('Navigation decision - hasOrganisation:', hasOrganisation, 'isConsumerMode:', isConsumerMode);
      
      if (hasOrganisation) {
        console.log('Navigating to Home (organisation user, skips paywall)...');
        navigation.replace('Home');
      } else {
        console.log('Navigating to Paywall (consumer user)...');
        navigation.replace('Paywall');
      }
    }
  };

  const handleSkipAll = async () => {
    // Skip everything - go straight to paywall
    // Always navigate to paywall, even if completion fails
    try {
      if (userId && typeof userId === 'string') {
        try {
          await setOnboardingCompleted(userId);
        } catch (error) {
          console.error('Error skipping onboarding (non-blocking):', error);
          // Continue anyway - this is expected in Expo Go
        }
      } else {
        console.log('No userId, skipping onboarding completion (dev mode)');
      }
    } catch (error) {
      console.error('Unexpected error in handleSkipAll:', error);
    } finally {
      // Check organisation status directly from Firestore if user just joined
      let hasOrganisation = organisation !== null;
      
      if (justJoinedOrganisation || !hasOrganisation) {
        // Double-check by reading user document directly (bypasses mode config call)
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Check for organisations array (new multi-org support) or legacy organisationId
            const hasOrgArray = userData?.organisations && Array.isArray(userData.organisations) && userData.organisations.length > 0;
            const hasActiveOrg = !!userData?.activeOrganisationId;
            const hasLegacyOrg = !!userData?.organisationId; // Backwards compatibility
            hasOrganisation = hasOrgArray || hasActiveOrg || hasLegacyOrg;
            console.log('Skip - Direct check - user has organisation:', {
              organisations: userData?.organisations,
              activeOrganisationId: userData?.activeOrganisationId,
              organisationId: userData?.organisationId,
              hasOrganisation
            });
          }
        } catch (error) {
          console.error('Error checking user document:', error);
        }
      }
      
      console.log('Skip navigation decision - hasOrganisation:', hasOrganisation, 'isConsumerMode:', isConsumerMode);
      
      if (hasOrganisation) {
        console.log('Navigating to Home (skip, organisation user, skips paywall)...');
        navigation.replace('Home');
      } else {
        console.log('Navigating to Paywall (skip, consumer user)...');
        navigation.replace('Paywall');
      }
    }
  };

  const handleGetStarted = () => {
    // Transition to guided setup
    setShowGuided(true);
  };

  const handleSkipGuided = () => {
    // Skip guided setup, go straight to paywall
    handleComplete();
  };

  const handleBackToIntro = () => {
    // Go back from guided onboarding to intro
    setShowGuided(false);
  };

  // Show simple intro first, then guided setup
  if (!showGuided) {
    return (
      <SimpleIntroScreen
        onGetStarted={handleGetStarted}
        onSkipAll={handleSkipAll}
      />
    );
  }

  return (
    <GuidedOnboarding
      onComplete={handleComplete}
      onSkip={handleSkipGuided}
      onBack={handleBackToIntro}
    />
  );
};

// Paywall wrapper screen
const PaywallWrapperScreen = ({ navigation }: any) => {
  const { isConsumerMode } = useMode();
  
  // Safety check: If user is in an organisation, redirect to Home (they shouldn't see paywall)
  React.useEffect(() => {
    if (!isConsumerMode) {
      console.log('⚠️ Organisation user reached Paywall - redirecting to Home');
      navigation.replace('Home');
    }
  }, [isConsumerMode, navigation]);
  
  const handleComplete = () => {
    navigation.replace('Home');
  };

  const handleRestore = () => {
    navigation.replace('Home');
  };

  // Don't show paywall if user is in organisation
  if (!isConsumerMode) {
    return null; // Will redirect via useEffect
  }

  return <PaywallScreen onComplete={handleComplete} onRestore={handleRestore} />;
};

// Simple success screen component
const SuccessScreen = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text style={styles.title}>🎉 LifeSet App is Running!</Text>
    <Text style={styles.subtitle}>Firebase migration successful!</Text>
    <TouchableOpacity 
      style={styles.button}
      onPress={() => navigation.navigate('Login')}
    >
      <Text style={styles.buttonText}>Test Firebase Auth</Text>
    </TouchableOpacity>
  </View>
);

// Firebase test login screen
const TestLoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('test@lifeset.com');
  const [password, setPassword] = useState('test123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const user = await signIn(email, password);
      Alert.alert('Success!', `Logged in as: ${user.email}`, [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error: any) {
      console.log('Login error:', error);
      Alert.alert('Login Failed', `Error: ${error.code}\nMessage: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const user = await signUp(email, password, 'TestUser');
      Alert.alert('Success!', `Account created: ${user.email}`);
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LifeSet Firebase Auth</Text>
      <Text style={styles.subtitle}>Test Authentication</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Create Account'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.info}>
        Default: test@lifeset.com / test123456
      </Text>
    </View>
  );
};

// Root navigation with routing logic
function RootNavigator({ navigationRef }: { navigationRef: any }) {
  const { userId } = useFirebaseUser();
  const subscriptionStatus = useSubscription();
  const { isConsumerMode, loading: modeLoading } = useMode();
  
  // DEV BYPASS: Override subscription status in development
  const isSubscribed = (DEV_BYPASS_PAYWALL && __DEV__) ? true : subscriptionStatus.isSubscribed;
  const subLoading = (DEV_BYPASS_PAYWALL && __DEV__) ? false : subscriptionStatus.loading;
  
  // Organisation users skip paywall - they pay via organisation membership
  const shouldSkipPaywall = !isConsumerMode; // If user is in an organisation, skip paywall
  
  if (DEV_BYPASS_PAYWALL && __DEV__) {
    console.log('🔧 DEV BYPASS: Paywall bypassed - treating as subscribed');
  }
  const authInitialized = useSelector(selectAuthInitialized);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);

  // Log when auth initialization state changes
  useEffect(() => {
    console.log('\n========== NAVIGATION STATE ==========');
    console.log('authInitialized:', authInitialized);
    console.log('userId:', userId ? 'EXISTS' : 'NONE');
    console.log('checkingOnboarding:', checkingOnboarding);
    console.log('subLoading:', subLoading);
    console.log('hasCompletedOnboarding:', hasCompletedOnboarding);
    console.log('isSubscribed:', isSubscribed);
    console.log('======================================\n');
    
    if (authInitialized) {
      console.log('✅ Auth initialized via Redux - userId:', userId ? 'EXISTS' : 'NONE');
    } else {
      console.log('⏳ Waiting for auth initialization...');
    }
  }, [authInitialized, userId, checkingOnboarding, subLoading, hasCompletedOnboarding, isSubscribed]);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (userId && typeof userId === 'string') {
        try {
          const completed = await getOnboardingStatus(userId);
          setHasCompletedOnboarding(completed);
        } catch (error) {
          console.error('Error checking onboarding:', error);
          setHasCompletedOnboarding(false);
        }
      } else {
        setHasCompletedOnboarding(null);
      }
      setCheckingOnboarding(false);
    };

    if (userId) {
      checkOnboarding();
    } else {
      setCheckingOnboarding(false);
      setHasCompletedOnboarding(null);
    }
  }, [userId]);

  // Handle deep links from widgets
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { path, queryParams } = Linking.parse(event.url);
      console.log('🔗 Deep link received:', path, queryParams);
      
      if (!navigationRef.current || !userId || !isSubscribed) {
        console.log('⏳ Deep link deferred - waiting for auth/subscription');
        return;
      }

      // Map deep link paths to screen names
      const routeMap: { [key: string]: string } = {
        'habits': 'Habits',
        'journal': 'Journal',
        'recipes': 'Recipes',
        'workouts': 'WorkoutPlans',
        'meditation': 'MeditationBrowser',
      };

      const screenName = routeMap[path || ''];
      if (screenName && navigationRef.current.isReady()) {
        console.log(`✅ Navigating to ${screenName} via deep link`);
        navigationRef.current.navigate(screenName as never);
      }
    };

    // Get initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [userId, isSubscribed]);

  // Navigate when auth state changes - BUT ONLY after auth is initialized
  useEffect(() => {
    const checkAndNavigate = async () => {
      console.log('🔍 Navigation effect triggered - checking conditions...');
      console.log('  checkingOnboarding:', checkingOnboarding);
      console.log('  subLoading:', subLoading);
      console.log('  authInitialized:', authInitialized);
      console.log('  navigationRef.current exists:', !!navigationRef.current);
      console.log('  initialLoadComplete:', initialLoadComplete);
      console.log('  isSubscribed:', isSubscribed);
      
      // Wait for all checks to complete before navigating
      const allChecksComplete = !checkingOnboarding && !subLoading && authInitialized;
      
      if (allChecksComplete && navigationRef.current) {
        // FIRST: Check if user just signed up (within last 10 seconds) - prevent navigation override
        let justSignedUpCheck = false;
        try {
          const signupTimestamp = await AsyncStorage.getItem('justSignedUp');
          if (signupTimestamp) {
            const timeSinceSignup = Date.now() - parseInt(signupTimestamp, 10);
            justSignedUpCheck = timeSinceSignup < 10000; // Increased to 10 seconds
            
            // Clear flag after 10 seconds
            if (timeSinceSignup >= 10000) {
              await AsyncStorage.removeItem('justSignedUp');
            }
          }
        } catch (error) {
          console.error('Error checking signup flag:', error);
        }
        
        // SECOND: Check current route - don't auto-navigate if user is on specific screens
        const currentRoute = navigationRef.current.getCurrentRoute();
        const routeName = currentRoute?.name;
        const isOnJoinOrganisationScreen = routeName === 'JoinOrganisationAfterSignup';
        const isOnSignUpScreen = routeName === 'SignUp';
        const isOnWelcomeScreen = routeName === 'Welcome';
        
        // ALWAYS skip auto-navigation if:
        // 1. User just signed up (within last 10 seconds)
        // 2. User is on JoinOrganisationAfterSignup screen
        // 3. User is on SignUp screen (might be in the process of signing up)
        if (justSignedUpCheck || isOnJoinOrganisationScreen || isOnSignUpScreen) {
          console.log('⏭️ Skipping auto-navigation - user on protected screen or just signed up', {
            justSignedUpCheck,
            isOnJoinOrganisationScreen,
            isOnSignUpScreen,
            routeName
          });
          return; // Don't navigate away from this screen
        }
        
        // Mark initial load as complete, but don't navigate on the same render
        // This ensures we have the final subscription status before routing
        if (!initialLoadComplete) {
          console.log('✅ Initial load complete - navigation ready (waiting one render cycle)');
          setInitialLoadComplete(true);
          return; // Exit early - navigation will happen on next render
        }
        
        // Only navigate after initialLoadComplete is set (ensures we have final isSubscribed value)
        console.log('\n========== NAVIGATION DECISION ==========');
        console.log('userId:', userId ? 'EXISTS' : 'NONE');
        console.log('hasCompletedOnboarding:', hasCompletedOnboarding);
        console.log('isSubscribed:', isSubscribed);
        console.log('isConsumerMode:', isConsumerMode);
        console.log('shouldSkipPaywall:', shouldSkipPaywall);
        console.log('navigationRef available:', !!navigationRef.current);
        console.log('currentRoute:', currentRoute?.name);
        console.log('=========================================\n');
        
        // DEV BYPASS: Skip onboarding check in development
        const shouldSkipOnboarding = DEV_BYPASS_ONBOARDING && __DEV__;
        const effectiveOnboardingComplete = shouldSkipOnboarding ? true : hasCompletedOnboarding;
        
        if (shouldSkipOnboarding) {
          console.log('🔧 DEV BYPASS: Onboarding bypassed');
        }
        
        if (userId && effectiveOnboardingComplete === false) {
          // Don't navigate if already on Onboarding screen
          if (routeName !== 'Onboarding') {
            console.log('🧭 DECISION: Navigating to Onboarding');
            navigationRef.current?.navigate('Onboarding');
          } else {
            console.log('⏭️ Already on Onboarding screen, skipping navigation');
          }
        } else if (userId && effectiveOnboardingComplete && !shouldSkipPaywall && !isSubscribed) {
          console.log('🧭 DECISION: Navigating to Paywall (consumer user, not subscribed)');
          navigationRef.current?.navigate('Paywall');
        } else if (userId && effectiveOnboardingComplete && (shouldSkipPaywall || isSubscribed)) {
          const reason = shouldSkipPaywall ? 'organisation user (skips paywall)' : 'user subscribed';
          console.log(`🧭 DECISION: Navigating to Home (${reason})`);
          navigationRef.current?.navigate('Home');
        } else if (!userId) {
          console.log('🧭 DECISION: Navigating to Welcome (NO USER - THIS IS THE LOGOUT)');
          navigationRef.current?.navigate('Welcome');
        }
      } else {
        console.log('⏭️ Navigation effect conditions not met, skipping navigation');
      }
    };
    
    checkAndNavigate();
  }, [userId, hasCompletedOnboarding, isSubscribed, shouldSkipPaywall, checkingOnboarding, subLoading, authInitialized, initialLoadComplete, modeLoading]);

  // Show loading while checking status or waiting for auth to initialize
  // OR during initial load to prevent flickering between screens
  // CRITICAL: Keep loading screen visible until subscription loads for logged-in users
  // Also wait for mode loading to determine if user is in organisation
  const waitingForSubscription = userId && subLoading;
  const waitingForMode = userId && modeLoading;
  const showLoading = checkingOnboarding || !authInitialized || !initialLoadComplete || waitingForSubscription || waitingForMode;
  
  console.log('🔄 Loading screen decision:', {
    checkingOnboarding,
    authInitialized,
    initialLoadComplete,
    userId: !!userId,
    subLoading,
    waitingForSubscription,
    showLoading
  });
  
  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your account...</Text>
      </View>
    );
  }

  // Determine which screen to show based on auth and subscription state
  // Since initialRouteName doesn't update reactively, we manually route in the effect
  // But we still need to set a reasonable default for the first render
  const getInitialRoute = () => {
    if (userId && hasCompletedOnboarding === false) {
      return 'Onboarding';
    } else if (userId && hasCompletedOnboarding && !shouldSkipPaywall && !isSubscribed) {
      return 'Paywall';
    } else if (userId && hasCompletedOnboarding && (shouldSkipPaywall || isSubscribed)) {
      return 'Home';
    }
    return 'Welcome';
  };

  const initialRoute = getInitialRoute();
  console.log('🏗️ Rendering Stack.Navigator with initialRouteName:', initialRoute);
  
  return (
    <Stack.Navigator 
      key={`nav-${userId}-${hasCompletedOnboarding}-${isSubscribed}`}
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      {/* Auth screens */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="JoinOrganisationAfterSignup" component={JoinOrganisationAfterSignup} />
      
      {/* Onboarding & Paywall */}
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="Paywall" 
        component={PaywallWrapperScreen}
        options={{ gestureEnabled: false }}
      />

      {/* Main app screens */}
      <Stack.Screen 
        name="Home" 
        component={HomeDashboard} 
        options={{ gestureEnabled: false }} 
      />
      <Stack.Screen name="Habits" component={HabitsScreen} />
      <Stack.Screen name="AddHabit" component={AddHabitScreen} />
      <Stack.Screen name="AddGoal" component={AddGoalScreen} />
      <Stack.Screen name="Journal" component={JournalSimpleScreen} />
      <Stack.Screen name="WriteJournal" component={WriteJournalSimpleScreen} />
      <Stack.Screen name="Recipes" component={RecipeBrowserScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="WorkoutPlans" component={WorkoutPlansScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="WorkoutPlanDetail" component={WorkoutPlanDetailScreen} />
      <Stack.Screen name="CreateWorkoutPlan" component={CreateWorkoutPlanScreen} />
      <Stack.Screen name="EditWorkoutPlan" component={EditWorkoutPlanScreen} />
      <Stack.Screen name="Meditation" component={MeditationBrowserScreen} />
      <Stack.Screen name="MeditationPlayer" component={MeditationPlayerScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetailsSimpleScreen} />

      {/* Organisation screens (only accessible for organisation users) */}
      <Stack.Screen name="JoinOrganisation" component={JoinOrganisationScreen} />
      <Stack.Screen name="MyOrganisation" component={MyOrganisationScreen} />
      <Stack.Screen name="MembershipStatus" component={MembershipStatusScreen} />
      <Stack.Screen name="PackBalance" component={PackBalanceScreen} />
      <Stack.Screen name="QRCode" component={QRCodeScreen} />
      <Stack.Screen name="Bookings" component={BookingsScreen} />

      {/* Legal screens */}
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
    </Stack.Navigator>
  );
};

export function Navigation() {
  const navigationRef = useNavigationContainerRef();
  
  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator navigationRef={navigationRef} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
});