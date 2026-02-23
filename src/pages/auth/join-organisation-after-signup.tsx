import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useOrganisation } from 'src/hooks/useOrganisation';
import { useMode } from 'src/hooks/useMode';

export const JoinOrganisationAfterSignup = ({ 
  navigation, 
  route,
  onComplete,
  onSkip
}: { 
  navigation: any;
  route?: any;
  onComplete?: () => void;
  onSkip?: () => void;
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { joinByCode } = useOrganisation();
  const { refetch } = useMode();
  const skipToOnboarding = route?.params?.skipToOnboarding || false;

  const handleJoin = async () => {
    if (!code.trim()) {
      setError('Please enter an invite code');
      return;
    }

    // Normalize code (uppercase, remove spaces)
    const normalizedCode = code.trim().toUpperCase().replace(/\s/g, '');

    if (normalizedCode.length < 4) {
      setError('Invalid code format');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await joinByCode(normalizedCode);
      
      // Refetch mode to get updated organisation data - wait a bit for Firestore to propagate
      console.log('Refetching mode config after joining organisation...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for Firestore to update
      await refetch();
      console.log('Mode config refetched');

      // If called from Onboarding screen, use callback; otherwise navigate
      if (onComplete) {
        onComplete();
      } else {
        navigation.replace('Onboarding');
      }
    } catch (err: any) {
      console.error('Join organisation error:', err);
      setError(err.message || 'Failed to join organisation. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // If called from Onboarding screen, use callback; otherwise navigate
    if (onSkip) {
      onSkip();
    } else {
      navigation.replace('Onboarding');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Join an Organisation</Text>
          <Text style={styles.subtitle}>
            Do you have an invite code from your gym, studio, or employer?
          </Text>

          {/* Invite Code Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Invite Code (Optional)</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Enter code (e.g., ABC123)"
              placeholderTextColor="#999"
              value={code}
              onChangeText={(text) => {
                setCode(text.toUpperCase().replace(/\s/g, ''));
                setError(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loading}
              maxLength={20}
            />
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>

          {/* Join Button */}
          <TouchableOpacity
            style={[styles.joinButton, (loading || !code.trim()) && styles.buttonDisabled]}
            onPress={handleJoin}
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.joinButtonText}>Join Organisation</Text>
            )}
          </TouchableOpacity>

          {/* Skip Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 What is this?</Text>
            <Text style={styles.infoText}>
              If you're joining a gym, fitness studio, or corporate wellness program, 
              you'll receive an invite code from your organisation. You can always join later in Settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#f8f9fa',
    textAlign: 'center',
    letterSpacing: 4,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 8,
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});

