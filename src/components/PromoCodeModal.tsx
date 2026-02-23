// Promo Code Redemption Modal
// Allows users to enter and redeem promotional codes

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { redeemPromoCode } from 'src/services/firebase/promo-codes';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';

interface PromoCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; // Called when code is successfully redeemed
}

export const PromoCodeModal: React.FC<PromoCodeModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { userId, user } = useFirebaseUser();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    if (!userId) {
      setError('Please sign in first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await redeemPromoCode(code, userId, user?.email || undefined);
      
      // Show success message
      Alert.alert(
        'Code Redeemed! 🎉',
        result.message,
        [
          {
            text: 'Awesome!',
            onPress: () => {
              setCode('');
              onSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to redeem code');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Redeem Promo Code</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Enter your promotional code below to unlock premium access.
            </Text>

            {/* Input */}
            <TextInput
              style={styles.input}
              placeholder="Enter code (e.g., FRIEND2024)"
              placeholderTextColor="#999"
              value={code}
              onChangeText={(text) => {
                setCode(text.toUpperCase());
                setError(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loading}
            />

            {/* Error Message */}
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Redeem Button */}
            <TouchableOpacity
              style={[styles.redeemButton, loading && styles.redeemButtonDisabled]}
              onPress={handleRedeem}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.redeemButtonText}>Redeem Code</Text>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  redeemButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  redeemButtonDisabled: {
    backgroundColor: '#b0b0b0',
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default PromoCodeModal;

