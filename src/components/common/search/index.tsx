import React, { FC } from "react";
import { View } from "react-native";
import { Input, InputProps } from "../input";

const useStyles = require("../../../themes/search/styles/styles").default;
const useInputStyles = require("../../../themes/input/styles/styles").default;

export interface SearchProps extends InputProps {
  readonly disabled?: boolean;
  readonly style?: any;
  readonly testID?: string;
}

export const Search: FC<SearchProps> = ({
  style,
  testID = "search",
  disabled,
  ...restProps
}) => {
  const styles = useStyles();
  const inputStyles = useInputStyles();
  return (
    <View
      testID={testID}
      style={[styles.inputContainer, style?.inputContainer]}
    >
      <Input
        multiline={false}
        numberOfLines={1}
        testID={`${testID}-input`}
        maxLength={45}
        inputStyle={[inputStyles.searchInput]}
        inputContainerStyle={[{ borderBottomWidth: 0 }]}
        style={[
          inputStyles.searchInputContainer,
          style?.input,
          { borderBottomWidth: 0 },
        ]}
        editable={!disabled}
        {...restProps}
      />
    </View>
  );
};
