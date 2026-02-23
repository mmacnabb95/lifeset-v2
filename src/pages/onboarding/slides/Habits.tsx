import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const HabitsSlide = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji} allowFontScaling={false}>✅</Text>
        <Text style={styles.title} allowFontScaling={false}>Track Your Habits</Text>
        <Text style={styles.subtitle} allowFontScaling={false}>
          Build lasting habits with daily tracking, streaks, and completion insights
        </Text>
        <View style={styles.featureList}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon} allowFontScaling={false}>📊</Text>
            <Text style={styles.featureText} allowFontScaling={false}>Visual progress tracking</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon} allowFontScaling={false}>🔥</Text>
            <Text style={styles.featureText} allowFontScaling={false}>Maintain your streak</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon} allowFontScaling={false}>🎯</Text>
            <Text style={styles.featureText} allowFontScaling={false}>Set custom goals</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  featureList: {
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});

