import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

const useCommonStyles =
  require("../../../themes/snackbar/styles/styles").default;

export const useSnackBar = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const showSnackOk = ({ message }: { message: string }) => {
    setMessage(message);
    setIsError(false);
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 3000);
  };

  const showSnackError = ({ message }: { message: string }) => {
    setMessage(message);
    setIsError(true);
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 3000);
  };

  const Snack = () => {
    if (!visible) return null;
    
    return (
      <View style={[styles.container, isError ? styles.errorContainer : styles.successContainer]}>
        <Text style={styles.text}>{message}</Text>
      </View>
    );
  };

  return { showSnackOk, showSnackError, Snack };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: '#FF3B30',
  },
  successContainer: {
    backgroundColor: '#4CD964',
  },
  text: {
    color: 'white',
    fontSize: 14,
  },
});
