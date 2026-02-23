import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WidgetPromptModalProps {
  isVisible: boolean;
  onDismiss: () => void;
  onRemindLater: () => void;
}

export const WidgetPromptModal: React.FC<WidgetPromptModalProps> = ({
  isVisible,
  onDismiss,
  onRemindLater,
}) => {
  const handleAddWidget = () => {
    // On iOS, we can't directly open widget configuration, but we can show instructions
    // The user will need to long-press on home screen and add widget manually
    onDismiss();
    
    // Show alert with instructions
    if (Platform.OS === 'ios') {
      Alert.alert(
        'Add LifeSet Widget',
        '1. Long-press on your home screen\n2. Tap the "+" button in the top-left\n3. Search for "LifeSet"\n4. Choose your widget size\n5. Tap "Add Widget"',
        [
          { text: 'Got it!', style: 'default' }
        ]
      );
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#4e8fea', '#3a7bd5']}
            style={styles.headerGradient}
          >
            <Text style={styles.headerIcon}>📱</Text>
            <Text style={styles.headerTitle}>Add LifeSet Widget</Text>
            <Text style={styles.headerSubtitle}>
              Track your habits and streak right from your home screen
            </Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>🔥</Text>
              <Text style={styles.benefitText}>See your streak at a glance</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>✅</Text>
              <Text style={styles.benefitText}>Quick view of today's habits</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>🎯</Text>
              <Text style={styles.benefitText}>Track your goals progress</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAddWidget}
            >
              <Text style={styles.primaryButtonText}>Add Widget</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onRemindLater}
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
            >
              <Text style={styles.dismissButtonText}>Don't Show Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    fontSize: 24,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingTop: 10,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  primaryButton: {
    backgroundColor: '#4e8fea',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#4e8fea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  dismissButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
});

