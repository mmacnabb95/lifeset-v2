import React, { ReactElement, useState } from "react";
import { Modal, View } from "react-native";

// @ts-ignore
import useCommonStyles from "./styles/styles";

const Index = ({ children }: { children: ReactElement }) => {
  const commonStyles = useCommonStyles();

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={commonStyles.centeredView}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={commonStyles.centeredView}>
          <View style={commonStyles.modalView}>
            {React.cloneElement(children, { setModalVisible })}
          </View>
        </View>
      </Modal>
      {React.cloneElement(children, { setModalVisible })}
    </View>
  );
};

export default Index;
