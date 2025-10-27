import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { signIn, signUp } from "src/services/firebase/auth";
import { useFirebaseUser } from "src/hooks/useFirebaseUser";
import { getOnboardingStatus, setOnboardingCompleted } from "src/services/firebase/user";
import { useSubscription } from "src/hooks/useSubscription";
import { useSelector } from "react-redux";
import { selectAuthInitialized } from "src/redux/features/auth/slice";

// Import screens
import { HomeDashboard } from "src/pages/home/home-dashboard";
import { HabitsScreen } from "src/pages/habits/habits-screen";
import { AddHabitScreen } from "src/pages/habits/add-habit-screen";
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

// Import new screens
import { OnboardingCarousel } from "src/pages/onboarding/OnboardingCarousel";
import { PaywallScreen } from "src/pages/paywall/paywall-screen";
import { PrivacyPolicyScreen } from "src/pages/legal/privacy-policy";
import { TermsOfServiceScreen } from "src/pages/legal/terms-of-service";
import { WelcomeScreen } from "src/pages/auth/welcome-screen";
import { SignUpScreen } from "src/pages/auth/signup-screen";
import { LoginScreen } from "src/pages/auth/login-screen";

const Stack = createNativeStackNavigator();

// Onboarding wrapper screen
const OnboardingScreen = ({ navigation }: any) => {
  const { userId } = useFirebaseUser();

  const handleComplete = async () => {
    if (userId) {
      try {
        await setOnboardingCompleted(userId);
        navigation.replace('Paywall');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        navigation.replace('Paywall');
      }
    }
  };

  const handleSkip = async () => {
    if (userId) {
      try {
        await setOnboardingCompleted(userId);
        navigation.replace('Paywall');
      } catch (error) {
        console.error('Error skipping onboarding:', error);
        navigation.replace('Paywall');
      }
    }
  };

  return <OnboardingCarousel onComplete={handleComplete} onSkip={handleSkip} />;
};

// Paywall wrapper screen
const PaywallWrapperScreen = ({ navigation }: any) => {
  const handleComplete = () => {
    navigation.replace('Home');
  };

  const handleRestore = () => {
    navigation.replace('Home');
  };

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
const RootNavigator = () => {
  const { userId } = useFirebaseUser();
  const { isSubscribed, loading: subLoading } = useSubscription();
  const authInitialized = useSelector(selectAuthInitialized);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const navigationRef = useRef<any>(null);

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
      if (userId) {
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

  // Navigate when auth state changes - BUT ONLY after auth is initialized
  useEffect(() => {
    if (!checkingOnboarding && !subLoading && authInitialized && navigationRef.current) {
      console.log('🧭 Navigation effect running - userId:', userId ? 'EXISTS' : 'NONE', 'onboarding:', hasCompletedOnboarding, 'subscribed:', isSubscribed);
      
      if (userId && hasCompletedOnboarding === false) {
        console.log('🧭 Navigating to Onboarding');
        navigationRef.current?.navigate('Onboarding');
      } else if (userId && hasCompletedOnboarding && !isSubscribed) {
        console.log('🧭 Navigating to Paywall');
        navigationRef.current?.navigate('Paywall');
      } else if (userId && hasCompletedOnboarding && isSubscribed) {
        console.log('🧭 Navigating to Home');
        navigationRef.current?.navigate('Home');
      } else if (!userId) {
        console.log('🧭 Navigating to Welcome (no user)');
        navigationRef.current?.navigate('Welcome');
      }
    }
  }, [userId, hasCompletedOnboarding, isSubscribed, checkingOnboarding, subLoading, authInitialized]);

  // Show loading while checking status or waiting for auth to initialize
  if (checkingOnboarding || subLoading || !authInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading...</Text>
        <Text style={styles.debugText}>
          Auth Init: {authInitialized ? '✅' : '⏳'} | User: {userId ? '✅' : '❌'} | Sub: {subLoading ? '⏳' : '✅'}
        </Text>
        <Text style={[styles.debugText, { fontSize: 10, marginTop: 8 }]}>
          Build 13 - Redux Auth Flag
        </Text>
      </View>
    );
  }

  // Determine initial route
  let initialRouteName = 'Welcome';
  
  if (userId && hasCompletedOnboarding === false) {
    initialRouteName = 'Onboarding';
  } else if (userId && hasCompletedOnboarding && !isSubscribed) {
    initialRouteName = 'Paywall';
  } else if (userId && hasCompletedOnboarding && isSubscribed) {
    initialRouteName = 'Home';
  }

  return (
    <Stack.Navigator 
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      {/* Auth screens */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      
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

      {/* Legal screens */}
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
    </Stack.Navigator>
  );
};

export const Navigation = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

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
  debugText: {
    marginTop: 12,
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
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