import React, { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useSnackBar } from "src/components/common/snackBar";

const ConnectionStatus: React.FunctionComponent = () => {
  const { showSnackOk, showSnackError, Snack } = useSnackBar();
  const [connected, setConnected] = useState<boolean | null>(true);
  const [isErrorShown, setIsErrorShown] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnected(state?.isConnected);
    });
    return () => {
      unsubscribe();
    };
  });

  useEffect(() => {
    if (connected !== true) {
      showSnackError({ message: "Your device is offline" });
      setIsErrorShown(true);
    }
  }, [connected]);

  useEffect(() => {
    if (connected === true && isErrorShown) {
      showSnackOk({ message: "Сonnection restored" });
      setIsErrorShown(false);
    }
  }, [connected, isErrorShown]);

  return <Snack />;
};

export { ConnectionStatus };
