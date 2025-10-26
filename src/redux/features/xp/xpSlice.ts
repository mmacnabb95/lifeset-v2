import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface XPState {
  totalXP: number;
  level: number;
  history: Array<{
    action: string;
    xp: number;
    timestamp: string;
  }>;
}

const XP_PER_LEVEL = 100; // Amount of XP needed to level up

const initialState: XPState = {
  totalXP: 0,
  level: 1,
  history: [],
};

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

export const xpSlice = createSlice({
  name: 'xp',
  initialState,
  reducers: {
    addXP: (state, action: PayloadAction<{ amount: number; action: string }>) => {
      state.totalXP += action.payload.amount;
      state.level = calculateLevel(state.totalXP);
      state.history.push({
        action: action.payload.action,
        xp: action.payload.amount,
        timestamp: new Date().toISOString(),
      });
    },
    resetXP: (state) => {
      state.totalXP = 0;
      state.level = 1;
      state.history = [];
    },
  },
});

export const { addXP, resetXP } = xpSlice.actions;
export default xpSlice.reducer; 