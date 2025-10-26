import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const getAuthHeaders = useCallback(async () => {
    const token = await AsyncStorage.getItem("token"); // ✅ consistent key
    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  return {
    getAuthHeaders,
  };
};
