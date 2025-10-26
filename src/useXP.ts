import { useDispatch, useSelector } from 'react-redux';
import {
  addXP,
  subtractXP,
  XP_REWARDS,
  XPActionType,
  loadXPState,
  initializeXP,
  restoreXP,
} from './redux/domain/features/xp/collection-slice';
import { AppState } from './redux/reducer/root-reducer';

export const useXP = () => {
  const dispatch = useDispatch();
  const { totalXP, level, history } = useSelector((state: AppState) => state.xp);

  const restoreUserXP = async (userId: string) => {
    dispatch(initializeXP(userId));
    const savedXPState = await loadXPState(userId);
    if (savedXPState) {
      dispatch(restoreXP(savedXPState));
    }
  };

  const awardXP = (action: XPActionType) => {
    dispatch(addXP({ amount: XP_REWARDS[action], action }));
  };

  const removeXP = (action: XPActionType) => {
    dispatch(subtractXP({ amount: XP_REWARDS[action], action }));
  };

  return {
    totalXP,
    level,
    history,
    awardXP,
    removeXP,
    restoreUserXP,
  };
};
