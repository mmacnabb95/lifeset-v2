import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface XPState {
  currentXP: number;
  level: number;
  xpToNextLevel: number;
}

const XP_PER_LEVEL = 100;

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

const calculateXPToNextLevel = (xp: number): number => {
  const currentLevel = calculateLevel(xp);
  return currentLevel * XP_PER_LEVEL - xp;
};

const initialState: XPState = {
  currentXP: 0,
  level: 1,
  xpToNextLevel: XP_PER_LEVEL,
};

export const xpSlice = createSlice({
  name: 'xp',
  initialState,
  reducers: {
    addXP: (state, action: PayloadAction<number>) => {
      state.currentXP += action.payload;
      state.level = calculateLevel(state.currentXP);
      state.xpToNextLevel = calculateXPToNextLevel(state.currentXP);
    },
    resetXP: (state) => {
      state.currentXP = 0;
      state.level = 1;
      state.xpToNextLevel = XP_PER_LEVEL;
    },
  },
});

export const { addXP, resetXP } = xpSlice.actions;
export default xpSlice.reducer; 