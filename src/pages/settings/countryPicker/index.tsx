import React from "react";
import {
  View,
  Modal,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

import styles from "./style";

let componentIndex = 0;

export default ({
  sectionStyle,
  sectionTextStyle,
  optionStyle,
  optionTextStyle,
  onChange,
  data,
  overlayStyle,
  cancelText,
  close,
  cancelStyle,
  cancelTextStyle,
  animationType,
  modalVisible,
  style,
  children,
  setModalVisible,
}: any) => {
  const renderSection = (section: any) => {
    return (
      <View key={section.key} style={[styles.sectionStyle, sectionStyle]}>
        <Text style={[styles.sectionTextStyle, sectionTextStyle]}>
          {section.label}
        </Text>
      </View>
    );
  };

  const renderOption = (option: any) => {
    return (
      <TouchableOpacity key={option.key} onPress={() => onChange(option)}>
        <View
          style={[
            styles.optionStyle,
            optionStyle,
            {
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            },
          ]}
        >
          <View style={{ flex: 0.15 }}>
            <Image
              source={option.image}
              resizeMode="stretch"
              style={{ width: 30, height: 16 }}
            />
          </View>
          <View style={{ flex: 0.7, alignItems: "center" }}>
            <Text
              style={[
                styles.optionTextStyle,
                optionTextStyle,
                { color: "#434343", fontSize: 14 },
              ]}
            >
              {option.label}
            </Text>
          </View>
          <View style={{ flex: 0.15, alignItems: "flex-end" }}>
            <Text
              style={[
                styles.optionTextStyle,
                optionTextStyle,
                { color: "grey", fontSize: 12 },
              ]}
            >
              {option.dialCode}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOptionList = () => {
    if (!data) return null;

    const options = data.map((item: any) => {
      if (item.section) {
        return renderSection(item);
      }

      return renderOption(item);
    });

    return (
      <View
        style={[styles.overlayStyle, overlayStyle]}
        key={`modalPicker${componentIndex++}`}
      >
        <View style={styles.optionContainer}>
          <ScrollView keyboardShouldPersistTaps="always">
            <View style={{ paddingHorizontal: 10 }}>{options}</View>
          </ScrollView>
        </View>
        <View style={styles.cancelContainer}>
          <TouchableOpacity onPress={close}>
            <View style={[styles.cancelStyle, cancelStyle]}>
              <Text style={[styles.cancelTextStyle, cancelTextStyle]}>
                {cancelText}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderChildren = () => {
    if (children) {
      return children;
    }
  };

  return (
    <View style={style}>
      <Modal
        transparent
        ref={(ref) => {}}
        visible={modalVisible}
        onRequestClose={close}
        animationType={animationType}
      >
        {renderOptionList()}
      </Modal>

      <TouchableOpacity onPress={() => open()}>
        {renderChildren()}
      </TouchableOpacity>
    </View>
  );
};
