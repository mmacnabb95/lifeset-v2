import { CommonActions } from "@react-navigation/native";
import { Platform } from "react-native";

export const useLogoutWorkaround = (props: any) => {
  const screenName = props?.state?.routes?.[0]?.state?.routes?.[
    (props?.state?.routes?.[0]?.state?.routes?.length || 1) - 1
  ]?.name || 'Auth';
  
  const screenParams = props?.state?.routes?.[0]?.state?.routes?.[
    (props?.state?.routes?.[0]?.state?.routes?.length || 1) - 1
  ]?.params || {};

  const resetNav = () => {
    if (Platform.OS === "web") {
      try {
        const resetAction = CommonActions.reset({
          index: 0,
          routes: [{ name: screenName, params: screenParams }],
        });
        props?.navigation?.dispatch?.(resetAction);
      } catch (error) {
        console.error('Navigation reset failed:', error);
      }
    }
  };

  return { resetNav };
};
