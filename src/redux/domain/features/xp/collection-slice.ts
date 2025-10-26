import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '../../../reducer/root-reducer';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const XP_REWARDS = {
  CREATE_JOURNAL: 5,
  COMPLETE_WORKOUT: 10,
  COMPLETE_MEDITATION: 5,
  COMPLETE_HABIT:10,
  COMPLETE_ALL_HABITS: 15,
} as const;

export type XPActionType = keyof typeof XP_REWARDS;
export type XPHistoryAction = XPActionType | `UNDO_${XPActionType}`;

interface XPHistoryEntry {
  action: XPHistoryAction;
  xp: number;
  timestamp: string;
}

interface XPState {
  totalXP: number;
  level: number;
  history: XPHistoryEntry[];
  userId?: string;
  initialized: boolean;
}

const XP_PER_LEVEL = 100; // Amount of XP needed to level up
const XP_STORAGE_KEY_PREFIX = 'lifeset_xp_data_user_';

const initialState: XPState = {
  totalXP: 0,
  level: 1,
  history: [],
  userId: undefined,
  initialized: false,
};

// Helper function to get storage key for specific user
const getUserXPKey = (userId: string) => `${XP_STORAGE_KEY_PREFIX}${userId}`;

// Helper function to save XP state to AsyncStorage
const saveXPState = async (state: XPState) => {
  if (!state.userId) {
    console.log('[XP] No userId present, skipping XP save');
    return;
  }
  try {
    // Create a plain object copy of the state
    const stateToSave = {
      totalXP: state.totalXP,
      level: state.level,
      history: [...state.history], // Create a new array copy
      userId: state.userId,
      initialized: true,
    };
    const key = getUserXPKey(state.userId);
    
    console.log('[XP] Preparing to save XP state:', {
      userId: stateToSave.userId,
      totalXP: stateToSave.totalXP,
      key
    });
    
    await AsyncStorage.setItem(key, JSON.stringify(stateToSave));
    console.log('[XP] Successfully saved XP state for user:', stateToSave.userId, 'with XP:', stateToSave.totalXP);
    
    // Debug: List all keys in AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    const xpKeys = allKeys.filter(k => k.startsWith(XP_STORAGE_KEY_PREFIX));
    console.log('[XP] All XP keys after save:', xpKeys);
  } catch (error) {
    console.error('[XP] Error saving XP state:', error);
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('[XP] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  }
};

// Helper function to load XP state from AsyncStorage
export const loadXPState = async (userId: string): Promise<XPState | null> => {
  if (!userId) {
    console.log('[XP] No userId provided to load XP state');
    return null;
  }
  try {
    const key = getUserXPKey(userId);
    console.log('[XP] Attempting to load XP state for user:', userId, 'with key:', key);
    
    // Debug: List all keys in AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    const xpKeys = allKeys.filter(k => k.startsWith(XP_STORAGE_KEY_PREFIX));
    console.log('[XP] Available XP keys:', xpKeys);
    
    const savedState = await AsyncStorage.getItem(key);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      console.log('[XP] Found saved XP state for user:', userId, 'with XP:', parsedState.totalXP);
      return {
        ...initialState,
        ...parsedState,
        userId,
        initialized: true,
      };
    } else {
      console.log('[XP] No saved XP state found for user:', userId);
      return {
        ...initialState,
        userId,
        initialized: true,
      };
    }
  } catch (error) {
    console.error('[XP] Error loading XP state:', error);
    return null;
  }
};

// Debug helper to clear XP data
export const clearAllXPData = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const xpKeys = allKeys.filter(key => key.startsWith('lifeset_xp_data_user_'));
    await AsyncStorage.multiRemove(xpKeys);
    console.log('[XP] Cleared all XP data');
  } catch (error) {
    console.error('[XP] Error clearing XP data:', error);
  }
};

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

export const xpSlice = createSlice({
  name: 'xp',
  initialState,
  reducers: {
    initializeXP: (state, action: PayloadAction<string>) => {
      console.log('[XP] Initializing XP for user:', action.payload);
      state.userId = action.payload;
      state.initialized = true;
    },
    addXP: (state, action: PayloadAction<{ amount: number; action: XPActionType }>) => {
      if (!state.initialized || !state.userId) {
        console.log('[XP] Cannot add XP - state not initialized');
        return;
      }
      const newTotalXP = state.totalXP + action.payload.amount;
      const newLevel = calculateLevel(newTotalXP);
      const newHistoryEntry = {
        action: action.payload.action,
        xp: action.payload.amount,
        timestamp: new Date().toISOString(),
      };
      
      // Update state
      state.totalXP = newTotalXP;
      state.level = newLevel;
      state.history.push(newHistoryEntry);
      
      // Save state
      const stateToSave = {
        totalXP: state.totalXP,
        level: state.level,
        history: [...state.history],
        userId: state.userId,
        initialized: true,
      };
      saveXPState(stateToSave);
    },
    subtractXP: (state, action: PayloadAction<{ amount: number; action: XPActionType }>) => {
      if (!state.initialized || !state.userId) {
        console.log('[XP] Cannot subtract XP - state not initialized');
        return;
      }
      const newTotalXP = Math.max(0, state.totalXP - action.payload.amount);
      const newLevel = calculateLevel(newTotalXP);
      const newHistoryEntry: XPHistoryEntry = {
        action: `UNDO_${action.payload.action}` as XPHistoryAction,
        xp: -action.payload.amount,
        timestamp: new Date().toISOString(),
      };
      
      // Update state
      state.totalXP = newTotalXP;
      state.level = newLevel;
      state.history.push(newHistoryEntry);
      
      // Save state
      const stateToSave: XPState = {
        totalXP: state.totalXP,
        level: state.level,
        history: [...state.history],
        userId: state.userId,
        initialized: true,
      };
      saveXPState(stateToSave);
    },
    resetXP: (state) => {
      if (!state.initialized || !state.userId) {
        console.log('[XP] Cannot reset XP - state not initialized');
        return;
      }
      state.totalXP = 0;
      state.level = 1;
      state.history = [];
      
      // Save state
      const stateToSave = {
        totalXP: 0,
        level: 1,
        history: [],
        userId: state.userId,
        initialized: true,
      };
      saveXPState(stateToSave);
    },
    restoreXP: (state, action: PayloadAction<XPState>) => {
      console.log('[XP] Restoring XP state:', action.payload);
      state.totalXP = action.payload.totalXP;
      state.level = action.payload.level;
      state.history = action.payload.history;
      state.userId = action.payload.userId;
      state.initialized = true;
      
      // Save state
      const stateToSave = {
        totalXP: action.payload.totalXP,
        level: action.payload.level,
        history: [...action.payload.history],
        userId: action.payload.userId,
        initialized: true,
      };
      saveXPState(stateToSave);
    },
  },
  extraReducers: (builder) => {
    builder.addCase('RESET_APP', (state) => {
      console.log('[XP] App reset - preserving XP state');
      // Don't reset anything on app reset
      // The state will be reinitialized when user info is available
    });
  },
});

export const { addXP, subtractXP, resetXP, restoreXP, initializeXP } = xpSlice.actions;

// Selectors
export const selectXP = (state: AppState) => state.xp.totalXP;
export const selectLevel = (state: AppState) => state.xp.level;
export const selectHistory = (state: AppState) => state.xp.history;
export const selectUserId = (state: AppState) => state.xp.userId;
export const selectInitialized = (state: AppState) => state.xp.initialized;

export default xpSlice.reducer; 