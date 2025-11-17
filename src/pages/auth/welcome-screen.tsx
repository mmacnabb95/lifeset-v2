import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithApple } from 'src/services/firebase/auth';
import { useDispatch } from 'react-redux';
import { setFirebaseUser } from 'src/redux/features/auth/slice';

export const WelcomeScreen = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  const [appleLoading, setAppleLoading] = useState(false);

  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true);
      const user = await signInWithApple();
      
      // Dispatch to Redux
      dispatch(setFirebaseUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      }));

      // Navigation will be handled by auth listener
      console.log('Apple Sign In successful:', user.uid);
    } catch (error: any) {
      console.error('Apple Sign In error:', error);
      
      // Don't show error for user cancellation
      if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        return;
      }
      
      Alert.alert('Sign In Failed', error.message || 'Failed to sign in with Apple');
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image 
          source={require('../../../assets/lifeset-icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to LifeSet</Text>
        <Text style={styles.subtitle}>
          Your personal companion for building better habits and living your best life
        </Text>

        <View style={styles.buttonContainer}>
          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
              disabled={appleLoading}
            />
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  appleButton: {
    width: '100%',
    height: 50,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

