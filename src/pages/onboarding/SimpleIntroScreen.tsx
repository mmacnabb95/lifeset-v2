// Simple Intro Screen - Replaces the carousel with a concise intro
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SimpleIntroScreenProps {
  onGetStarted: () => void;
  onSkipAll: () => void;
}

export const SimpleIntroScreen: React.FC<SimpleIntroScreenProps> = ({
  onGetStarted,
  onSkipAll,
}) => {
  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/lifeset-icon.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title} allowFontScaling={false}>Welcome to LifeSet</Text>
        <Text style={styles.subtitle} allowFontScaling={false}>
          Gamify your growth, build habits, achieve goals, and become your best self.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon} allowFontScaling={false}>⚡</Text>
            <Text style={styles.featureText} allowFontScaling={false}>Track Daily Habits</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon} allowFontScaling={false}>🎯</Text>
            <Text style={styles.featureText} allowFontScaling={false}>Set & Achieve Goals</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon} allowFontScaling={false}>💪</Text>
            <Text style={styles.featureText} allowFontScaling={false}>Build Workout Plans</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon} allowFontScaling={false}>📝</Text>
            <Text style={styles.featureText} allowFontScaling={false}>Journal Your Thoughts</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon} allowFontScaling={false}>🧘</Text>
            <Text style={styles.featureText} allowFontScaling={false}>Meditate & Reflect</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon} allowFontScaling={false}>🍎</Text>
            <Text style={styles.featureText} allowFontScaling={false}>Discover Healthy Recipes</Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onGetStarted}
        >
          <Text style={styles.primaryButtonText} allowFontScaling={false}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkipAll}
        >
          <Text style={styles.skipButtonText} allowFontScaling={false}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  features: {
    width: '100%',
    maxWidth: 300,
    gap: 4,
    alignItems: 'flex-start',
    alignSelf: 'center',
    marginTop: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    width: '100%',
  },
  featureIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

