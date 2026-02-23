import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export const WelcomeSlide = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji} allowFontScaling={false}>✨</Text>
        <Text style={styles.title} allowFontScaling={false}>Welcome to LifeSet</Text>
        <Text style={styles.subtitle} allowFontScaling={false}>
          Your personal companion for building better habits, achieving goals, and transforming your lifestyle.
        </Text>
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
  },
});

