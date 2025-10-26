import React, { ReactElement, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { usePlayerDimensions } from "../forms/usePlayerDimensions";

const FullScreenModal = ({ children }: { children: ReactElement }) => {
  const { playerHeight, playerWidth } = usePlayerDimensions();
  const [modalVisible, setModalVisible] = useState(false);

  //   const player = React.cloneElement(children, { setModalVisible });
  //   const player = useMemo(() => {
  //     return React.cloneElement(children, { setModalVisible });
  //   }, [children]);

  return (
    <View
      style={[
        styles.centeredView,
        { minWidth: playerWidth, minHeight: playerHeight },
      ]}
    >
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {React.cloneElement(children, { setModalVisible })}
          </View>
        </View>
      </Modal>
      {React.cloneElement(children, { setModalVisible })}
      {/* <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => setModalVisible(true)}
      >
        <Text>Show Modal</Text>
      </Pressable> */}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    alignItems: "center",
    elevation: 5,
    width: "100%",
    height: "100%",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
});

export default FullScreenModal;
