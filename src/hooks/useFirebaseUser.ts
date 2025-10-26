import { useSelector } from "react-redux";
import { selectFirebaseUser, selectUserId } from "src/redux/features/auth/slice";

/**
 * Custom hook to get the current Firebase user and user ID
 */
export const useFirebaseUser = () => {
  const firebaseUser = useSelector(selectFirebaseUser);
  const userId = useSelector(selectUserId);

  return {
    user: firebaseUser,
    userId: userId || firebaseUser?.uid,
    isAuthenticated: !!userId || !!firebaseUser?.uid,
  };
};

