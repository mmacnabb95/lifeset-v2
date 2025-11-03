/**
 * Debug Overlay Component
 * 
 * Shows real-time debugging information on screen for TestFlight builds
 * where console logs aren't accessible.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';
import { useSubscription } from 'src/hooks/useSubscription';
import { useSelector } from 'react-redux';
import { selectAuthInitialized } from 'src/redux/features/auth/slice';
import { getUserSession } from 'src/services/auth-persistence';

interface DebugInfo {
  secureStoreSession: string;
  userId: string;
  authInitialized: boolean;
  isSubscribed: boolean;
  subLoading: boolean;
  timestamp: string;
}

export const DebugOverlay = ({ visible = true }: { visible?: boolean }) => {
  const { userId } = useFirebaseUser();
  const { isSubscribed, loading: subLoading } = useSubscription();
  const authInitialized = useSelector(selectAuthInitialized);
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    secureStoreSession: 'Checking...',
    userId: userId || 'NONE',
    authInitialized: false,
    isSubscribed: false,
    subLoading: true,
    timestamp: new Date().toLocaleTimeString(),
  });
  
  const [expanded, setExpanded] = useState(true);

  // Check SecureStore on mount and when userId changes
  useEffect(() => {
    const checkSecureStore = async () => {
      try {
        const session = await getUserSession();
        setDebugInfo(prev => ({
          ...prev,
          secureStoreSession: session ? `✅ ${session.userId.substring(0, 8)}...` : '❌ NONE',
          userId: userId || 'NONE',
          authInitialized,
          isSubscribed,
          subLoading,
          timestamp: new Date().toLocaleTimeString(),
        }));
      } catch (error) {
        setDebugInfo(prev => ({
          ...prev,
          secureStoreSession: '❌ ERROR',
          userId: userId || 'NONE',
          authInitialized,
          isSubscribed,
          subLoading,
          timestamp: new Date().toLocaleTimeString(),
        }));
      }
    };

    checkSecureStore();
  }, [userId, authInitialized, isSubscribed, subLoading]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.headerText}>
          🔍 DEBUG {expanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.content}>
          <Text style={styles.row}>
            <Text style={styles.label}>SecureStore:</Text>
            <Text style={styles.value}> {debugInfo.secureStoreSession}</Text>
          </Text>
          
          <Text style={styles.row}>
            <Text style={styles.label}>User ID:</Text>
            <Text style={styles.value}> {userId ? `✅ ${userId.substring(0, 12)}...` : '❌ NONE'}</Text>
          </Text>
          
          <Text style={styles.row}>
            <Text style={styles.label}>Auth Init:</Text>
            <Text style={styles.value}> {authInitialized ? '✅ YES' : '⏳ NO'}</Text>
          </Text>
          
          <Text style={styles.row}>
            <Text style={styles.label}>Subscribed:</Text>
            <Text style={styles.value}> {subLoading ? '⏳ Loading' : (isSubscribed ? '✅ YES' : '❌ NO')}</Text>
          </Text>
          
          <Text style={styles.timestamp}>
            Updated: {debugInfo.timestamp}
          </Text>
          
          <Text style={styles.build}>
            Build 39 - Back Buttons
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#667eea',
    overflow: 'hidden',
    zIndex: 9999,
    maxWidth: 280,
  },
  header: {
    backgroundColor: '#667eea',
    padding: 8,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    padding: 10,
  },
  row: {
    marginBottom: 6,
    fontSize: 11,
  },
  label: {
    color: '#aaa',
    fontWeight: '600',
  },
  value: {
    color: '#fff',
    fontFamily: 'Courier',
  },
  timestamp: {
    color: '#888',
    fontSize: 9,
    marginTop: 8,
    fontStyle: 'italic',
  },
  build: {
    color: '#667eea',
    fontSize: 10,
    marginTop: 4,
    fontWeight: 'bold',
  },
});

